import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { test } from 'node:test';

import { parseFeed } from '../src/modules/ingestion/adapters/feed.adapter';

void test('recorded Verge Atom fragments keep reporting and metadata without self-navigation', async () => {
  const xml = await readFile('apps/api/test/fixtures/atom.xml', 'utf8');
  const items = parseFeed(xml);
  const control = parseFeed(
    xml.replaceAll('Read the full story', 'Open the full story'),
  );
  assert.equal(items.length, 2);
  for (const [index, item] of items.entries()) {
    assert.match(
      control[index].excerpt,
      / … Open the full story at The Verge\.$/,
    );
    assert.equal(
      item.excerpt,
      control[index].excerpt.replace(
        / Open the full story at The Verge\.$/,
        '',
      ),
    );
    assert.deepEqual(
      { ...item, excerpt: '' },
      { ...control[index], excerpt: '' },
    );
  }
});

void test('Verge navigation removal requires publisher, destination, wording and terminal position', () => {
  const article = 'https://www.theverge.com/tech/123/report';
  const footer = `<p><a href="${article}">Read the full story at The Verge.</a></p>`;
  const parse = (body: string, url = article) =>
    parseFeed(
      `<rss><channel><item><title>Report</title><pubDate>2026-11-14</pubDate><link>${url}</link><description><![CDATA[<p>Supplied reporting.</p>${body}]]></description></item></channel></rss>`,
    )[0];
  assert.equal(parse(footer).excerpt, 'Supplied reporting.…');
  assert.equal(parse('').excerpt, 'Supplied reporting.');
  for (const body of [
    footer.replace(article, 'https://www.theverge.com/tech/456/other'),
    footer.replace('Read the full story', 'Open the full story'),
    `${footer}<p>Further reporting.</p>`,
  ])
    assert.match(parse(body).excerpt, /full story/);
  assert.match(
    parse(footer, 'https://example.com/report').excerpt,
    /Read the full story/,
  );
});
