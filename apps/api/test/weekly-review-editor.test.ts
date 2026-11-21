import assert from 'node:assert/strict';
import { test } from 'node:test';

import {
  validateWeeklyReview,
  weeklyEditorEvidence,
} from '../src/modules/digests/application/weekly-review-editor';
import type { weeklyReviewInput } from '../src/modules/digests/domain/weekly-review-input';

type Input = ReturnType<typeof weeklyReviewInput>;
const story = {
  id: 'recurring-id',
  title: 'Daily headline',
  url: 'https://example.com/story',
  summary: 'Saved summary',
  excerpt: 'Saved excerpt',
  sources: ['Publisher'],
  publishedAt: '2026-11-21T15:00:00Z',
  score: 9,
  reasons: ['Private score'],
};
const input: Input = {
  windowStart: '2026-11-15T17:00:00Z',
  windowEnd: '2026-11-22T17:00:00Z',
  editions: [21, 22].map((day) => ({
    editionId: `daily-${day}`,
    publishedAt: `2026-11-${day}T15:00:00Z`,
    windowEnd: `2026-11-${day}T15:00:00Z`,
    stories: [structuredClone(story)],
    posts: [
      {
        platform: 'x',
        externalId: 'post',
        author: 'Reporter',
        authorUrl: 'https://x.com/reporter',
        url: 'https://x.com/reporter/status/1',
        text: 'Saved post',
        publishedAt: story.publishedAt,
        metrics: {},
        reasons: [],
      },
    ],
  })),
};
const pick = (references = ['d0:s0', 'd1:s0', 'd1:p0']) => ({
  title: 'The week’s development',
  summary: 'The story moved from A to B.',
  references,
});

void test('weekly editor preserves cross-day provenance and excludes private ranking metadata', () => {
  const before = structuredClone(input);
  const evidence = weeklyEditorEvidence(input);
  assert.equal(evidence.length, 4);
  assert.equal('score' in evidence[0], false);
  assert.equal('reasons' in evidence[0], false);
  const result = validateWeeklyReview(input, { stories: [pick()] });
  assert.ok(result);
  assert.deepEqual(
    result.stories[0].coverage.map((x) => x.editionId),
    ['daily-21', 'daily-22', 'daily-22'],
  );
  result.stories[0].coverage[0].text = 'Changed';
  assert.deepEqual(input, before);
});

void test('weekly editor rejects invented, duplicate, reused and post-only coverage atomically', () => {
  for (const stories of [
    [pick(['unknown'])],
    [pick(['d0:s0', 'd0:s0'])],
    [pick(['d0:s0']), pick(['d0:s0'])],
    [pick(['d0:p0'])],
    [pick(['d0:s0']), pick(['invented'])],
  ])
    assert.equal(validateWeeklyReview(input, { stories }), null);
});

void test('weekly editor enforces five stories, nonblank prose and strict output shape', () => {
  for (const response of [
    { stories: Array.from({ length: 6 }, () => pick()) },
    { stories: [{ ...pick(), title: ' ' }] },
    { stories: [{ ...pick(), summary: '' }] },
    { stories: [{ ...pick(), url: 'https://invented.com' }] },
    { stories: [pick()], extra: true },
  ])
    assert.equal(validateWeeklyReview(input, response), null);
  assert.deepEqual(validateWeeklyReview(input, { stories: [] })?.stories, []);
});
