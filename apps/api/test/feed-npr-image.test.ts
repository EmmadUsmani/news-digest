import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { test } from 'node:test';

import { parseFeed } from '../src/modules/ingestion/adapters/feed.adapter';

void test('recorded NPR reporting retains its opening photo without selecting tracking pixels', async () => {
  const xml = await readFile(
    'apps/api/test/fixtures/npr-politics-lead-image-2026-11-14.xml',
    'utf8',
  );
  const [item] = parseFeed(xml);
  assert.ok(item.imageUrl);
  const image = new URL(item.imageUrl);
  assert.equal(image.hostname, 'npr.brightspotcdn.com');
  assert.match(
    image.searchParams.get('url') ?? '',
    /gettyimages-2303426754\.jpg$/,
  );
  assert.match(item.excerpt, /politics of masculinity/);
  const withoutPhoto = xml.replace(
    /<img src='https:\/\/npr\.brightspotcdn\.com[^>]*\/>/,
    '',
  );
  assert.notEqual(withoutPhoto, xml);
  assert.deepEqual({ ...item, imageUrl: null }, parseFeed(withoutPhoto)[0]);
  for (const changed of [
    xml.replaceAll('www.npr.org', 'example.com'),
    xml.replaceAll(
      'https://npr.brightspotcdn.com',
      'http://npr.brightspotcdn.com',
    ),
    xml.replaceAll('https://npr.brightspotcdn.com', 'https://example.com'),
    xml.replaceAll('/dims3/', '/other/'),
    xml.replaceAll(
      'https://npr.brightspotcdn.com',
      'https://user:password@npr.brightspotcdn.com',
    ),
    xml.replace(
      "<img src='https://npr.brightspotcdn.com",
      "<p>Reporting before a later photo.</p><img src='https://npr.brightspotcdn.com",
    ),
  ])
    assert.equal(parseFeed(changed)[0].imageUrl, null);
  assert.equal(parseFeed(withoutPhoto)[0].imageUrl, null);
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
