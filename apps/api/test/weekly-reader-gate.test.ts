import assert from 'node:assert/strict';
import { test } from 'node:test';

import type { ReaderWeeklyEdition } from '@digest/contracts';

import { verifyWeeklyCoverage } from '../../../scripts/lib/weekly-reader-gate';

function example(): ReaderWeeklyEdition {
  return {
    id: 'weekly',
    kind: 'weekly',
    windowStart: '2026-11-15T17:00:00Z',
    windowEnd: '2026-11-22T17:00:00Z',
    topics: [
      {
        id: 'tech',
        name: 'Tech',
        stories: [
          {
            title: 'Synthetic event',
            summary: 'Synthetic weekly summary.',
            coverage: [
              {
                kind: 'story',
                editionId: 'daily',
                itemId: 'story',
                publishedAt: '2026-11-22T15:05:00Z',
                title: 'Daily story',
                url: 'https://example.com/story',
              },
              {
                kind: 'post',
                editionId: 'daily',
                itemId: 'post',
                publishedAt: '2026-11-22T15:05:00Z',
                title: 'Daily post',
                url: 'https://example.com/post',
              },
            ],
          },
        ],
      },
      { id: 'quiet', name: 'Quiet', stories: [] },
    ],
  };
}
function daily() {
  return {
    id: 'daily',
    windowEnd: '2026-11-22T15:00:00Z',
    topics: [
      {
        id: 'tech',
        stories: [{ id: 'story' }],
        posts: [{ externalId: 'post' }],
      },
    ],
  };
}

void test('weekly acceptance checks story/post membership and reads each immutable daily once', async () => {
  let calls = 0;
  assert.deepEqual(
    await verifyWeeklyCoverage(example(), async () => {
      calls++;
      return daily();
    }),
    { topics: 2, stories: 1, coverageLinks: 2, dailyEditions: 1 },
  );
  assert.equal(calls, 1);
});

void test('weekly acceptance refuses broken links, wrong topics and out-of-window daily coverage', async () => {
  for (const mutate of [
    (value: ReturnType<typeof daily>) => {
      value.topics[0].stories = [];
    },
    (value: ReturnType<typeof daily>) => {
      value.topics[0].posts = [];
    },
    (value: ReturnType<typeof daily>) => {
      value.topics[0].id = 'other';
    },
    (value: ReturnType<typeof daily>) => {
      value.id = 'other';
    },
    (value: ReturnType<typeof daily>) => {
      value.windowEnd = '2026-11-15T17:00:00Z';
    },
    (value: ReturnType<typeof daily>) => {
      value.windowEnd = '2026-11-23T15:00:00Z';
    },
  ]) {
    const saved = daily();
    mutate(saved);
    await assert.rejects(verifyWeeklyCoverage(example(), async () => saved));
  }
});

void test('weekly acceptance refuses post-only, reused coverage, empty summaries and wrong cutoff', async () => {
  for (const mutate of [
    (value: ReaderWeeklyEdition) => {
      value.topics[0].stories[0].coverage.shift();
    },
    (value: ReaderWeeklyEdition) => {
      value.topics[0].stories.push(structuredClone(value.topics[0].stories[0]));
    },
    (value: ReaderWeeklyEdition) => {
      value.topics[0].stories[0].summary = ' ';
    },
    (value: ReaderWeeklyEdition) => {
      value.windowEnd = '2026-11-23T17:00:00Z';
    },
    (value: ReaderWeeklyEdition) => {
      value.windowStart = '2026-11-16T17:00:00Z';
    },
  ]) {
    const weekly = example();
    mutate(weekly);
    await assert.rejects(verifyWeeklyCoverage(weekly, async () => daily()));
  }
});
