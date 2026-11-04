import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { test } from 'node:test';

import { llmUsageSchema } from '@digest/contracts';

import { database } from '../src/libs/db/connections';
import { PostgresScheduledBudgetRepository } from '../src/modules/curation/database/scheduled-budget.repository';
import { readLlmUsage } from '../src/modules/curation/public/usage';
import { hasBudgetDayOccurrence } from '../src/modules/profiles/public/budget-day';

void test('reserve telemetry distinguishes disabled protection, active manual limits and released fallback outcome', async () => {
  const db = database();
  const budgets = new PostgresScheduledBudgetRepository(db);
  const now = (await db.query<{ now: Date }>('SELECT clock_timestamp() AS now'))
    .rows[0].now;
  const runId = randomUUID();
  const env = {
    LLM_SCHEDULED_RESERVE_ENABLED: '1',
    LLM_SCHEDULED_RESERVE_MICROS: '100000',
  };
  try {
    await budgets.register(now, runId);
    const read = async (overrides = env) =>
      llmUsageSchema.parse(await readLlmUsage(db, overrides));
    const pending = await read();
    assert.equal(pending.scheduledReserve?.state, 'pending');
    assert.equal(pending.scheduledReserve.reserveMicros, 100000);
    assert.equal(
      pending.scheduledReserve.otherSpendLimitMicros,
      pending.dailyCapMicros - 100000,
    );
    assert.equal(
      pending.scheduledReserve.otherAvailableMicros,
      Math.max(
        0,
        Math.min(
          pending.availableMicros,
          pending.dailyCapMicros -
            100000 -
            pending.todayMicros -
            pending.todayReservedMicros,
        ),
      ),
    );
    const disabled = await read({ ...env, LLM_SCHEDULED_RESERVE_ENABLED: '0' });
    assert.equal(disabled.scheduledReserve?.enabled, false);
    assert.equal(disabled.scheduledReserve.reserveMicros, 0);
    assert.equal(disabled.scheduledReserve.sizedReserveMicros, 100000);
    assert.equal(
      disabled.scheduledReserve.otherAvailableMicros,
      disabled.availableMicros,
    );
    assert.equal(disabled.scheduledReserve.limitedByReserve, false);
    const claim = await budgets.claim(runId);
    assert.ok(claim);
    assert.equal((await read()).scheduledReserve?.state, 'running');
    await budgets.finishAttempt(runId, claim.attempt, 'retrying');
    assert.equal((await read()).scheduledReserve?.reserveMicros, 100000);
    const retry = await budgets.claim(runId);
    assert.ok(retry);
    const outcome = {
      editionId: randomUUID(),
      mode: 'fallback' as const,
      reason: 'Synthetic budget exhaustion.',
    };
    await budgets.finishAttempt(runId, retry.attempt, 'succeeded', outcome);
    const released = await read();
    assert.equal(released.scheduledReserve?.reserveMicros, 0);
    assert.equal(
      released.scheduledReserve.otherAvailableMicros,
      released.availableMicros,
    );
    assert.deepEqual(released.scheduledReserve.lastOutcome, {
      budgetDay: now.toISOString().slice(0, 10),
      scheduledAt: now.toISOString(),
      state: 'succeeded',
      outcome,
    });
  } finally {
    await db.query('DELETE FROM scheduled_ai_budget_days WHERE run_id=$1', [
      runId,
    ]);
    await db.end();
  }
});

void test('missing schedule fails usage closed, rolls back and releases the ledger lock and pooled client', async () => {
  const db = database();
  // A leaked checkout must fail the retry instead of silently using another client.
  db.options.max = 1;
  const observer = database();
  const profileId = '00000000-0000-4000-8000-000000000001';
  const {
    rows: [schedule],
  } = await db.query('SELECT * FROM digest_schedules WHERE profile_id=$1', [
    profileId,
  ]);
  const { rows: slots } = await db.query(
    'SELECT * FROM scheduled_ai_budget_days WHERE budget_day=CURRENT_DATE',
  );
  const client = await db.connect();
  try {
    await client.query('BEGIN');
    await client.query('DELETE FROM digest_schedules WHERE profile_id=$1', [
      profileId,
    ]);
    await assert.rejects(
      hasBudgetDayOccurrence(client, '2026-11-04'),
      /Default profile schedule missing/,
    );
    await client.query(
      'DELETE FROM scheduled_ai_budget_days WHERE budget_day=CURRENT_DATE',
    );
    await client.query('COMMIT');
  } finally {
    await client.query('ROLLBACK');
    client.release();
  }
  try {
    await assert.rejects(
      readLlmUsage(db, {}),
      /Default profile schedule missing/,
    );
    assert.equal(db.totalCount, 1);
    assert.equal(db.idleCount, 1, 'failed usage read releases its only client');
    // A different session must acquire the transaction-scoped lock after failure.
    const lock = await observer.connect();
    try {
      await lock.query('BEGIN');
      const {
        rows: [row],
      } = await lock.query<{ acquired: boolean }>(
        'SELECT pg_try_advisory_xact_lock(756282) AS acquired',
      );
      assert.equal(
        row.acquired,
        true,
        'rollback releases the shared ledger lock',
      );
    } finally {
      await lock.query('ROLLBACK');
      lock.release();
    }
    await db.query(
      'INSERT INTO digest_schedules SELECT * FROM json_populate_record(NULL::digest_schedules,$1::json)',
      [JSON.stringify(schedule)],
    );
    const usage = llmUsageSchema.parse(await readLlmUsage(db, {}));
    assert.equal(usage.scheduledReserve?.state, 'pending');
    assert.equal(db.idleCount, 1, 'retry succeeds on the same pooled session');
  } finally {
    await db.query(
      'INSERT INTO digest_schedules SELECT * FROM json_populate_record(NULL::digest_schedules,$1::json) ON CONFLICT DO NOTHING',
      [JSON.stringify(schedule)],
    );
    await db.query(
      'DELETE FROM scheduled_ai_budget_days WHERE budget_day=CURRENT_DATE',
    );
    for (const slot of slots) {
      await db.query(
        'INSERT INTO scheduled_ai_budget_days SELECT * FROM json_populate_record(NULL::scheduled_ai_budget_days,$1::json)',
        [JSON.stringify(slot)],
      );
    }
    await observer.end();
    await db.end();
  }
});
