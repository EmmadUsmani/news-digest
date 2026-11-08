import assert from 'node:assert/strict';
import { test } from 'node:test';

import type { Pool } from 'pg';

import { verifyDevelopmentScores } from '../scripts/smoke-anthropic';
import { prepareDevelopmentLlmRuntime } from '../src/development-llm-runtime';
import type { DevelopmentSpendPort } from '../src/modules/digests/domain/development-spend.port';

const candidates = ['a', 'b', 'c'].map((id) => ({
  id,
  title: 'Offline fixture ' + id,
}));
void test('live smoke uses development admission, fixed Haiku and durable replay without production DB', async () => {
  let calls = 0;
  let settled = 0;
  const attempts = new Set<string>();
  const spend: DevelopmentSpendPort = {
    status: async () => {
      throw new Error('Unexpected status');
    },
    reserve: async (id, provider) => {
      assert.equal(provider, 'anthropic');
      const replay = attempts.has(id);
      attempts.add(id);
      return { admitted: true, replay, mustReport: false };
    },
    settle: async () => {
      settled++;
      return {
        capMicros: 5_000_000,
        stopAtMicros: 3_750_000,
        availableMicros: 4_999_000,
        mustReport: false,
      };
    },
  };
  const runtime = prepareDevelopmentLlmRuntime(
    {
      db: {} as Pool,
      env: { LLM_LIVE: '1', ANTHROPIC_API_KEY: 'offline-fixture' },
      fetch: async (_url, init) => {
        calls++;
        const body = JSON.parse(init?.body as string);
        assert.equal(body.model, 'claude-haiku-5-5');
        return new Response(
          JSON.stringify({
            content: [
              {
                type: 'text',
                text: JSON.stringify({
                  items: candidates.map(({ id }) => ({ id, importance: 5 })),
                }),
              },
            ],
            usage: { input_tokens: 10, output_tokens: 10 },
          }),
          { headers: { 'content-type': 'application/json' } },
        );
      },
    },
    () => spend,
  )!;
  assert.deepEqual(
    await verifyDevelopmentScores(runtime, candidates, 'offline-smoke'),
    {
      realCandidates: 3,
      validatedScores: 3,
      replayAvoidedCall: true,
      pool: 'development',
    },
  );
  assert.equal(calls, 1);
  assert.equal(settled, 1);
});
void test('smoke stops on refusal or report threshold without retrying', async () => {
  for (const outcome of [
    { status: 'budget-refused' as const, mustReport: true },
    {
      status: 'complete' as const,
      mustReport: true,
      value: {
        text: '{}',
        usage: { input: 1, output: 1, cacheRead: 0, cacheWrite: 0 },
      },
    },
  ]) {
    let calls = 0;
    await assert.rejects(
      verifyDevelopmentScores(
        {
          complete: async () => {
            calls++;
            return outcome;
          },
        },
        candidates,
        'stopped',
      ),
    );
    assert.equal(calls, 1);
  }
});
