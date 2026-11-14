import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { test } from 'node:test';

import { parseFeed } from '../src/modules/ingestion/adapters/feed.adapter';

void test('recorded Xbox store badges leave more excerpt space for release reporting', async () => {
  const xml = await readFile(
    'apps/api/test/fixtures/xbox-store-badges-2026-11-14.xml',
    'utf8',
  );
  const [item] = parseFeed(xml);
  assert.doesNotMatch(item.excerpt, /[☆★]|13576|\$79\.99|Pre-order/);
  assert.match(item.excerpt, /Grand Theft Auto VI – November 19/);
  assert.match(
    item.excerpt,
    /Ranger’s Path: National Park Simulator – November 17/,
  );
  assert.match(item.excerpt, /Restore and maintain scenic trails/);
  assert.match(item.excerpt, /clear blocked paths/);
  assert.match(item.excerpt, /Purchase prior to 19 November 2026/);
  assert.match(item.excerpt, /…$/);
  for (const changed of [
    xml.replaceAll('news.xbox.com', 'example.com'),
    xml.replaceAll('ms-product-badge mspb-normal', 'article-reporting'),
  ]) {
    const [control] = parseFeed(changed);
    assert.match(control.excerpt, /☆☆☆☆☆ 13576 ★★★★★ \$79\.99 Pre-order/);
    assert.doesNotMatch(control.excerpt, /clear blocked paths/);
    assert.deepEqual(
      { ...control, excerpt: item.excerpt, url: item.url },
      item,
    );
  }
  // Synthetic boundaries: balanced nested widgets, article prices and an
  // incomplete widget must never swallow the following reporting.
  const withContent = (content: string) =>
    xml.replace(
      /<content:encoded>[\s\S]*?<\/content:encoded>/,
      `<content:encoded><![CDATA[${content}]]></content:encoded>`,
    );
  const badge =
    '<div class="ms-product-badge mspb-normal"><div>Buy now</div></div>';
  assert.equal(
    parseFeed(
      withContent(
        `<p>Reporting costs $20.</p>${badge}<p>Release Friday.</p>${badge}<p>More reporting.</p>`,
      ),
    )[0].excerpt,
    'Reporting costs $20. Release Friday. More reporting.',
  );
  const incomplete =
    '<div class="ms-product-badge mspb-normal"><p>Keep this reporting.</p>';
  assert.equal(
    parseFeed(withContent(incomplete))[0].excerpt,
    'Keep this reporting.',
  );
});
