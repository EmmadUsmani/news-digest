import assert from 'node:assert/strict';
import test from 'node:test';

import { eventGroupingEvaluationLedger } from '../scripts/event-grouping-evaluation-ledger';
import { llmConfig } from '../src/modules/curation/adapters/config';
import { BudgetedLlm } from '../src/modules/curation/application/budgeted-llm';
import { EventGrouping } from '../src/modules/curation/application/event-grouping';
import type { LlmLedger } from '../src/modules/curation/domain/llm-ledger.port';

const request = {
  model: llmConfig({}).haiku,
  runId: 'evaluation',
  purpose: 'story-grouping-v3',
  instructions: '',
  prompt: '',
  maxOutputTokens: 4096,
};
const options = {
  live: '1',
  runId: request.runId,
  modelId: request.model.id,
  capMicros: 50000,
  now: () => new Date('2026-11-03T20:00:00Z'),
};
const ledger: LlmLedger = {
  async reserve() {
    return 'hold';
  },
  async settle() {},
  async fail() {},
  async cached() {
    return undefined;
  },
  async cache() {},
};

void test('evaluation admission requires opt-in, valid cap and permitted UTC time', () => {
  for (const live of [undefined, '', 'true', '0'])
    assert.throws(() =>
      eventGroupingEvaluationLedger(ledger, { ...options, live }),
    );
  for (const capMicros of [0, -1, 50001, 1.5, NaN, Infinity])
    assert.throws(() =>
      eventGroupingEvaluationLedger(ledger, { ...options, capMicros }),
    );
  for (const time of ['13:00:00', '15:59:59'])
    assert.throws(() =>
      eventGroupingEvaluationLedger(ledger, {
        ...options,
        now: () => new Date(`2026-11-03T${time}Z`),
      }),
    );
  for (const time of ['12:59:59', '16:00:00'])
    assert.ok(
      eventGroupingEvaluationLedger(ledger, {
        ...options,
        now: () => new Date(`2026-11-03T${time}Z`),
      }),
    );
  assert.throws(() =>
    eventGroupingEvaluationLedger(ledger, {
      ...options,
      now: () => new Date(NaN),
    }),
  );
});

void test('concurrent reservations cannot exceed ceiling; failure and settlement do not refund', async () => {
  let sharedCalls = 0;
  const bounded = eventGroupingEvaluationLedger(
    {
      ...ledger,
      async reserve() {
        sharedCalls++;
        return 'hold';
      },
    },
    options,
  );
  assert.deepEqual(
    await Promise.all([
      bounded.reserve(request, 30000),
      bounded.reserve(request, 30000),
    ]),
    ['hold', null],
  );
  await bounded.fail('hold', 'transport', false, true);
  await bounded.settle(
    'hold',
    { input: 1, output: 1, cacheRead: 0, cacheWrite: 0 },
    1,
  );
  assert.equal(await bounded.reserve(request, 20000), 'hold');
  assert.equal(await bounded.reserve(request, 1), null);
  assert.equal(sharedCalls, 2);
});

void test('shared refusal stays authoritative and crossing the time gate blocks later calls', async () => {
  let date = options.now();
  let calls = 0;
  const bounded = eventGroupingEvaluationLedger(
    {
      ...ledger,
      async reserve() {
        calls++;
        return null;
      },
    },
    { ...options, now: () => date },
  );
  assert.equal(await bounded.reserve(request, 50000), null);
  assert.equal(await bounded.reserve(request, 1), null);
  date = new Date('2026-11-04T13:00:00Z');
  await assert.rejects(bounded.reserve(request, 1), /opt-in/);
  assert.equal(calls, 1);
});

void test('foreign requests and invalid estimates never reach the shared ledger', async () => {
  let calls = 0;
  const bounded = eventGroupingEvaluationLedger(
    {
      ...ledger,
      async reserve() {
        calls++;
        return 'hold';
      },
    },
    options,
  );
  for (const invalid of [
    { ...request, runId: 'other' },
    { ...request, purpose: 'editor' },
    { ...request, model: { ...request.model, id: 'other' } },
  ])
    await assert.rejects(bounded.reserve(invalid, 1), /Invalid evaluation/);
  for (const estimate of [0, -1, 0.5, NaN, Infinity])
    await assert.rejects(
      bounded.reserve(request, estimate),
      /Invalid evaluation/,
    );
  assert.equal(calls, 0);
});

void test('budgeted grouping uses shared settlement/cache and skips provider when the local ceiling is too small', async () => {
  const cache = new Map<string, unknown>();
  let calls = 0;
  let settlements = 0;
  const shared = {
    ...ledger,
    async cached(key: string) {
      return cache.get(key);
    },
    async cache(key: string, value: unknown) {
      cache.set(key, value);
    },
    async settle() {
      settlements++;
    },
  };
  const provider = {
    async complete() {
      calls++;
      return {
        text: '{"groups":[]}',
        usage: { input: 10, output: 10, cacheWrite: 0, cacheRead: 0 },
      };
    },
  };
  const candidates = ['a', 'b'].map((id) => ({
    id,
    topicId: 'topic',
    title: id,
    outlet: 'outlet',
    publishedAt: '2026-11-03T10:00:00Z',
    excerpt: null,
  }));
  const grouping = new EventGrouping(
    new BudgetedLlm(provider, eventGroupingEvaluationLedger(shared, options)),
    request.model,
  );
  assert.deepEqual(
    await grouping.group('topic', candidates, request.runId),
    [],
  );
  assert.deepEqual(
    await grouping.group('topic', candidates, request.runId),
    [],
  );
  assert.equal(calls, 1);
  assert.equal(settlements, 1);
  const denied = new EventGrouping(
    new BudgetedLlm(
      provider,
      eventGroupingEvaluationLedger(ledger, { ...options, capMicros: 1 }),
    ),
    request.model,
  );
  assert.deepEqual(await denied.group('topic', candidates, request.runId), []);
  assert.equal(calls, 1);
});
