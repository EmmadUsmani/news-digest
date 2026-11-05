// Explicit free API probe; --store opts into isolated observation writes.
// No scheduling or edition changes. At most four queries / 200 observations.
// Prints only aggregate yield; never credentials, session bodies or tokens.
import { readFileSync } from 'node:fs';
import { homedir } from 'node:os';

import { topicSchema } from '@digest/contracts';

import { BlueskySearch } from '../apps/api/src/modules/social/adapters/bluesky-search';
import { collectBluesky } from '../apps/api/src/modules/social/application/collect-bluesky';
import { PostgresBlueskyRepository } from '../apps/api/src/modules/social/database/bluesky.repository';
import { rankBlueskyPosts } from '../apps/api/src/modules/social/domain/bluesky-ranking';
import { localAdminFetch } from './lib/local-admin-fetch';

async function main() {
  const args = process.argv.slice(2);
  if (args.some((arg) => arg !== '--store') || args.length > 1)
    throw new Error('Usage: probe-bluesky.ts [--store]');
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
  const response = await localAdminFetch(
    'http://127.0.0.1:8000/api/admin/topics',
    {
      signal: AbortSignal.timeout(10000),
    },
  );
  if (!response.ok) throw new Error('Topic policies unavailable');
  const topics = topicSchema.array().parse(await response.json());
  const until = new Date();
  const since = new Date(until.getTime() - 86400000);
  const repository = args.includes('--store')
    ? new PostgresBlueskyRepository()
    : undefined;
  try {
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
      const collection = repository
        ? await collectBluesky(
            repository,
            client,
            configured.id,
            query,
            since,
            until,
          )
        : undefined;
      const observedCutoff = collection?.cutoff ?? new Date();
      const posts = repository
        ? await repository.observations(
            configured.id,
            since,
            until,
            observedCutoff,
          )
        : await client.search(query, since, until);
      // Search is bounded by until; observations arrive after that timestamp.
      const rankingCutoff = new Date();
      const shortlist = rankBlueskyPosts(
        posts,
        configured.relevancePolicy,
        since,
        rankingCutoff,
        configured.postBudget,
      );
      console.log(
        JSON.stringify({
          topic,
          query,
          since,
          until,
          fetched: collection?.fetched ?? posts.length,
          submitted: collection?.submitted ?? 0,
          storedWindowObservations: repository ? posts.length : 0,
          withEngagement: posts.filter((post) =>
            Object.values(post.metrics).some((count) => count > 0),
          ).length,
          withImages: posts.filter((post) =>
            post.media?.some((media) => media.type === 'image'),
          ).length,
          withVideo: posts.filter((post) =>
            post.media?.some((media) => media.type === 'video'),
          ).length,
          phraseEligibleShortlist: shortlist.length,
          observationCutoff: rankingCutoff,
          semanticReviewed: false,
          productionInclusion: false,
        }),
      );
    }
  } finally {
    await repository?.db.end();
  }
}
main().catch(() => {
  console.error(
    'Bluesky live probe failed; credentials and response details suppressed',
  );
  process.exitCode = 1;
});
