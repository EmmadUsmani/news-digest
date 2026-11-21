import assert from 'node:assert/strict';
import { test } from 'node:test';

import {
  weeklyReviewInput,
  type WeeklySourceEdition,
} from '../src/modules/digests/domain/weekly-review-input';

const target = {
  profileId: null,
  topicId: 'tech',
  scheduledAt: '2026-11-22T17:00:00Z',
};
function edition(day: number): WeeklySourceEdition {
  const end = `2026-11-${day}T15:00:00Z`;
  return {
    profileId: null,
    kind: 'daily',
    publishedAt: end,
    snapshot: {
      id: `daily-${day}`,
      createdAt: end,
      windowStart: `2026-11-${day - 1}T15:00:00Z`,
      windowEnd: end,
      method: 'editorial-v1',
      topics: [
        {
          id: 'tech',
          name: 'Tech',
          candidateCount: 200,
          stories: [
            {
              id: 'story',
              title: 'Selected story',
              url: 'https://example.com/story',
              excerpt: 'Saved evidence',
              summary: 'Saved summary',
              sources: ['Source'],
              publishedAt: end,
              score: 8,
              reasons: ['Editor: important'],
            },
          ],
          posts: [
            {
              platform: 'x',
              externalId: 'post',
              text: 'Selected post',
              url: 'https://x.com/author/status/1',
              author: 'Author',
              authorUrl: 'https://x.com/author',
              publishedAt: end,
              metrics: {},
              reasons: [],
            },
          ],
        },
      ],
    },
  };
}

void test('weekly pool covers seven elapsed days, includes Sunday daily and preserves selections', () => {
  const rows = [22, 14, 19, 16, 15, 21, 18, 17, 20].map(edition);
  const before = structuredClone(rows);
  const result = weeklyReviewInput(rows, target);
  assert.equal(result.windowStart, '2026-11-15T17:00:00.000Z');
  assert.deepEqual(
    result.editions.map((x) => x.editionId),
    [16, 17, 18, 19, 20, 21, 22].map((x) => `daily-${x}`),
  );
  assert.deepEqual(
    result.editions[6].stories,
    rows[0].snapshot.topics[0].stories,
  );
  assert.deepEqual(result.editions[6].posts, rows[0].snapshot.topics[0].posts);
  assert.equal('candidateCount' in result.editions[0], false);
  result.editions[6].stories[0].sources.push('mutated');
  result.editions[6].posts[0].reasons.push('mutated');
  assert.deepEqual(rows, before);
});

void test('weekly pool excludes private, other-profile, future, weekly and test editions', () => {
  const variants = Array.from({ length: 8 }, () => edition(22));
  variants[0].publishedAt = null;
  variants[1].profileId = 'other';
  variants[2].publishedAt = '2026-11-22T17:00:01Z';
  variants[3].kind = 'weekly';
  variants[4].kind = 'test';
  variants[5].snapshot.windowEnd = '2026-11-22T18:00:00Z';
  variants[6].publishedAt = 'invalid';
  variants[7].snapshot.windowStart = 'invalid';
  assert.deepEqual(weeklyReviewInput(variants, target).editions, []);
  assert.deepEqual(
    weeklyReviewInput([edition(22)], { ...target, topicId: 'nba' }).editions,
    [],
  );
});

void test('latest published regeneration supersedes the same window without reviving removed topics', () => {
  const original = edition(22);
  const revised = structuredClone(original);
  revised.snapshot.id = 'revised';
  revised.publishedAt = '2026-11-22T16:00:00Z';
  revised.snapshot.topics[0].stories[0].summary = 'Revised summary';
  for (const rows of [
    [original, revised],
    [revised, original],
  ]) {
    const result = weeklyReviewInput(rows, target);
    assert.equal(result.editions.length, 1);
    assert.equal(result.editions[0].editionId, 'revised');
    assert.equal(result.editions[0].stories[0].summary, 'Revised summary');
  }
  revised.snapshot.topics = [];
  assert.deepEqual(weeklyReviewInput([original, revised], target).editions, []);
});

void test('UTC Sunday slot is stable across timezone spellings; invalid slots fail', () => {
  assert.deepEqual(
    weeklyReviewInput([], {
      ...target,
      scheduledAt: '2026-11-22T12:00:00-05:00',
    }),
    weeklyReviewInput([], target),
  );
  for (const scheduledAt of [
    'bad',
    '2026-11-21T17:00:00Z',
    '2026-11-22T15:00:00Z',
    '2026-11-22T17:00:01Z',
  ]) {
    assert.throws(
      () => weeklyReviewInput([], { ...target, scheduledAt }),
      /Sunday 17:00 UTC/,
    );
  }
  const boundary = edition(15);
  boundary.snapshot.windowEnd = '2026-11-15T17:00:00Z';
  assert.equal(weeklyReviewInput([boundary], target).editions.length, 0);
});
