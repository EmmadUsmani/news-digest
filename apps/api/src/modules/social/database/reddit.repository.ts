import {
  and,
  asc,
  desc,
  DrizzleQueryError,
  eq,
  exists,
  gte,
  lt,
  sql,
} from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/node-postgres';
import type { PoolClient } from 'pg';

import { database } from '../../../libs/db/connections';
import {
  redditTopicPosts,
  redditXCitations,
  socialPosts,
  topics,
} from '../../../libs/db/schema';
import { extractXLinks } from '../../ingestion/public/discovery';
import type {
  RedditCollectionRepository,
  RedditPost,
  RedditRankingRepository,
} from '../domain/reddit';

export class PostgresRedditRepository
  implements RedditCollectionRepository, RedditRankingRepository
{
  readonly db = database();
  async observations(topicId: string, start: Date, end: Date) {
    return readRedditObservations(this.db, topicId, start, end);
  }
  async communities() {
    // PostgreSQL's set-returning JSON expansion has no query-builder equivalent.
    const community = sql<string>`lower(c.value)`;
    return drizzle(this.db)
      .select({
        community,
        topicIds: sql<
          string[]
        >`array_agg(DISTINCT ${topics.id}::text ORDER BY ${topics.id}::text)`,
      })
      .from(topics)
      .crossJoin(
        sql`LATERAL jsonb_array_elements_text(${topics.redditCommunities}) c`,
      )
      .where(eq(topics.enabled, true))
      .groupBy(community)
      .orderBy(community);
  }
  async store(posts: RedditPost[], topicIds: string[]) {
    await drizzle(this.db)
      .transaction(async (tx) => {
        for (const post of posts) {
          const values = {
            canonicalUrl: post.url,
            author: post.author,
            authorUrl: post.authorUrl,
            publishedAt: post.publishedAt,
            metrics: post.metrics,
            redditMetadata: {
              title: post.title,
              text: post.text,
              subreddit: post.subreddit,
              thumbnail: post.thumbnail,
              externalUrl: post.externalUrl,
            },
          };
          await tx
            .insert(socialPosts)
            .values({
              ...values,
              platform: 'reddit',
              externalId: post.externalId,
              embedHtml: '',
            })
            .onConflictDoUpdate({
              target: [socialPosts.platform, socialPosts.externalId],
              set: { ...values, verifiedAt: sql`now()` },
            });
          // Replace a post's evidence atomically when its text or destination changes.
          await tx
            .delete(redditXCitations)
            .where(eq(redditXCitations.redditId, post.externalId));
          for (const link of extractXLinks(
            `${post.externalUrl ?? ''} ${post.text}`,
          )) {
            await tx.insert(redditXCitations).values({
              redditId: post.externalId,
              externalId: link.externalId,
              canonicalUrl: link.url,
              verificationUrl: link.verificationUrl ?? null,
              citingEngagement: post.metrics.score ?? 0,
            });
          }
          for (const topicId of topicIds) {
            // Recheck configuration on write so disabled/removed communities do not gain associations.
            await tx
              .insert(redditTopicPosts)
              .select(
                tx
                  .select({
                    topicId: topics.id,
                    externalId: sql<string>`${post.externalId}`.as(
                      'external_id',
                    ),
                    platform: sql<string>`'reddit'`.as('platform'),
                    lastSeenAt: sql<string>`now()`.as('last_seen_at'),
                  })
                  .from(topics)
                  .where(
                    and(
                      eq(topics.id, topicId),
                      eq(topics.enabled, true),
                      // JSON array membership is case-insensitive and requires set expansion.
                      sql`EXISTS(SELECT 1 FROM jsonb_array_elements_text(${topics.redditCommunities}) c WHERE lower(c.value)=lower(${post.subreddit}))`,
                    ),
                  ),
              )
              .onConflictDoUpdate({
                target: [redditTopicPosts.topicId, redditTopicPosts.externalId],
                set: { lastSeenAt: sql`now()` },
              });
          }
        }
      })
      .catch((error: unknown) => {
        // Preserve the port's PostgreSQL errors after transaction rollback.
        if (error instanceof DrizzleQueryError && error.cause)
          throw error.cause;
        throw error;
      });
  }
}

export async function readRedditObservations(
  db: Pick<PoolClient, 'query'>,
  topicId: string,
  start: Date,
  end: Date,
) {
  // Read-only builder retains the publisher's existing transaction client.
  const orm = drizzle(db as PoolClient);
  const rows = await orm
    .select({
      externalId: socialPosts.externalId,
      url: socialPosts.canonicalUrl,
      author: socialPosts.author,
      authorUrl: socialPosts.authorUrl,
      publishedAt: socialPosts.publishedAt,
      observedAt: socialPosts.verifiedAt,
      metrics: sql<RedditPost['metrics']>`${socialPosts.metrics}`,
      metadata: sql<
        Omit<
          RedditPost,
          | 'platform'
          | 'externalId'
          | 'url'
          | 'author'
          | 'authorUrl'
          | 'publishedAt'
          | 'metrics'
        >
      >`${socialPosts.redditMetadata}`,
      citesX: sql<boolean>`${exists(orm.select({ id: redditXCitations.externalId }).from(redditXCitations).where(eq(redditXCitations.redditId, socialPosts.externalId)))}`,
    })
    .from(socialPosts)
    .innerJoin(
      redditTopicPosts,
      eq(redditTopicPosts.externalId, socialPosts.externalId),
    )
    .innerJoin(topics, eq(topics.id, redditTopicPosts.topicId))
    .where(
      and(
        eq(socialPosts.platform, 'reddit'),
        eq(topics.id, topicId),
        eq(topics.enabled, true),
        // PostgreSQL JSON set expansion preserves case-insensitive community membership.
        sql`EXISTS(SELECT 1 FROM jsonb_array_elements_text(${topics.redditCommunities}) c WHERE lower(c.value)=lower(${socialPosts.redditMetadata}->>'subreddit'))`,
        gte(
          socialPosts.publishedAt,
          sql`${start.toISOString()}::timestamptz - interval '7 days'`,
        ),
        lt(socialPosts.publishedAt, end.toISOString()),
      ),
    )
    .orderBy(desc(socialPosts.publishedAt), asc(socialPosts.externalId))
    .limit(5000);
  return rows.map((row) => ({
    post: {
      ...row.metadata,
      platform: 'reddit' as const,
      externalId: row.externalId,
      url: row.url,
      author: row.author,
      authorUrl: row.authorUrl,
      publishedAt: new Date(row.publishedAt!).toISOString(),
      metrics: row.metrics,
    },
    observedAt: new Date(row.observedAt).toISOString(),
    citesX: row.citesX,
  }));
}
