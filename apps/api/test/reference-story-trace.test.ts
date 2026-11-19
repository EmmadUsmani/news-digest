import assert from 'node:assert/strict';
import { test } from 'node:test';

import { traceReferenceStories } from '../scripts/trace-reference-stories';

const id = '00000000-0000-4000-8000-000000000001';
const date = '2026-11-18T14:00:00Z';
const reference = (url: string) => ({
  title: 'Saved reference',
  excerpt: 'Original reporting — preserved for review.',
  url,
  publishedAt: date,
});
const edition = {
  id,
  createdAt: date,
  windowStart: '2026-11-17T15:00:00Z',
  windowEnd: '2026-11-18T15:00:00Z',
  topics: [
    {
      id,
      name: 'Gaming',
      brief: [],
      posts: [],
      stories: [
        {
          id,
          title: 'Selected event',
          url: 'https://example.com/lead',
          publishedAt: date,
          sources: ['Publisher'],
          summary: 'Saved prose',
          coverage: [
            {
              id,
              title: 'Same event',
              url: 'https://example.com/coverage?a=1&b=2',
              sources: ['Other'],
              publishedAt: date,
            },
          ],
        },
      ],
    },
  ],
};
const capture = {
  schemaVersion: 1,
  start: edition.windowStart,
  end: edition.windowEnd,
  capturedAt: date,
  windowEnded: false,
  feeds: [
    {
      topic: 'Gaming',
      name: 'Reference',
      observedAt: date,
      stories: [
        reference('https://example.com/lead?utm_source=feed#top'),
        reference('https://example.com/coverage?b=2&a=1'),
        reference('https://example.com/other'),
      ],
    },
  ],
};

void test('reference trace uses saved coverage and canonical URLs without declaring other URLs misses', () => {
  const before = JSON.stringify({ capture, edition });
  const report = traceReferenceStories(capture, edition);
  assert.equal(report.windowEnded, false);
  assert.equal(
    traceReferenceStories({ ...capture, windowEnded: undefined }, edition)
      .windowEnded,
    false,
  );
  const stories = report.feeds[0].stories!;
  assert.equal(
    stories[2].excerpt,
    'Original reporting — preserved for review.',
  );
  assert.deepEqual(
    stories.map((story) => story.status),
    ['selected-cluster-url', 'selected-cluster-url', 'needs-event-review'],
  );
  assert.deepEqual(stories[1].selectedClusters, [
    { id, title: 'Selected event' },
  ]);
  assert.equal(JSON.stringify({ capture, edition }), before);
  const otherTopic = traceReferenceStories(
    { ...capture, feeds: [{ ...capture.feeds[0], topic: 'NBA' }] },
    edition,
  );
  assert.equal(otherTopic.feeds[0].topicAvailable, false);
  assert.ok(
    otherTopic.feeds[0].stories.every(
      (story) => story.status === 'needs-event-review',
    ),
  );
  const failed = traceReferenceStories(
    {
      ...capture,
      feeds: [
        {
          topic: 'Gaming',
          name: 'Failed',
          observedAt: date,
          error: 'HTTP 503',
        },
      ],
    },
    edition,
  );
  assert.equal(failed.feeds[0].error, 'HTTP 503');
  assert.equal(failed.feeds[0].stories, undefined);
});

void test('reference trace refuses mismatched windows, out-of-window entries and ambiguous topics', () => {
  assert.throws(
    () => traceReferenceStories({ ...capture, start: date }, edition),
    /windows/,
  );
  assert.throws(
    () =>
      traceReferenceStories(
        {
          ...capture,
          feeds: [
            {
              ...capture.feeds[0],
              stories: [
                {
                  ...reference('https://example.com/lead'),
                  publishedAt: edition.windowEnd,
                },
              ],
            },
          ],
        },
        edition,
      ),
    /outside/,
  );
  assert.throws(
    () =>
      traceReferenceStories(capture, {
        ...edition,
        topics: [...edition.topics, ...edition.topics],
      }),
    /Ambiguous/,
  );
  assert.throws(
    () =>
      traceReferenceStories(
        {
          ...capture,
          feeds: [
            {
              ...capture.feeds[0],
              stories: [reference('https://user:password@example.com/lead')],
            },
          ],
        },
        edition,
      ),
    /Invalid reference URL/,
  );
});
