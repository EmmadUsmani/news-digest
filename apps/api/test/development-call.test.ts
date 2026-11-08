import assert from 'node:assert/strict';
import { test } from 'node:test';

import { DevelopmentCall } from '../src/modules/digests/application/development-call';
import type { DevelopmentSpendPort } from '../src/modules/digests/domain/development-spend.port';

function harness() {
  const events: string[] = [];
  const spend: DevelopmentSpendPort = {
    status: async () => {
      throw new Error('Unexpected status read');
    },
    reserve: async (id, provider, amount) => {
      events.push(`reserve:${id}:${provider}:${amount}`);
      return { admitted: true, replay: false, mustReport: false };
    },
    settle: async (id, cost) => {
      events.push(`settle:${id}:${cost}`);
      return {
        capMicros: 5_000_000,
        stopAtMicros: 3_750_000,
        availableMicros: 100,
        mustReport: false,
      };
    },
  };
  const request = {
    enabled: true,
    id: 'stable-attempt',
    provider: 'anthropic' as const,
    maxCostMicros: 100,
  };
  const call = async () => {
    events.push('provider');
    return { value: 'response', costMicros: 25 };
  };
  return { events, spend, request, call, runner: new DevelopmentCall(spend) };
}

void test('development calls require opt-in and reserve before confirmed settlement', async () => {
  const h = harness();
  assert.deepEqual(
    await h.runner.run({ ...h.request, enabled: false }, h.call),
    { status: 'disabled' },
  );
  assert.deepEqual(h.events, []);
  assert.deepEqual(await h.runner.run(h.request, h.call), {
    status: 'complete',
    value: 'response',
    mustReport: false,
  });
  assert.deepEqual(h.events, [
    'reserve:stable-attempt:anthropic:100',
    'provider',
    'settle:stable-attempt:25',
  ]);
});

void test('refused, replayed and failed reservations never invoke the provider', async () => {
  const h = harness();
  h.spend.reserve = async () => ({ admitted: false, mustReport: true });
  assert.deepEqual(await h.runner.run(h.request, h.call), {
    status: 'budget-refused',
    mustReport: true,
  });
  h.spend.reserve = async () => ({ admitted: true, replay: true });
  assert.deepEqual(await h.runner.run(h.request, h.call), { status: 'replay' });
  h.spend.reserve = async () => {
    throw new Error('database unavailable');
  };
  await assert.rejects(h.runner.run(h.request, h.call), /database unavailable/);
  assert.deepEqual(h.events, []);
});

void test('uncertain provider outcomes and invalid billing preserve unresolved holds', async () => {
  for (const costMicros of [NaN, -1, 0.5, Infinity]) {
    const h = harness();
    await assert.rejects(
      h.runner.run(h.request, async () => ({ value: '', costMicros })),
      /Unconfirmed/,
    );
    assert.deepEqual(h.events, ['reserve:stable-attempt:anthropic:100']);
  }
  const h = harness();
  await assert.rejects(
    h.runner.run(h.request, async () => {
      throw new Error('timeout');
    }),
    /timeout/,
  );
  assert.deepEqual(h.events, ['reserve:stable-attempt:anthropic:100']);
});

void test('confirmed zero releases, overestimates charge actual billing and limits propagate', async () => {
  for (const costMicros of [0, 150]) {
    const h = harness();
    h.spend.settle = async (id, cost) => {
      assert.equal(id, h.request.id);
      assert.equal(cost, costMicros);
      return {
        capMicros: 100,
        stopAtMicros: 75,
        availableMicros: 0,
        mustReport: true,
      };
    };
    const result = await h.runner.run(
      { ...h.request, provider: 'xai' },
      async () => ({ value: 42, costMicros }),
    );
    assert.deepEqual(result, {
      status: 'complete',
      value: 42,
      mustReport: true,
    });
    assert.deepEqual(h.events, ['reserve:stable-attempt:xai:100']);
  }
});

void test('settlement failure does not retry the provider or release its hold', async () => {
  const h = harness();
  h.spend.settle = async () => {
    throw new Error('settlement unavailable');
  };
  await assert.rejects(
    h.runner.run(h.request, h.call),
    /settlement unavailable/,
  );
  h.spend.reserve = async () => ({ admitted: true, replay: true });
  assert.deepEqual(await h.runner.run(h.request, h.call), { status: 'replay' });
  assert.deepEqual(h.events, [
    'reserve:stable-attempt:anthropic:100',
    'provider',
  ]);
});
