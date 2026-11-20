import assert from 'node:assert/strict';
import { test } from 'node:test';

import { BudgetedLlm } from '../src/modules/curation/application/budgeted-llm';
import { reserveLlmPlan } from '../src/modules/curation/application/reserved-llm-plan';
import {
  type LlmPort,
  type LlmRequest,
  ProviderSpendLimit,
} from '../src/modules/curation/domain/llm.port';
import type { LlmLedger } from '../src/modules/curation/domain/llm-ledger.port';

const request: LlmRequest = {
  runId: 'offline',
  topicId: 'tech',
  purpose: 'matching',
  instructions: 'JSON',
  prompt: '日',
  maxOutputTokens: 100,
  model: { id: 'offline', input: 1, cacheRead: 0, cacheWrite: 2, output: 3 },
};
function harness() {
  const released: string[] = [];
  const settled: string[] = [];
  const uncertain: string[] = [];
  let batches = 0;
  let dispatches = 0;
  let cached: unknown;
  let error: Error | undefined;
  let text = '{"ok":true}';
  const ledger: LlmLedger = {
    reserveBatch: async (entries) => {
      batches++;
      return { status: 'admitted', ids: entries.map((_, i) => String(i)) };
    },
    reserve: async () => {
      throw new Error('Must not reserve twice');
    },
    settle: async (id) => {
      settled.push(id);
    },
    fail: async (id, _code, _limit, held) => {
      (held ? uncertain : released).push(id);
    },
    cached: async () => cached,
    cache: async () => {},
  };
  const provider: LlmPort = {
    complete: async () => {
      dispatches++;
      if (error) throw error;
      return {
        text,
        usage: { input: 2, output: 2, cacheWrite: 0, cacheRead: 0 },
      };
    },
  };
  return {
    ledger,
    provider,
    released,
    settled,
    uncertain,
    counts: () => ({ batches, dispatches }),
    cache: (value: unknown) => {
      cached = value;
    },
    error: (value: Error) => {
      error = value;
    },
    text: (value: string) => {
      text = value;
    },
  };
}
const validate = (value: unknown) => value;

void test('admitted requests settle once without a second reservation; unused holds release', async () => {
  const h = harness();
  const plan = await reserveLlmPlan(h.ledger, [
    request,
    { ...request, purpose: 'rewrite' },
  ]);
  assert.ok(plan);
  const llm = new BudgetedLlm(h.provider, plan.ledger);
  assert.equal(
    (await llm.jsonOutcome(request, validate, { repair: false })).status,
    'complete',
  );
  assert.equal(
    (await llm.jsonOutcome(request, validate, { repair: false })).status,
    'budget-refused',
  );
  await plan.releaseUnused();
  await plan.releaseUnused();
  assert.deepEqual(h.settled, ['0']);
  assert.deepEqual(h.released, ['1']);
  assert.deepEqual(h.counts(), { batches: 1, dispatches: 1 });
});

void test('changed attribution, prices, prompts and estimates cannot consume a hold', async () => {
  const h = harness();
  const plan = await reserveLlmPlan(h.ledger, [request]);
  assert.ok(plan);
  const llm = new BudgetedLlm(h.provider, plan.ledger);
  for (const changed of [
    { ...request, runId: 'other' },
    { ...request, topicId: 'other' },
    { ...request, purpose: 'rewrite' },
    { ...request, prompt: 'other' },
    { ...request, model: { ...request.model, input: 0.5 } },
  ])
    assert.equal(
      (await llm.jsonOutcome(changed, validate)).status,
      'budget-refused',
    );
  assert.equal(await plan.ledger.reserve(request, 1), null);
  await plan.releaseUnused();
  assert.equal(
    (await llm.jsonOutcome(request, validate)).status,
    'budget-refused',
  );
  assert.deepEqual(h.released, ['0']);
  assert.equal(h.counts().dispatches, 0);
});

void test('cache hits and expired execution release their unused holds', async () => {
  for (const cache of [false, true]) {
    const h = harness();
    if (cache) h.cache({ ok: true });
    const plan = await reserveLlmPlan(h.ledger, [request]);
    assert.ok(plan);
    const llm = new BudgetedLlm(h.provider, plan.ledger);
    const outcome = await llm.jsonOutcome(request, validate, {
      execution: { deadline: 0 },
    });
    assert.equal(outcome.status, cache ? 'complete' : 'provider-call-failed');
    await plan.releaseUnused();
    assert.deepEqual(h.released, ['0']);
    assert.equal(h.counts().dispatches, 0);
  }
});

void test('transport uncertainty retains consumed holds; provider limit releases them', async () => {
  for (const limit of [false, true]) {
    const h = harness();
    h.error(limit ? new ProviderSpendLimit() : new Error('uncertain'));
    const plan = await reserveLlmPlan(h.ledger, [
      request,
      { ...request, purpose: 'rewrite' },
    ]);
    assert.ok(plan);
    const llm = new BudgetedLlm(h.provider, plan.ledger);
    assert.equal(
      (await llm.jsonOutcome(request, validate)).status,
      limit ? 'provider-spend-limit' : 'provider-call-failed',
    );
    await plan.releaseUnused();
    assert.deepEqual(h.uncertain, limit ? [] : ['0']);
    assert.deepEqual(h.released, limit ? ['0', '1'] : ['1']);
  }
});

void test('malformed JSON settles the call but cannot admit an unplanned repair', async () => {
  const h = harness();
  h.text('invalid');
  const plan = await reserveLlmPlan(h.ledger, [request]);
  assert.ok(plan);
  const llm = new BudgetedLlm(h.provider, plan.ledger);
  assert.equal(
    (await llm.jsonOutcome(request, validate)).status,
    'budget-refused',
  );
  await plan.releaseUnused();
  assert.deepEqual(h.settled, ['0']);
  assert.equal(h.counts().dispatches, 1);
  assert.deepEqual(h.released, []);
});

void test('missing capability, refused plans and invalid bounds never dispatch', async () => {
  const h = harness();
  assert.equal(
    await reserveLlmPlan({ ...h.ledger, reserveBatch: undefined }, [request]),
    null,
  );
  assert.equal(
    await reserveLlmPlan(
      {
        ...h.ledger,
        reserveBatch: async () => ({
          status: 'refused',
          index: 0,
          reasons: ['daily-cap'],
        }),
      },
      [request],
    ),
    null,
  );
  await assert.rejects(
    reserveLlmPlan(h.ledger, [{ ...request, maxOutputTokens: 0 }]),
  );
  assert.deepEqual(h.counts(), { batches: 0, dispatches: 0 });
});

void test('parallel consumers cannot reuse one hold and concurrent cleanup releases once', async () => {
  const h = harness();
  const plan = await reserveLlmPlan(h.ledger, [
    request,
    { ...request, purpose: 'rewrite' },
  ]);
  assert.ok(plan);
  const results = await Promise.all([
    plan.ledger.reserve(request, 4410),
    plan.ledger.reserve(request, 4410),
  ]);
  // JSON framing + instructions + UTF-8 prompt, priced at the highest input rate.
  assert.deepEqual(results, ['0', null]);
  await Promise.all([plan.releaseUnused(), plan.releaseUnused()]);
  assert.deepEqual(h.released, ['1']);
});
