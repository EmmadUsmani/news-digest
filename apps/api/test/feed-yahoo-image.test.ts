import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { test } from 'node:test';

import { parseFeed } from '../src/modules/ingestion/adapters/feed.adapter';

void test('recorded Yahoo NBA bare lead photo survives without selecting later images', async () => {
  const xml = await readFile(
    'apps/api/test/fixtures/yahoo-nba-bare-image-2026-11-14.xml',
    'utf8',
  );
  const [item] = parseFeed(xml);
  assert.equal(
    item.imageUrl,
    'https://media.zenfs.com/en/ny_post_sports_articles_389/2914d66ec4c2ab077d601af5afb1a12d.jpg',
  );
  assert.match(item.excerpt, /Kendrick Perkins/);
  const withoutPhoto = xml.replace(/&lt;img.*?\/&gt;/, '');
  assert.notEqual(withoutPhoto, xml);
  assert.deepEqual({ ...item, imageUrl: null }, parseFeed(withoutPhoto)[0]);
  for (const changed of [
    xml.replaceAll('sports.yahoo.com', 'example.com'),
    xml.replaceAll('https://media.zenfs.com', 'http://media.zenfs.com'),
    xml.replaceAll('media.zenfs.com', 'example.com'),
    xml.replaceAll('/en/', '/other/'),
    xml.replaceAll(
      'https://media.zenfs.com',
      'https://user:password@media.zenfs.com',
    ),
    xml.replace(
      '&lt;img',
      '&lt;p&gt;Reporting before a later photo.&lt;/p&gt;&lt;img',
    ),
  ])
    assert.equal(parseFeed(changed)[0].imageUrl, null);
  assert.equal(
    parseFeed(
      xml.replace(
        '<item>',
        '<item><media:thumbnail url="https://example.com/preferred.jpg"/>',
      ),
    )[0].imageUrl,
    'https://example.com/preferred.jpg',
  );
});
