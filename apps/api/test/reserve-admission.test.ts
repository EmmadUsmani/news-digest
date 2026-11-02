import assert from 'node:assert/strict';
import { test } from 'node:test';

import { database } from '../src/libs/db/connections';
import { llmConfig } from '../src/modules/curation/adapters/config';
import { PostgresLlmLedger } from '../src/modules/curation/database/llm.ledger';
import { PostgresScheduledBudgetRepository } from '../src/modules/curation/database/scheduled-budget.repository';
import { configuredLlmLedger } from '../src/modules/curation/public/ledger';
import {
  scheduledLedgerContext,
  withEditionRun,
  withScheduledAttempt,
} from '../src/modules/curation/public/scheduled-context';
import { hasBudgetDayOccurrence } from '../src/modules/profiles/public/budget-day';

void test('reserve admission serializes competing spend and fences scheduled privileges by identity and attempt', async () => {
  const db = database();
  const budgets = new PostgresScheduledBudgetRepository(db);
  const {
    rows: [clock],
  } = await db.query<{ now: Date }>('SELECT clock_timestamp() AS now');
  const day = clock.now.toISOString().slice(0, 10);
  const runId = 'reserve-admission-slot';
  const request = {
    model: llmConfig({}).haiku,
    purpose: 'scheduled-editor',
    runId: 'reserve-admission-edition',
    instructions: '',
    prompt: '',
    maxOutputTokens: 1,
  };
  // Earlier repository fixtures can leave settled usage in this disposable DB.
  // Give this case exactly 100k additional allowance without deleting their data.
  const {
    rows: [baseline],
  } = await db.query<{ used: number }>(
    `SELECT COALESCE(sum(COALESCE(cost_micros,reserved_micros)),0)::float8 AS used
     FROM llm_calls WHERE status <> 'failed'
     AND (created_at >= $1::date OR status IN ('pending','uncertain'))`,
    [day],
  );
  const caps = { monthly: 30e6, dailyMax: baseline.used + 100000 };
  let context:
    { runId: string; attempt: number; editionRunId: string } | undefined;
  const options = {
    policy: { configuredMicros: 80000, headroom: 1.5 },
    context: () => context,
  };
  const ledger = new PostgresLlmLedger(db, caps, false, options);
  try {
    // Missing registration protects funds; arbitrary purpose text grants nothing.
    assert.equal(await ledger.reserve(request, 20001), null);
    await budgets.register(clock.now, runId);
    const results = await Promise.all(
      Array.from({ length: 8 }, () => ledger.reserve(request, 10000)),
    );
    const admitted = results.filter((id): id is string => id !== null);
    assert.equal(admitted.length, 2);
    const claimed = await budgets.claim(runId);
    assert.ok(claimed);
    context = { runId, attempt: claimed.attempt, editionRunId: request.runId };
    assert.equal(
      await ledger.reserve({ ...request, runId: 'forged-edition' }, 1),
      null,
    );
    assert.equal(
      await ledger.reserve({ ...request, purpose: 'verification' }, 1),
      null,
    );
    assert.equal(
      await new PostgresLlmLedger(db, caps, true, options).reserve(request, 1),
      null,
    );
    context = { ...context, attempt: claimed.attempt + 1 };
    assert.equal(await ledger.reserve(request, 1), null);
    context = { ...context, attempt: claimed.attempt, runId: 'wrong-slot' };
    assert.equal(await ledger.reserve(request, 1), null);
    context = { ...context, runId };
    const env = {
      LLM_SCHEDULED_RESERVE_ENABLED: '1',
      LLM_SCHEDULED_RESERVE_MICROS: '80000',
    };
    const contextualLedger = configuredLlmLedger(db, caps, false, env);
    const verificationLedger = configuredLlmLedger(db, caps, true, env);
    assert.equal(
      await withScheduledAttempt(runId, claimed.attempt, () =>
        withEditionRun(runId, request.runId, () =>
          verificationLedger.reserve(request, 1),
        ),
      ),
      null,
    );
    assert.equal(await contextualLedger.reserve(request, 1), null);
    const scheduled = await withScheduledAttempt(runId, claimed.attempt, () =>
      withEditionRun(runId, request.runId, () =>
        contextualLedger.reserve(request, 60000),
      ),
    );
    assert.equal(scheduledLedgerContext(), undefined);
    assert.ok(scheduled);
    await ledger.fail(scheduled, 'fixture-uncertain', false, true);
    // Uncertain holds consume actual daily allowance even for the owner slot.
    assert.equal(await ledger.reserve(request, 20001), null);
    assert.equal(
      await budgets.finishAttempt(runId, claimed.attempt, 'retrying'),
      true,
    );
    assert.equal(await ledger.reserve(request, 1), null);
    const retried = await budgets.claim(runId);
    assert.ok(retried);
    assert.equal(await ledger.reserve(request, 1), null); // Old context is fenced.
    context = { ...context, attempt: retried.attempt };
    assert.equal(
      await budgets.finishAttempt(runId, retried.attempt, 'failed'),
      true,
    );
    context = undefined;
    const released = await ledger.reserve(request, 20000);
    assert.ok(released);
    assert.equal(await ledger.reserve(request, 1), null);
  } finally {
    await db.query('DELETE FROM llm_calls WHERE run_id=$1', [request.runId]);
    await db.query(
      'DELETE FROM scheduled_ai_budget_days WHERE budget_day=$1 AND run_id=$2',
      [day, runId],
    );
    await db.end();
  }
});

void test('lifecycle transitions and admission share lock ordering; yesterday cannot spend today’s reserve', async () => {
  const db = database();
  const budgets = new PostgresScheduledBudgetRepository(db);
  const {
    rows: [clock],
  } = await db.query<{ now: Date }>('SELECT clock_timestamp() AS now');
  const day = clock.now.toISOString().slice(0, 10);
  const runId = 'reserve-lifecycle-slot';
  const yesterday = new Date(clock.now.getTime() - 86400000);
  const oldRunId = 'reserve-yesterday-slot';
  const request = {
    model: llmConfig({}).haiku,
    purpose: 'scheduled-editor',
    runId: 'reserve-lifecycle-edition',
    instructions: '',
    prompt: '',
    maxOutputTokens: 1,
  };
  const {
    rows: [baseline],
  } = await db.query<{ used: number }>(
    `SELECT COALESCE(sum(COALESCE(cost_micros,reserved_micros)),0)::float8 AS used
     FROM llm_calls WHERE status <> 'failed'
     AND (created_at >= $1::date OR status IN ('pending','uncertain'))`,
    [day],
  );
  let context = { runId, attempt: 1, editionRunId: request.runId };
  const ledger = new PostgresLlmLedger(
    db,
    { monthly: 30e6, dailyMax: baseline.used + 100000 },
    false,
    {
      policy: { configuredMicros: 100000, headroom: 1.5 },
      context: () => context,
    },
  );
  // Hold the real shared lock, then observe PostgreSQL's waiter before queueing
  // the competing operation. This pins transaction ordering without sleeps as
  // evidence or any production clock/ledger overrides.
  const gate = await db.connect();
  async function queued<T, U>(
    first: () => Promise<T>,
    second: () => Promise<U>,
  ) {
    await gate.query('BEGIN');
    await gate.query('SELECT pg_advisory_xact_lock(756282)');
    const firstResult = first();
    let waiting = false;
    for (let i = 0; i < 200; i++) {
      const {
        rows: [row],
      } = await gate.query<{ waiting: boolean }>(
        `SELECT EXISTS(SELECT 1 FROM pg_locks WHERE locktype='advisory'
         AND objid=756282 AND NOT granted) AS waiting`,
      );
      if (row.waiting) {
        waiting = true;
        break;
      }
      await new Promise((resolve) => setTimeout(resolve, 5));
    }
    if (!waiting) {
      await gate.query('ROLLBACK');
      await firstResult;
      assert.fail('first operation never queued on the shared ledger lock');
    }
    const secondResult = second();
    await gate.query('COMMIT');
    return Promise.all([firstResult, secondResult]);
  }
  try {
    await budgets.register(clock.now, runId);
    const [claimed, admitted] = await queued(
      () => budgets.claim(runId),
      () => ledger.reserve(request, 1),
    );
    assert.equal(claimed?.attempt, 1);
    assert.ok(admitted); // Claim committed before admission reads the identity.
    await ledger.fail(admitted, 'fixture', false, false);
    const [retrying, denied] = await queued(
      () => budgets.finishAttempt(runId, 1, 'retrying'),
      () => ledger.reserve(request, 1),
    );
    assert.equal(retrying, true);
    assert.equal(denied, null);
    const retried = await budgets.claim(runId);
    assert.equal(retried?.attempt, 2);
    context = { ...context, attempt: 2 };
    await budgets.register(yesterday, oldRunId);
    const oldClaim = await budgets.claim(oldRunId);
    assert.ok(oldClaim);
    context = { ...context, runId: oldRunId, attempt: oldClaim.attempt };
    assert.equal(await ledger.reserve(request, 1), null);
    // Ordinary admission ahead of terminal release remains denied; the next
    // admission sees the committed failure and can use the released allowance.
    const [beforeRelease, finished] = await queued(
      () => ledger.reserve(request, 1),
      () => budgets.finishAttempt(runId, 2, 'failed'),
    );
    assert.equal(beforeRelease, null);
    assert.equal(finished, true);
    assert.ok(await ledger.reserve(request, 100000));
    assert.equal(await ledger.reserve(request, 1), null);
  } finally {
    await gate.query('ROLLBACK');
    gate.release();
    await db.query('DELETE FROM llm_calls WHERE run_id=$1', [request.runId]);
    await db.query(
      'DELETE FROM scheduled_ai_budget_days WHERE run_id=ANY($1::text[])',
      [[runId, oldRunId]],
    );
    await db.end();
  }
});

void test('verified no-occurrence releases missing slots only and locks the saved schedule', async () => {
  const db = database();
  const budgets = new PostgresScheduledBudgetRepository(db);
  const reader = await db.connect();
  const writer = await db.connect();
  const {
    rows: [clock],
  } = await db.query<{ now: Date }>('SELECT clock_timestamp() AS now');
  const day = clock.now.toISOString().slice(0, 10);
  const profileId = '00000000-0000-4000-8000-000000000001';
  const {
    rows: [original],
  } = await db.query<{ cadence: string; timezone: string }>(
    'SELECT cadence,timezone FROM digest_schedules WHERE profile_id=$1',
    [profileId],
  );
  const {
    rows: [baseline],
  } = await db.query<{ used: number }>(
    `SELECT COALESCE(sum(COALESCE(cost_micros,reserved_micros)),0)::float8 AS used
     FROM llm_calls WHERE status <> 'failed'
     AND (created_at >= $1::date OR status IN ('pending','uncertain'))`,
    [day],
  );
  const caps = { monthly: 30e6, dailyMax: baseline.used + 100000 };
  const request = {
    model: llmConfig({}).haiku,
    purpose: 'manual-editor',
    runId: 'no-occurrence-edition',
    instructions: '',
    prompt: '',
    maxOutputTokens: 1,
  };
  const options = {
    policy: { configuredMicros: 100000, headroom: 1.5 },
    context: () => undefined,
    // Frozen DST day exercises the real persisted-schedule resolver; ledger
    // money and lifecycle continue to use the actual PostgreSQL clock.
    hasOccurrence: (client: import('pg').PoolClient) =>
      hasBudgetDayOccurrence(client, '2026-11-01'),
  };
  const ledger = new PostgresLlmLedger(db, caps, false, options);
  const runId = 'no-occurrence-slot';
  try {
    await db.query(
      `UPDATE digest_schedules SET cadence='30 16 * * *',timezone='America/Los_Angeles' WHERE profile_id=$1`,
      [profileId],
    );
    await reader.query('BEGIN');
    assert.equal(await hasBudgetDayOccurrence(reader, '2026-11-01'), false);
    assert.equal(await hasBudgetDayOccurrence(reader, '2026-11-02'), true);
    // A concurrent settings update cannot invalidate the admission snapshot.
    await writer.query('BEGIN');
    await writer.query("SET LOCAL lock_timeout='100ms'");
    await assert.rejects(
      writer.query(
        `UPDATE digest_schedules SET cadence='0 7 * * *' WHERE profile_id=$1`,
        [profileId],
      ),
      { code: '55P03' },
    );
    await writer.query('ROLLBACK');
    await reader.query('COMMIT');
    assert.ok(await ledger.reserve(request, 100000));
    assert.equal(await ledger.reserve(request, 1), null); // Still obeys daily cap.
    await db.query('DELETE FROM llm_calls WHERE run_id=$1', [request.runId]);
    await budgets.register(clock.now, runId);
    assert.equal(await ledger.reserve(request, 1), null); // Existing identity wins.
    const claimed = await budgets.claim(runId);
    assert.ok(claimed);
    assert.equal(await ledger.reserve(request, 1), null);
    await db.query('DELETE FROM scheduled_ai_budget_days WHERE run_id=$1', [
      runId,
    ]);
    await db.query(
      `UPDATE digest_schedules SET timezone='invalid-zone' WHERE profile_id=$1`,
      [profileId],
    );
    await assert.rejects(ledger.reserve(request, 1), /Invalid IANA timezone/);
    await db.query(
      `UPDATE digest_schedules SET cadence='0 7 * * *',timezone='UTC' WHERE profile_id=$1`,
      [profileId],
    );
    const production = configuredLlmLedger(db, caps, false, {
      LLM_SCHEDULED_RESERVE_ENABLED: '1',
      LLM_SCHEDULED_RESERVE_MICROS: '100000',
    });
    assert.equal(await production.reserve(request, 1), null); // Today's occurrence needs a slot.
    await db.query(
      `UPDATE digest_schedules SET timezone='invalid-zone' WHERE profile_id=$1`,
      [profileId],
    );
    await assert.rejects(
      production.reserve(request, 1),
      /Invalid IANA timezone/,
    );
  } finally {
    await reader.query('ROLLBACK');
    await writer.query('ROLLBACK');
    reader.release();
    writer.release();
    await db.query(
      'UPDATE digest_schedules SET cadence=$2,timezone=$3 WHERE profile_id=$1',
      [profileId, original.cadence, original.timezone],
    );
    await db.query('DELETE FROM llm_calls WHERE run_id=$1', [request.runId]);
    await db.query('DELETE FROM scheduled_ai_budget_days WHERE run_id=$1', [
      runId,
    ]);
    await db.end();
  }
});
