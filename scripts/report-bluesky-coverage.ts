// Read stored observations only: no search, collection, inference or edition writes.
import { topicSchema } from '@digest/contracts';

import { database } from '../apps/api/src/libs/db/connections';
import { readBlueskyObservations } from '../apps/api/src/modules/social/database/bluesky.repository';
import {
  rankBlueskyPosts,
  rankSafeBlueskyPosts,
} from '../apps/api/src/modules/social/domain/bluesky-ranking';

async function main() {
  if (process.argv.length > 2)
    throw new Error('Usage: report-bluesky-coverage.ts');
  const response = await fetch('http://localhost:8000/api/topics', {
    signal: AbortSignal.timeout(10_000),
  });
  if (!response.ok) throw new Error('Topics unavailable');
  const topics = topicSchema.array().parse(await response.json());
  const cutoff = new Date();
  const start = new Date(cutoff.getTime() - 86_400_000);
  const db = database();
  try {
    const client = await db.connect();
    try {
      await client.query('BEGIN ISOLATION LEVEL REPEATABLE READ READ ONLY');
      await client.query("SET LOCAL statement_timeout = '10s'");
      const coverage = [];
      for (const topic of topics.filter((topic) => topic.enabled)) {
        const posts = await readBlueskyObservations(
          client,
          topic.id,
          start,
          cutoff,
          cutoff,
        );
        const safe = rankSafeBlueskyPosts(
          posts,
          topic.relevancePolicy,
          start,
          cutoff,
          50,
        );
        const phrase = rankBlueskyPosts(
          posts,
          topic.relevancePolicy,
          start,
          cutoff,
          topic.postBudget,
        );
        coverage.push({
          topic: topic.name,
          postBudget: topic.postBudget,
          storedObservations: posts.length,
          observationReadLimitReached: posts.length === 5000,
          distinctStoredPosts: new Set(posts.map((post) => post.externalId))
            .size,
          newestObservationAt:
            posts
              .map((post) => post.observedAt)
              .sort()
              .at(-1) ?? null,
          safeEngagedCandidatesUpTo50: safe.length,
          phraseEligibleShortlist: phrase.length,
          strongestSafeExamples: safe.slice(0, 3).map(({ post }) => ({
            url: post.url,
            author: post.author,
            publishedAt: post.publishedAt,
            observedAt: post.observedAt,
            metrics: post.metrics,
          })),
        });
      }
      await client.query('COMMIT');
      console.log(
        JSON.stringify({
          start,
          cutoff,
          coverage,
          note: 'Rolling 24-hour publication window; stored official API observations only, capped at 5,000 per topic. Distinct counts are within that read. Safe engaged candidates use latest valid snapshots, safety gates and positive engagement, capped at 50; they have not passed semantic relevance or editorial selection. Phrase shortlist uses the topic post budget and lexical relevance. Examples are engagement-ranked safe candidates, not editorial picks or measured growth. Zero means no stored eligible evidence, not no platform activity. No provider calls or writes.',
        }),
      );
    } finally {
      client.release();
    }
  } finally {
    await db.end();
  }
}
void main().catch(() => {
  console.error(
    'Stored Bluesky coverage report failed; check API/database access',
  );
  process.exitCode = 1;
});
