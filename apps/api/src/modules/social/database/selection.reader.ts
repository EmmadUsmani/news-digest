import {
  and,
  desc,
  eq,
  exists,
  gte,
  inArray,
  isNotNull,
  lt,
  lte,
  or,
  sql,
} from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/node-postgres';
import type { PoolClient } from 'pg';

import {
  redditTopicPosts,
  redditXCitations,
  socialDiscoveryCitations,
  socialDiscoverySources,
  socialPosts,
  topicSourceConnections,
  xLinkCitations,
  xSearchCitations,
} from '../../../libs/db/schema';
import type { XReportedEngagement } from '../domain/x-search.port';

// Stay on the publisher's client so posts, citations and stories share its snapshot.
export async function readSelectionPosts(
  db: Pick<PoolClient, 'query'>,
  topicId: string,
  start: Date,
  end: Date,
) {
  const orm = drizzle(db as PoolClient);
  // JSON timestamps require a PostgreSQL cast before cutoff comparison and ordering.
  const observedAt = sql`(${xSearchCitations.reportedEngagement}->>'observedAt')::timestamptz`;
  const engagement = orm
    .select({ value: xSearchCitations.reportedEngagement })
    .from(xSearchCitations)
    .where(
      and(
        eq(xSearchCitations.externalId, socialPosts.externalId),
        eq(xSearchCitations.topicId, topicId),
        isNotNull(xSearchCitations.reportedEngagement),
        lte(observedAt, end.toISOString()),
      ),
    )
    .orderBy(desc(observedAt), xSearchCitations.callId)
    .limit(1);
  const rows = await orm
    .select({
      externalId: socialPosts.externalId,
      url: socialPosts.canonicalUrl,
      author: socialPosts.author,
      authorUrl: socialPosts.authorUrl,
      publishedAt: socialPosts.publishedAt,
      embedHtml: socialPosts.embedHtml,
      metrics: socialPosts.metrics,
      reportedEngagement: sql<XReportedEngagement | null>`(${engagement})`,
    })
    .from(socialPosts)
    .where(
      and(
        eq(socialPosts.platform, 'x'),
        gte(socialPosts.publishedAt, start.toISOString()),
        lt(socialPosts.publishedAt, end.toISOString()),
        or(
          exists(
            orm
              .select({ id: xLinkCitations.externalId })
              .from(xLinkCitations)
              .innerJoin(
                topicSourceConnections,
                eq(topicSourceConnections.sourceId, xLinkCitations.sourceId),
              )
              .where(
                and(
                  eq(xLinkCitations.externalId, socialPosts.externalId),
                  eq(topicSourceConnections.topicId, topicId),
                ),
              ),
          ),
          exists(
            orm
              .select({ id: socialDiscoveryCitations.externalId })
              .from(socialDiscoveryCitations)
              .innerJoin(
                socialDiscoverySources,
                eq(
                  socialDiscoverySources.id,
                  socialDiscoveryCitations.sourceId,
                ),
              )
              .where(
                and(
                  eq(
                    socialDiscoveryCitations.externalId,
                    socialPosts.externalId,
                  ),
                  eq(socialDiscoverySources.topicId, topicId),
                ),
              ),
          ),
          exists(
            orm
              .select({ id: redditXCitations.externalId })
              .from(redditXCitations)
              .innerJoin(
                redditTopicPosts,
                eq(redditTopicPosts.externalId, redditXCitations.redditId),
              )
              .where(
                and(
                  eq(redditXCitations.externalId, socialPosts.externalId),
                  eq(redditTopicPosts.topicId, topicId),
                ),
              ),
          ),
          exists(
            orm
              .select({ id: xSearchCitations.externalId })
              .from(xSearchCitations)
              .where(
                and(
                  eq(xSearchCitations.externalId, socialPosts.externalId),
                  eq(xSearchCitations.topicId, topicId),
                ),
              ),
          ),
        ),
      ),
    )
    .orderBy(desc(socialPosts.publishedAt), socialPosts.externalId)
    .limit(500);
  return rows.map((row) => ({
    ...row,
    publishedAt: new Date(row.publishedAt!),
    metrics: row.metrics as Record<string, number>,
  }));
}

export async function readStoryCitations(
  db: Pick<PoolClient, 'query'>,
  postIds: string[],
  storyIds: string[],
) {
  if (!postIds.length || !storyIds.length) return [];
  return drizzle(db as PoolClient)
    .selectDistinct({
      externalId: xLinkCitations.externalId,
      itemId: xLinkCitations.itemId,
    })
    .from(xLinkCitations)
    .where(
      and(
        inArray(xLinkCitations.externalId, postIds),
        inArray(xLinkCitations.itemId, storyIds),
      ),
    );
}
