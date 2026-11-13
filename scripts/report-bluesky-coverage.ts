// Read stored observations only: no search, collection, inference or edition writes.
import { topicSchema } from '@digest/contracts';

import { database } from '../apps/api/src/libs/db/connections';
import { readBlueskyObservations } from '../apps/api/src/modules/social/database/bluesky.repository';
import {
  rankBlueskyPosts,
  rankSafeBlueskyPosts,
} from '../apps/api/src/modules/social/domain/bluesky-ranking';
import { localAdminFetch } from './lib/local-admin-fetch';

async function main() {
  const args = process.argv.slice(2);
  const now = new Date();
  const cutoff = args.length === 0 ? now : new Date(args[1]);
  if (
    args.length !== 0 &&
    (args.length !== 2 ||
      args[0] !== '--window-end' ||
      !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{3})?Z$/.test(args[1]) ||
      !Number.isFinite(cutoff.getTime()) ||
      cutoff > now ||
      cutoff.toISOString().replace('.000Z', 'Z') !==
        args[1].replace('.000Z', 'Z'))
  )
    throw new Error(
      'Usage: report-bluesky-coverage.ts [--window-end past-UTC-ISO]',
    );
  const response = await localAdminFetch(
    'http://127.0.0.1:8000/api/admin/topics',
    {
      signal: AbortSignal.timeout(10_000),
    },
  );
  if (!response.ok) throw new Error('Topics unavailable');
  const topics = topicSchema.array().parse(await response.json());
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
          configuredBlueskyQuery: topic.blueskyQuery ?? null,
          effectiveCollectionQuery: (
            (topic.blueskyQuery?.trim() ||
              topic.queries.find((query) => query.trim())) ??
            topic.relevancePolicy.includeAny[0] ??
            topic.name
          )
            .trim()
            .slice(0, 500),
          collectionQuerySource: topic.blueskyQuery?.trim()
            ? 'blueskyQuery'
            : topic.queries.some((query) => query.trim())
              ? 'queries'
              : topic.relevancePolicy.includeAny[0] !== undefined
                ? 'includeAny'
                : 'topic name',
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
          strongestSafeLikesUpTo50: Math.max(
            0,
            ...safe.map(({ post }) => post.metrics.likes),
          ),
          strongestSafeExamples: safe.slice(0, 3).map(({ post }) => ({
            url: post.url,
            author: post.author,
            publishedAt: post.publishedAt,
            observedAt: post.observedAt,
            metrics: post.metrics,
            text: (post.displayText ?? post.text).slice(0, 600),
          })),
        });
      }
      await client.query('COMMIT');
      console.log(
        JSON.stringify({
          start,
          cutoff,
          policyBasis:
            'Current enabled topics and relevance policies; not a replay of historical editorial selection.',
          coverage,
          note: '24-hour publication window ending at cutoff; observations after cutoff excluded. Stored official API observations only, capped at 5,000 per topic. Distinct counts are within that read. Safe engaged candidates use latest valid snapshots, safety gates and positive engagement, capped at 50; they have not passed semantic relevance or editorial selection. Phrase shortlist uses the topic post budget and lexical relevance. Examples are engagement-ranked safe candidates, not editorial picks or measured growth. Zero means no stored eligible evidence, not no platform activity. No provider calls or writes.',
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
