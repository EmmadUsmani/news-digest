import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';

import { parseReferenceFeed } from '../scripts/reference-feed';

const feed = 'https://www.techmeme.com/feed.xml';
const recorded = readFileSync(
  new URL('./fixtures/reference/techmeme-2026-11-19.xml', import.meta.url),
  'utf8',
);

void test('recorded Techmeme headline links retain publisher identity without an image link', () => {
  const items = parseReferenceFeed(recorded, feed);
  assert.equal(items.length, 3);
  const attack = items.find((item) => item.url.endsWith('/p32'))!;
  assert.equal(
    'publisherUrl' in attack && attack.publisherUrl,
    'https://www.politico.eu/newsletter/brussels-playbook/cyberattack-hits-the-commission/',
  );
  assert.ok(attack.excerpt?.includes('cyberattack'));
  assert.equal(items.filter((item) => 'publisherUrl' in item).length, 3);
  assert.ok(
    parseReferenceFeed(recorded, 'https://publisher.test/feed').every(
      (item) => !('publisherUrl' in item),
    ),
  );
});

void test('missing or unsafe headline links do not substitute unrelated links', () => {
  for (const description of [
    '<a href="https://publisher.test/advert">Advertisement</a>',
    '<b><a href="javascript:alert(1)">Headline</a></b>',
    '<b><a href="https://www.techmeme.com/related">Headline</a></b>',
  ]) {
    const xml = `<rss><channel><item><title>Headline</title><link>https://www.techmeme.com/261119/p32</link><pubDate>Thu, 19 Nov 2026 14:00:00 GMT</pubDate><description><![CDATA[${description}]]></description></item></channel></rss>`;
    assert.ok(!('publisherUrl' in parseReferenceFeed(xml, feed)[0]));
  }
  assert.throws(() => parseReferenceFeed('<rss>', feed), /Invalid XML/);
});
