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

void test('later matching refusal prevents every edition rewrite', async () => {
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
  const second = {
    ...topic('nba'),
    grouping: {
      async groupWithResult() {
        return { status: 'unavailable' as const };
      },
    },
  };
  const refused = await enrichDevelopingEdition([first, second]);
  assert.equal(refused.status, 'unchanged');
  assert.equal(rewrites, 1);
  assert.equal(refused.topics[0].stories, first.selected);
  assert.equal(refused.topics[1].stories, second.selected);

  const events: string[] = [];
  const matchedTopics = ['tech', 'nba', 'world'].map((topicId) => ({
    ...first,
    topicId,
    grouping: {
      async groupWithResult() {
        events.push(`match:${topicId}`);
        return {
          status: 'validated' as const,
          groups: [['current:0', 'history:0:0']],
        };
      },
    },
    llm: {
      async complete() {
        events.push(`rewrite:${topicId}`);
        // Refuse the second rewrite; the third must never dispatch.
        return topicId === 'nba'
          ? {
              text: '[]',
              usage: { input: 0, output: 0, cacheRead: 0, cacheWrite: 0 },
            }
          : first.llm.complete();
      },
    },
  }));
  const rewriteRefused = await enrichDevelopingEdition(matchedTopics);
  assert.equal(rewriteRefused.status, 'unchanged');
  assert.equal(rewriteRefused.reason, 'rewrite-refused');
  assert.deepEqual(events, [
    'match:tech',
    'match:nba',
    'match:world',
    'rewrite:tech',
    'rewrite:nba',
  ]);
  rewriteRefused.topics.forEach((item, index) =>
    assert.equal(item.stories, matchedTopics[index].selected),
  );
});

void test('invalid later topic refuses the edition before any matching dispatch', async () => {
  let calls = 0;
  const first = {
    ...topic('tech'),
    grouping: {
      async groupWithResult() {
        calls++;
        return { status: 'validated' as const, groups: [] };
      },
    },
  };
  const missing = { ...topic('nba'), evidence: [] };
  const duplicate = {
    ...topic('nba'),
    selected: [...missing.selected, ...missing.selected],
  };
  const overCapacity = {
    ...topic('nba'),
    history: [
      {
        ...topic('nba').history[0],
        stories: Array.from(
          { length: 40 },
          () => topic('nba').history[0].stories[0],
        ),
      },
    ],
  };
  for (const [invalid, reason] of [
    [missing, 'ambiguous-or-missing-evidence'],
    [duplicate, 'ambiguous-or-missing-evidence'],
    [overCapacity, 'history-capacity'],
    [{ ...topic('nba'), grouping: null }, 'matching-unavailable'],
  ] as const) {
    const result = await enrichDevelopingEdition([first, invalid]);
    assert.equal(result.status, 'unchanged');
    assert.equal(result.reason, reason);
    assert.equal(result.topics[0].stories, first.selected);
    assert.equal(result.topics[1].stories, invalid.selected);
  }
  assert.equal(calls, 0);
});

void test('edition chronology refuses invalid inputs before dispatch and accepts equivalent instants', async () => {
  let calls = 0;
  const first = {
    ...topic('tech'),
    grouping: {
      async groupWithResult() {
        calls++;
        return { status: 'validated' as const, groups: [] };
      },
    },
  };
  const second = { ...first, topicId: 'nba' };
  const invalidTopics = [
    { ...second, publishedAt: 'invalid' },
    { ...second, publishedAt: '2026-11-21T15:00:00Z' },
    { ...second, runId: ' ' },
    ...[
      { editionId: 'edition' },
      { publishedAt: 'invalid' },
      { publishedAt: first.publishedAt },
      { publishedAt: '2026-11-21T15:00:00Z' },
    ].map((override) => ({
      ...second,
      history: [{ ...second.history[0], ...override }],
    })),
  ];
  for (const invalid of invalidTopics) {
    const result = await enrichDevelopingEdition([first, invalid]);
    assert.equal(result.status, 'unchanged');
    assert.equal(result.reason, 'invalid-edition');
    assert.equal(result.topics[0].stories, first.selected);
    assert.equal(result.topics[1].stories, invalid.selected);
  }
  assert.equal(calls, 0);
  const accepted = await enrichDevelopingEdition([
    first,
    { ...second, publishedAt: '2026-11-20T10:00:00-05:00' },
  ]);
  assert.equal(accepted.status, 'completed');
  assert.equal(calls, 2);
});
