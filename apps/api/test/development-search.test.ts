import assert from 'node:assert/strict';
import { test } from 'node:test';

import type { Pool } from 'pg';

import { prepareDevelopmentXRuntime } from '../src/development-x-runtime';
import { developmentSearch } from '../src/modules/social/public/development-search';

const request = {
  topic: 'Technology',
  guidance: 'Technology news',
  fromDate: '2026-11-06',
  toDate: '2026-11-07',
};
const value = {
  usage: {
    inputTokens: 10,
    outputTokens: 4,
    postsFetched: 0,
    profilesFetched: 0,
  },
  links: [],
};
void test('development search preserves results and separates per-edition attempts', async () => {
  const attempts: string[] = [];
  let active = 0;
  const runtime = {
    async search(input: typeof request, attempt: string) {
      assert.equal(input, request);
      assert.equal(++active, 1);
      attempts.push(attempt);
      await Promise.resolve();
      active--;
      return { status: 'complete' as const, value, mustReport: false };
    },
  };
  const port = developmentSearch(runtime, 'edition-a');
  assert.deepEqual(
    await Promise.all([port.search(request), port.search(request)]),
    [value, value],
  );
  assert.equal(
    await developmentSearch(runtime, 'edition-b').search(request),
    value,
  );
  assert.deepEqual(attempts, [
    'edition-a:search:1',
    'edition-a:search:2',
    'edition-b:search:1',
  ]);
  assert.throws(() => developmentSearch(runtime, ' '), /edition ID/);
});
void test('development search stops queued and later calls after every accounting stop', async () => {
  const outcomes = [
    { status: 'disabled' as const },
    { status: 'replay' as const },
    { status: 'budget-refused' as const, mustReport: false },
    { status: 'budget-refused' as const, mustReport: true },
    { status: 'complete' as const, value, mustReport: true },
    {
      status: 'complete' as const,
      value: { ...value, execution: 'unconfirmed' as const },
      mustReport: false,
    },
  ];
  for (const outcome of outcomes) {
    let calls = 0;
    const port = developmentSearch(
      {
        async search() {
          calls++;
          return outcome;
        },
      },
      'edition',
    );
    const results = await Promise.allSettled([
      port.search(request),
      port.search(request),
      port.search(request),
    ]);
    assert.ok(results.every((result) => result.status === 'rejected'));
    await assert.rejects(port.search(request), /stopped/);
    assert.equal(calls, 1);
  }
});
void test('development search preserves provider errors and never retries uncertain calls', async () => {
  let calls = 0;
  const failure = new Error('Uncertain provider response');
  const port = developmentSearch(
    {
      async search() {
        calls++;
        throw failure;
      },
    },
    'edition',
  );
  await assert.rejects(port.search(request), (error) => error === failure);
  await assert.rejects(port.search(request), /stopped/);
  assert.equal(calls, 1);
});

void test('recorded xAI runtime settles threshold-crossing call before bridge stops queued topics', async () => {
  const events: string[] = [];
  const runtime = prepareDevelopmentXRuntime(
    {
      db: {} as Pool,
      env: { X_SEARCH_LIVE: '1', XAI_API_KEY: 'offline-fixture' },
      fetch: async () => {
        events.push('http');
        return new Response(
          JSON.stringify({
            status: 'completed',
            output: [],
            usage: {
              input_tokens: 10,
              output_tokens: 4,
              server_side_tool_usage_details: {
                x_posts_fetched: 3,
                x_users_fetched: 2,
              },
            },
          }),
        );
      },
    },
    () => ({
      status: async () => {
        throw new Error('Unexpected status');
      },
      reserve: async () => {
        events.push('reserve');
        return { admitted: true, replay: false, mustReport: false };
      },
      settle: async (_id, cost) => {
        events.push('settle');
        assert.equal(cost, 35023);
        return {
          capMicros: 2000000,
          stopAtMicros: 1500000,
          availableMicros: 0,
          mustReport: true,
        };
      },
    }),
  )!;
  const port = developmentSearch(runtime, 'recorded-edition');
  const fixed = {
    ...request,
    fixedSearch: {
      style: 'trending' as const,
      rankedStoryTitles: [],
      settings: {
        trendingMinFaves: 100,
        reactionMinFaves: 100,
        exclusions: [],
      },
    },
  };
  const outcomes = await Promise.allSettled([
    port.search(fixed),
    port.search(fixed),
  ]);
  assert.ok(outcomes.every((outcome) => outcome.status === 'rejected'));
  assert.match(
    (outcomes[0] as PromiseRejectedResult).reason.message,
    /report required/,
  );
  assert.deepEqual(events, ['reserve', 'http', 'settle']);
});
