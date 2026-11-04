import assert from 'node:assert/strict';
import test from 'node:test';

import type { PoolClient } from 'pg';

import { loadReactionStories } from '../src/modules/digests/public/reaction-stories';
import { runSearchFollowups } from '../src/modules/social/application/search-followups';

const start = new Date('2026-11-02T00:00:00Z');
const end = new Date('2026-11-03T00:00:00Z');
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
  const requests: string[] = [];
  await runSearchFollowups(
    [
      {
        id: 'nba',
        request: {
          topic: 'NBA',
          guidance: '',
          fromDate: '2026-11-02',
          toDate: '2026-11-03',
        },
        openCallId: '00000000-0000-0000-0000-000000000001',
        openState: 'completed',
        openVerifiedAdditions: 0,
        stories,
        handles: ['NBA'],
      },
    ],
    async () => true,
    async (_id, request) => {
      requests.push(request.reactionStory!.title);
      return { state: 'completed' };
    },
  );
  assert.deepEqual(requests, ['NBA team wins championship']);
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
