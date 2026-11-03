// Explicit live, free API probe. No DB writes, scheduling or edition changes.
// Prints only aggregate yield; never credentials, session bodies or tokens.
import { readFileSync } from 'node:fs';
import { homedir } from 'node:os';

import { topicSchema } from '@digest/contracts';

import { BlueskySearch } from '../apps/api/src/modules/social/adapters/bluesky-search';
import { rankBlueskyPosts } from '../apps/api/src/modules/social/domain/bluesky-ranking';

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
  const response = await fetch('http://localhost:8000/api/topics', {
    signal: AbortSignal.timeout(10000),
  });
  if (!response.ok) throw new Error('Topic policies unavailable');
  const topics = topicSchema.array().parse(await response.json());
  const until = new Date();
  const since = new Date(until.getTime() - 86400000);
  for (const [topic, query] of [
    ['Tech & AI', 'artificial intelligence'],
    ['NBA', 'NBA'],
    ['Gaming', 'game'],
    ['World news & politics', 'world news'],
  ]) {
    const configured = topics.find(
      (item) => item.name === topic && item.enabled,
    );
    if (!configured) throw new Error('Expected enabled topic missing');
    const posts = await client.search(query, since, until);
    // Search is bounded by until; observations arrive after that timestamp.
    const observedCutoff = new Date();
    const shortlist = rankBlueskyPosts(
      posts,
      configured.relevancePolicy,
      since,
      observedCutoff,
      configured.postBudget,
    );
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
        phraseEligibleShortlist: shortlist.length,
        observationCutoff: observedCutoff,
        semanticReviewed: false,
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
