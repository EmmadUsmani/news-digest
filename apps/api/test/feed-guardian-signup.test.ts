import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { test } from 'node:test';

import { parseFeed } from '../src/modules/ingestion/adapters/feed.adapter';

void test('recorded Guardian live report omits exact newsletter signup while retaining reporting', async () => {
  const xml = await readFile(
    'apps/api/test/fixtures/guardian-ground-stop-2026-11-14.xml',
    'utf8',
  );
  const [item] = parseFeed(xml);
  assert.doesNotMatch(item.excerpt, /Sign up for the Breaking News/);
  assert.match(item.excerpt, /US aviation agency lifts nationwide ground stop/);
  assert.match(
    item.excerpt,
    /More than 6,600 flights were cancelled and 8,600 delayed/,
  );
  assert.match(
    item.excerpt,
    /US airlines including American, United and Southwest/,
  );
  assert.ok(item.excerpt.endsWith('…'));
  assert.ok(item.excerpt.length <= 1500);
  assert.ok(item.imageUrl);
  const withoutPromo = xml.replace(
    /&lt;li&gt;&lt;p&gt;&lt;a href="https:\/\/www\.theguardian\.com\/news\/2026\/feb\/17\/[\s\S]*?&lt;\/li&gt;/,
    '',
  );
  assert.notEqual(withoutPromo, xml);
  assert.deepEqual(item, parseFeed(withoutPromo)[0]);
  for (const changed of [
    xml.replaceAll('www.theguardian.com', 'example.com'),
    xml.replace('/news/2026/feb/17/sign-up-', '/news/2026/feb/18/sign-up-'),
    xml.replace(
      'https://www.theguardian.com/news/',
      'https://example.com/news/',
    ),
    xml.replace(
      'Sign up for the Breaking News US email',
      'Sign up for the Breaking News US reporting',
    ),
    xml.replace(
      'Sign up for the Breaking News US email',
      'Sign up for the Breaking News US email. Additional reporting.',
    ),
  ]) {
    assert.match(
      parseFeed(changed)[0].excerpt,
      /Sign up for the Breaking News US/,
    );
    assert.match(
      parseFeed(changed)[0].excerpt,
      /More than 6,600 flights were cancelled/,
    );
  }
});
