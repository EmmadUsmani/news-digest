import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { test } from 'node:test';

import { parseFeed } from '../src/modules/ingestion/adapters/feed.adapter';

void test('recorded Gaming teasers retain reporting without terminal self-navigation', async () => {
  for (const name of ['rps', 'eurogamer']) {
    const xml = await readFile(`apps/api/test/fixtures/${name}.xml`, 'utf8');
    const items = parseFeed(xml);
    const control = parseFeed(xml.replaceAll('Read more', 'Open report'));
    assert.equal(items.length, 2);
    for (const [index, item] of items.entries()) {
      assert.doesNotMatch(item.excerpt, /Read more/);
      assert.match(control[index].excerpt, /Open report$/);
      assert.equal(
        item.excerpt,
        control[index].excerpt.replace(/\s*Open report$/, '…'),
      );
      assert.deepEqual(
        { ...item, excerpt: '' },
        { ...control[index], excerpt: '' },
      );
    }
  }
});

void test('Gaming navigation omission requires publisher, self destination and terminal position', () => {
  const article = 'https://www.eurogamer.net/report';
  const footer = `<p><a href="${article}">Read more</a></p>`;
  const parse = (body: string, url = article) =>
    parseFeed(
      `<rss><channel><item><title>Report</title><link>${url}</link><pubDate>2026-11-14</pubDate><description><![CDATA[<p>Supplied reporting.</p>${body}]]></description></item></channel></rss>`,
    )[0];
  assert.equal(parse(footer).excerpt, 'Supplied reporting.…');
  for (const body of [
    footer.replace(article, 'https://www.eurogamer.net/other'),
    footer.replace('Read more', 'Read the report'),
    `${footer}<p>More reporting.</p>`,
  ])
    assert.match(parse(body).excerpt, /Read/);
  assert.match(
    parse(footer, 'https://example.com/report').excerpt,
    /Read more/,
  );
  assert.equal(parse('').excerpt, 'Supplied reporting.');
});
