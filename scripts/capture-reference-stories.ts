// Explicit, free RSS observations for the daily missed-story review.
// No database writes, queue operations, embeddings or model calls.
import { writeFileSync } from 'node:fs';

import { parseReferenceFeed } from '../apps/api/scripts/reference-feed';
import { SharedHttpClient } from '../apps/api/src/libs/ports/http.client';

const references = [
  ['Tech & AI', 'Techmeme', 'https://www.techmeme.com/feed.xml'],
  ['Tech & AI', 'The Verge', 'https://www.theverge.com/rss/index.xml'],
  ['NBA', 'CBS Sports NBA', 'https://www.cbssports.com/rss/headlines/nba/'],
  ['NBA', 'Yahoo NBA', 'https://sports.yahoo.com/nba/rss/'],
  ['Gaming', 'GamesIndustry.biz', 'https://www.gamesindustry.biz/feed'],
  ['Gaming', 'Eurogamer', 'https://www.eurogamer.net/feed'],
  [
    'World news & politics',
    'BBC World',
    'https://feeds.bbci.co.uk/news/world/rss.xml',
  ],
  [
    'World news & politics',
    'Guardian World',
    'https://www.theguardian.com/world/rss',
  ],
  [
    'U.S. news & politics',
    'NPR Politics',
    'https://feeds.npr.org/1014/rss.xml',
  ],
  [
    'U.S. news & politics',
    'Guardian US',
    'https://www.theguardian.com/us-news/rss',
  ],
] as const;

async function main() {
  const [start, end, output] = process.argv.slice(2);
  const from = Date.parse(start);
  const to = Date.parse(end);
  if (
    process.argv.length !== 5 ||
    !output ||
    !Number.isFinite(from) ||
    !Number.isFinite(to) ||
    from >= to ||
    to - from > 48 * 3600000 ||
    from > Date.now()
  )
    throw new Error(
      'Expected START END OUTPUT_FILE: started window, at most 48 hours',
    );

  const http = new SharedHttpClient();
  const feeds = [];
  for (const [topic, name, url] of references) {
    const observedAt = new Date().toISOString();
    try {
      const items = parseReferenceFeed(await http.get(url), url);
      if (!items.length) throw new Error('No dated feed entries');
      const stories = items
        .map((item) => ({
          title: item.title,
          url: item.url,
          publishedAt: item.publishedAt,
          excerpt: item.excerpt,
          ...('publisherUrl' in item
            ? { publisherUrl: item.publisherUrl }
            : {}),
        }))
        .filter(({ publishedAt }) => {
          const date = Date.parse(publishedAt);
          return date >= from && date < to;
        });
      feeds.push({
        topic,
        name,
        url,
        observedAt,
        parsed: items.length,
        stories,
      });
      console.log(
        JSON.stringify({
          topic,
          name,
          parsed: items.length,
          inWindow: stories.length,
        }),
      );
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Feed unavailable';
      feeds.push({ topic, name, url, observedAt, error: message });
      console.error(JSON.stringify({ topic, name, error: message }));
      process.exitCode = 1;
    }
  }
  // Never overwrite an earlier observation: rolling feeds cannot be backdated.
  writeFileSync(
    output,
    JSON.stringify(
      {
        schemaVersion: 1,
        start: new Date(from).toISOString(),
        end: new Date(to).toISOString(),
        capturedAt: new Date().toISOString(),
        windowEnded: feeds.every((feed) => Date.parse(feed.observedAt) >= to),
        feeds,
      },
      null,
      2,
    ) + '\n',
    { flag: 'wx', mode: 0o600 },
  );
}

void main().catch((error: unknown) => {
  console.error(
    error instanceof Error ? error.message : 'Reference capture failed',
  );
  process.exitCode = 1;
});
