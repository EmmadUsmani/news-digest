import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { test } from 'node:test';

import { parseFeed } from '../src/modules/ingestion/adapters/feed.adapter';

void test('recorded inline NBA photo caption does not displace reporting', async () => {
  const xml = await readFile(
    'apps/api/test/fixtures/yahoo-nba-inline-photo-2026-11-18.xml',
    'utf8',
  );
  const [item] = parseFeed(xml);
  assert.match(item.excerpt, /career-high 47 points/);
  assert.doesNotMatch(item.excerpt, /Getty Images|reacts after scoring/);
  assert.match(item.excerpt, /Luka Dončić/);
});

void test('only image-and-caption figures are removed, wherever they appear', () => {
  const parse = (body: string) =>
    parseFeed(
      `<rss><channel><item><title>Report</title><link>https://example.com/report</link><pubDate>Wed, 18 Nov 2026 12:00:00 GMT</pubDate><description><![CDATA[${body}]]></description></item></channel></rss>`,
    )[0].excerpt;
  const photo =
    '<figure><img src="https://example.com/photo.jpg"><figcaption>Photo credit.</figcaption></figure>';
  assert.equal(parse(`Before${photo}after.`), 'Before after.');
  assert.equal(
    parse(`<p>Opening reporting.</p>${photo}<p>Later reporting.</p>${photo}`),
    'Opening reporting. Later reporting.',
  );
  assert.match(
    parse(
      '<figure><img src="https://example.com/chart.jpg"><figcaption>Chart details.</figcaption><p>Reported analysis.</p></figure>',
    ),
    /Chart details.*Reported analysis/,
  );
  assert.match(
    parse('<p>The report discusses Getty Images.</p>'),
    /Getty Images/,
  );
  assert.match(
    parse('<figure><p>Reporting.</p></figure>' + photo),
    /Reporting/,
  );
});
