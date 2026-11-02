import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { test } from 'node:test';

import { llmUsageSchema } from '@digest/contracts';

import { database } from '../src/libs/db/connections';
import { PostgresScheduledBudgetRepository } from '../src/modules/curation/database/scheduled-budget.repository';
import { readLlmUsage } from '../src/modules/curation/public/usage';

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
