import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

import { scoredFallback } from '../src/modules/digests/domain/editorial-shortlist';
import {
  type Candidate,
  rankFallback,
} from '../src/modules/digests/domain/rank';
import { parseFeed } from '../src/modules/ingestion/adapters/feed.adapter';

void test('recorded headline-only Xbox syndication cannot consume a readable fallback slot', async () => {
  const xml = await readFile(
    'apps/api/test/fixtures/xbox-headline-only-2026-11-14.xml',
    'utf8',
  );
  const [item] = parseFeed(xml);
  assert.equal(item.excerpt, '');
  assert.equal(
    item.title,
    'Bethesda Celebrates XBOX 25 with id Software & MachineGames News',
  );
  assert.equal(item.publishedAt, '2026-11-13T00:00:00.000Z');
  assert.equal(item.author, 'Mike Nelson, XBOX Wire Editor');
  const headline: Candidate = {
    ...item,
    id: 'headline',
    sources: ['XBOX Wire'],
    points: 1000,
  };
  // A synthetic readable control follows the higher-ranked recorded headline.
  const readable: Candidate = {
    ...headline,
    id: 'readable',
    url: 'https://example.com/report',
    title: 'A separately supplied report',
    excerpt: 'Supplied reporting, rather than a repeated headline.',
    points: 0,
  };
  const start = new Date('2026-11-12T15:00:00Z');
  const end = new Date('2026-11-13T15:00:00Z');
  for (const select of [rankFallback, scoredFallback]) {
    assert.deepEqual(select([headline], start, end, 1), []);
    const selected = select([headline, readable], start, end, 1);
    assert.deepEqual(
      selected.map(({ id }) => id),
      ['readable'],
    );
    assert.equal(selected[0].excerpt, readable.excerpt);
  }
  // Both explicit content and description-only forms must remain empty.
  const descriptionOnly = xml.replace(
    /<content:encoded>[\s\S]*?<\/content:encoded>/,
    '',
  );
  assert.equal(parseFeed(descriptionOnly)[0].excerpt, '');
  const withReporting = xml.replaceAll(
    '&lt;p&gt;The post',
    '&lt;p&gt;Actual supplied reporting.&lt;/p&gt;&lt;p&gt;The post',
  );
  assert.equal(
    parseFeed(withReporting)[0].excerpt,
    'Actual supplied reporting.',
  );
  const foreignLink = xml.replaceAll(
    'href="https://news.xbox.com/en-us/2026/',
    'href="https://example.com/2026/',
  );
  assert.match(
    parseFeed(foreignLink)[0].excerpt,
    /appeared first on XBOX Wire\.$/,
  );
});
