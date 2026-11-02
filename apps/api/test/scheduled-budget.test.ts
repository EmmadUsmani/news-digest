import assert from 'node:assert/strict';
import { test } from 'node:test';

import { database } from '../src/libs/db/connections';
import { PostgresScheduledBudgetRepository } from '../src/modules/curation/database/scheduled-budget.repository';

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
