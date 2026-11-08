import assert from 'node:assert/strict';
import { test } from 'node:test';

import { developmentLlm } from '../src/modules/curation/public/development-llm';
import { DevelopmentCall } from '../src/modules/digests/application/development-call';
import type { DevelopmentSpendPort } from '../src/modules/digests/domain/development-spend.port';

function harness() {
  const events: unknown[] = [];
  const spend: DevelopmentSpendPort = {
    status: async () => {
      throw new Error('Unexpected status');
    },
    reserve: async (...args) => {
      events.push(args);
      return { admitted: true, replay: false, mustReport: false };
    },
    settle: async (...args) => {
      events.push(args);
      return {
        capMicros: 5_000_000,
        stopAtMicros: 3_750_000,
        availableMicros: 1,
        mustReport: true,
      };
    },
  };
  const response = {
    text: 'recorded',
    usage: { input: 10, cacheWrite: 5, cacheRead: 2, output: 3 },
  };
  const provider = {
    complete: async () => {
      events.push('provider');
      return response;
    },
  };
  const llm = developmentLlm(provider, new DevelopmentCall(spend));
  const request = {
    model: {
      id: 'fixture',
      input: 1,
      cacheWrite: 2,
      cacheRead: 0.1,
      output: 4,
    },
    purpose: 'verification',
    runId: 'test',
    instructions: 'é',
    prompt: '🙂',
    maxOutputTokens: 10,
  };
  return {
    events,
    spend,
    response,
    provider,
    llm,
    request,
    attempt: { enabled: true, id: 'stable' },
  };
}

void test('development LLM reserves UTF-8/worst-cache bound and settles actual usage', async () => {
  const h = harness();
  assert.deepEqual(await h.llm.complete(h.request, h.attempt), {
    status: 'complete',
    value: h.response,
    mustReport: true,
  });
  assert.deepEqual(h.events, [
    ['stable', 'anthropic', (2048 + 6) * 2 + 40],
    'provider',
    ['stable', 33],
  ]);
});

void test('disabled, oversized, replayed and refused development requests never call provider', async () => {
  const h = harness();
  assert.deepEqual(
    await h.llm.complete(h.request, { ...h.attempt, enabled: false }),
    { status: 'disabled' },
  );
  assert.deepEqual(
    await h.llm.complete(
      { ...h.request, prompt: 'x'.repeat(100000) },
      h.attempt,
    ),
    { status: 'input-limit' },
  );
  assert.deepEqual(h.events, []);
  h.spend.reserve = async () => ({ admitted: true, replay: true });
  assert.deepEqual(await h.llm.complete(h.request, h.attempt), {
    status: 'replay',
  });
  h.spend.reserve = async () => ({ admitted: false, mustReport: true });
  assert.deepEqual(await h.llm.complete(h.request, h.attempt), {
    status: 'budget-refused',
    mustReport: true,
  });
  assert.deepEqual(h.events, []);
});

void test('provider failures and invalid usage retain development holds without retries', async () => {
  for (const failure of ['transport', 'billing']) {
    const h = harness();
    if (failure === 'transport')
      h.provider.complete = async () => {
        h.events.push('provider');
        throw new Error('uncertain');
      };
    else h.response.usage.output = NaN;
    await assert.rejects(h.llm.complete(h.request, h.attempt));
    assert.equal(h.events.filter((event) => event === 'provider').length, 1);
    assert.equal(h.events.length, 2);
  }
});
