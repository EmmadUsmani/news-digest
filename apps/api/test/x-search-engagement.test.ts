import assert from 'node:assert/strict';
import { test } from 'node:test';

import { HistoricalXSearch as DirectXSearch } from '../src/modules/social/adapters/historical-x-search';
import { readReportedEngagement } from '../src/modules/social/adapters/x-search-engagement';

const id = '2117000000000000001';
const url = `https://x.com/small_builder/status/${id}`;
const links = [{ externalId: id, url }];
const now = new Date('2026-11-02T12:00:00Z');
const read = (entries: unknown) =>
  readReportedEngagement([JSON.stringify(entries)], links, now);

void test('reported X counts preserve provenance, zero and missing values without claiming verification', () => {
  assert.deepEqual(
    read([
      { url, likes: 4200, reposts: 0, published_at: '2026-11-02T10:00:00Z' },
    ]),
    [
      {
        externalId: id,
        reported_by: 'xai_search',
        observedAt: now.toISOString(),
        publishedAt: '2026-11-02T10:00:00Z',
        likes: 4200,
        reposts: 0,
      },
    ],
  );
  assert.deepEqual(read([{ url }]), []);
  assert.deepEqual(read([{ url, replies: 7 }])[0], {
    externalId: id,
    reported_by: 'xai_search',
    observedAt: now.toISOString(),
    replies: 7,
  });
});

void test('uncited, ambiguous, invalid and future reports cannot supply ranking observations', () => {
  for (const entry of [
    { url: 'https://x.com/other/status/2117000000000000099', likes: 999999 },
    { url: 'https://x.com.evil.test/small_builder/status/' + id, likes: 1 },
    { url, likes: -1 },
    { url, likes: 1.5 },
    { url, likes: '1000' },
    { url, likes: Number.MAX_SAFE_INTEGER + 1 },
    { url, likes: 1, published_at: '2026-11-03T00:00:00Z' },
    { url, likes: 1, published_at: 'yesterday' },
  ])
    assert.deepEqual(read([entry]), []);
  assert.deepEqual(
    read([
      { url, likes: 1 },
      { url, likes: 100 },
    ]),
    [],
  );
  assert.deepEqual(
    read(Array.from({ length: 6 }, () => ({ url, likes: 1 }))),
    [],
  );
  assert.deepEqual(readReportedEngagement(['not JSON'], links, now), []);
});

void test('adapter matches reported metrics only to cited candidates and keeps billed usage on malformed reports', async () => {
  const search = async (text: string, status = 'completed') =>
    new DirectXSearch(
      'offline-fixture',
      async () =>
        new Response(
          JSON.stringify({
            status,
            usage: {
              input_tokens: 10,
              output_tokens: 20,
              server_side_tool_usage_details: {
                x_posts_fetched: 5,
                x_users_fetched: 0,
              },
            },
            output: [
              {
                type: 'message',
                role: 'assistant',
                content: [
                  {
                    type: 'output_text',
                    text,
                    annotations: [{ type: 'url_citation', url }],
                  },
                ],
              },
            ],
          }),
        ),
    ).search({
      topic: 'AI',
      guidance: 'Demos',
      fromDate: '2026-11-01',
      toDate: '2026-11-02',
    });
  const text = JSON.stringify([
    { url, likes: 400 },
    { url: 'https://x.com/fake/status/2117000000000000099', likes: 999999 },
  ]);
  const result = await search(text);
  assert.equal(result.links.length, 1);
  assert.equal(result.reportedEngagement?.length, 1);
  assert.equal(result.reportedEngagement?.[0].likes, 400);
  assert.equal(result.reportedEngagement?.[0].reported_by, 'xai_search');
  assert.ok(
    Number.isFinite(Date.parse(result.reportedEngagement[0].observedAt)),
  );
  for (const [body, status] of [
    ['broken JSON', 'completed'],
    [text, 'incomplete'],
  ]) {
    const malformed = await search(body, status);
    assert.deepEqual(malformed.reportedEngagement, []);
    assert.equal(malformed.usage.postsFetched, 5);
  }
});
