import assert from 'node:assert/strict';
import { test } from 'node:test';

import {
  developingHistory,
  type PublishedStoryEdition,
} from '../src/modules/digests/domain/developing-history';

const edition = (
  day: number,
  overrides: Partial<PublishedStoryEdition> = {},
): PublishedStoryEdition => ({
  id: `edition-${day}`,
  profileId: null,
  publishedAt: `2026-11-${String(day).padStart(2, '0')}T15:00:00Z`,
  topics: [
    {
      id: 'tech',
      stories: [
        {
          id: `story-${day}`,
          title: `Title ${day}`,
          summary: `Summary ${day}`,
        },
      ],
    },
  ],
  ...overrides,
});
const target = {
  id: 'edition-19',
  profileId: null,
  publishedAt: '2026-11-19T15:00:00Z',
  topicId: 'tech',
};

void test('history is the last seven published topic editions, independent of input order and gaps', () => {
  const rows = [1, 2, 5, 8, 10, 13, 15, 16, 18].map((day) => edition(day));
  const before = structuredClone(rows);
  const result = developingHistory(rows, target);
  assert.deepEqual(
    result.map((row) => row.editionId),
    [18, 16, 15, 13, 10, 8, 5].map((day) => `edition-${day}`),
  );
  assert.equal(result[0].stories[0].summary, 'Summary 18');
  assert.deepEqual(rows, before);
  result[0].stories[0].title = 'mutated';
  assert.deepEqual(rows, before);
});
void test('history excludes other profiles, other topics, future/equal timestamps and the target itself', () => {
  const rows = [
    edition(18),
    edition(17, { profileId: 'private' }),
    edition(16, { topics: [{ id: 'nba', stories: [] }] }),
    edition(20),
    edition(19),
    edition(15, { id: target.id }),
    edition(14, { publishedAt: 'invalid' }),
  ];
  assert.deepEqual(
    developingHistory(rows, target).map((row) => row.editionId),
    ['edition-18'],
  );
  assert.equal(
    developingHistory(rows, { ...target, profileId: 'private' })[0].editionId,
    'edition-17',
  );
});
void test('empty topic editions count toward seven; missing summaries stay absent evidence', () => {
  const rows = Array.from({ length: 8 }, (_, index) =>
    edition(18 - index, { topics: [{ id: 'tech', stories: [] }] }),
  );
  rows[0].topics[0].stories = [{ id: 'a', title: 'Title' }];
  assert.equal(developingHistory(rows, target).length, 7);
  assert.equal(developingHistory(rows, target)[0].stories[0].summary, null);
  assert.throws(() =>
    developingHistory(rows, { ...target, publishedAt: 'invalid' }),
  );
});
