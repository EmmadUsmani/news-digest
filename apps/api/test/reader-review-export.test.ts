import assert from 'node:assert/strict';
import { test } from 'node:test';

import { exportReaderReview } from '../scripts/export-reader-review';

// Synthetic saved content; no provider, database or network access.
const id = '00000000-0000-4000-8000-000000000001';
const saved = {
  id,
  createdAt: '2026-11-05T15:00:00Z',
  windowStart: '2026-11-04T15:00:00Z',
  windowEnd: '2026-11-05T15:00:00Z',
  topics: [
    {
      id,
      name: 'Gaming',
      brief: ['A supported development'],
      stories: [
        {
          id,
          title: 'A release',
          url: 'https://example.com/story',
          publishedAt: '2026-11-05T14:00:00Z',
          sources: ['Publisher'],
          summary: 'The release includes a playable demo.',
          score: 99,
          reasons: ['private-selection-reason'],
        },
      ],
      posts: [
        {
          platform: 'x',
          externalId: '123',
          author: 'Author',
          authorUrl: 'https://x.com/author',
          url: 'https://x.com/author/status/123',
          publishedAt: '2026-11-05T14:00:00Z',
          text: '発表\nOriginal full text',
          displayText: 'Saved display version',
          whyItMatters: 'English explanation.',
          metrics: {},
          reasons: ['private-post-reason'],
        },
      ],
    },
  ],
};

void test('review export preserves saved reader text, ordering and identity without private fields', () => {
  const before = JSON.stringify(saved);
  const report = exportReaderReview(saved);
  for (const text of [
    id,
    saved.windowStart,
    saved.windowEnd,
    '1 stories; 1 posts',
    'A supported development',
    'The release includes a playable demo.',
    '発表\nOriginal full text',
    'Saved display version',
    'English explanation.',
    'https://example.com/story',
    'Saved engagement: {}',
  ])
    assert.ok(report.includes(text), text);
  assert.ok(report.indexOf('STORY 1') < report.indexOf('POST 1'));
  assert.doesNotMatch(report, /private-selection-reason|private-post-reason/);
  assert.equal(JSON.stringify(saved), before);
});

void test('review export represents empty saved sections and rejects non-reader input', () => {
  const report = exportReaderReview({
    ...saved,
    topics: [{ id, name: 'World', brief: [], stories: [], posts: [] }],
  });
  assert.match(report, /0 stories; 0 posts/);
  assert.match(report, /no stories saved/);
  assert.match(report, /no posts saved/);
  assert.throws(() => exportReaderReview({ topics: [] }));
});
