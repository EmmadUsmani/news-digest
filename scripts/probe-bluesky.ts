// Explicit live, free API probe. No DB writes, scheduling or edition changes.
// Prints only aggregate yield; never credentials, session bodies or tokens.
import { readFileSync } from 'node:fs';
import { homedir } from 'node:os';

import { BlueskySearch } from '../apps/api/src/modules/social/adapters/bluesky-search';

async function main() {
  const values = new Map(
    readFileSync(`${homedir()}/.config/news-digest/env`, 'utf8')
      .split('\n')
      .map((line) => {
        const match = /^(?:export\s+)?([A-Z_]+)=(.*)$/.exec(line.trim());
        return match
          ? [match[1], match[2].replace(/^(['"])(.*)\1$/, '$2')]
          : ['', ''];
      }),
  );
  const handle = values.get('BLUESKY_HANDLE');
  const password = values.get('BLUESKY_APP_PASSWORD');
  if (!handle || !password) throw new Error('Bluesky credentials missing');
  const client = new BlueskySearch({ handle, password });
  const until = new Date();
  const since = new Date(until.getTime() - 86400000);
  for (const [topic, query] of [
    ['Tech/AI', 'artificial intelligence'],
    ['NBA', 'NBA'],
    ['Gaming', 'game'],
    ['World', 'world news'],
  ]) {
    const posts = await client.search(query, since, until);
    console.log(
      JSON.stringify({
        topic,
        query,
        since,
        until,
        fetched: posts.length,
        withEngagement: posts.filter((post) =>
          Object.values(post.metrics).some((count) => count > 0),
        ).length,
        stored: 0,
        productionInclusion: false,
      }),
    );
  }
}
main().catch(() => {
  console.error(
    'Bluesky live probe failed; credentials and response details suppressed',
  );
  process.exitCode = 1;
});
