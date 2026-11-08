import assert from 'node:assert/strict';
import { test } from 'node:test';

import type { Pool } from 'pg';

import {
  developmentLlmAttemptId,
  prepareDevelopmentLlmRuntime,
} from '../src/development-llm-runtime';
import type { DevelopmentSpendPort } from '../src/modules/digests/domain/development-spend.port';

const request = {
  role: 'haiku' as const,
  runId: 'offline',
  instructions: 'fixture',
  prompt: 'fixture',
  maxOutputTokens: 10,
};
function harness(status = 200) {
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
        capMicros: 5_000_000,
        stopAtMicros: 3_750_000,
        availableMicros: 1,
        mustReport: true,
      };
    },
  };
  const deps = {
    db: {} as Pool,
    env: {
      LLM_LIVE: '1',
      ANTHROPIC_API_KEY: 'offline-fixture',
      LLM_TRIAGE_INPUT_USD_PER_MILLION: '0',
    },
    fetch: (async (_url, init) => {
      assert.equal(typeof init?.body, 'string');
      events.push(['http', JSON.parse(init?.body as string)]);
      return new Response(
        JSON.stringify(
          status === 200
            ? {
                id: 'fixture',
                type: 'message',
                role: 'assistant',
                model: 'claude-haiku-5-5',
                content: [{ type: 'text', text: 'recorded' }],
                stop_reason: 'end_turn',
                usage: { input_tokens: 10, output_tokens: 3 },
              }
            : { error: { type: 'rate_limit_error', message: 'fixture' } },
        ),
        {
          status,
          headers: { 'content-type': 'application/json' },
        },
      );
    }) as typeof fetch,
  };
  return {
    events,
    spend,
    deps,
    runtime: () => prepareDevelopmentLlmRuntime(deps, () => spend)!,
  };
}
void test('development runtime gates before database/key access', () => {
  for (const flag of [undefined, '0', 'true']) {
    assert.equal(
      prepareDevelopmentLlmRuntime(
        { db: {} as Pool, env: { LLM_LIVE: flag } },
        () => {
          throw new Error('Unexpected database');
        },
      ),
      null,
    );
  }
  assert.throws(
    () =>
      prepareDevelopmentLlmRuntime({ db: {} as Pool, env: { LLM_LIVE: '1' } }),
    /Missing development Anthropic key/,
  );
});
void test('offline HTTP composition reserves known pricing and settles only development usage', async () => {
  const h = harness();
  const result = await h.runtime().complete(request, 'stable-attempt');
  assert.equal(result.status, 'complete');
  assert.equal('mustReport' in result && result.mustReport, true);
  assert.deepEqual(h.events[0], [
    'reserve',
    developmentLlmAttemptId('stable-attempt'),
    'anthropic',
    Math.ceil((2048 + 14) * 0.125 + 5),
  ]);
  const http = h.events[1] as [string, { model: string; max_tokens: number }];
  assert.equal(http[1].model, 'claude-haiku-5-5');
  assert.equal(http[1].max_tokens, 10);
  assert.deepEqual(h.events[2], [
    'settle',
    developmentLlmAttemptId('stable-attempt'),
    3,
  ]);
});
void test('development runtime never retries rate limits and retains uncertain holds', async () => {
  const h = harness(429);
  await assert.rejects(h.runtime().complete(request, 'rate-limit'));
  assert.equal(h.events.length, 2);
});
void test('refusal, replay and malformed requests never reach HTTP', async () => {
  const h = harness();
  const runtime = h.runtime();
  for (const tokens of [0, -1, 0.5, NaN])
    assert.throws(
      () =>
        runtime.complete({ ...request, maxOutputTokens: tokens }, 'invalid'),
      /output limit/,
    );
  assert.throws(() => runtime.complete(request, ' '), /attempt ID/);
  h.spend.reserve = async () => ({ admitted: false, mustReport: true });
  assert.deepEqual(await runtime.complete(request, 'refused'), {
    status: 'budget-refused',
    mustReport: true,
  });
  h.spend.reserve = async () => ({ admitted: true, replay: true });
  assert.deepEqual(await runtime.complete(request, 'replay'), {
    status: 'replay',
  });
  assert.deepEqual(h.events, []);
});

void test('Sonnet uses its own fixed output and cache-write pricing', async () => {
  const h = harness();
  h.deps.env.LLM_TRIAGE_INPUT_USD_PER_MILLION = '999';
  const result = await h
    .runtime()
    .complete({ ...request, role: 'sonnet' }, 'sonnet');
  assert.equal(result.status, 'complete');
  assert.deepEqual(h.events[0], [
    'reserve',
    developmentLlmAttemptId('sonnet'),
    'anthropic',
    (2048 + 14) * 2.5 + 100,
  ]);
  const http = h.events[1] as [string, { model: string }];
  assert.equal(http[1].model, 'claude-sonnet-5-5');
  assert.deepEqual(h.events[2], [
    'settle',
    developmentLlmAttemptId('sonnet'),
    50,
  ]);
});
