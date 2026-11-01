import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { newsQuerySchema, newsQueryFeed } from '@digest/contracts';
import { parseFeed } from '../src/modules/ingestion/adapters/feed.adapter';
test('news query is bounded, strict and encoded without overriding the fixed Google edition', () => {
  for (const query of ['', ' ', 'x'.repeat(101), 'AI\nnews', 'AI\u0000'])
    assert.equal(newsQuerySchema.safeParse({ query }).success, false);
  assert.equal(
    newsQuerySchema.safeParse({ query: 'AI', url: 'https://other.example' })
      .success,
    false,
  );
  const input = {
    query: '  "AI agents" OR site:example.com &gl=GB#fragment  ',
  };
  const feed = newsQueryFeed(input);
  const url = new URL(feed.url);
  assert.equal(url.origin, 'https://news.google.com');
  assert.equal(url.pathname, '/rss/search');
  assert.equal(url.searchParams.get('q'), input.query.trim());
  assert.equal(url.searchParams.get('gl'), 'US');
  assert.equal(url.searchParams.get('hl'), 'en-US');
  assert.equal(url.searchParams.get('ceid'), 'US:en');
  assert.equal(url.hash, '');
  assert.equal(feed.name, `Google News: ${input.query.trim()}`);
});
test('recorded Google News RSS preserves real article titles, dates and Google links', () => {
  const items = parseFeed(
    readFileSync('apps/api/test/fixtures/google-news.xml', 'utf8'),
  );
  assert.equal(items.length, 2);
  for (const item of items) {
    assert.equal(new URL(item.url).hostname, 'news.google.com');
    assert.ok(item.title.length > 20);
    assert.ok(Number.isFinite(Date.parse(item.publishedAt)));
    assert.ok(!item.excerpt.includes('<a'));
  }
});
