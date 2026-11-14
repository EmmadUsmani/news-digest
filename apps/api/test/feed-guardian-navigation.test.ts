import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { test } from 'node:test';

import { parseFeed } from '../src/modules/ingestion/adapters/feed.adapter';

void test('recorded Guardian teasers retain reporting without terminal self-navigation', async () => {
  for (const name of ['guardian-us', 'guardian-world']) {
    const xml = await readFile(`apps/api/test/fixtures/${name}.xml`, 'utf8');
    const items = parseFeed(xml);
    const control = parseFeed(
      xml.replaceAll('Continue reading...', 'Keep reading...'),
    );
    assert.equal(items.length, 2);
    for (const [index, item] of items.entries()) {
      assert.doesNotMatch(item.excerpt, /Continue reading/);
      // The first U.S. report reaches the cap before its navigation.
      if (/Keep reading\.\.\.$/.test(control[index].excerpt)) {
        assert.equal(
          item.excerpt,
          control[index].excerpt.replace(/\s*Keep reading\.\.\.$/, '…'),
        );
      } else {
        assert.equal(item.excerpt, control[index].excerpt);
      }
      assert.deepEqual(
        { ...item, excerpt: '' },
        { ...control[index], excerpt: '' },
      );
    }
  }
});

void test('Guardian navigation omission requires publisher, self destination and terminal position', () => {
  const article = 'https://www.theguardian.com/world/2026/nov/14/report';
  const footer = `<a href="${article}">Continue reading...</a>`;
  const parse = (body: string, url = article) =>
    parseFeed(
      `<rss><channel><item><title>Report</title><link>${url}</link><pubDate>2026-11-14</pubDate><description><![CDATA[<p>Supplied reporting.</p>${body}]]></description></item></channel></rss>`,
    )[0];
  assert.equal(parse(footer).excerpt, 'Supplied reporting.…');
  for (const body of [
    footer.replace(article, 'https://www.theguardian.com/world/other'),
    footer.replace('Continue reading...', 'Continue the report...'),
    `${footer}<p>More reporting.</p>`,
  ])
    assert.match(parse(body).excerpt, /Continue/);
  assert.match(
    parse(footer, 'https://example.com/report').excerpt,
    /Continue reading/,
  );
  assert.equal(parse('').excerpt, 'Supplied reporting.');
});
