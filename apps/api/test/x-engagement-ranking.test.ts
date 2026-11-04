import assert from 'node:assert/strict';
import { test } from 'node:test';

import { xEngagementSignal } from '../src/modules/social/domain/x-engagement-ranking';
import type { XReportedEngagement } from '../src/modules/social/domain/x-search.port';
import { selectTopicPosts } from '../src/modules/social/public/selection';

const end = new Date('2026-11-02T12:00:00Z');
const report: XReportedEngagement = {
  externalId: '123',
  reported_by: 'xai_search',
  observedAt: end.toISOString(),
  likes: 1000,
};
void test('reported engagement is bounded, rewards age-adjusted rate and preserves unknowns', () => {
  const score = (hours: number, value = report) =>
    xEngagementSignal(
      value,
      '123',
      new Date(end.getTime() - hours * 3600000),
      end,
    );
  assert.ok(score(1).bonus > score(12).bonus);
  assert.ok(score(1, { ...report, likes: Number.MAX_SAFE_INTEGER }).bonus <= 2);
  assert.equal(score(1, { ...report, likes: 0 }).bonus, 0);
  assert.match(
    score(1, { ...report, likes: 0 }).reason,
    /likes 0, reposts unknown/,
  );
  for (const bad of [
    { ...report, likes: undefined },
    { ...report, likes: -1 },
    { ...report, likes: NaN },
    { ...report, likes: 1.5 },
    { ...report, externalId: 'other' },
    { ...report, observedAt: 'invalid' },
    { ...report, observedAt: '2026-11-02T13:00:00Z' },
    { ...report, observedAt: '2026-11-01T00:00:00Z' },
  ])
    assert.equal(score(1, bad).bonus, 0);
  assert.match(score(1).reason, /Unverified.*not measured growth/);
});

void test('verified shortlist applies engagement before budget and duplicate checks but cannot override topic/safety gates', async () => {
  const rows = [
    { externalId: 'new', text: 'AI demo', likes: undefined, hour: 11 },
    { externalId: '123', text: 'AI demo', likes: 1000, hour: 10 },
    {
      externalId: 'spam',
      text: 'AI crypto giveaway',
      likes: 1000000,
      hour: 10,
    },
    {
      externalId: 'unrelated',
      text: 'Unrelated sports',
      likes: 1000000,
      hour: 10,
    },
  ].map(({ externalId, text, likes, hour }) => ({
    externalId,
    url: `https://x.com/i/status/${externalId}`,
    author: 'Fixture',
    authorUrl: 'https://x.com/fixture',
    publishedAt: new Date(`2026-11-02T${hour}:00:00Z`),
    embedHtml: `<p>${text}</p>`,
    metrics: {},
    reportedEngagement:
      likes === undefined ? null : { ...report, externalId, likes },
  }));
  const db = {
    query: async () => ({
      rows: rows.map((row) => [
        row.externalId,
        row.url,
        row.author,
        row.authorUrl,
        row.publishedAt.toISOString(),
        row.embedHtml,
        row.metrics,
        row.reportedEngagement,
      ]),
    }),
  } as unknown as Parameters<typeof selectTopicPosts>[0];
  const posts = await selectTopicPosts(
    db,
    'topic',
    { includeAny: ['AI'], excludeAny: [] },
    new Date('2026-11-02T00:00:00Z'),
    end,
    1,
  );
  assert.deepEqual(
    posts.map((p) => p.externalId),
    ['123'],
  );
  assert.deepEqual(posts[0].metrics, {});
  assert.ok(posts[0].reasons.some((r) => r.includes('Unverified xai_search')));
});
