import assert from 'node:assert/strict';
import { test } from 'node:test';

import {
  matchDevelopingStories,
  matchDevelopingStoriesWithResult,
} from '../src/modules/digests/application/match-developing-stories';
import type { GroupingResultPort } from '../src/modules/digests/application/prepare-story-grouping';

const target = {
  topicId: 'tech',
  publishedAt: '2026-11-18T15:00:00Z',
  runId: 'run',
};
const current = [
  { id: 'reused', title: 'New facts', summary: 'Current summary' },
];
const history = [
  {
    editionId: 'previous',
    publishedAt: '2026-11-17T15:00:00Z',
    stories: [
      { id: 'reused', title: 'Earlier facts', summary: 'Earlier summary' },
    ],
  },
];

void test('one semantic request preserves occurrence IDs, evidence dates and run admission context', async () => {
  let calls = 0;
  const port: GroupingResultPort = {
    async groupWithResult(topicId, candidates, runId) {
      calls++;
      assert.equal(topicId, 'tech');
      assert.equal(runId, 'run');
      assert.deepEqual(
        candidates.map((x) => [x.id, x.publishedAt, x.excerpt]),
        [
          ['current:0', target.publishedAt, 'Current summary'],
          ['history:0:0', history[0].publishedAt, 'Earlier summary'],
        ],
      );
      return { status: 'validated', groups: [['current:0', 'history:0:0']] };
    },
  };
  const before = structuredClone({ current, history });
  const links = await matchDevelopingStories(port, target, current, history);
  assert.equal(calls, 1);
  assert.equal(links[0]?.previousEditionId, 'previous');
  assert.equal(links[0]?.previousSummary, 'Earlier summary');
  assert.deepEqual({ current, history }, before);
});

void test('unavailable, invalid and failed semantic results leave stories unlinked', async () => {
  for (const port of [
    null,
    {
      async groupWithResult() {
        return { status: 'unavailable' as const, reason: 'no-result' as const };
      },
    },
    {
      async groupWithResult() {
        return {
          status: 'validated' as const,
          groups: [['current:0', 'unknown']],
        };
      },
    },
    {
      async groupWithResult(): Promise<never> {
        throw new Error('provider unavailable');
      },
    },
  ])
    assert.deepEqual(
      await matchDevelopingStories(port, target, current, history),
      [],
    );
});

void test('missing evidence and oversized pools never invoke the provider or truncate history', async () => {
  const port: GroupingResultPort = {
    async groupWithResult(): Promise<never> {
      assert.fail('must not call');
    },
  };
  assert.deepEqual(await matchDevelopingStories(port, target, [], history), []);
  assert.deepEqual(await matchDevelopingStories(port, target, current, []), []);
  const large = [
    {
      ...history[0],
      stories: Array.from({ length: 40 }, (_, i) => ({
        ...history[0].stories[0],
        id: String(i),
      })),
    },
  ];
  assert.deepEqual(
    await matchDevelopingStories(port, target, current, large),
    [],
  );
});

void test('edition admission distinguishes valid absence from matching refusal', async () => {
  for (const groups of [[], [['history:0:0', 'current:0']]]) {
    const result = await matchDevelopingStoriesWithResult(
      {
        async groupWithResult() {
          return { status: 'validated', groups };
        },
      },
      target,
      current,
      history,
    );
    assert.equal(result.status, 'validated');
    assert.equal(result.links.length, groups.length);
  }
  for (const groups of [
    [['current:0', 'unknown']],
    [['current:0']],
    [
      ['current:0', 'history:0:0'],
      ['current:0', 'history:0:0'],
    ],
  ]) {
    const result = await matchDevelopingStoriesWithResult(
      {
        async groupWithResult() {
          return { status: 'validated', groups };
        },
      },
      target,
      current,
      history,
    );
    assert.equal(result.status, 'unavailable');
    assert.deepEqual(result.links, []);
  }
  for (const port of [
    null,
    {
      async groupWithResult() {
        return { status: 'unavailable' as const, reason: 'no-result' as const };
      },
    },
    {
      async groupWithResult(): Promise<never> {
        throw new Error('transport');
      },
    },
  ]) {
    const result = await matchDevelopingStoriesWithResult(
      port,
      target,
      current,
      history,
    );
    assert.equal(result.status, 'unavailable');
    assert.deepEqual(result.links, []);
  }
});
