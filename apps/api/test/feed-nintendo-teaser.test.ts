import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { test } from 'node:test';

import { parseFeed } from '../src/modules/ingestion/adapters/feed.adapter';

void test('recorded Nintendo Life teasers preserve reporting and mark omitted continuation', async () => {
  const xml = await readFile(
    'apps/api/test/fixtures/nintendo-life.xml',
    'utf8',
  );
  const items = parseFeed(xml);
  assert.equal(items.length, 2);
  for (const item of items) {
    assert.ok(item.excerpt.endsWith('…'));
    assert.doesNotMatch(item.excerpt, /Read the full article/);
    assert.ok(item.excerpt.length <= 1500);
  }
  assert.match(items[0].excerpt, /Switch 2 in 2027/);
  assert.match(items[0].excerpt, /other platforms on 4th December 2026/);
  assert.match(items[1].excerpt, /12th November 2026/);
  const withoutFooter = parseFeed(
    xml.replace(
      /&lt;p&gt;Read the &lt;a[^>]*?full article on nintendolife\.com&lt;\/a&gt;&lt;\/p&gt;/g,
      '',
    ),
  );
  assert.deepEqual(
    items,
    withoutFooter.map((item) => ({ ...item, excerpt: item.excerpt + '…' })),
  );
  for (const changed of [
    xml.replaceAll('www.nintendolife.com', 'example.com'),
    xml.replaceAll(
      'full article on nintendolife.com',
      'full review on nintendolife.com',
    ),
    xml.replaceAll(
      'full article on nintendolife.com',
      'full article on pushsquare.com',
    ),
    xml.replaceAll(
      'full article on nintendolife.com&lt;/a&gt;&lt;/p&gt;',
      'full article on nintendolife.com&lt;/a&gt;&lt;/p&gt;&lt;p&gt;More reporting.&lt;/p&gt;',
    ),
    xml.replaceAll(
      'Read the &lt;a href="https://www.nintendolife.com/news/',
      'Read the &lt;a href="https://www.nintendolife.com/other/',
    ),
  ])
    assert.match(
      parseFeed(changed)[0].excerpt,
      /Read the full (?:article|review)/,
    );
});
