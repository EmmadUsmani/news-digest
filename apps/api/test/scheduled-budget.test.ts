import assert from 'node:assert/strict';
import { test } from 'node:test';

import { database } from '../src/libs/db/connections';
import { readFullAiEditionCosts } from '../src/modules/curation/database/edition-cost.reader';
import { PostgresScheduledBudgetRepository } from '../src/modules/curation/database/scheduled-budget.repository';

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
