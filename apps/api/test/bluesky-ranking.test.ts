import assert from 'node:assert/strict';
import { test } from 'node:test';

import type { BlueskyPost } from '../src/modules/social/domain/bluesky';
import { rankBlueskyPosts } from '../src/modules/social/domain/bluesky-ranking';

const start = new Date('2026-11-02T12:00:00Z');
const end = new Date('2026-11-03T12:00:00Z');
const policy = { includeAny: ['AI'], excludeAny: ['sponsored'] };
const post = (
  externalId: string,
  changes: Partial<BlueskyPost> = {},
): BlueskyPost => ({
  platform: 'bluesky',
  externalId,
  url: `https://bsky.app/profile/example.bsky.social/post/${externalId}`,
  author: 'example.bsky.social',
  text: 'AI model demo',
  publishedAt: '2026-11-03T11:00:00Z',
  observedAt: end.toISOString(),
  metrics: { likes: 100, reposts: 10, replies: 5 },
  ...changes,
});
const rank = (posts: BlueskyPost[], budget = 5) =>
  rankBlueskyPosts(posts, policy, start, end, budget);

void test('Bluesky ranking rewards engagement and age-adjusted rate after relevance and safety gates', () => {
  const old = post('old', { publishedAt: start.toISOString() });
  const fresh = post('fresh');
  const popular = post('popular', {
    metrics: { likes: 1000, reposts: 100, replies: 50 },
  });
  const excluded = [
    'football match',
    'AI crypto giveaway',
    'AI sponsored demo',
    '',
  ];
  assert.deepEqual(
    rank([
      old,
      fresh,
      popular,
      ...excluded.map((text, i) =>
        post(`bad${i}`, {
          text,
          metrics: { likes: 1000000, reposts: 1000000, replies: 1000000 },
        }),
      ),
    ]).map((r) => r.post.externalId),
    ['popular', 'fresh', 'old'],
  );
  assert.deepEqual(
    rank([old, fresh, popular], 1).map((r) => r.post.externalId),
    ['popular'],
  );
  assert.match(
    rank([fresh])[0].reasons.join(' '),
    /Official Bluesky API.*not measured growth/,
  );
  assert.equal(
    rankBlueskyPosts([fresh], { ...policy, includeAny: [] }, start, end, 5)
      .length,
    0,
  );
});

void test('Bluesky ranking rejects invalid counts, observation times and half-open window violations', () => {
  for (const count of [-1, NaN, Infinity, 1.5, Number.MAX_SAFE_INTEGER + 1]) {
    for (const key of ['likes', 'reposts', 'replies'] as const)
      assert.equal(
        rank([
          post('bad', {
            metrics: { likes: 100, reposts: 10, replies: 5, [key]: count },
          }),
        ]).length,
        0,
      );
  }
  for (const observedAt of [
    'invalid',
    '2026-11-03T10:00:00Z',
    '2026-11-03T12:00:01Z',
  ])
    assert.equal(rank([post('bad', { observedAt })]).length, 0);
  for (const publishedAt of [
    'invalid',
    '2026-11-02T11:59:59Z',
    end.toISOString(),
  ])
    assert.equal(rank([post('bad', { publishedAt })]).length, 0);
  assert.equal(
    rank([post('zero', { metrics: { likes: 0, reposts: 0, replies: 0 } })])
      .length,
    0,
  );
  assert.equal(
    rank([post('start', { publishedAt: start.toISOString() })]).length,
    1,
  );
  for (const budget of [0, -1, 1.5, NaN])
    assert.equal(rank([post('x')], budget).length, 0);
  assert.throws(() => rankBlueskyPosts([], policy, end, start, 1), /Invalid/);
});

void test('Bluesky ranking selects latest valid snapshot before cutoff without lookahead or duplicate slots', () => {
  const earlier = post('same', { observedAt: '2026-11-03T11:30:00Z' });
  const latest = post('same', {
    metrics: { likes: 10, reposts: 0, replies: 0 },
  });
  const future = post('same', { observedAt: '2026-11-03T13:00:00Z' });
  const invalid = post('same', {
    metrics: { likes: -1, reposts: 0, replies: 0 },
  });
  const rows = [earlier, latest, future, invalid, post('tie-b'), post('tie-a')];
  const result = rank(rows);
  assert.deepEqual(rank([...rows].reverse()), result);
  assert.deepEqual(
    result.map((r) => r.post.externalId),
    ['tie-a', 'tie-b', 'same'],
  );
  assert.equal(result[2].post.metrics.likes, 10);
  assert.equal(rows[0], earlier);
});
