import {
  and,
  desc,
  DrizzleQueryError,
  eq,
  exists,
  isNotNull,
  isNull,
  or,
  sql,
} from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/node-postgres';
import { unionAll } from 'drizzle-orm/pg-core';

import { database } from '../../../libs/db/connections';
import {
  redditTopicPosts,
  redditXCitations,
  socialDiscoveryCitations,
  socialDiscoverySources,
  socialPosts,
  topics,
  topicSourceConnections,
  xEmbedChecks,
  xLinkCitations,
  xSearchCitations,
} from '../../../libs/db/schema';
import type { SocialPost } from '../domain/posts';
import { xPostTime } from '../domain/x-post-time';

export class PostgresSocialRepository {
  readonly db = database();
  async topicPosts(topicId: string) {
    // Source association is discovery scope only; relevance must use post text.
    const orm = drizzle(this.db);
    const rows = await orm
      .select({
        externalId: socialPosts.externalId,
        publishedAt: socialPosts.publishedAt,
        embedHtml: socialPosts.embedHtml,
      })
      .from(socialPosts)
      .where(
        and(
          eq(socialPosts.platform, 'x'),
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
      .orderBy(
        sql`${socialPosts.publishedAt} desc nulls last`,
        socialPosts.externalId,
      );
    return rows.map((row) => ({
      ...row,
      publishedAt: row.publishedAt === null ? null : new Date(row.publishedAt),
    }));
  }
  async candidates(limit: number): Promise<string[]> {
    // Unioned citation provenance, window ranks and grouped minimum ordering preserve
    // topic fairness and prioritize unverified discoveries over refreshes.
    const result = await drizzle(this.db).execute<{ external_id: string }>(
      sql`WITH citations AS (
         SELECT c.external_id,c.source_id,c.last_seen_at,t.topic_id
         FROM x_link_citations c JOIN topic_source_connections t ON t.source_id=c.source_id
         UNION ALL
         SELECT c.external_id,'river:' || c.source_id,c.last_seen_at,s.topic_id
         FROM social_discovery_citations c JOIN social_discovery_sources s ON s.id=c.source_id
         UNION ALL
         SELECT c.external_id,'reddit:' || lower(p.reddit_metadata->>'subreddit'),c.last_seen_at,r.topic_id
         FROM reddit_x_citations c JOIN reddit_topic_posts r ON r.external_id=c.reddit_id
         JOIN social_posts p ON p.platform='reddit' AND p.external_id=c.reddit_id
         UNION ALL
         SELECT c.external_id,'x-search',c.discovered_at,c.topic_id FROM x_search_citations c
       ), eligible AS (
         SELECT c.external_id,c.topic_id,
                CASE WHEN p.external_id IS NULL THEN 0 ELSE 1 END AS refresh,
                count(DISTINCT c.source_id) AS sources,max(c.last_seen_at) AS last_seen
         FROM citations c JOIN topics t ON t.id=c.topic_id AND t.enabled
         LEFT JOIN x_embed_checks v ON v.external_id=c.external_id
         LEFT JOIN social_posts p ON p.platform='x' AND p.external_id=c.external_id
         WHERE v.checked_at IS NULL OR v.checked_at < now() - interval '1 day'
         GROUP BY c.external_id,c.topic_id,p.external_id
       ), ranked AS (
         SELECT *,row_number() OVER (
           PARTITION BY refresh,topic_id
           ORDER BY sources DESC,last_seen DESC,length(external_id) DESC,external_id DESC
         ) AS topic_rank FROM eligible
       ) SELECT external_id FROM ranked
       GROUP BY external_id
       ORDER BY min(refresh),min(topic_rank),max(sources) DESC,max(last_seen) DESC,
                length(external_id) DESC,external_id DESC LIMIT ${Math.min(50, Math.max(1, limit))}`,
    );
    return result.rows.map((row) => row.external_id);
  }
  async discoverySources() {
    return drizzle(this.db)
      .select({
        id: socialDiscoverySources.id,
        url: socialDiscoverySources.url,
      })
      .from(socialDiscoverySources)
      .innerJoin(topics, eq(topics.id, socialDiscoverySources.topicId))
      .where(eq(topics.enabled, true))
      .orderBy(socialDiscoverySources.id);
  }
  async discovered(
    sourceId: string,
    links: { externalId: string; url: string; verificationUrl?: string }[],
  ) {
    await drizzle(this.db)
      .transaction(async (tx) => {
        for (const link of links) {
          await tx
            .insert(socialDiscoveryCitations)
            .values({
              sourceId,
              externalId: link.externalId,
              canonicalUrl: link.url,
              verificationUrl: link.verificationUrl ?? null,
            })
            .onConflictDoUpdate({
              target: [
                socialDiscoveryCitations.sourceId,
                socialDiscoveryCitations.externalId,
              ],
              set: {
                lastSeenAt: sql`now()`,
                verificationUrl: sql`coalesce(excluded.verification_url, ${socialDiscoveryCitations.verificationUrl})`,
              },
            });
        }
        await tx
          .update(socialDiscoverySources)
          .set({
            lastSuccess: sql`now()`,
            lastError: null,
            lastLinkCount: links.length,
          })
          .where(eq(socialDiscoverySources.id, sourceId));
      })
      .catch((error: unknown) => {
        // Preserve native PostgreSQL errors after the transaction has rolled back.
        throw error instanceof DrizzleQueryError && error.cause
          ? error.cause
          : error;
      });
  }
  async discoveryFailed(sourceId: string) {
    await drizzle(this.db)
      .update(socialDiscoverySources)
      .set({ lastError: 'Public discovery page unavailable' })
      .where(eq(socialDiscoverySources.id, sourceId));
  }
  async verificationUrl(externalId: string): Promise<string | undefined> {
    const orm = drizzle(this.db);
    const citations = unionAll(
      orm
        .select({
          url: xLinkCitations.verificationUrl,
          seen: xLinkCitations.lastSeenAt,
        })
        .from(xLinkCitations)
        .where(eq(xLinkCitations.externalId, externalId)),
      orm
        .select({
          url: socialDiscoveryCitations.verificationUrl,
          seen: socialDiscoveryCitations.lastSeenAt,
        })
        .from(socialDiscoveryCitations)
        .where(eq(socialDiscoveryCitations.externalId, externalId)),
      orm
        .select({
          url: redditXCitations.verificationUrl,
          seen: redditXCitations.lastSeenAt,
        })
        .from(redditXCitations)
        .where(eq(redditXCitations.externalId, externalId)),
      orm
        .select({
          url: xSearchCitations.verificationUrl,
          seen: xSearchCitations.discoveredAt,
        })
        .from(xSearchCitations)
        .where(eq(xSearchCitations.externalId, externalId)),
    ).as('citations');
    const rows = await orm
      .select({ url: citations.url })
      .from(citations)
      .where(isNotNull(citations.url))
      .orderBy(desc(citations.seen))
      .limit(1);
    return rows[0]?.url ?? undefined;
  }
  async store(post: SocialPost) {
    await drizzle(this.db)
      .insert(socialPosts)
      .values({
        platform: post.platform,
        externalId: post.externalId,
        canonicalUrl: post.url,
        author: post.author,
        authorUrl: post.authorUrl,
        publishedAt: post.publishedAt,
        metrics: post.metrics,
        embedHtml: post.embedHtml,
      })
      .onConflictDoUpdate({
        target: [socialPosts.platform, socialPosts.externalId],
        set: {
          publishedAt: sql`coalesce(excluded.published_at, ${socialPosts.publishedAt})`,
          author: post.author,
          authorUrl: post.authorUrl,
          embedHtml: post.embedHtml,
          verifiedAt: sql`now()`,
        },
      });
  }
  async refreshMissingTimes(now = new Date()): Promise<number> {
    const orm = drizzle(this.db);
    const posts = await orm
      .select({ externalId: socialPosts.externalId })
      .from(socialPosts)
      .where(
        and(eq(socialPosts.platform, 'x'), isNull(socialPosts.publishedAt)),
      );
    let updated = 0;
    for (const post of posts) {
      const time = xPostTime(post.externalId, now);
      if (!time) continue;
      const result = await orm
        .update(socialPosts)
        .set({ publishedAt: time })
        .where(
          and(
            eq(socialPosts.platform, 'x'),
            eq(socialPosts.externalId, post.externalId),
            isNull(socialPosts.publishedAt),
          ),
        );
      updated += result.rowCount ?? 0;
    }
    return updated;
  }
  async checked(externalId: string, error: string | null) {
    await drizzle(this.db)
      .insert(xEmbedChecks)
      .values({ externalId, error })
      .onConflictDoUpdate({
        target: xEmbedChecks.externalId,
        set: { checkedAt: sql`now()`, error },
      });
  }
}
