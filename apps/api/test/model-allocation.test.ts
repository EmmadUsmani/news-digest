import assert from 'node:assert/strict';
import { test } from 'node:test';
import { isDeepStrictEqual } from 'node:util';

import { database } from '../src/libs/db/connections';
import { llmConfig } from '../src/modules/curation/adapters/config';
import { BudgetedLlm } from '../src/modules/curation/application/budgeted-llm';
import { ShortlistEditor } from '../src/modules/curation/application/editor';
import { PostgresLlmLedger } from '../src/modules/curation/database/llm.ledger';
import { readUsage } from '../src/modules/curation/database/usage.reader';
import { modelBudgetAvailable } from '../src/modules/curation/domain/budget';
import type { LlmRequest } from '../src/modules/curation/domain/llm.port';

void test('model allocation floors microdollars and rejects invalid settings', () => {
  assert.equal(modelBudgetAvailable(482758, 346552, 0.8), 39654);
  assert.equal(modelBudgetAvailable(100, 90, 0.8), 0);
  assert.equal(modelBudgetAvailable(101, 0, 0.8), 80);
  assert.equal(modelBudgetAvailable(100, 0, 0), 0);
  assert.equal(modelBudgetAvailable(100, 20, 1), 80);
  assert.throws(() => modelBudgetAvailable(100, 0, 1.01));
  assert.throws(() => llmConfig({ LLM_EDITOR_DAILY_FRACTION: '1.01' }));
  assert.throws(() => llmConfig({ LLM_EDITOR_DAILY_FRACTION: '-1' }));
  assert.equal(llmConfig({}).caps.modelAllocation?.dailyFraction, 0.8);
  assert.equal(
    llmConfig({ LLM_EDITOR_MODEL: 'custom-editor' }).caps.modelAllocation
      ?.model,
    'custom-editor',
  );
});

void test('serialized model reservations preserve Haiku funds, settlement, uncertainty and cached editorial fallback', async () => {
  const db = database();
  const config = llmConfig({});
  const ledger = new PostgresLlmLedger(db, {
    monthly: 30e6,
    dailyMax: 100000,
    modelAllocation: { model: config.sonnet.id, dailyFraction: 0.5 },
  });
  const request: LlmRequest = {
    model: config.sonnet,
    purpose: 'allocation-test',
    runId: 'offline',
    instructions: '',
    prompt: '',
    maxOutputTokens: 10,
  };
  const ids: string[] = [];
  const cacheKeys: string[] = [];
  const cache = ledger.cache.bind(ledger);
  ledger.cache = async (key, value) => {
    cacheKeys.push(key);
    await cache(key, value);
  };
  try {
    const results = await Promise.all(
      Array.from({ length: 10 }, () => ledger.reserve(request, 30000)),
    );
    ids.push(...results.filter((id): id is string => id !== null));
    assert.equal(ids.length, 1);
    await ledger.settle(
      ids[0],
      { input: 0, cacheWrite: 0, cacheRead: 0, output: 1 },
      10000,
    );
    const second = await ledger.reserve(request, 40000);
    assert.ok(second);
    ids.push(second);
    await ledger.fail(second, 'offline-uncertain', false, true);
    // Uncertain calls remain charged even across month/day boundaries.
    await db.query(
      "UPDATE llm_calls SET created_at=now()-interval '2 months' WHERE id=$1",
      [second],
    );
    assert.equal(await ledger.reserve(request, 1), null);
    const status = await readUsage(db, ledger.caps);
    assert.deepEqual(status.modelAllocation, {
      model: config.sonnet.id,
      dailyCapMicros: 50000,
      usedMicros: 50000,
      availableMicros: 0,
    });
    assert.equal(status.availableMicros, 50000);
    let calls = 0;
    const editor = new ShortlistEditor(
      new BudgetedLlm(
        {
          async complete(req) {
            calls++;
            assert.equal(req.model.id, config.haiku.id);
            return {
              text: JSON.stringify({
                brief: ['One', 'Two'],
                stories: [
                  {
                    id: 'a',
                    evidenceIds: ['a'],
                    headline: 'Headline',
                    summary: 'Summary.',
                    whyItMatters: 'Significance.',
                    rationale: 'Reason.',
                  },
                ],
              }),
              usage: { input: 10, cacheWrite: 0, cacheRead: 0, output: 20 },
            };
          },
        },
        ledger,
      ),
      config.sonnet,
      config.haiku,
    );
    const topic = { id: 'topic', name: 'Topic', description: '', guidance: '' };
    const candidates = [
      { id: 'a', title: 'Article', excerpt: 'Facts.', sources: ['Source'] },
    ];
    const edited = await editor.edit(topic, candidates, 1, 'offline');
    assert.equal(edited?.model, config.haiku.id);
    assert.deepEqual(await editor.edit(topic, candidates, 1, 'cached'), edited);
    assert.equal(calls, 1);
    // A known failed request releases its model allocation.
    await db.query("UPDATE llm_calls SET status='failed' WHERE id=$1", [
      second,
    ]);
    const released = await ledger.reserve(request, 40000);
    assert.ok(released);
    ids.push(released);
  } finally {
    await db.query(
      "DELETE FROM llm_calls WHERE purpose IN ('allocation-test','shortlist-editor-v2')",
    );
    await db.query('DELETE FROM llm_cache WHERE cache_key=ANY($1::text[])', [
      cacheKeys,
    ]);
    await db.end();
  }
});

void test('concurrent cache writers preserve one complete immutable JSON response and recover after rejection', async () => {
  const db = database();
  const ledgers = [
    new PostgresLlmLedger(db, { monthly: 30e6, dailyMax: 1e6 }),
    new PostgresLlmLedger(db, { monthly: 30e6, dailyMax: 1e6 }),
  ];
  const key = 'isolated-concurrent-cache';
  const otherKey = `${key}-other`;
  const responses = [
    { picks: [{ id: 'a', score: 0.75 }], explanation: '世界', extra: null },
    {
      picks: [{ id: 'b', score: 0.25 }],
      explanation: 'NBA',
      extra: [true, false],
    },
  ];
  try {
    assert.equal(await ledgers[0].cached(key), undefined);
    await Promise.all(
      ledgers.map((ledger, i) => ledger.cache(key, responses[i])),
    );
    const winner = await ledgers[0].cached(key);
    assert.ok(
      responses.some((response) => isDeepStrictEqual(response, winner)),
    );
    assert.deepEqual(await ledgers[1].cached(key), winner);
    // A later write cannot replace the first successful response.
    await ledgers[1].cache(key, { replacement: true });
    assert.deepEqual(await ledgers[0].cached(key), winner);
    const mutable = (await ledgers[1].cached(key)) as {
      picks: { id: string }[];
    };
    mutable.picks[0].id = 'caller-mutation';
    assert.deepEqual(await ledgers[0].cached(key), winner);
    // PostgreSQL JSON rejects a zero byte; the failure must not poison reuse.
    await assert.rejects(ledgers[0].cache(otherKey, { invalid: '\u0000' }));
    assert.equal(await ledgers[1].cached(otherKey), undefined);
    await ledgers[1].cache(otherKey, { recovered: [1, null, 'ok'] });
    assert.deepEqual(await ledgers[0].cached(otherKey), {
      recovered: [1, null, 'ok'],
    });
    assert.deepEqual(await ledgers[1].cached(key), winner);
    assert.deepEqual(await ledgers[0].cachedMany([]), new Map());
    const bulk = await ledgers[0].cachedMany([
      otherKey,
      key,
      'missing-cache-key',
      key,
    ]);
    assert.equal(bulk.size, 2);
    assert.deepEqual(bulk.get(key), winner);
    assert.deepEqual(bulk.get(otherKey), { recovered: [1, null, 'ok'] });
    assert.equal(bulk.has('missing-cache-key'), false);
    bulk.clear();
    assert.equal((await ledgers[1].cachedMany([key])).size, 1);
    await ledgers[0].cacheMany([]);
    await ledgers[0].cacheMany([
      { key, response: { replacement: true } },
      { key: otherKey, response: { replacement: true } },
    ]);
    assert.deepEqual(await ledgers[1].cached(key), winner);
    await db.query('DELETE FROM llm_cache WHERE cache_key=$1', [otherKey]);
    await assert.rejects(
      ledgers[0].cacheMany([
        { key: otherKey, response: { valid: true } },
        { key: otherKey + '-bad', response: { invalid: '\u0000' } },
      ]),
    );
    assert.equal(await ledgers[1].cached(otherKey), undefined);
    await ledgers[0].cacheMany([
      { key: otherKey, response: { first: true } },
      { key: otherKey, response: { second: true } },
    ]);
    assert.deepEqual(await ledgers[1].cached(otherKey), { first: true });
  } finally {
    await db.query('DELETE FROM llm_cache WHERE cache_key=ANY($1::text[])', [
      [key, otherKey],
    ]);
    await db.end();
  }
});
