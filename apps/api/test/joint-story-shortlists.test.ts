import assert from 'node:assert/strict';
import { test } from 'node:test';

import { EventGrouping } from '../src/modules/curation/application/event-grouping';
import type { OwnedStoryGroup } from '../src/modules/curation/public/editorial';
import { jointStoryShortlists } from '../src/modules/digests/application/joint-story-shortlists';
import { type Candidate, rank } from '../src/modules/digests/domain/rank';

const start = new Date('2026-11-10T00:00:00Z');
const end = new Date('2026-11-11T00:00:00Z');
const article = (id: string): Candidate => ({
  id,
  title: 'Reported policy announcement',
  url: `https://example.com/${id}`,
  excerpt: 'Recorded reporting about the announcement.',
  publishedAt: '2026-11-10T12:00:00Z',
  sources: [id],
  publisher: { name: `Publisher ${id}`, url: `https://example.com/${id}` },
  points: 0,
});
const pools = [
  {
    scope: { id: 'world', name: 'World', description: 'Global', guidance: '' },
    candidates: [article('a'), article('b')],
  },
  {
    scope: { id: 'us', name: 'U.S.', description: 'Domestic', guidance: '' },
    candidates: [article('c'), article('d')],
  },
];

void test('joint ownership moves whole events before ranking, preserving coverage and scores', async () => {
  let calls = 0;
  const result = await jointStoryShortlists(
    {
      async assignTopics(scopes, candidates, runId) {
        calls++;
        assert.deepEqual(
          scopes,
          pools.map((pool) => pool.scope),
        );
        assert.equal(runId, 'edition');
        assert.deepEqual(
          candidates.map((item) => [item.id, item.topicId]),
          [
            ['a', 'world'],
            ['b', 'world'],
            ['c', 'us'],
            ['d', 'us'],
          ],
        );
        return [
          { topicId: 'us', ids: ['a', 'c'] },
          { topicId: 'world', ids: ['b', 'd'] },
        ];
      },
    },
    pools,
    start,
    end,
    'edition',
  );
  assert.equal(calls, 1);
  assert.ok(result);
  const stories = [...result.values()].flat();
  assert.equal(stories.length, 2);
  assert.deepEqual(
    result.get('us')![0].coverage.map((item) => item.id),
    ['a', 'c'],
  );
  assert.deepEqual(
    result.get('world')![0].coverage.map((item) => item.id),
    ['b', 'd'],
  );
  assert.deepEqual(
    stories.flatMap((story) => story.coverage.map((item) => item.id)).sort(),
    ['a', 'b', 'c', 'd'],
  );
  assert.equal(result.get('us')![0].coverage[1].publisher?.name, 'Publisher c');
  assert.equal(
    result.get('us')![0].score,
    rank([article('a')], start, end, 10)[0].score,
  );
  assert.deepEqual(
    pools[0].candidates.map((item) => item.id),
    ['a', 'b'],
  );
});

void test('unavailable or incomplete ownership refuses the whole split', async () => {
  const decisions: (OwnedStoryGroup[] | null)[] = [
    null,
    [],
    [{ topicId: 'us', ids: ['a', 'b', 'c'] }],
    [{ topicId: 'unknown', ids: ['a', 'b', 'c', 'd'] }],
    [{ topicId: 'us', ids: ['a', 'b', 'c', 'd', 'other'] }],
    [
      { topicId: 'us', ids: ['a', 'b', 'c', 'd'] },
      { topicId: 'world', ids: ['a'] },
    ],
    [
      { topicId: 'us', ids: ['a', 'b', 'c', 'd'] },
      { topicId: 'world', ids: [] },
    ],
  ];
  for (const decision of decisions) {
    assert.equal(
      await jointStoryShortlists(
        {
          async assignTopics() {
            return decision;
          },
        },
        pools,
        start,
        end,
        'edition',
      ),
      null,
    );
  }
  assert.equal(
    await jointStoryShortlists(
      {
        async assignTopics() {
          throw new Error('refused');
        },
      },
      pools,
      start,
      end,
      'edition',
    ),
    null,
  );
});

void test('invalid pools refuse before inference and empty pools require no request', async () => {
  const port = {
    async assignTopics(): Promise<null> {
      assert.fail('no inference');
    },
  };
  for (const invalid of [
    pools.slice(0, 1),
    [pools[0], pools[0]],
    [pools[0], { ...pools[1], candidates: [article('a')] }],
    [
      pools[0],
      {
        ...pools[1],
        candidates: Array.from({ length: 40 }, (_, i) => article(`extra-${i}`)),
      },
    ],
  ]) {
    assert.equal(
      await jointStoryShortlists(port, invalid, start, end, 'edition'),
      null,
    );
  }
  assert.equal(
    await jointStoryShortlists(null, pools, start, end, 'edition'),
    null,
  );
  assert.equal(
    await jointStoryShortlists(port, pools, end, start, 'edition'),
    null,
  );
  assert.deepEqual(
    await jointStoryShortlists(
      port,
      pools.map((pool) => ({ ...pool, candidates: [] })),
      start,
      end,
      'edition',
    ),
    new Map([
      ['world', []],
      ['us', []],
    ]),
  );
});

void test('real ownership parser feeds the ranked bridge with a recorded response', async () => {
  const grouping = new EventGrouping(
    {
      async json(request, parse) {
        assert.equal(request.purpose, 'joint-story-grouping-v1');
        return parse({
          groups: [{ topicId: 'us', ids: ['a', 'b', 'c', 'd'] }],
        });
      },
    },
    { id: 'recorded', input: 0, cacheWrite: 0, cacheRead: 0, output: 0 },
  );
  const result = await jointStoryShortlists(
    grouping,
    pools,
    start,
    end,
    'recorded',
  );
  assert.ok(result);
  assert.deepEqual(result.get('world'), []);
  assert.equal(result.get('us')!.length, 1);
  assert.equal(result.get('us')![0].coverage.length, 4);
});
