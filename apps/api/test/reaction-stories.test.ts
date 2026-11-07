import assert from 'node:assert/strict';
import test from 'node:test';

import type { PoolClient } from 'pg';

import { cachedReactionStories } from '../src/modules/digests/domain/cached-reaction-stories';
import { loadReactionStories } from '../src/modules/digests/public/reaction-stories';

const start = new Date('2026-11-02T00:00:00Z');
const end = new Date('2026-11-03T00:00:00Z');
void test('experiment reactions reject cached off-topic stories and prioritize saved importance without new calls', () => {
  const candidates = [
    { id: 'nfl', title: 'Football trade', publishedAt: '2026-11-02T23:59:00Z' },
    {
      id: 'world',
      title: 'Election result',
      publishedAt: '2026-11-02T12:00:00Z',
    },
    {
      id: 'unscored',
      title: 'Unscored report',
      publishedAt: '2026-11-02T23:58:00Z',
    },
    { id: 'major', title: 'Major event', publishedAt: '2026-11-02T01:00:00Z' },
    { id: 'outside', title: 'Outside window', publishedAt: end.toISOString() },
  ].map((row) => ({
    ...row,
    url: `https://example.com/${row.id}`,
    excerpt: 'Reported facts',
    sources: ['Fixture'],
    points: 0,
  }));
  const scores = [
    { id: 'nfl', relevance: 2, importance: 10 },
    { id: 'world', relevance: 8, importance: 7 },
    { id: 'major', relevance: 6, importance: 10 },
    { id: 'outside', relevance: 10, importance: 10 },
  ];
  const result = cachedReactionStories(candidates, scores, start, end);
  assert.deepEqual(
    result.map((row) => row.id),
    ['major', 'world', 'unscored'],
  );
  assert.deepEqual(result[0].cachedScore, scores[2]);
  assert.equal(result[2].cachedScore, null);
  assert.deepEqual(
    cachedReactionStories(candidates, [], start, end).map((row) => row.id),
    ['nfl', 'unscored', 'world', 'major'],
  );
});
const article = (
  id: string,
  title: string,
  publishedAt = '2026-11-02T23:00:00Z',
  points = 0,
) => ({
  id,
  title,
  publishedAt: new Date(publishedAt),
  points,
  url: `https://example.com/${id}`,
  excerpt: '',
  sources: ['Fixture'],
});
function fixture(enabled = true) {
  const calls: unknown[][] = [];
  const db = {
    query: async (
      _sql: string | { text: string; rowMode?: string },
      values: unknown[],
    ) => {
      calls.push(
        values.length === 3 && values[1] === true
          ? [values[0]]
          : [
              values[0],
              new Date(String(values[1])),
              new Date(String(values[2])),
            ],
      );
      return {
        rows:
          calls.length === 1
            ? enabled
              ? [[{ includeAny: ['NBA'], excludeAny: ['rumor'] }]]
              : []
            : [
                article('best', 'NBA team wins championship', undefined, 1000),
                article('second', 'NBA coach announces retirement'),
                article(
                  'third',
                  'NBA team opens training camp',
                  '2026-11-02T01:00:00Z',
                ),
                article('duplicate', 'NBA team wins championship'),
                article('wrong-topic', 'New game launches worldwide'),
                article('excluded', 'NBA rumor spreads'),
                article('promo', 'NBA best bets'),
                article('old', 'NBA earlier event', '2026-11-01T23:59:59Z'),
                article('end', 'NBA later event', end.toISOString()),
              ].map((row) => [
                row.id,
                row.title,
                row.url,
                row.excerpt,
                null,
                null, // structured publisher unknown in this fixture
                row.publishedAt.toISOString(),
                row.sources,
                row.points,
              ]),
      };
    },
  } as unknown as Pick<PoolClient, 'query'>;
  return { db, calls };
}
void test('reaction stories reuse article filters, ranking without wording grouping and the exact topic/window', async () => {
  const { db, calls } = fixture();
  const stories = await loadReactionStories(db, 'nba', start, end);
  assert.deepEqual(
    stories.map(({ id }) => id),
    ['best', 'duplicate'],
  );
  assert.ok(stories[0].importance > stories[1].importance);
  assert.deepEqual(calls, [['nba'], ['nba', start, end]]);
});
void test('disabled/missing topics and invalid windows cannot load reaction candidates', async () => {
  const { db, calls } = fixture(false);
  assert.deepEqual(await loadReactionStories(db, 'nba', start, end), []);
  assert.equal(calls.length, 1);
  for (const [id, from, to] of [
    ['', start, end],
    ['nba', end, start],
    ['nba', new Date(NaN), end],
  ] as const)
    await assert.rejects(loadReactionStories(db, id, from, to));
  assert.equal(calls.length, 1);
});
