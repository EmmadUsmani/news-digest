import assert from 'node:assert/strict';
import { test } from 'node:test';

import type { DigestPreview } from '@digest/contracts';

import { database } from '../src/libs/db/connections';
import { readFullAiEditionCosts } from '../src/modules/curation/database/edition-cost.reader';
import { PostgresScheduledBudgetRepository } from '../src/modules/curation/database/scheduled-budget.repository';
import {
  reconcileFailedScheduledJob,
  runScheduledBudgetAttempt,
  scheduledOutcome,
} from '../src/scheduled-budget-attempt';
import { refreshScheduledBudget } from '../src/scheduled-budget-refresh';

void test('reserve measurements include complete article/social costs and reject incomplete, unresolved and verification editions', async () => {
  const db = database();
  const client = await db.connect();
  const now = new Date('2090-06-01T12:00:00Z');
  const ai = { mode: 'ai', unscoredIds: [] as string[] };
  try {
    await client.query('BEGIN');
    const add = async (
      ageDays: number,
      topic = { editorial: ai, postEditorial: ai },
      calls = [
        { status: 'succeeded', cost: 100, purpose: 'triage' },
        { status: 'succeeded', cost: 200, purpose: 'social-editor' },
      ],
    ) => {
      const id = crypto.randomUUID();
      const date = new Date(now.getTime() - ageDays * 86400000);
      await client.query(
        `INSERT INTO digest_previews(id,profile_id,created_at,window_start,window_end,snapshot)
         VALUES($1,'00000000-0000-4000-8000-000000000001',$2,$2::timestamptz-interval '1 day',$2,$3)`,
        [id, date, JSON.stringify({ method: 'editorial-v1', topics: [topic] })],
      );
      for (const call of calls)
        await client.query(
          `INSERT INTO llm_calls(id,model,purpose,run_id,status,reserved_micros,cost_micros)
           VALUES($1,'fixture-model',$2,$3,$4,999,$5)`,
          [
            crypto.randomUUID(),
            call.purpose,
            id,
            call.status,
            call.status === 'succeeded' ? call.cost : null,
          ],
        );
    };
    await add(30); // Inclusive lookback boundary.
    await add(0, undefined, [
      { status: 'succeeded', cost: 450, purpose: 'editor' },
    ]);
    await add(31);
    await add(-1); // Future snapshots are not measurements.
    await add(1, {
      editorial: ai,
      postEditorial: { mode: 'non-ai', unscoredIds: [] },
    });
    await add(1, {
      editorial: { mode: 'ai', unscoredIds: ['missed'] },
      postEditorial: ai,
    });
    for (const status of ['pending', 'uncertain'])
      await add(1, undefined, [
        { status: 'succeeded', cost: 500, purpose: 'editor' },
        { status, cost: 0, purpose: 'triage' },
      ]);
    await add(1, undefined, [
      { status: 'succeeded', cost: 900, purpose: 'verification' },
    ]);
    await add(1, undefined, []); // Cache-only editions cannot size fresh work.
    await add(1, undefined, [
      { status: 'succeeded', cost: 0, purpose: 'editor' },
    ]);
    assert.deepEqual(await readFullAiEditionCosts(client, now), [450, 300]);
    assert.deepEqual(await readFullAiEditionCosts(client, now, 1), [450]);
    // Released failed holds add no cost; all settled models/purposes do.
    await add(2, undefined, [
      { status: 'failed', cost: 0, purpose: 'editor' },
      { status: 'succeeded', cost: 700, purpose: 'triage' },
    ]);
    assert.deepEqual(
      await readFullAiEditionCosts(client, now),
      [450, 700, 300],
    );
    await assert.rejects(readFullAiEditionCosts(client, now, 0));
    await assert.rejects(readFullAiEditionCosts(client, new Date('invalid')));
  } finally {
    await client.query('ROLLBACK');
    client.release();
    await db.end();
  }
});

void test('scheduled budget identity survives UTC boundaries, concurrent claims, retries and restarts', async () => {
  const db = database();
  const repo = new PostgresScheduledBudgetRepository(db);
  const runId = `scheduled-${crypto.randomUUID()}`;
  // Local Nov 3 is UTC Nov 4; no wall-clock-hour assumption.
  const slot = new Date('2040-11-03T23:30:00-08:00');
  const outcome = {
    editionId: 'fixture-edition',
    mode: 'mixed' as const,
    reason: 'editor budget exhausted',
  };
  try {
    assert.equal(await repo.read('2040-11-04'), null);
    const registered = await repo.register(slot, runId);
    assert.equal(registered.budgetDay, '2040-11-04');
    assert.equal(registered.scheduledAt.toISOString(), slot.toISOString());
    assert.equal(registered.state, 'pending');
    const duplicate = await repo.register(
      new Date('2040-11-04T09:00:00Z'),
      'replacement',
    );
    assert.equal(duplicate.runId, runId);
    assert.equal(duplicate.scheduledAt.toISOString(), slot.toISOString());
    const restarted = new PostgresScheduledBudgetRepository(db);
    const claims = await Promise.all([
      repo.claim(runId),
      restarted.claim(runId),
    ]);
    assert.equal(claims.filter(Boolean).length, 1);
    assert.equal(claims.find(Boolean)?.attempt, 1);
    assert.equal(await restarted.finishAttempt(runId, 1, 'retrying'), true);
    assert.equal((await repo.read('2040-11-04'))?.state, 'retrying');
    assert.equal((await restarted.claim(runId))?.attempt, 2);
    // A late response from the previous worker cannot release today's reserve.
    assert.equal(
      await repo.finishAttempt(runId, 1, 'succeeded', outcome),
      false,
    );
    assert.equal(
      await restarted.finishAttempt(runId, 2, 'succeeded', outcome),
      true,
    );
    assert.equal(await repo.finishAttempt(runId, 2, 'failed'), false);
    assert.equal(await repo.claim(runId), null);
    assert.deepEqual((await restarted.read('2040-11-04'))?.outcome, outcome);
    assert.equal((await repo.register(slot, 'new-id'))?.state, 'succeeded');
    assert.equal(await repo.claim('replacement'), null);
    await assert.rejects(repo.register(new Date('invalid'), runId));
    await assert.rejects(repo.finishAttempt(runId, 2, 'succeeded'));
    await assert.rejects(repo.finishAttempt(runId, 2, 'failed', outcome));
  } finally {
    await db.query('DELETE FROM scheduled_ai_budget_days WHERE run_id=$1', [
      runId,
    ]);
    await db.end();
  }
});

void test('scheduled budget lifecycle shares the ledger lock and final failure stays terminal', async () => {
  const db = database();
  const repo = new PostgresScheduledBudgetRepository(db);
  const runId = `scheduled-${crypto.randomUUID()}`;
  const client = await db.connect();
  try {
    await repo.register(new Date('2040-11-05T15:00:00Z'), runId);
    await client.query('BEGIN');
    await client.query('SELECT pg_advisory_xact_lock(756282)');
    // A bounded DB lock timeout proves registration/claims cannot bypass spend's lock.
    await db.query("SET lock_timeout='100ms'");
    await assert.rejects(
      repo.reconcilePending(
        '2040-11-05',
        runId,
        new Date('2040-11-05T16:00:00Z'),
        'blocked-replacement',
      ),
      { code: '55P03' },
    );
    await assert.rejects(repo.claim(runId), { code: '55P03' });
    await client.query('ROLLBACK');
    await db.query('SET lock_timeout=0');
    assert.equal((await repo.read('2040-11-05'))?.state, 'pending');
    assert.equal((await repo.claim(runId))?.attempt, 1);
    assert.equal(await repo.finishAttempt(runId, 1, 'failed'), true);
    assert.equal(
      await new PostgresScheduledBudgetRepository(db).claim(runId),
      null,
    );
    assert.equal((await repo.read('2040-11-05'))?.state, 'failed');
  } finally {
    await client.query('ROLLBACK');
    client.release();
    await db.query('DELETE FROM scheduled_ai_budget_days WHERE run_id=$1', [
      runId,
    ]);
    await db.end();
  }
});

void test('pending schedule reconciliation fences stale settings, obsolete jobs and concurrent claims', async () => {
  const db = database();
  const repo = new PostgresScheduledBudgetRepository(db);
  const day = '2040-11-06';
  const old = `old-${crypto.randomUUID()}`;
  const replacement = `new-${crypto.randomUUID()}`;
  const later = new Date(`${day}T18:00:00Z`);
  try {
    await repo.register(new Date(`${day}T15:00:00Z`), old);
    assert.equal(
      await repo.reconcilePending(day, old, later, replacement),
      true,
    );
    assert.equal(await repo.claim(old), null);
    assert.equal(await repo.reconcilePending(day, old, later, 'stale'), false);
    assert.equal(
      (await repo.read(day))?.scheduledAt.toISOString(),
      later.toISOString(),
    );
    await assert.rejects(
      repo.reconcilePending(
        day,
        replacement,
        new Date('2040-11-07T00:00:00Z'),
        'cross-day',
      ),
    );
    await assert.rejects(
      repo.reconcilePending(day, replacement, later, replacement),
    );
    await assert.rejects(
      repo.reconcilePending(day, replacement, new Date('invalid'), 'invalid'),
    );
    // Whichever acquires the ledger lock first wins. Never both a claimed old
    // identity and a replaced identity, even with separate repository instances.
    const next = `race-${crypto.randomUUID()}`;
    const [claim, changed] = await Promise.all([
      repo.claim(replacement),
      new PostgresScheduledBudgetRepository(db).reconcilePending(
        day,
        replacement,
        later,
        next,
      ),
    ]);
    assert.equal(Boolean(claim), !changed);
    const active = changed ? next : replacement;
    if (changed) assert.equal((await repo.claim(active))?.attempt, 1);
    assert.equal(
      await repo.reconcilePending(day, active, later, 'running'),
      false,
    );
    assert.equal(await repo.finishAttempt(active, 1, 'retrying'), true);
    assert.equal(
      await repo.reconcilePending(day, active, later, 'retrying'),
      false,
    );
    assert.equal((await repo.claim(active))?.attempt, 2);
    assert.equal(await repo.finishAttempt(active, 2, 'failed'), true);
    assert.equal(
      await repo.reconcilePending(day, active, later, 'terminal'),
      false,
    );
    assert.equal((await repo.read(day))?.runId, active);
  } finally {
    await db.query('DELETE FROM scheduled_ai_budget_days WHERE budget_day=$1', [
      day,
    ]);
    await db.end();
  }
});

void test('scheduler refresh registers the current UTC day and reconciles only unclaimed slots', async () => {
  const db = database();
  const repo = new PostgresScheduledBudgetRepository(db);
  const profile = (
    cadence = '0 7 * * *',
    timezone = 'America/Los_Angeles',
  ) => ({
    id: 'synthetic-profile',
    name: 'Synthetic',
    schedule: {
      cadence,
      timezone,
      coverageWindow: 'P1D',
      storyBudget: 5,
      postBudget: 5,
    },
  });
  const now = new Date('2070-11-04T23:00:00Z');
  const refresh = (value = profile(), date = now) =>
    refreshScheduledBudget(repo, async () => value, date);
  try {
    // Resolve from midnight even after the slot has passed; restarting must
    // not shift today's protection to tomorrow or create a second identity.
    assert.deepEqual(await refresh(), profile());
    const first = await repo.read('2070-11-04');
    assert.equal(first.scheduledAt.toISOString(), '2070-11-04T15:00:00.000Z');
    assert.equal(
      first.runId,
      `synthetic-profile:${first.scheduledAt.getTime()}`,
    );
    await refresh();
    assert.deepEqual(await repo.read('2070-11-04'), first);
    await refresh(profile('0 8 * * *'));
    const changed = await repo.read('2070-11-04');
    assert.equal(changed.scheduledAt.toISOString(), '2070-11-04T16:00:00.000Z');
    assert.equal(await repo.claim(first.runId), null);
    const claim = await repo.claim(changed.runId);
    await refresh(profile('0 9 * * *'));
    assert.deepEqual(await repo.read('2070-11-04'), claim);
    await repo.finishAttempt(claim.runId, claim.attempt, 'retrying');
    await refresh();
    assert.equal((await repo.read('2070-11-04'))?.state, 'retrying');
    const retry = await repo.claim(claim.runId);
    await repo.finishAttempt(retry.runId, retry.attempt, 'failed');
    await refresh();
    assert.equal((await repo.read('2070-11-04'))?.state, 'failed');
    await refresh(profile(), new Date('2070-11-05T00:00:00Z'));
    assert.equal((await repo.read('2070-11-05'))?.state, 'pending');
    assert.equal((await repo.read('2070-11-04'))?.state, 'failed');
  } finally {
    await db.query(
      "DELETE FROM scheduled_ai_budget_days WHERE budget_day IN ('2070-11-04','2070-11-05')",
    );
    await db.end();
  }
});

void test('slow scheduler settings snapshots cannot overwrite newer registration or reconciliation', async () => {
  const db = database();
  const repo = new PostgresScheduledBudgetRepository(db);
  const profile = (hour: number) => ({
    id: 'race-profile',
    name: 'Synthetic',
    schedule: {
      cadence: `0 ${hour} * * *`,
      timezone: 'UTC',
      coverageWindow: 'P1D',
      storyBudget: 5,
      postBudget: 5,
    },
  });
  const now = new Date('2070-11-06T00:00:00Z');
  try {
    for (const existing of [false, true]) {
      if (existing)
        await repo.register(new Date('2070-11-06T01:00:00Z'), 'initial');
      let loaded!: () => void;
      let release!: () => void;
      const snapshotLoaded = new Promise<void>((resolve) => {
        loaded = resolve;
      });
      const resume = new Promise<void>((resolve) => {
        release = resolve;
      });
      const stale = refreshScheduledBudget(
        repo,
        async () => {
          loaded();
          await resume;
          return profile(2);
        },
        now,
      );
      await snapshotLoaded;
      try {
        await refreshScheduledBudget(repo, async () => profile(3), now);
      } finally {
        release();
      }
      await stale;
      assert.equal(
        (await repo.read('2070-11-06'))?.scheduledAt.toISOString(),
        '2070-11-06T03:00:00.000Z',
      );
      await db.query(
        "DELETE FROM scheduled_ai_budget_days WHERE budget_day='2070-11-06'",
      );
    }
  } finally {
    await db.query(
      "DELETE FROM scheduled_ai_budget_days WHERE budget_day='2070-11-06'",
    );
    await db.end();
  }
});

void test('scheduler refresh leaves UTC days without a cron occurrence unregistered and fails on invalid settings', async () => {
  const db = database();
  const repo = new PostgresScheduledBudgetRepository(db);
  const profile = {
    id: 'dst-profile',
    name: 'Synthetic',
    schedule: {
      cadence: '0 16 * * *',
      timezone: 'America/Los_Angeles',
      coverageWindow: 'P1D',
      storyBudget: 5,
      postBudget: 5,
    },
  };
  const now = new Date('2026-11-01T12:00:00Z');
  try {
    await refreshScheduledBudget(repo, async () => profile, now);
    assert.equal(await repo.read('2026-11-01'), null);
    await assert.rejects(
      refreshScheduledBudget(
        repo,
        async () => ({
          ...profile,
          schedule: { ...profile.schedule, cadence: 'invalid' },
        }),
        now,
      ),
    );
    assert.equal(await repo.read('2026-11-01'), null);
  } finally {
    await db.end();
  }
});

void test('scheduled worker retries retain protection and publish conservative AI outcomes', async () => {
  const db = database();
  const repo = new PostgresScheduledBudgetRepository(db);
  const slot = new Date('2045-01-01T15:00:00Z');
  const runId = crypto.randomUUID();
  const edition = fixtureScheduledEdition();
  try {
    await repo.register(slot, runId);
    await assert.rejects(
      runScheduledBudgetAttempt(repo, slot, runId, 1, 0, 3, async () => {
        throw new Error('fixture transport failure');
      }),
      /fixture transport/,
    );
    assert.equal((await repo.read('2045-01-01'))?.state, 'retrying');
    assert.equal(
      await runScheduledBudgetAttempt(
        repo,
        slot,
        runId,
        2,
        1,
        3,
        async () => edition,
      ),
      edition,
    );
    const result = await repo.read('2045-01-01');
    assert.equal(result?.attempt, 2);
    assert.equal(result?.state, 'succeeded');
    assert.equal(result?.outcome?.mode, 'full-ai');
    assert.equal(result?.outcome?.editionId, edition.id);
    const mixed = fixtureScheduledEdition();
    mixed.topics[0].postEditorial!.unscoredIds = ['unscored-fixture'];
    assert.equal(scheduledOutcome(mixed).mode, 'mixed');
    mixed.topics[0].editorial!.mode = 'non-ai';
    mixed.topics[0].postEditorial!.mode = 'non-ai';
    assert.equal(scheduledOutcome(mixed).mode, 'fallback');
    assert.equal(scheduledOutcome({ ...mixed, topics: [] }).mode, 'fallback');
  } finally {
    await db.query('DELETE FROM scheduled_ai_budget_days WHERE run_id=$1', [
      runId,
    ]);
    await db.end();
  }
});

void test('stalled redelivery fences abandoned workers; final failure is terminal', async () => {
  const db = database();
  const repo = new PostgresScheduledBudgetRepository(db);
  const slot = new Date('2045-01-02T15:00:00Z');
  const runId = crypto.randomUUID();
  try {
    await repo.register(slot, runId);
    const old = await repo.claim(runId);
    assert.equal(old?.attempt, 1);
    await assert.rejects(
      runScheduledBudgetAttempt(repo, slot, runId, 1, 0, 3, async () => {
        throw new Error('must not generate');
      }),
      /could not be claimed/,
    );
    await assert.rejects(
      runScheduledBudgetAttempt(repo, slot, runId, 2, 2, 3, async () => {
        assert.equal(
          await repo.finishAttempt(
            runId,
            1,
            'succeeded',
            scheduledOutcome(fixtureScheduledEdition()),
          ),
          false,
        );
        throw new Error('last fixture failure');
      }),
      /last fixture failure/,
    );
    assert.equal((await repo.read('2045-01-02'))?.state, 'failed');
    assert.equal((await repo.read('2045-01-02'))?.attempt, 2);
    assert.equal(await repo.claim(runId, 2), null);
    await assert.rejects(repo.claim(runId, 0), /Invalid/);
  } finally {
    await db.query('DELETE FROM scheduled_ai_budget_days WHERE run_id=$1', [
      runId,
    ]);
    await db.end();
  }
});

void test('concurrent recovery compare-and-swap admits one replacement attempt', async () => {
  const db = database();
  const repo = new PostgresScheduledBudgetRepository(db);
  const runId = crypto.randomUUID();
  try {
    await repo.register(new Date('2045-01-03T15:00:00Z'), runId);
    await repo.claim(runId);
    const recovered = await Promise.all([
      repo.claim(runId, 1),
      repo.claim(runId, 1),
    ]);
    assert.equal(recovered.filter(Boolean).length, 1);
    assert.equal(recovered.find(Boolean)?.attempt, 2);
    assert.equal(await repo.claim(runId, 1), null);
  } finally {
    await db.query('DELETE FROM scheduled_ai_budget_days WHERE run_id=$1', [
      runId,
    ]);
    await db.end();
  }
});

function fixtureScheduledEdition(): DigestPreview {
  const section = {
    mode: 'ai' as const,
    model: 'fixture-model',
    reason: 'Fixture AI evidence',
    triage: [],
    unscoredIds: [] as string[],
  };
  return {
    id: crypto.randomUUID(),
    createdAt: '2045-01-01T15:00:00Z',
    windowStart: '2044-12-31T15:00:00Z',
    windowEnd: '2045-01-01T15:00:00Z',
    method: 'editorial-v1',
    topics: [
      {
        id: crypto.randomUUID(),
        name: 'Fixture topic',
        candidateCount: 0,
        stories: [],
        editorial: { ...section, brief: [] },
        postEditorial: { ...section },
      },
    ],
  };
}

void test('queue-final stalls release only the matching running attempt and fence redelivery races', async () => {
  const db = database();
  const repo = new PostgresScheduledBudgetRepository(db);
  const slot = new Date('2045-01-04T15:00:00Z');
  const profileId = crypto.randomUUID();
  const runId = `${profileId}:${slot.getTime()}`;
  const job = {
    name: 'generate',
    opts: { prevMillis: slot.getTime() },
    getState: async () => 'failed',
  };
  try {
    await repo.register(slot, runId);
    assert.equal(
      await reconcileFailedScheduledJob(repo, profileId, job),
      false,
    );
    await repo.claim(runId);
    assert.equal(
      await reconcileFailedScheduledJob(repo, 'other-profile', job),
      false,
    );
    assert.equal(
      await reconcileFailedScheduledJob(repo, profileId, {
        ...job,
        name: 'on-demand',
      }),
      false,
    );
    assert.equal(
      await reconcileFailedScheduledJob(repo, profileId, { ...job, opts: {} }),
      false,
    );
    for (const state of [
      'active',
      'delayed',
      'waiting',
      'completed',
      'unknown',
    ])
      assert.equal(
        await reconcileFailedScheduledJob(repo, profileId, {
          ...job,
          getState: async () => state,
        }),
        false,
      );
    assert.equal(
      await reconcileFailedScheduledJob(repo, profileId, {
        ...job,
        getState: async () => {
          await repo.claim(runId, 1);
          return 'failed';
        },
      }),
      false,
    );
    assert.equal((await repo.read('2045-01-04'))?.attempt, 2);
    assert.equal((await repo.read('2045-01-04'))?.state, 'running');
    assert.equal(await reconcileFailedScheduledJob(repo, profileId, job), true);
    assert.equal((await repo.read('2045-01-04'))?.state, 'failed');
    assert.equal(
      await repo.finishAttempt(
        runId,
        2,
        'succeeded',
        scheduledOutcome(fixtureScheduledEdition()),
      ),
      false,
    );
    assert.equal(
      await reconcileFailedScheduledJob(repo, profileId, job),
      false,
    );
  } finally {
    await db.query('DELETE FROM scheduled_ai_budget_days WHERE run_id=$1', [
      runId,
    ]);
    await db.end();
  }
});

void test('no-occurrence refresh removes only observed unclaimed slots and preserves competing work', async () => {
  const db = database();
  const repo = new PostgresScheduledBudgetRepository(db);
  const day = '2026-11-01';
  const slot = new Date(day + 'T07:00:00Z');
  const now = new Date(day + 'T00:00:00Z');
  const profile = {
    id: 'obsolete-profile',
    name: 'Synthetic',
    schedule: {
      cadence: '0 16 * * *',
      timezone: 'America/Los_Angeles',
      coverageWindow: 'P1D',
      storyBudget: 5,
      postBudget: 5,
    },
  };
  const clean = () =>
    db.query('DELETE FROM scheduled_ai_budget_days WHERE budget_day=$1', [day]);
  try {
    await repo.register(slot, 'obsolete');
    await refreshScheduledBudget(repo, async () => profile, now);
    assert.equal(await repo.read(day), null);
    assert.equal(await repo.claim('obsolete'), null);
    await refreshScheduledBudget(repo, async () => profile, now);
    assert.equal(await repo.read(day), null);
    // Restoring a schedule on this day can install a fresh slot.
    await refreshScheduledBudget(
      repo,
      async () => ({
        ...profile,
        schedule: {
          ...profile.schedule,
          cadence: '0 8 * * *',
          timezone: 'UTC',
        },
      }),
      now,
    );
    assert.equal(
      (await repo.read(day))?.scheduledAt.toISOString(),
      day + 'T08:00:00.000Z',
    );
    await clean();

    for (const action of [
      'replace',
      'claim',
      'retry',
      'fail',
      'succeed',
    ] as const) {
      await repo.register(slot, 'observed');
      let loaded!: () => void;
      let release!: () => void;
      const snapshotLoaded = new Promise<void>((resolve) => {
        loaded = resolve;
      });
      const resume = new Promise<void>((resolve) => {
        release = resolve;
      });
      const stale = refreshScheduledBudget(
        repo,
        async () => {
          loaded();
          await resume;
          return profile;
        },
        now,
      );
      await snapshotLoaded;
      let expected;
      try {
        if (action === 'replace') {
          await repo.reconcilePending(day, 'observed', slot, 'replacement');
        } else {
          const claim = await repo.claim('observed');
          assert.ok(claim);
          if (action !== 'claim') {
            await repo.finishAttempt(
              claim.runId,
              claim.attempt,
              action === 'retry'
                ? 'retrying'
                : action === 'fail'
                  ? 'failed'
                  : 'succeeded',
              action === 'succeed'
                ? {
                    editionId: 'synthetic-edition',
                    mode: 'fallback',
                    reason: 'Synthetic test',
                  }
                : undefined,
            );
          }
        }
        expected = await repo.read(day);
      } finally {
        release();
      }
      await stale;
      assert.deepEqual(await repo.read(day), expected, action);
      await clean();
    }
    await assert.rejects(repo.removePending(day, ' '));
  } finally {
    await clean();
    await db.end();
  }
});
