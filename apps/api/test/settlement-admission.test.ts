import assert from 'node:assert/strict';
import { test } from 'node:test';

import { admitAfterSettlement } from '../src/modules/curation/application/settlement-admission';
import type { LlmRequest } from '../src/modules/curation/domain/llm.port';
import type { LlmReservationResult } from '../src/modules/curation/domain/llm-ledger.port';

const request: LlmRequest = {
  model: { id: 'sonnet', input: 1, output: 1, cacheRead: 1, cacheWrite: 1 },
  purpose: 'fixture',
  runId: 'fixture',
  instructions: '',
  prompt: '',
  maxOutputTokens: 1,
};
function refused(): LlmReservationResult & { status: 'refused' } {
  return {
    status: 'refused',
    reasons: ['model-allocation'],
    estimateMicros: 10,
    sharedAvailableMicros: 100,
    availableMicros: 0,
    modelAvailableMicros: 0,
    pendingHoldsOverflow: false,
    pendingHolds: [
      {
        id: 'original',
        model: 'sonnet',
        reservedMicros: 20,
        createdAt: '2026-11-12T00:00:00Z',
      },
    ],
  };
}
function harness() {
  let time = 0;
  let calls = 0;
  const snapshots: string[][] = [];
  const controller = new AbortController();
  const state = {
    result: refused() as LlmReservationResult,
    pending: ['original'],
    onSleep: () => {},
    onQuery: () => {},
    options: {
      scheduled: true,
      sonnetModel: 'sonnet',
      execution: { deadline: 600_000 },
      signal: controller.signal,
      now: () => time,
      sleep: async (ms: number) => {
        time += ms;
        state.onSleep();
      },
    },
    ledger: {
      reserveDetailed: async () => {
        calls++;
        return state.result;
      },
      pendingOriginalHolds: async (_model: string, ids: string[]) => {
        snapshots.push([...ids]);
        state.onQuery();
        return state.pending;
      },
    },
    run: () => admitAfterSettlement(state.ledger, request, 10, state.options),
    calls: () => calls,
    snapshots,
    controller,
    advance: (ms: number) => {
      time += ms;
    },
  };
  return state;
}
void test('settlement frees budget, but only atomic reservation admits', async () => {
  const h = harness();
  h.onSleep = () => {
    h.pending = [];
    h.result = { status: 'admitted', id: 'new' };
  };
  const result = await h.run();
  assert.equal(result.stop, 'admitted');
  assert.equal(result.attempts, 2);
  assert.equal(result.waitedMs, 250);
  assert.deepEqual(h.snapshots, [['original']]);
});
void test('competing holds never replace original IDs; settled original cannot extend wait', async () => {
  const h = harness();
  h.onSleep = () => {
    h.result = {
      ...refused(),
      pendingHolds: [{ ...refused().pendingHolds[0], id: 'competitor' }],
    };
  };
  h.onQuery = () => {
    if (h.calls() === 2) h.pending = [];
  };
  const result = await h.run();
  assert.equal(result.stop, 'holds-settled');
  assert.equal(result.attempts, 3);
  assert.deepEqual(h.snapshots, [['original'], ['original']]);
});
void test('five-second bound includes final atomic attempt and at most 21 attempts', async () => {
  const h = harness();
  const result = await h.run();
  assert.equal(result.stop, 'exhausted');
  assert.equal(result.attempts, 21);
  assert.equal(result.waitedMs, 5000);
});
void test('noneligible callers and refusals never sleep', async () => {
  for (const kind of [
    'manual',
    'missing',
    'model',
    'combined',
    'overflow',
    'empty',
    'wrong-model',
  ]) {
    const h = harness();
    if (kind === 'manual') h.options.scheduled = false;
    if (kind === 'missing') Object.assign(h.options, { execution: undefined });
    if (kind === 'model') h.options.sonnetModel = 'other';
    const result = refused();
    if (kind === 'combined') result.reasons.push('daily-cap');
    if (kind === 'overflow') result.pendingHoldsOverflow = true;
    if (kind === 'empty') result.pendingHolds = [];
    if (kind === 'wrong-model') result.pendingHolds[0].model = 'other';
    h.result = result;
    assert.equal((await h.run()).stop, 'ineligible', kind);
    assert.equal(h.calls(), 1);
  }
});
void test('deadline and cancellation checked before sleep and after asynchronous work', async () => {
  for (const phase of ['before', 'sleep', 'query']) {
    for (const cancel of [false, true]) {
      const h = harness();
      const stop = () => {
        if (cancel) h.controller.abort();
        else h.options.execution.deadline = 300_000;
      };
      if (phase === 'before') stop();
      if (phase === 'sleep') h.onSleep = stop;
      if (phase === 'query') h.onQuery = stop;
      assert.equal((await h.run()).stop, cancel ? 'cancelled' : 'deadline');
      assert.equal(h.calls(), 1);
    }
  }
});
void test('late timer or query never starts another admission; changed refusal stops', async () => {
  for (const phase of ['sleep', 'query']) {
    const h = harness();
    if (phase === 'sleep') h.onSleep = () => h.advance(5000);
    else h.onQuery = () => h.advance(5000);
    assert.equal((await h.run()).stop, 'exhausted');
    assert.equal(h.calls(), 1);
  }
  const h = harness();
  h.onSleep = () => {
    h.result = { ...refused(), reasons: ['provider-blocked'] };
  };
  assert.equal((await h.run()).stop, 'ineligible');
  assert.equal(h.calls(), 2);
});
void test('ledger errors propagate without retry or treating them as budget refusals', async () => {
  const h = harness();
  h.ledger.pendingOriginalHolds = async () => {
    throw new Error('fixture');
  };
  await assert.rejects(h.run(), /fixture/);
  assert.equal(h.calls(), 1);
});

void test('every nonallocation refusal is immediate and immediate admission never sleeps', async () => {
  for (const reason of [
    'verification-cap',
    'provider-blocked',
    'monthly-cap',
    'daily-cap',
    'scheduled-reserve',
  ] as const) {
    const h = harness();
    h.result = { ...refused(), reasons: [reason] };
    assert.equal((await h.run()).stop, 'ineligible');
    assert.equal(h.calls(), 1);
    assert.equal(h.snapshots.length, 0);
  }
  const h = harness();
  h.result = { status: 'admitted', id: 'immediate' };
  const result = await h.run();
  assert.equal(result.stop, 'admitted');
  assert.equal(result.waitedMs, 0);
  assert.equal(result.attempts, 1);
});
