import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';

import { newsQueryFeed, newsQuerySchema } from '@digest/contracts';

import { parseFeed } from '../src/modules/ingestion/adapters/feed.adapter';
void test('news query is bounded, strict and encoded without overriding the fixed Google edition', () => {
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
void test('recorded Google News RSS preserves real article titles, dates and Google links', () => {
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

void test('recorded RSS exposes structured publishers separately from Google discovery URLs', () => {
  const items = parseFeed(
    readFileSync('apps/api/test/fixtures/google-news.xml', 'utf8'),
  );
  assert.deepEqual(
    items.map((item) => item.publisher),
    [
      { name: 'Futurism', url: 'https://futurism.com/' },
      { name: "Tom's Hardware", url: 'https://www.tomshardware.com/' },
    ],
  );
  assert.ok(
    items.every((item) => new URL(item.url).hostname === 'news.google.com'),
  );
});
void test('RSS publisher evidence never comes from titles, authors or link hosts', () => {
  const entry = (source: string) =>
    `<rss><channel><item><title>Report - Reuters</title><link>https://news.google.com/report</link><pubDate>Sat, 31 Oct 2026 10:53:00 GMT</pubDate><author>CNBC</author>${source}</item></channel></rss>`;
  assert.equal(parseFeed(entry(''))[0].publisher, undefined);
  assert.equal(
    parseFeed(entry('<source url="https://reuters.com"/>'))[0].publisher,
    undefined,
  );
  for (const url of [
    'javascript:alert(1)',
    'https://user:secret@example.com',
    'invalid',
  ]) {
    assert.deepEqual(
      parseFeed(
        entry(`<source url="${url}">Reuters &amp; Partners</source>`),
      )[0].publisher,
      { name: 'Reuters & Partners', url: null },
    );
  }
  assert.deepEqual(parseFeed(entry('<source>Reuters</source>'))[0].publisher, {
    name: 'Reuters',
    url: null,
  });
});
void test('Atom origin feed metadata is not RSS publisher evidence', () => {
  const [item] = parseFeed(
    `<feed><entry><title>Report</title><link href="https://example.com/report"/><updated>2026-10-31T10:53:00Z</updated><source><title>Origin feed</title></source></entry></feed>`,
  );
  assert.equal(item.publisher, undefined);
});
