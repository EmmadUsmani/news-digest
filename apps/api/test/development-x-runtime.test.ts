import assert from 'node:assert/strict';
import { test } from 'node:test';

import type { Pool } from 'pg';

import { prepareDevelopmentXRuntime } from '../src/development-x-runtime';
import type { DevelopmentSpendPort } from '../src/modules/digests/domain/development-spend.port';

const request = {
  topic: 'Technology',
  guidance: 'Technology news',
  fromDate: '2026-11-06',
  toDate: '2026-11-07',
  fixedSearch: {
    style: 'trending' as const,
    rankedStoryTitles: [],
    settings: { trendingMinFaves: 100, reactionMinFaves: 100, exclusions: [] },
  },
};
function harness(inputTokens = 10, status = 200) {
  const events: unknown[] = [];
  const spend: DevelopmentSpendPort = {
    status: async () => {
      throw new Error('Unexpected status');
    },
    reserve: async (...args) => {
      events.push(['reserve', ...args]);
      return { admitted: true, replay: false, mustReport: false };
    },
    settle: async (...args) => {
      events.push(['settle', ...args]);
      return {
        capMicros: 2000000,
        stopAtMicros: 1500000,
        availableMicros: 1,
        mustReport: true,
      };
    },
  };
  const runtime = prepareDevelopmentXRuntime(
    {
      db: {} as Pool,
      env: { X_SEARCH_LIVE: '1', XAI_API_KEY: 'offline-fixture' },
      fetch: async (url, init) => {
        assert.equal(url, 'https://api.x.ai/v1/responses');
        assert.equal(init?.redirect, 'error');
        events.push('http');
        return new Response(
          JSON.stringify({
            status: 'completed',
            output: [],
            usage: {
              input_tokens: inputTokens,
              output_tokens: 4,
              server_side_tool_usage_details: {
                x_posts_fetched: 3,
                x_users_fetched: 2,
              },
            },
          }),
          { status },
        );
      },
    },
    () => spend,
  )!;
  return { events, spend, runtime };
}
void test('development X opt-in avoids key and database access', () => {
  for (const flag of [undefined, '0', 'true'])
    assert.equal(
      prepareDevelopmentXRuntime(
        { db: {} as Pool, env: { X_SEARCH_LIVE: flag } },
        () => {
          throw new Error('Unexpected database');
        },
      ),
      null,
    );
  assert.throws(
    () =>
      prepareDevelopmentXRuntime({
        db: {} as Pool,
        env: { X_SEARCH_LIVE: '1' },
      }),
    /key/,
  );
});
void test('development X reserves first and settles all fetched items at fixed tier pricing', async () => {
  for (const [input, expected] of [
    [10, 35023],
    [200000, 535020],
    [1_000_000, 2535020],
  ]) {
    const h = harness(input);
    const result = await h.runtime.search(request, 'offline');
    assert.equal(result.status, 'complete');
    if (result.status === 'complete') assert.equal(result.mustReport, true);
    assert.deepEqual(h.events, [
      ['reserve', 'offline', 'xai', 400000],
      'http',
      ['settle', 'offline', expected],
    ]);
  }
});
void test('development X refuses malformed requests before reservation', () => {
  const h = harness();
  assert.throws(() => h.runtime.search(request, ' '), /attempt/);
  assert.throws(
    () => h.runtime.search({ ...request, fixedSearch: undefined }, 'offline'),
    /fixed keyword/,
  );
  assert.throws(
    () => h.runtime.search({ ...request, fromDate: 'invalid' }, 'offline'),
    /Invalid/,
  );
  assert.deepEqual(h.events, []);
});
void test('development X suppresses replay and refused attempts', async () => {
  for (const reservation of [
    { admitted: true as const, replay: true, mustReport: false },
    { admitted: false as const, mustReport: true },
  ]) {
    const h = harness();
    h.spend.reserve = async () => reservation;
    assert.equal(
      (await h.runtime.search(request, 'offline')).status,
      reservation.admitted ? 'replay' : 'budget-refused',
    );
    assert.deepEqual(h.events, []);
  }
});
void test('development X transport/usage failures retain holds without retries', async () => {
  for (const h of [harness(10, 429), harness(-1)]) {
    await assert.rejects(h.runtime.search(request, 'offline'));
    assert.deepEqual(h.events, [['reserve', 'offline', 'xai', 400000], 'http']);
  }
});
