import assert from 'node:assert/strict';
import { test } from 'node:test';

import { llmConfig } from '../src/modules/curation/adapters/config';
import { enrichDevelopingEdition } from '../src/modules/digests/application/enrich-developing-edition';

function topic(topicId: string) {
  return {
    topicId,
    topicName: 'Tech',
    runId: 'edition',
    editorialMode: 'ai' as const,
    selected: [
      {
        id: 'a',
        title: 'Accepted',
        summary: 'Original',
        whyItMatters: 'Impact',
      },
    ],
    evidence: [
      {
        id: 'a',
        title: 'Reporting',
        excerpt: 'New reporting',
        sources: ['Source'],
      },
    ],
    publishedAt: '2026-11-20T15:00:00Z',
    history: [
      {
        editionId: 'previous',
        publishedAt: '2026-11-19T15:00:00Z',
        stories: [
          { id: 'old', title: 'Earlier', summary: 'Earlier reporting' },
        ],
      },
    ],
    grouping: {
      async groupWithResult() {
        return { status: 'validated' as const, groups: [] };
      },
    },
    model: llmConfig({}).sonnet,
    llm: {
      async complete() {
        throw new Error('unexpected rewrite');
      },
    },
  };
}

void test('edition preserves successful no-link and ineligible topics without rewriting', async () => {
  const topics = [
    topic('tech'),
    { ...topic('nba'), editorialMode: 'fallback' as const },
  ];
  const result = await enrichDevelopingEdition(topics);
  assert.equal(result.status, 'completed');
  result.topics.forEach((item, index) =>
    assert.equal(item.stories, topics[index].selected),
  );
});

void test('edition refusal stops later dispatch and preserves every original array', async () => {
  let calls = 0;
  const topics = [
    topic('tech'),
    { ...topic('nba'), grouping: null },
    {
      ...topic('world'),
      grouping: {
        async groupWithResult() {
          calls++;
          throw new Error('unreachable');
        },
      },
    },
  ];
  const result = await enrichDevelopingEdition(topics);
  assert.equal(result.status, 'unchanged');
  assert.equal(result.reason, 'matching-unavailable');
  assert.equal(calls, 0);
  result.topics.forEach((item, index) =>
    assert.equal(item.stories, topics[index].selected),
  );
});

void test('invalid edition identities refuse before matching', async () => {
  let calls = 0;
  const first = {
    ...topic('tech'),
    grouping: {
      async groupWithResult() {
        calls++;
        throw new Error('unexpected');
      },
    },
  };
  for (const topics of [
    [first, first],
    [first, { ...topic('nba'), runId: 'other' }],
    [topic(' ')],
  ]) {
    const result = await enrichDevelopingEdition(topics);
    assert.equal(result.status, 'unchanged');
    assert.equal(result.reason, 'invalid-edition');
  }
  assert.equal(calls, 0);
});

void test('later matching refusal discards an earlier successful rewrite', async () => {
  let rewrites = 0;
  const first = {
    ...topic('tech'),
    history: [
      {
        editionId: '00000000-0000-4000-8000-000000000001',
        publishedAt: '2026-11-19T15:00:00Z',
        stories: [
          {
            id: '00000000-0000-4000-8000-000000000002',
            title: 'Earlier',
            summary: 'Earlier reporting',
          },
        ],
      },
    ],
    grouping: {
      async groupWithResult() {
        return {
          status: 'validated' as const,
          groups: [['current:0', 'history:0:0']],
        };
      },
    },
    llm: {
      async complete() {
        rewrites++;
        return {
          text: JSON.stringify([
            {
              id: 'a',
              title: 'Updated',
              summary: 'New reporting',
              whyItMatters: 'Impact',
            },
          ]),
          usage: { input: 0, output: 0, cacheRead: 0, cacheWrite: 0 },
        };
      },
    },
  };
  const successful = await enrichDevelopingEdition([first]);
  assert.equal(successful.status, 'completed');
  assert.equal(successful.topics[0].stories[0].title, 'Updated');
  const second = { ...topic('nba'), grouping: null };
  const refused = await enrichDevelopingEdition([first, second]);
  assert.equal(refused.status, 'unchanged');
  assert.equal(rewrites, 2);
  assert.equal(refused.topics[0].stories, first.selected);
  assert.equal(refused.topics[1].stories, second.selected);
});
