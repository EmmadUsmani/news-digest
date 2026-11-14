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
  let cutoff = now;
  let exampleLimit = 3;
  const seen = new Set<string>();
  for (let index = 0; index < args.length; index += 2) {
    const flag = args[index];
    const value = args[index + 1];
    if (seen.has(flag) || value === undefined)
      throw new Error('Duplicate flag or missing value');
    seen.add(flag);
    if (flag === '--examples' && /^(?:[1-9]|[1-4][0-9]|50)$/.test(value)) {
      exampleLimit = Number(value);
    } else if (flag === '--window-end') {
      cutoff = new Date(value);
      if (
        !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{3})?Z$/.test(value) ||
        !Number.isFinite(cutoff.getTime()) ||
        cutoff > now ||
        cutoff.toISOString().replace('.000Z', 'Z') !==
          value.replace('.000Z', 'Z')
      )
        throw new Error('Invalid past UTC window end');
    } else {
      throw new Error('Unknown flag or invalid example count');
    }
  }
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
        const authorCounts = new Map<string, number>();
        for (const { post } of safe)
          authorCounts.set(
            post.author,
            (authorCounts.get(post.author) ?? 0) + 1,
          );
        const safeAuthors = [...authorCounts]
          .map(([author, distinctPosts]) => ({ author, distinctPosts }))
          .sort(
            (a, b) =>
              b.distinctPosts - a.distinctPosts ||
              a.author.localeCompare(b.author),
          );
        coverage.push({
          topic: topic.name,
          configuredBlueskyQuery: topic.blueskyQuery ?? null,
          currentUnrotatedCollectionQuery: (
            (topic.blueskyQuery?.trim() ||
              topic.queries.find((query) => query.trim())) ??
            topic.relevancePolicy.includeAny[0] ??
            topic.name
          )
            .trim()
            .slice(0, 500),
          currentUnrotatedQuerySource: topic.blueskyQuery?.trim()
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
          distinctStoredPostsWithVideoInAnySnapshot: new Set(
            posts
              .filter((post) =>
                post.media?.some((media) => media.type === 'video'),
              )
              .map((post) => post.externalId),
          ).size,
          newestObservationAt:
            posts
              .map((post) => post.observedAt)
              .sort()
              .at(-1) ?? null,
          safeEngagedCandidatesUpTo50: safe.length,
          safeEngagedMediaCoverageUpTo50: {
            postsWithImages: safe.filter(({ post }) =>
              post.media?.some((media) => media.type === 'image'),
            ).length,
            postsWithVideo: safe.filter(({ post }) =>
              post.media?.some((media) => media.type === 'video'),
            ).length,
            postsWithoutAttachedMedia: safe.filter(
              ({ post }) => !post.media?.length,
            ).length,
            postsWithAuthorDescriptions: safe.filter(({ post }) =>
              post.media?.some((media) => media.alt.trim()),
            ).length,
          },
          safeEngagedAuthorCoverageUpTo50: {
            distinctAuthors: safeAuthors.length,
            largestAuthorPostCount: safeAuthors[0]?.distinctPosts ?? 0,
            authors: safeAuthors,
          },
          phraseEligibleShortlist: phrase.length,
          strongestSafeLikesUpTo50: Math.max(
            0,
            ...safe.map(({ post }) => post.metrics.likes),
          ),
          strongestSafeVideoExamples: safe
            .filter(({ post }) =>
              post.media?.some((media) => media.type === 'video'),
            )
            .slice(0, exampleLimit)
            .map(({ post }) => ({
              url: post.url,
              author: post.author,
              metrics: post.metrics,
              text: (post.displayText ?? post.text).slice(0, 600),
            })),
          strongestSafeExamples: safe
            .slice(0, exampleLimit)
            .map(({ post }) => ({
              url: post.url,
              author: post.author,
              publishedAt: post.publishedAt,
              observedAt: post.observedAt,
              metrics: post.metrics,
              attachedMediaTypes: [
                ...new Set(post.media?.map((media) => media.type) ?? []),
              ],
              text: (post.displayText ?? post.text).slice(0, 600),
            })),
        });
      }
      await client.query('COMMIT');
      console.log(
        JSON.stringify({
          start,
          cutoff,
          exampleLimit,
          policyBasis:
            'Current enabled topics and relevance policies; not a replay of historical editorial selection.',
          collectionQueryBasis:
            'Current topic metadata without the optional hourly World rotation; not the queries that produced stored observations. An enabled rotation replaces only the fallback, using baseline/Ukraine/baseline/Gaza by UTC hour; an explicit blueskyQuery still wins. Historical collection queries are not stored on observations, so this report cannot attribute posts to baseline or event searches.',
          coverage,
          note: '24-hour publication window ending at cutoff; observations after cutoff excluded. Stored official API observations only, capped at 5,000 per topic. Distinct counts are within that read. Safe engaged candidates use latest valid snapshots, safety gates and positive engagement, capped at 50; they have not passed semantic relevance or editorial selection. Stored video counts include any retained snapshot; safe media counts use selected latest snapshots. Attached media and author descriptions do not verify contents or identify highlights. Image/video counts can overlap. Author counts describe distinct posts within those capped candidates, not the full pool or measured relevance. Phrase shortlist uses the topic post budget and lexical relevance. Examples are engagement-ranked safe candidates, not editorial picks or measured growth. Zero means no stored eligible evidence, not no platform activity. No provider calls or writes.',
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
    'Stored Bluesky coverage report failed; usage: report-bluesky-coverage.ts [--window-end past-UTC-ISO] [--examples 1..50]. Check arguments or API/database access',
  );
  process.exitCode = 1;
});
