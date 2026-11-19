import assert from 'node:assert/strict';
import { test } from 'node:test';

import { llmConfig } from '../src/modules/curation/adapters/config';
import { BudgetedLlm } from '../src/modules/curation/application/budgeted-llm';
import { costMicros } from '../src/modules/curation/domain/budget';
import type { LlmRequest } from '../src/modules/curation/domain/llm.port';
import { ProviderSpendLimit } from '../src/modules/curation/domain/llm.port';
import type { LlmLedger } from '../src/modules/curation/domain/llm-ledger.port';
import { enrichSelectedDevelopingStories } from '../src/modules/digests/application/enrich-selected-developing-stories';

const selected = [
  {
    id: 'a',
    title: 'Launch',
    summary: 'Original',
    whyItMatters: 'Impact',
    rationale: 'Keep',
  },
  {
    id: 'b',
    title: 'Other',
    summary: 'Untouched',
    whyItMatters: 'Other impact',
  },
];
const evidence = [
  {
    id: 'a',
    title: 'Launch begins',
    excerpt: 'The company began shipping its product today.',
    sources: ['Publisher'],
  },
];
const links = [
  {
    storyId: 'a',
    previousEditionId: '00000000-0000-4000-8000-000000000001',
    previousStoryId: '00000000-0000-4000-8000-000000000002',
    previousHeadline: 'Launch announced',
    previousSummary: 'Shipping was planned.',
    editionCount: 2,
  },
];
const prose = {
  id: 'a',
  title: 'Product ships',
  summary: 'The company began shipping today.',
  whyItMatters: 'Customers can receive the product.',
};
const config = {
  selected,
  evidence,
  links,
  model: llmConfig({}).sonnet,
  runId: 'offline',
  topicId: 'topic',
  topicName: 'Tech',
};
const usage = { input: 0, output: 0, cacheRead: 0, cacheWrite: 0 };

const history = [
  {
    editionId: links[0].previousEditionId,
    publishedAt: '2026-11-17T15:00:00Z',
    stories: [
      {
        id: links[0].previousStoryId,
        title: 'Launch announced',
        summary: 'Shipping was planned.',
      },
    ],
  },
];
const completeEvidence = [
  ...evidence,
  {
    id: 'b',
    title: 'Other reporting',
    excerpt: 'Other facts',
    sources: ['Publisher'],
  },
];

void test('selected enrichment matches original reporting then rewrites once without selecting again', async () => {
  const order: string[] = [];
  const input = {
    ...config,
    evidence: completeEvidence,
    editorialMode: 'ai' as const,
    history,
    publishedAt: '2026-11-18T15:00:00Z',
    grouping: {
      async groupWithResult(
        _topic: string,
        candidates: { title: string; excerpt: string }[],
      ) {
        order.push('match');
        assert.equal(candidates[0].title, evidence[0].title);
        assert.equal(candidates[0].excerpt, evidence[0].excerpt);
        assert.equal(candidates.length, 3);
        return {
          status: 'validated' as const,
          groups: [['current:0', 'history:0:0']],
        };
      },
    },
    llm: {
      async complete(request: LlmRequest) {
        order.push('rewrite');
        assert.equal(request.purpose, 'developing-rewrite');
        return { text: JSON.stringify([prose]), usage };
      },
    },
  };
  const before = structuredClone({
    selected,
    evidence: completeEvidence,
    history,
  });
  const result = await enrichSelectedDevelopingStories(input);
  assert.equal(result.status, 'rewritten');
  assert.deepEqual(order, ['match', 'rewrite']);
  assert.equal(result.stories[0].rationale, 'Keep');
  assert.deepEqual(result.stories[1], selected[1]);
  assert.deepEqual({ selected, evidence: completeEvidence, history }, before);
  const refused = await enrichSelectedDevelopingStories({
    ...input,
    llm: {
      async complete() {
        return { text: 'null', usage };
      },
    },
  });
  assert.equal(refused.stories, selected);
  assert.equal(refused.status, 'unchanged');
  assert.equal('reason' in refused && refused.reason, 'rewrite-refused');
});

void test('fallback, missing or ambiguous evidence and capacity refusal make no enrichment calls', async () => {
  const never = async (): Promise<never> => assert.fail('must not dispatch');
  const input = {
    ...config,
    evidence: completeEvidence,
    editorialMode: 'ai' as const,
    history,
    publishedAt: '2026-11-18T15:00:00Z',
    grouping: { groupWithResult: never },
    llm: { complete: never },
  };
  const reasons = [
    'non-ai-selection',
    'ambiguous-or-missing-evidence',
    'ambiguous-or-missing-evidence',
    'ambiguous-or-missing-evidence',
    'empty-history',
    'history-capacity',
    'matching-unavailable',
    'empty-selection',
  ];
  for (const [index, override] of [
    { editorialMode: 'fallback' as const },
    { evidence },
    { evidence: [...completeEvidence, evidence[0]] },
    { selected: [selected[0], selected[0]] },
    { history: [] },
    {
      history: [
        {
          ...history[0],
          stories: Array.from({ length: 40 }, (_, i) => ({
            ...history[0].stories[0],
            id: String(i),
          })),
        },
      ],
    },
    { grouping: null },
    { selected: [] },
  ].entries()) {
    const value = { ...input, ...override };
    const result = await enrichSelectedDevelopingStories(value);
    assert.equal(result.status, 'unchanged');
    assert.equal('reason' in result && result.reason, reasons[index]);
    assert.equal(result.stories, value.selected);
  }
  const result = await enrichSelectedDevelopingStories({
    ...input,
    grouping: {
      async groupWithResult() {
        throw new Error('unavailable');
      },
    },
  });
  assert.equal(result.stories, selected);
  assert.equal('reason' in result && result.reason, 'no-validated-links');
});

void test('selected enrichment retains accepted stories across real budget-wrapper admission and settlement outcomes', async () => {
  for (const scenario of [
    'refused',
    'success',
    'invalid-json',
    'transport-error',
    'provider-limit',
    'expired',
  ] as const) {
    const reservations: { request: LlmRequest; estimate: number }[] = [];
    const settlements: { id: string; cost: number }[] = [];
    const failures: {
      id: string;
      code: string;
      limit: boolean;
      uncertain: boolean;
    }[] = [];
    const cache = new Map<string, unknown>();
    let providerCalls = 0;
    let matchingCalls = 0;
    const ledger: LlmLedger = {
      async reserve(request, estimate) {
        reservations.push({ request, estimate });
        return scenario === 'refused' ? null : 'rewrite-hold';
      },
      async settle(id, _usage, cost) {
        settlements.push({ id, cost });
      },
      async fail(id, code, limit, uncertain) {
        failures.push({ id, code, limit, uncertain });
      },
      async cached(key) {
        return cache.get(key);
      },
      async cache(key, value) {
        cache.set(key, value);
      },
    };
    const actualUsage = { input: 100, output: 40, cacheRead: 0, cacheWrite: 0 };
    const budgeted = new BudgetedLlm(
      {
        async complete() {
          providerCalls++;
          if (scenario === 'transport-error')
            throw new Error('uncertain transport');
          if (scenario === 'provider-limit') throw new ProviderSpendLimit();
          return {
            text: scenario === 'invalid-json' ? '{' : JSON.stringify([prose]),
            usage: actualUsage,
          };
        },
      },
      ledger,
    );
    const result = await enrichSelectedDevelopingStories({
      ...config,
      evidence: completeEvidence,
      editorialMode: 'ai',
      history,
      publishedAt: '2026-11-18T15:00:00Z',
      execution: scenario === 'expired' ? { deadline: 0 } : undefined,
      grouping: {
        async groupWithResult() {
          matchingCalls++;
          return {
            status: 'validated',
            groups: [['current:0', 'history:0:0']],
          };
        },
      },
      // Test composition only: the real wrapper owns reservation and settlement.
      // Disable repairs so a failed enrichment cannot start an extra dispatch.
      llm: {
        async complete(request, execution) {
          const outcome = await budgeted.jsonOutcome(
            request,
            (value) => value,
            { repair: false, execution },
          );
          if (outcome.status !== 'complete') throw new Error(outcome.status);
          return { text: JSON.stringify(outcome.value), usage };
        },
      },
    });
    assert.equal(matchingCalls, 1);
    assert.equal(reservations.length, scenario === 'expired' ? 0 : 1);
    assert.equal(
      providerCalls,
      ['refused', 'expired'].includes(scenario) ? 0 : 1,
    );
    if (reservations.length) {
      const { request, estimate } = reservations[0];
      assert.equal(request.runId, config.runId);
      assert.equal(request.topicId, config.topicId);
      assert.equal(request.purpose, 'developing-rewrite');
      assert.equal(
        estimate,
        costMicros(
          {
            input:
              Buffer.byteLength(request.instructions + request.prompt, 'utf8') +
              2048,
            output: request.maxOutputTokens,
            cacheRead: 0,
            cacheWrite: 0,
          },
          {
            ...request.model,
            input: Math.max(
              request.model.input,
              request.model.cacheRead,
              request.model.cacheWrite,
            ),
          },
        ),
      );
    }
    if (scenario === 'success' || scenario === 'invalid-json') {
      assert.deepEqual(settlements, [
        { id: 'rewrite-hold', cost: costMicros(actualUsage, config.model) },
      ]);
    } else assert.deepEqual(settlements, []);
    if (scenario === 'transport-error' || scenario === 'provider-limit') {
      assert.deepEqual(failures, [
        {
          id: 'rewrite-hold',
          code:
            scenario === 'provider-limit'
              ? 'provider-spend-limit'
              : 'provider-call-failed',
          limit: scenario === 'provider-limit',
          uncertain: scenario === 'transport-error',
        },
      ]);
    } else assert.deepEqual(failures, []);
    assert.equal(cache.size, scenario === 'success' ? 1 : 0);
    if (scenario === 'success') {
      assert.equal(result.status, 'rewritten');
      assert.equal(result.stories[0].summary, prose.summary);
      assert.deepEqual(result.stories[1], selected[1]);
    } else {
      assert.equal(result.status, 'unchanged');
      assert.equal(result.stories, selected);
      assert.equal('reason' in result && result.reason, 'rewrite-refused');
    }
  }
});
