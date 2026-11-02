import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { test } from 'node:test';

import { extractXLinks } from '../src/modules/ingestion/public/discovery';
import { RedditListing } from '../src/modules/social/adapters/reddit-listing';

const fixture = () =>
  readFile('apps/api/test/fixtures/reddit/top.synthetic.json', 'utf8');
void test('synthetic Reddit listing preserves card metadata and X citation evidence', async () => {
  const urls: string[] = [];
  const adapter = new RedditListing({
    get: async (url) => {
      urls.push(url);
      return fixture();
    },
  });
  const [post] = await adapter.collect('nba');
  assert.deepEqual(urls, [
    'https://www.reddit.com/r/nba/top.json?t=day&limit=100',
  ]);
  assert.equal(post.platform, 'reddit');
  assert.equal(
    post.url,
    'https://www.reddit.com/r/nba/comments/abc123/synthetic_highlight/',
  );
  assert.equal(post.publishedAt, '2026-11-02T14:00:00.000Z');
  assert.deepEqual(post.metrics, {
    score: 1234,
    comments: 87,
    upvoteRatio: 0.97,
  });
  assert.equal(post.authorUrl, 'https://www.reddit.com/user/fixture_author/');
  assert.equal(post.thumbnail, 'https://preview.redd.it/fixture.jpg');
  assert.equal(
    extractXLinks(post.externalUrl!)[0].externalId,
    '2116948532477468673',
  );
});
void test('Reddit listing skips unsafe, removed, pinned, mismatched and malformed posts and dedupes IDs', async () => {
  const base = JSON.parse(await fixture()) as {
    data: { children: { kind: string; data: Record<string, unknown> }[] };
  };
  const item = base.data.children[0];
  const variants = [
    { over_18: true },
    { stickied: true },
    { removed_by_category: 'moderator' },
    { selftext: '[deleted]' },
    { author: '[deleted]' },
    { subreddit: 'Games' },
    { permalink: '//evil.example/r/nba/comments/abc123/' },
    { permalink: '/r/nba/comments/different/title/' },
    { created_utc: 'yesterday' },
    { upvote_ratio: 2 },
  ].map((patch) => ({ kind: 't3', data: { ...item.data, ...patch } }));
  base.data.children = [...variants, item, item];
  const adapter = new RedditListing({ get: async () => JSON.stringify(base) });
  assert.equal((await adapter.collect('nba')).length, 1);
  item.data.thumbnail = 'javascript:alert(1)';
  item.data.url = 'https://user:pass@example.com/';
  const [safe] = await adapter.collect('nba');
  assert.equal(safe.thumbnail, null);
  assert.equal(safe.externalUrl, null);
});
void test('Reddit access denial propagates once and invalid community input never fetches', async () => {
  let calls = 0;
  const adapter = new RedditListing({
    get: async () => {
      calls++;
      throw new Error('HTTP 403');
    },
  });
  await assert.rejects(
    adapter.collect('nba/../worldnews'),
    /Invalid Reddit community/,
  );
  assert.equal(calls, 0);
  await assert.rejects(adapter.collect('nba'), /HTTP 403/);
  assert.equal(calls, 1);
  for (const body of ['{}', '<html>blocked</html>']) {
    await assert.rejects(
      new RedditListing({ get: async () => body }).collect('nba'),
    );
  }
});
