import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { test } from 'node:test';

import { parseFeed } from '../src/modules/ingestion/adapters/feed.adapter';

void test('recorded Ars Rocket Report keeps launch reporting without subscription navigation', async () => {
  const xml = await readFile(
    'apps/api/test/fixtures/ars-rocket-report-2026-11-14.xml',
    'utf8',
  );
  const [item] = parseFeed(xml);
  assert.equal(item.excerpt.length, 757);
  assert.match(item.excerpt, /^Welcome to Edition 9\.19/);
  assert.match(item.excerpt, /upper stage landing attempt 22\.5 hours later/);
  assert.match(item.excerpt, /Electron’s 100th overall mission/);
  assert.ok(item.excerpt.endsWith('NASASpaceflight.com reports.…'));
  assert.doesNotMatch(item.excerpt, /subscribe|submissions|AMP-enabled/);
  const withoutPromo = xml.replace(
    /&lt;p&gt;As always, we [\s\S]*?&lt;\/p&gt;/,
    '',
  );
  assert.notEqual(withoutPromo, xml);
  assert.deepEqual(item, parseFeed(withoutPromo)[0]);
  for (const changed of [
    xml.replaceAll('arstechnica.com', 'example.com'),
    xml.replace('arstechnica.wufoo.com', 'example.com'),
    xml.replace('welcome reader submissions', 'welcome reader reporting'),
    xml.replace('please subscribe', 'please consider subscribing'),
    xml.replace(
      'Each report will include',
      'Additional reporting. Each report will include',
    ),
  ]) {
    assert.match(parseFeed(changed)[0].excerpt, /As always, we/);
    assert.match(
      parseFeed(changed)[0].excerpt,
      /Electron’s 100th overall mission/,
    );
  }
});
