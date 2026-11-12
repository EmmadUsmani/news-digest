import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { test } from 'node:test';

import { database } from '../src/libs/db/connections';
import { llmConfig } from '../src/modules/curation/adapters/config';
import { PostgresLlmLedger } from '../src/modules/curation/database/llm.ledger';

void test('live development scripts refuse without opt-in before database or provider access', () => {
  for (const name of [
    'smoke-anthropic',
    'smoke-editor',
    'smoke-triage',
    'record-editorial-evaluation',
  ]) {
    const result = spawnSync(
      'pnpm',
      ['exec', 'tsx', `apps/api/scripts/${name}.ts`],
      {
        env: {
          ...process.env,
          LLM_LIVE: '',
          DATABASE_URL: 'invalid',
          ANTHROPIC_API_KEY: '',
        },
        encoding: 'utf8',
        timeout: 10000,
      },
    );
    assert.equal(result.status, 1, name);
    assert.match(result.stderr, /LLM_LIVE=1/, name);
  }
});

void test('verification reservations serialize across ledgers, repairs and UTC rollover', async () => {
  const db = database();
  const caps = { monthly: 30e6, dailyMax: 1e6 };
  const ledgers = [
    new PostgresLlmLedger(db, caps, true),
    new PostgresLlmLedger(db, caps, true),
  ];
  const request = {
    model: llmConfig({}).haiku,
    purpose: 'editor-original-purpose',
    runId: 'verification-budget-test',
    instructions: '',
    prompt: '',
    maxOutputTokens: 10,
  };
  try {
    const results = await Promise.all(
      Array.from({ length: 8 }, (_, i) =>
        ledgers[i % 2].reserve(request, 30000),
      ),
    );
    const ids = results.filter((id): id is string => id !== null);
    assert.equal(ids.length, 1);
    assert.equal(
      (await db.query('SELECT purpose FROM llm_calls WHERE id=$1', ids)).rows[0]
        .purpose,
      'verification',
    );
    await ledgers[0].settle(
      ids[0],
      { input: 1, cacheWrite: 0, cacheRead: 0, output: 1 },
      10000,
    );
    const second = await ledgers[1].reserve(request, 40000);
    assert.ok(second);
    await ledgers[1].fail(second, 'offline-uncertain', false, true);
    await db.query(
      "UPDATE llm_calls SET created_at=now()-interval '2 months' WHERE id=$1",
      [second],
    );
    assert.equal(await ledgers[0].reserve(request, 1), null);
    // Explicit purpose tags must receive the same ceiling without constructor mode.
    assert.equal(
      await new PostgresLlmLedger(db, caps).reserve(
        { ...request, purpose: 'verification' },
        1,
      ),
      null,
    );
    // An operator resolving an uncertain transport outcome releases its hold.
    await db.query("UPDATE llm_calls SET status='failed' WHERE id=$1", [
      second,
    ]);
    const released = await ledgers[0].reserve(request, 40000);
    assert.ok(released);
    assert.equal(await ledgers[1].reserve(request, 1), null);
    // Ordinary digest reservations retain the existing app allowance.
    const ordinary = await new PostgresLlmLedger(db, caps).reserve(request, 1);
    assert.ok(ordinary);
  } finally {
    await db.query('DELETE FROM llm_calls WHERE run_id=$1', [request.runId]);
    await db.end();
  }
});

void test('detailed admission snapshots preserve caps, old pending holds and atomic legacy admission', async () => {
  const db = database();
  const model = { ...llmConfig({}).haiku, id: 'detailed-admission-fixture' };
  const request = {
    model,
    purpose: 'verification',
    runId: 'detailed-admission-fixture',
    instructions: '',
    prompt: '',
    maxOutputTokens: 1,
  };
  const ledger = new PostgresLlmLedger(db, {
    monthly: 1,
    dailyMax: 1,
    modelAllocation: { model: model.id, dailyFraction: 0.8 },
  });
  const pending = crypto.randomUUID();
  const uncertain = crypto.randomUUID();
  try {
    for (const [id, status] of [
      [pending, 'pending'],
      [uncertain, 'uncertain'],
    ]) {
      await db.query(
        `INSERT INTO llm_calls
        (id,model,purpose,run_id,status,reserved_micros,created_at)
        VALUES ($1,$2,'verification',$3,$4,50000,now()-interval '2 months')`,
        [id, model.id, request.runId, status],
      );
    }
    const result = await ledger.reserveDetailed(request, 1);
    assert.equal(result.status, 'refused');
    if (result.status !== 'refused') assert.fail('expected refusal');
    assert.deepEqual(result.reasons, [
      'verification-cap',
      'monthly-cap',
      'daily-cap',
      'model-allocation',
    ]);
    assert.equal(result.modelAvailableMicros, 0);
    assert.equal(result.pendingHoldsOverflow, false);
    assert.deepEqual(
      result.pendingHolds.map((hold) => hold.id),
      [pending],
    );
    assert.equal(result.pendingHolds[0].reservedMicros, 50000);
    assert.ok(
      Date.parse(result.pendingHolds[0].createdAt) < Date.now() - 86400000,
    );
    assert.equal(await ledger.reserve(request, 1), null);
    await assert.rejects(
      ledger.reserveDetailed(request, NaN),
      /Invalid reservation/,
    );
    await db.query(
      `INSERT INTO llm_calls
      (id,model,purpose,run_id,status,reserved_micros)
      SELECT gen_random_uuid(),$1,'verification',$2,'pending',1
      FROM generate_series(1,64)`,
      [model.id, request.runId],
    );
    const overflow = await ledger.reserveDetailed(request, 1);
    assert.equal(overflow.status, 'refused');
    if (overflow.status !== 'refused') assert.fail('expected refusal');
    assert.equal(overflow.pendingHoldsOverflow, true);
    assert.deepEqual(overflow.pendingHolds, []);
    await db.query('DELETE FROM llm_calls WHERE run_id=$1', [request.runId]);
    const generous = new PostgresLlmLedger(db, {
      monthly: 1e12,
      dailyMax: 1e12,
    });
    const normal = { ...request, purpose: 'editor' };
    const admitted = await generous.reserveDetailed(normal, 1);
    assert.equal(admitted.status, 'admitted');
    const legacy = await generous.reserve(normal, 1);
    assert.ok(legacy);
    const { rows } = await db.query(
      'SELECT id FROM llm_calls WHERE run_id=$1',
      [request.runId],
    );
    assert.equal(rows.length, 2);
    assert.deepEqual(
      new Set(rows.map((row: { id: string }) => row.id)),
      new Set([legacy, admitted.status === 'admitted' ? admitted.id : '']),
    );
  } finally {
    await db.query('DELETE FROM llm_calls WHERE run_id=$1', [request.runId]);
    await db.end();
  }
});
