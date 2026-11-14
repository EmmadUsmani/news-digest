import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { test } from 'node:test';

import { parseFeed } from '../src/modules/ingestion/adapters/feed.adapter';

void test('recorded Ars fragment retains reporting without article/comments navigation', async () => {
  const xml = await readFile(
    'apps/api/test/fixtures/ars-outage-2026-11-13.xml',
    'utf8',
  );
  const [item] = parseFeed(xml);
  assert.equal(item.excerpt.length, 567);
  assert.match(item.excerpt, /extended email timeout to 48 hours/);
  assert.ok(item.excerpt.endsWith('…'));
  assert.doesNotMatch(item.excerpt, /Read full article|Comments/);
  const withoutFooter = xml.replace(
    /&lt;p&gt;&lt;a href="[^"]*"&gt;Read full article[\s\S]*?Comments&lt;\/a&gt;&lt;\/p&gt;/,
    '',
  );
  assert.notEqual(withoutFooter, xml);
  assert.deepEqual(item, {
    ...parseFeed(withoutFooter)[0],
    excerpt: parseFeed(withoutFooter)[0].excerpt + '…',
  });
  for (const changed of [
    xml.replaceAll('arstechnica.com', 'example.com'),
    xml.replace('Read full article', 'Read related article'),
    xml.replace('#comments', '#discussion'),
    xml.replace(
      'href="https://arstechnica.com/tech-policy/',
      'href="https://arstechnica.com/other/',
    ),
    xml.replace('/#comments', '/other/#comments'),
    xml.replace(
      'Comments&lt;/a&gt;&lt;/p&gt;',
      'Comments&lt;/a&gt;&lt;/p&gt;&lt;p&gt;More reporting.&lt;/p&gt;',
    ),
  ]) {
    assert.match(
      parseFeed(changed)[0].excerpt,
      /Read (?:full|related) article Comments/,
    );
  }
});
