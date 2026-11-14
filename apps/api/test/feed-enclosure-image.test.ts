import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { test } from 'node:test';

import { parseFeed } from '../src/modules/ingestion/adapters/feed.adapter';

void test('recorded CBS RSS image enclosures retain lead photos and all reporting', async () => {
  const xml = await readFile('apps/api/test/fixtures/rss.xml', 'utf8');
  const items = parseFeed(xml);
  assert.deepEqual(
    items.map((item) => item.imageUrl),
    [
      'https://sportshub.cbsistatic.com/i/2026/10/21/a0920648-560c-4b7a-a24d-b217c48798b3/steph-curry-2.jpg',
      'https://sportshub.cbsistatic.com/i/2026/10/31/2c89a994-ccbb-4dda-962c-daffa9b9a50b/jeaniebuss.png',
    ],
  );
  const without = xml.replace(/<enclosure\b[^>]*\/>/g, '');
  assert.deepEqual(
    items.map((item) => ({ ...item, imageUrl: null })),
    parseFeed(without),
  );
  for (const changed of [
    xml.replaceAll('type="image/jpeg"', 'type="audio/mpeg"'),
    xml.replaceAll('type="image/jpeg"', 'type="image/svg+xml"'),
    xml.replaceAll('type="image/jpeg"', 'type="text/html"'),
    xml.replaceAll('type="image/jpeg"', ''),
    xml.replaceAll(
      'https://sportshub.cbsistatic.com',
      'http://sportshub.cbsistatic.com',
    ),
    xml.replaceAll(
      'https://sportshub.cbsistatic.com',
      'https://user:password@sportshub.cbsistatic.com',
    ),
  ])
    assert.equal(parseFeed(changed)[0].imageUrl, null);
  for (const preferred of [
    '<media:thumbnail url="https://example.com/preferred.jpg"/>',
    '<content:encoded><![CDATA[<figure><img src="https://example.com/preferred.jpg"></figure>]]></content:encoded>',
  ]) {
    assert.equal(
      parseFeed(xml.replace('<item>', `<item>${preferred}`))[0].imageUrl,
      'https://example.com/preferred.jpg',
    );
  }
  const audioFirst = xml.replace(
    '<enclosure ',
    '<enclosure type="audio/mpeg" url="https://example.com/audio.mp3"/><enclosure ',
  );
  assert.equal(parseFeed(audioFirst)[0].imageUrl, items[0].imageUrl);
});
