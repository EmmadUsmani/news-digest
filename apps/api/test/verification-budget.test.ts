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
