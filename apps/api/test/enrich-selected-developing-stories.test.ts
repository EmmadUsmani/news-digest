import assert from 'node:assert/strict';
import { test } from 'node:test';

import { llmConfig } from '../src/modules/curation/adapters/config';
import type { LlmRequest } from '../src/modules/curation/domain/llm.port';
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
