import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { test } from 'node:test';

import { parseFeed } from '../src/modules/ingestion/adapters/feed.adapter';

void test('recorded Gematsu descriptions retain publisher lead images without changing reporting', async () => {
  const xml = await readFile('apps/api/test/fixtures/gematsu.xml', 'utf8');
  const items = parseFeed(xml);
  assert.ok(items.length > 0);
  assert.equal(
    items[0].imageUrl,
    'https://www.gematsu.com/wp-content/uploads/2026/11/Nagoshi-Studio-Dissolves_11-01-26.jpg',
  );
  const stripped = parseFeed(xml.replace(/<img\b[^>]*>/g, ''));
  assert.deepEqual(
    items.map((item) => ({ ...item, imageUrl: null })),
    stripped,
  );
  for (const changed of [
    xml.replaceAll('www.gematsu.com', 'example.com'),
    xml.replaceAll('<img src=', '<p>Reporting first.</p><img src='),
    xml.replaceAll('<img src=', '<img data-src='),
    xml.replaceAll(
      'https://www.gematsu.com/wp-content/uploads/',
      'https://example.com/wp-content/uploads/',
    ),
    xml.replaceAll(
      'https://www.gematsu.com/wp-content/uploads/',
      'http://www.gematsu.com/wp-content/uploads/',
    ),
    xml.replaceAll('/wp-content/uploads/', '/tracking/'),
  ])
    assert.equal(parseFeed(changed)[0].imageUrl, null);
  const media = xml.replace(
    '<item>',
    '<item><media:thumbnail url="https://example.com/preferred.jpg"/>',
  );
  assert.equal(
    parseFeed(media)[0].imageUrl,
    'https://example.com/preferred.jpg',
  );
});
