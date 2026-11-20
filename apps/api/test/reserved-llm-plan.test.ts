import assert from 'node:assert/strict';
import { test } from 'node:test';

import { BudgetedLlm } from '../src/modules/curation/application/budgeted-llm';
import { reserveLlmPlan } from '../src/modules/curation/application/reserved-llm-plan';
import {
  runCapturedDevelopingLlmPlan,
  runReservedLlmPlan,
} from '../src/modules/curation/application/run-reserved-llm-plan';
import {
  type LlmPort,
  type LlmRequest,
  ProviderSpendLimit,
} from '../src/modules/curation/domain/llm.port';
import type { LlmLedger } from '../src/modules/curation/domain/llm-ledger.port';
import { enrichDevelopingEdition } from '../src/modules/digests/application/enrich-developing-edition';

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

void test('scoped cache reuse requires the admitted request identity and an open plan', async () => {
  const h = harness();
  h.cache({ ok: true });
  const protectedRequest = { ...request, prompt: 'protected morning work' };
  const plan = await reserveLlmPlan(h.ledger, [request], [protectedRequest]);
  assert.ok(plan);
  const llm = new BudgetedLlm(h.provider, plan.ledger);
  for (const changed of [
    { ...request, runId: 'foreign' },
    { ...request, topicId: 'foreign' },
    { ...request, purpose: 'foreign' },
    { ...request, model: { ...request.model, input: 0.5 } },
    { ...request, prompt: 'uncaptured' },
    protectedRequest,
  ])
    assert.equal(
      (await llm.jsonOutcome(changed, validate)).status,
      'budget-refused',
    );
  assert.equal((await llm.jsonOutcome(request, validate)).status, 'complete');
  await plan.releaseUnused();
  assert.equal(
    (await llm.jsonOutcome(request, validate)).status,
    'budget-refused',
  );
  assert.deepEqual(h.released, ['0', '1']);
  assert.deepEqual(h.settled, []);
  assert.equal(h.counts().dispatches, 0);
});

void test('foreign attribution cannot reuse an admitted in-flight response', async () => {
  const h = harness();
  let started!: () => void;
  const dispatchStarted = new Promise<void>((resolve) => {
    started = resolve;
  });
  let finish!: () => void;
  const responseReady = new Promise<void>((resolve) => {
    finish = resolve;
  });
  const provider: LlmPort = {
    complete: async () => {
      started();
      await responseReady;
      return {
        text: '{"ok":true}',
        usage: { input: 2, output: 2, cacheWrite: 0, cacheRead: 0 },
      };
    },
  };
  const plan = await reserveLlmPlan(h.ledger, [request]);
  assert.ok(plan);
  const llm = new BudgetedLlm(provider, plan.ledger);
  const accepted = llm.jsonOutcome(request, validate);
  await dispatchStarted;
  const foreign = llm.jsonOutcome({ ...request, topicId: 'foreign' }, validate);
  finish();
  assert.equal((await foreign).status, 'budget-refused');
  assert.equal((await accepted).status, 'complete');
  assert.deepEqual(h.settled, ['0']);
  await plan.releaseUnused();
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

void test('protected obligations reserve atomically but cannot be consumed by feature work', async () => {
  const h = harness();
  const protectedRequest = { ...request, purpose: 'morning-editor' };
  const batches: { request: LlmRequest; estimate: number }[][] = [];
  const plan = await reserveLlmPlan(
    {
      ...h.ledger,
      reserveBatch: async (entries) => {
        batches.push([...entries]);
        return { status: 'admitted', ids: entries.map((_, i) => String(i)) };
      },
    },
    [request],
    [protectedRequest, request],
  );
  assert.ok(plan);
  assert.equal(batches.length, 1);
  assert.deepEqual(
    batches[0].map((entry) => entry.request.purpose),
    ['matching', 'morning-editor', 'matching'],
  );
  assert.ok(batches[0].every((entry) => entry.estimate === 4410));
  const llm = new BudgetedLlm(h.provider, plan.ledger);
  assert.equal(
    (await llm.jsonOutcome(protectedRequest, validate)).status,
    'budget-refused',
  );
  assert.equal((await llm.jsonOutcome(request, validate)).status, 'complete');
  // Even identical protected obligations cannot extend the feature allowance.
  assert.equal(
    (await llm.jsonOutcome(request, validate)).status,
    'budget-refused',
  );
  assert.deepEqual(h.released, []);
  await plan.releaseUnused();
  assert.deepEqual(h.settled, ['0']);
  assert.deepEqual(h.released, ['1', '2']);
  assert.equal(h.counts().dispatches, 1);
});

void test('protected obligation refusal or invalid bounds prevents feature admission', async () => {
  const h = harness();
  const protectedRequest = { ...request, purpose: 'morning-editor' };
  let batches = 0;
  const ledger: LlmLedger = {
    ...h.ledger,
    reserveBatch: async (entries) => {
      batches++;
      assert.equal(entries.length, 2);
      return { status: 'refused', index: 1, reasons: ['model-allocation'] };
    },
  };
  assert.equal(
    await reserveLlmPlan(ledger, [request], [protectedRequest]),
    null,
  );
  await assert.rejects(
    reserveLlmPlan(
      ledger,
      [request],
      [{ ...protectedRequest, maxOutputTokens: 0 }],
    ),
  );
  assert.equal(batches, 1);
  assert.equal(h.counts().dispatches, 0);
});

void test('cleanup releases later obligations after failures and retries only failed holds', async () => {
  const h = harness();
  const attempts: string[] = [];
  let failing = true;
  const plan = await reserveLlmPlan(
    {
      ...h.ledger,
      fail: async (id, code, limit, uncertain) => {
        attempts.push(id);
        if (failing && (id === '0' || id === '2'))
          throw new Error(`Unavailable ${id}`);
        await h.ledger.fail(id, code, limit, uncertain);
      },
    },
    [request],
    [request, request, request],
  );
  assert.ok(plan);
  const results = await Promise.allSettled([
    plan.releaseUnused(),
    plan.releaseUnused(),
  ]);
  for (const result of results) {
    assert.equal(result.status, 'rejected');
    if (result.status !== 'rejected') continue;
    assert.ok(result.reason instanceof AggregateError);
    assert.equal(result.reason.errors.length, 2);
  }
  assert.deepEqual(attempts, ['0', '1', '2', '3']);
  assert.deepEqual(h.released, ['1', '3']);
  assert.equal(await plan.ledger.reserve(request, 4410), null);
  failing = false;
  await plan.releaseUnused();
  await plan.releaseUnused();
  assert.deepEqual(attempts, ['0', '1', '2', '3', '0', '2']);
  assert.deepEqual(h.released, ['1', '3', '0', '2']);
  assert.equal(h.counts().dispatches, 0);
});

void test('plan runner admits all phases before execution and closes ports before returning', async () => {
  const h = harness();
  let retained: BudgetedLlm | undefined;
  const rewrite = { ...request, purpose: 'rewrite' };
  const result = await runReservedLlmPlan({
    editionId: request.runId,
    ...h,
    requests: [request, rewrite],
    protectedRequests: [{ ...request, purpose: 'social' }],
    async execute(llm) {
      retained = llm;
      assert.equal(h.counts().batches, 1);
      assert.equal(
        (await llm.jsonOutcome(request, validate, { repair: false })).status,
        'complete',
      );
      assert.equal(
        (await llm.jsonOutcome(rewrite, validate, { repair: false })).status,
        'complete',
      );
      assert.deepEqual(h.released, []);
      return { edition: 'accepted' };
    },
  });
  assert.deepEqual(result, {
    status: 'completed',
    value: { edition: 'accepted' },
  });
  assert.deepEqual(h.settled, ['0', '1']);
  assert.deepEqual(h.released, ['2']);
  assert.ok(retained);
  assert.equal(
    (await retained.jsonOutcome(request, validate)).status,
    'budget-refused',
  );
  assert.deepEqual(h.counts(), { batches: 1, dispatches: 2 });
});

void test('plan runner never constructs execution after atomic admission refusal', async () => {
  const h = harness();
  h.ledger.reserveBatch = async () => ({
    status: 'refused',
    index: 1,
    reasons: ['daily-cap'],
  });
  const result = await runReservedLlmPlan({
    editionId: request.runId,
    ...h,
    requests: [request],
    protectedRequests: [{ ...request, purpose: 'social' }],
    execute: () => {
      throw new Error('must not construct edition services');
    },
  });
  assert.deepEqual(result, { status: 'admission-refused' });
  assert.equal(h.counts().dispatches, 0);
  assert.deepEqual(h.released, []);
});

void test('plan runner cleans remaining obligations on execution failure while retaining uncertain spend', async () => {
  const h = harness();
  h.error(new Error('uncertain transport'));
  const failure = new Error('edition stopped');
  await assert.rejects(
    runReservedLlmPlan({
      editionId: request.runId,
      ...h,
      requests: [request, { ...request, purpose: 'rewrite' }],
      protectedRequests: [{ ...request, purpose: 'social' }],
      async execute(llm) {
        assert.equal(
          (await llm.jsonOutcome(request, validate, { repair: false })).status,
          'provider-call-failed',
        );
        throw failure;
      },
    }),
    (error) => error === failure,
  );
  assert.deepEqual(h.uncertain, ['0']);
  assert.deepEqual(h.released, ['1', '2']);
  assert.equal(h.counts().dispatches, 1);
});

void test('plan runner withholds results when cleanup fails and preserves both errors', async () => {
  for (const executionFails of [false, true]) {
    const h = harness();
    const failure = new Error('execution');
    const cleanup = new Error('cleanup');
    const release = h.ledger.fail.bind(h.ledger);
    h.ledger.fail = async (...args) => {
      if (args[0] === '0') throw cleanup;
      await release(...args);
    };
    await assert.rejects(
      runReservedLlmPlan({
        editionId: request.runId,
        ...h,
        requests: [request],
        protectedRequests: [{ ...request, purpose: 'social' }],
        async execute() {
          if (executionFails) throw failure;
          return 'must not publish';
        },
      }),
      (error) => {
        assert.ok(error instanceof AggregateError);
        if (executionFails) {
          assert.equal(error.errors[0], failure);
          assert.ok(error.errors[1] instanceof AggregateError);
          assert.equal(error.errors[1].errors[0], cleanup);
        } else assert.equal(error.errors[0], cleanup);
        return true;
      },
    );
    assert.deepEqual(h.released, ['1']);
    assert.equal(h.counts().dispatches, 0);
  }
});

void test('reserved runner composes edition-wide matching and cleans no-link or later-refused plans', async () => {
  for (const refuses of [false, true]) {
    const h = harness();
    const matching = ['tech', 'nba'].map((topicId) => ({
      ...request,
      topicId,
    }));
    const selected = [
      {
        id: 'a',
        title: 'Accepted',
        summary: 'Original',
        whyItMatters: 'Impact',
      },
    ];
    const result = await runReservedLlmPlan({
      editionId: request.runId,
      ...h,
      requests: [
        ...matching,
        ...matching.map((item) => ({ ...item, purpose: 'rewrite' })),
      ],
      protectedRequests: [{ ...request, purpose: 'social' }],
      async execute(llm) {
        return enrichDevelopingEdition(
          matching.map((item, index) => ({
            topicId: item.topicId,
            topicName: item.topicId,
            runId: item.runId,
            editorialMode: 'ai' as const,
            selected,
            evidence: [
              {
                id: 'a',
                title: 'Reporting',
                excerpt: 'Current reporting',
                sources: ['Publisher'],
              },
            ],
            publishedAt: '2026-11-20T15:00:00Z',
            history: [
              {
                editionId: 'prior',
                publishedAt: '2026-11-19T15:00:00Z',
                stories: [
                  { id: 'old', title: 'Earlier', summary: 'Earlier reporting' },
                ],
              },
            ],
            model: item.model,
            llm: {
              complete: () => {
                throw new Error('no rewrite should run');
              },
            },
            grouping: {
              async groupWithResult() {
                assert.equal(
                  (await llm.jsonOutcome(item, validate, { repair: false }))
                    .status,
                  'complete',
                );
                return refuses && index === 1
                  ? { status: 'refused' as const }
                  : { status: 'validated' as const, groups: [] };
              },
            },
          })),
        );
      },
    });
    assert.equal(result.status, 'completed');
    if (result.status !== 'completed') assert.fail('plan should be admitted');
    assert.equal(result.value.status, refuses ? 'unchanged' : 'completed');
    result.value.topics.forEach((topic) =>
      assert.equal(topic.stories, selected),
    );
    assert.deepEqual(h.settled, ['0', '1']);
    assert.deepEqual(h.released, ['2', '3', '4']);
    assert.deepEqual(h.counts(), { batches: 1, dispatches: 2 });
  }
});

void test('scope rejects settlement and failure for protected, unused and foreign holds', async () => {
  const h = harness();
  const plan = await reserveLlmPlan(
    h.ledger,
    [request, { ...request, purpose: 'unused' }],
    [{ ...request, purpose: 'morning-editor' }],
  );
  assert.ok(plan);
  const usage = { input: 1, output: 1, cacheRead: 0, cacheWrite: 0 };
  for (const id of ['0', '1', '2', 'foreign']) {
    await assert.rejects(plan.ledger.settle(id, usage, 1), /consumed feature/);
    await assert.rejects(
      plan.ledger.fail(id, 'test', true, false),
      /consumed feature/,
    );
  }
  assert.deepEqual(h.settled, []);
  assert.deepEqual(h.released, []);
  assert.deepEqual(h.uncertain, []);
  const llm = new BudgetedLlm(h.provider, plan.ledger);
  assert.deepEqual(await llm.json(request, validate), { ok: true });
  assert.deepEqual(h.settled, ['0']);
  await plan.releaseUnused();
  assert.deepEqual(h.released, ['1', '2']);
  // Cleanup must not grant execution ownership to an unused feature hold.
  await assert.rejects(plan.ledger.settle('1', usage, 1), /consumed feature/);
  await assert.rejects(
    plan.ledger.fail('2', 'test', false, false),
    /consumed feature/,
  );
  assert.deepEqual(h.released, ['1', '2']);
});

void test('edition scope refuses foreign feature and protected work before admission', async () => {
  const invalid = ['', ' ', 'foreign-edition'];
  for (const runId of invalid) {
    for (const field of ['requests', 'protectedRequests'] as const) {
      const h = harness();
      let executions = 0;
      const result = await runReservedLlmPlan({
        editionId: request.runId,
        ledger: h.ledger,
        provider: h.provider,
        requests: [request],
        protectedRequests: [{ ...request, purpose: 'social' }],
        [field]: [{ ...request, runId }],
        execute: async () => {
          executions++;
        },
      });
      assert.deepEqual(result, { status: 'admission-refused' });
      assert.deepEqual(h.counts(), { batches: 0, dispatches: 0 });
      assert.equal(executions, 0);
      assert.deepEqual(h.released, []);
    }
  }
});

void test('edition scope requires an explicit nonblank expected edition', async () => {
  for (const editionId of ['', ' ', 'different-edition']) {
    const h = harness();
    assert.deepEqual(
      await runReservedLlmPlan({
        editionId,
        ledger: h.ledger,
        provider: h.provider,
        requests: [request],
        protectedRequests: [],
        execute: async () => {
          throw new Error('Must not construct edition services');
        },
      }),
      { status: 'admission-refused' },
    );
    assert.deepEqual(h.counts(), { batches: 0, dispatches: 0 });
  }
});

void test('runtime capture admission rejects incomplete plans before reservation or execution', async () => {
  const capture = (purpose: string) => ({
    editionId: 'offline',
    topicId: 'tech',
    status: 'request-ready',
    request: { ...request, purpose },
  });
  const captures = {
    editionId: 'offline',
    topicIds: ['tech'],
    matching: [capture('story-grouping-v3')],
    rewrites: [capture('developing-rewrite')],
    additionalRequests: [],
  };
  for (const invalid of [
    { ...captures, rewrites: [] },
    { ...captures, matching: captures.rewrites },
    { ...captures, topicIds: ['tech', 'nba'] },
    {
      ...captures,
      matching: [{ ...captures.matching[0], status: 'unavailable' }],
    },
    { ...captures, additionalRequests: [{ ...request, runId: 'foreign' }] },
  ]) {
    const h = harness();
    const result = await runCapturedDevelopingLlmPlan({
      captures: invalid,
      ledger: h.ledger,
      provider: h.provider,
      protectedRequests: [],
      execute: async () => assert.fail('Must not execute'),
    });
    assert.deepEqual(result, { status: 'admission-refused' });
    assert.deepEqual(h.counts(), { batches: 0, dispatches: 0 });
  }
  const h = harness();
  const result = await runCapturedDevelopingLlmPlan({
    captures,
    ledger: h.ledger,
    provider: h.provider,
    protectedRequests: [{ ...request, purpose: 'morning-editor' }],
    execute: async (llm) => {
      for (const item of [...captures.matching, ...captures.rewrites])
        assert.equal(
          (await llm.jsonOutcome(item.request, validate, { repair: false }))
            .status,
          'complete',
        );
      return 'accepted';
    },
  });
  assert.deepEqual(result, { status: 'completed', value: 'accepted' });
  assert.deepEqual(h.counts(), { batches: 1, dispatches: 2 });
  assert.deepEqual(h.settled, ['0', '1']);
  assert.deepEqual(h.released, ['2']);
});

void test('invalid original prices refuse both atomic and live admission before any hold or dispatch', async () => {
  for (const rate of ['input', 'cacheRead', 'cacheWrite', 'output'] as const) {
    for (const value of [-1, NaN, Infinity]) {
      const h = harness();
      let holds = 0;
      h.ledger.reserve = async () => {
        holds++;
        return 'unexpected';
      };
      const invalid = {
        ...request,
        model: { ...request.model, [rate]: value },
      };
      await assert.rejects(
        reserveLlmPlan(h.ledger, [invalid]),
        /Invalid token usage or pricing/,
      );
      const live = new BudgetedLlm(h.provider, h.ledger);
      await assert.rejects(
        live.json(invalid, validate, { repair: false }),
        /Invalid token usage or pricing/,
      );
      assert.equal(holds, 0);
      assert.deepEqual(h.counts(), { batches: 0, dispatches: 0 });
    }
  }
});

void test('atomic plans reject inconsistent model prices across feature and protected work before holds', async () => {
  for (const rate of ['input', 'cacheRead', 'cacheWrite', 'output'] as const) {
    for (const protectedWork of [false, true]) {
      const h = harness();
      const changed = {
        ...request,
        purpose: 'later-work',
        model: { ...request.model, [rate]: request.model[rate] + 1 },
      };
      await assert.rejects(
        reserveLlmPlan(
          h.ledger,
          protectedWork ? [request] : [request, changed],
          protectedWork ? [changed] : [],
        ),
        /Conflicting edition model prices/,
      );
      assert.deepEqual(h.counts(), { batches: 0, dispatches: 0 });
    }
  }
  for (const id of ['', '   ']) {
    const h = harness();
    await assert.rejects(
      reserveLlmPlan(
        h.ledger,
        [request],
        [{ ...request, model: { ...request.model, id } }],
      ),
      /Invalid edition model identity/,
    );
    assert.deepEqual(h.counts(), { batches: 0, dispatches: 0 });
  }
});

void test('atomic plans support consistent repeated prices and distinct models', async () => {
  const h = harness();
  const other = {
    ...request,
    purpose: 'other-model',
    model: { ...request.model, id: 'other', output: 7 },
  };
  const plan = await reserveLlmPlan(
    h.ledger,
    [request, { ...request }],
    [other],
  );
  assert.ok(plan);
  const llm = new BudgetedLlm(h.provider, plan.ledger);
  assert.equal(
    (await llm.jsonOutcome(request, validate, { repair: false })).status,
    'complete',
  );
  assert.equal(
    (await llm.jsonOutcome(request, validate, { repair: false })).status,
    'complete',
  );
  await plan.releaseUnused();
  assert.deepEqual(h.counts(), { batches: 1, dispatches: 2 });
  assert.deepEqual(h.settled, ['0', '1']);
  assert.deepEqual(h.released, ['2']);
});

void test('cache lookup and coalesced callers refuse after reserved scope cleanup', async () => {
  for (const cached of [undefined, { ok: true }]) {
    const h = harness();
    let finishCache!: (value: unknown) => void;
    h.ledger.cached = () =>
      new Promise((resolve) => {
        finishCache = resolve;
      });
    const plan = await reserveLlmPlan(h.ledger, [request]);
    assert.ok(plan);
    const llm = new BudgetedLlm(h.provider, plan.ledger);
    let validations = 0;
    const check = (value: unknown) => {
      validations++;
      return value;
    };
    const first = llm.jsonOutcome(request, check, { repair: false });
    const second = llm.jsonOutcome(request, check, { repair: false });
    await plan.releaseUnused();
    finishCache(cached);
    assert.deepEqual(await Promise.all([first, second]), [
      { status: 'budget-refused' },
      { status: 'budget-refused' },
    ]);
    assert.equal(validations, 0);
    assert.deepEqual(h.counts(), { batches: 1, dispatches: 0 });
    assert.deepEqual(h.released, ['0']);
  }
});

void test('request identity is rechecked after asynchronous cache lookup', async () => {
  const h = harness();
  let finishCache!: (value: unknown) => void;
  h.ledger.cached = () =>
    new Promise((resolve) => {
      finishCache = resolve;
    });
  const mutable = { ...request, model: { ...request.model } };
  const plan = await reserveLlmPlan(h.ledger, [mutable]);
  assert.ok(plan);
  const llm = new BudgetedLlm(h.provider, plan.ledger);
  const pending = llm.jsonOutcome(
    mutable,
    () => assert.fail('Must not validate'),
    { repair: false },
  );
  mutable.topicId = 'foreign';
  finishCache({ ok: true });
  assert.deepEqual(await pending, { status: 'budget-refused' });
  await plan.releaseUnused();
  assert.deepEqual(h.counts(), { batches: 1, dispatches: 0 });
  assert.deepEqual(h.released, ['0']);
});

void test('coalesced caller rechecks its own identity while admitted caller succeeds', async () => {
  const h = harness();
  let finishCache!: (value: unknown) => void;
  h.ledger.cached = () =>
    new Promise((resolve) => {
      finishCache = resolve;
    });
  const plan = await reserveLlmPlan(h.ledger, [request]);
  assert.ok(plan);
  const llm = new BudgetedLlm(h.provider, plan.ledger);
  const other = { ...request };
  const first = llm.jsonOutcome(request, validate, { repair: false });
  const second = llm.jsonOutcome(
    other,
    () => assert.fail('Must not validate'),
    { repair: false },
  );
  other.topicId = 'foreign';
  finishCache({ ok: true });
  assert.deepEqual(await first, { status: 'complete', value: { ok: true } });
  assert.deepEqual(await second, { status: 'budget-refused' });
  await plan.releaseUnused();
  assert.deepEqual(h.counts(), { batches: 1, dispatches: 0 });
  assert.deepEqual(h.released, ['0']);
});

void test('reservation completion rechecks scope and identity before dispatch and releases consumed holds', async () => {
  for (const change of ['close', 'identity', 'none']) {
    const h = harness();
    const mutable = { ...request, model: { ...request.model } };
    const plan = await reserveLlmPlan(h.ledger, [mutable]);
    assert.ok(plan);
    const reserve = plan.ledger.reserve.bind(plan.ledger);
    let finishReserve!: () => void;
    let started!: () => void;
    const reserved = new Promise<void>((resolve) => {
      started = resolve;
    });
    plan.ledger.reserve = async (candidate, estimate) => {
      const id = await reserve(candidate, estimate);
      started();
      await new Promise<void>((resolve) => {
        finishReserve = resolve;
      });
      return id;
    };
    const llm = new BudgetedLlm(h.provider, plan.ledger);
    let validations = 0;
    const pending = llm.jsonOutcome(
      mutable,
      (value) => {
        validations++;
        return value;
      },
      { repair: false },
    );
    await reserved;
    if (change === 'close') await plan.releaseUnused();
    if (change === 'identity') mutable.topicId = 'foreign';
    finishReserve();
    assert.equal(
      (await pending).status,
      change === 'none' ? 'complete' : 'budget-refused',
    );
    await plan.releaseUnused();
    assert.equal(validations, change === 'none' ? 1 : 0);
    assert.deepEqual(h.counts(), {
      batches: 1,
      dispatches: change === 'none' ? 1 : 0,
    });
    assert.deepEqual(h.released, change === 'none' ? [] : ['0']);
    assert.deepEqual(h.settled, change === 'none' ? ['0'] : []);
    assert.deepEqual(h.uncertain, []);
  }
});
