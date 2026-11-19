import assert from 'node:assert/strict';
import { test } from 'node:test';

import { llmConfig } from '../src/modules/curation/adapters/config';
import type { LlmRequest } from '../src/modules/curation/domain/llm.port';
import { rewriteSelectedDevelopingStories } from '../src/modules/digests/application/rewrite-selected-developing-stories';

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

void test('prepared orchestration dispatches one attributed request and preserves accepted metadata', async () => {
  const before = structuredClone(config);
  const requests: LlmRequest[] = [];
  const execution = { deadline: 12345 };
  const result = await rewriteSelectedDevelopingStories({
    ...config,
    execution,
    llm: {
      async complete(request, context) {
        requests.push(request);
        assert.equal(context, execution);
        assert.equal(JSON.parse(request.prompt).stories.length, 1);
        return { text: JSON.stringify([prose]), usage };
      },
    },
  });
  assert.equal(requests.length, 1);
  assert.equal(requests[0].purpose, 'developing-rewrite');
  assert.equal(requests[0].runId, 'offline');
  assert.equal(requests[0].topicId, 'topic');
  assert.equal(requests[0].model.id, config.model.id);
  assert.equal(result.status, 'rewritten');
  assert.equal(result.stories[0].summary, prose.summary);
  assert.equal(result.stories[0].rationale, 'Keep');
  assert.deepEqual(result.stories[1], selected[1]);
  assert.deepEqual(config, before);
});

void test('prepared orchestration fails atomically without retries on refusals, invalid output, guard failures or port errors', async () => {
  for (const text of [
    'null',
    'not JSON',
    '```json\n[]\n```',
    '[]',
    JSON.stringify([{ ...prose, summary: 'No injuries were reported.' }]),
    JSON.stringify([{ ...prose, sources: ['Injected'] }]),
    'throw',
  ]) {
    let calls = 0;
    const result = await rewriteSelectedDevelopingStories({
      ...config,
      llm: {
        async complete() {
          calls++;
          if (text === 'throw') throw new Error('Budget unavailable');
          return { text, usage };
        },
      },
    });
    assert.equal(calls, 1);
    assert.equal(result.status, 'unchanged');
    assert.equal(result.stories, selected);
  }
});

void test('empty matches and oversized evidence never reach the LLM port', async () => {
  let calls = 0;
  const llm = {
    async complete() {
      calls++;
      return { text: JSON.stringify([prose]), usage };
    },
  };
  for (const overrides of [
    { links: [] },
    { evidence: [{ ...evidence[0], excerpt: 'x'.repeat(100000) }] },
  ]) {
    const result = await rewriteSelectedDevelopingStories({
      ...config,
      ...overrides,
      llm,
    });
    assert.equal(result.status, 'unchanged');
    assert.equal(result.stories, selected);
  }
  assert.equal(calls, 0);
});
