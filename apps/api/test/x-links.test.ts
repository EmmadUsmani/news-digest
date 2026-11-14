import assert from 'node:assert/strict';
import { test } from 'node:test';

import { parseFeed } from '../src/modules/ingestion/adapters/feed.adapter';
import { extractXLinks } from '../src/modules/ingestion/domain/x-links';

void test('X citations deduplicate exact IDs without trusting host lookalikes or metrics', () => {
  const links = extractXLinks(`
    https://twitter.com/reporter/status/1234567890123456789?s=20
    https://x.com/i/web/status/1234567890123456789
    (https://mobile.twitter.com/NBA/status/987654321).
    https://x.com.evil.org/a/status/111
    https://x.com@evil.org/a/status/222
    https://evil.org/?next=https://x.com/a/status/333
    https://x.com/a/status/444garbage
    https://x.com/a/status/0
    https://x.com:8080/a/status/555
  `);
  assert.deepEqual(
    links.map((link) => link.externalId),
    ['1234567890123456789', '987654321'],
  );
  assert.equal(
    links[0].verificationUrl,
    'https://twitter.com/reporter/status/1234567890123456789',
  );
  assert.equal(links[0].url, 'https://x.com/i/web/status/1234567890123456789');
  assert.equal(
    extractXLinks(
      Array.from(
        { length: 100 },
        (_, i) => `https://x.com/a/status/${i + 1}`,
      ).join(' '),
    ).length,
    50,
  );
});
void test('feed harvest keeps embedded links before stripping HTML and truncating excerpts', () => {
  // Synthetic fixture: does not claim to represent a live post.
  const items = parseFeed(`<rss><channel><item>
    <title>Example</title><link>https://example.org/story</link>
    <pubDate>2026-11-02T00:00:00Z</pubDate>
    <description><![CDATA[<a href="https://twitter.com/NBA/status/123456789">Clip</a>]]></description>
    <content:encoded><![CDATA[${'Long article '.repeat(200)}<blockquote><a href="https://x.com/i/web/status/987654321">Post</a></blockquote>]]></content:encoded>
  </item></channel></rss>`);
  assert.deepEqual(
    items[0].xLinks?.map((link) => link.externalId),
    ['123456789', '987654321'],
  );
  assert.equal(items[0].excerpt, 'Long article '.repeat(115) + 'Long…');
});
