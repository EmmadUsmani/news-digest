import assert from 'node:assert/strict';
import { test } from 'node:test';

import { database } from '../src/libs/db/connections';
import { llmConfig } from '../src/modules/curation/adapters/config';
import { PostgresLlmLedger } from '../src/modules/curation/database/llm.ledger';
import { PostgresScheduledBudgetRepository } from '../src/modules/curation/database/scheduled-budget.repository';

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
    const scheduled = await ledger.reserve(request, 60000);
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
