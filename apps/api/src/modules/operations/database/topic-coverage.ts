import {
  and,
  asc,
  count,
  countDistinct,
  eq,
  gte,
  isNull,
  lt,
  lte,
  sql,
} from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/node-postgres';
import type { Pool } from 'pg';

import {
  contentItems,
  contentObservations,
  contentSources,
  redditTopicPosts,
  redditXCitations,
  socialDiscoveryCitations,
  socialDiscoverySources,
  socialPosts,
  topics,
  topicSourceConnections,
  xLinkCitations,
  xSearchCitations,
} from '../../../libs/db/schema';

// Collection scope is not an editorial relevance or quality assessment.
export async function readTopicCoverage(db: Pick<Pool, 'query'>, end: Date) {
  const start = new Date(end.getTime() - 86400000);
  const orm = drizzle(db as Pool);
  // UNION (rather than UNION ALL) counts each platform/post/topic once across
  // discovery routes, without treating citation breadth as outlet independence.
  const postTopics = orm.$with('post_topics').as(
    orm
      .select({
        platform: sql<string>`'x'`.as('post_platform'),
        externalId: xLinkCitations.externalId,
        topicId: sql<string | null>`${topicSourceConnections.topicId}`.as(
          'topic_id',
        ),
      })
      .from(xLinkCitations)
      .innerJoin(
        topicSourceConnections,
        eq(topicSourceConnections.sourceId, xLinkCitations.sourceId),
      )
      .union(
        orm
          .select({
            platform: sql<string>`'x'`,
            externalId: socialDiscoveryCitations.externalId,
            topicId: socialDiscoverySources.topicId,
          })
          .from(socialDiscoveryCitations)
          .innerJoin(
            socialDiscoverySources,
            eq(socialDiscoverySources.id, socialDiscoveryCitations.sourceId),
          ),
      )
      .union(
        orm
          .select({
            platform: sql<string>`'x'`,
            externalId: xSearchCitations.externalId,
            topicId: xSearchCitations.topicId,
          })
          .from(xSearchCitations),
      )
      .union(
        orm
          .select({
            platform: sql<string>`'x'`,
            externalId: redditXCitations.externalId,
            topicId: redditTopicPosts.topicId,
          })
          .from(redditXCitations)
          .innerJoin(
            redditTopicPosts,
            eq(redditTopicPosts.externalId, redditXCitations.redditId),
          ),
      )
      .union(
        orm
          .select({
            platform: sql<string>`'reddit'`,
            externalId: redditTopicPosts.externalId,
            topicId: redditTopicPosts.topicId,
          })
          .from(redditTopicPosts),
      ),
  );
  const connected = orm
    .select({ value: count().as('value') })
    .from(topicSourceConnections)
    .where(eq(topicSourceConnections.topicId, topics.id));
  const healthy = orm
    .select({ value: count().as('value') })
    .from(topicSourceConnections)
    .innerJoin(
      contentSources,
      eq(contentSources.id, topicSourceConnections.sourceId),
    )
    .where(
      and(
        eq(topicSourceConnections.topicId, topics.id),
        isNull(contentSources.lastError),
        gte(
          contentSources.lastSuccess,
          new Date(end.getTime() - 3600000).toISOString(),
        ),
        lte(contentSources.lastSuccess, end.toISOString()),
      ),
    );
  const articles = orm
    .select({ value: countDistinct(contentItems.id).as('value') })
    .from(topicSourceConnections)
    .innerJoin(
      contentObservations,
      eq(contentObservations.sourceId, topicSourceConnections.sourceId),
    )
    .innerJoin(contentItems, eq(contentItems.id, contentObservations.itemId))
    .where(
      and(
        eq(topicSourceConnections.topicId, topics.id),
        gte(contentItems.publishedAt, start.toISOString()),
        lt(contentItems.publishedAt, end.toISOString()),
      ),
    );
  const posts = (platform: 'x' | 'reddit') =>
    orm
      .select({ value: count().as('value') })
      .from(postTopics)
      .innerJoin(
        socialPosts,
        and(
          eq(socialPosts.platform, postTopics.platform),
          eq(socialPosts.externalId, postTopics.externalId),
        ),
      )
      .where(
        and(
          eq(postTopics.topicId, topics.id),
          eq(socialPosts.platform, platform),
          gte(socialPosts.publishedAt, start.toISOString()),
          lt(socialPosts.publishedAt, end.toISOString()),
        ),
      );
  // Scalar subqueries need an explicit numeric decoder; PostgreSQL count is int8.
  const rows = await orm
    .with(postTopics)
    .select({
      topicId: topics.id,
      name: topics.name,
      enabled: topics.enabled,
      connectedSources: sql<number>`(${connected})`.mapWith(Number),
      healthySources: sql<number>`(${healthy})`.mapWith(Number),
      articles: sql<number>`(${articles})`.mapWith(Number),
      xPosts: sql<number>`(${posts('x')})`.mapWith(Number),
      redditPosts: sql<number>`(${posts('reddit')})`.mapWith(Number),
    })
    .from(topics)
    .orderBy(asc(topics.position), asc(topics.id));
  return { start: start.toISOString(), end: end.toISOString(), topics: rows };
}
