import {
  and,
  desc,
  DrizzleQueryError,
  eq,
  exists,
  isNotNull,
  isNull,
  lt,
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
  xSearchTopicSettings,
} from '../../../libs/db/schema';
import type { SocialPost } from '../domain/posts';
import { xPostTime } from '../domain/x-post-time';

export class PostgresSocialRepository {
  readonly db = database();
  // Missing configuration stays explicit; callers must not silently invent thresholds.
  async searchSettings(topicId: string) {
    const [settings] = await drizzle(this.db)
      .select()
      .from(xSearchTopicSettings)
      .where(eq(xSearchTopicSettings.topicId, topicId));
    return settings ?? null;
  }
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
    const db = drizzle(this.db);
    const citations = db.$with('citations').as(
      unionAll(
        db
          .select({
            externalId: xLinkCitations.externalId,
            sourceId: xLinkCitations.sourceId,
            lastSeenAt: xLinkCitations.lastSeenAt,
            topicId: sql<string | null>`${topicSourceConnections.topicId}`.as(
              'topic_id',
            ),
          })
          .from(xLinkCitations)
          .innerJoin(
            topicSourceConnections,
            eq(topicSourceConnections.sourceId, xLinkCitations.sourceId),
          ),
        db
          .select({
            externalId: socialDiscoveryCitations.externalId,
            sourceId: sql<string>`'river:' || ${socialDiscoveryCitations.sourceId}`,
            lastSeenAt: socialDiscoveryCitations.lastSeenAt,
            topicId: socialDiscoverySources.topicId,
          })
          .from(socialDiscoveryCitations)
          .innerJoin(
            socialDiscoverySources,
            eq(socialDiscoverySources.id, socialDiscoveryCitations.sourceId),
          ),
        db
          .select({
            externalId: redditXCitations.externalId,
            sourceId: sql<string>`'reddit:' || lower(${socialPosts.redditMetadata}->>'subreddit')`,
            lastSeenAt: redditXCitations.lastSeenAt,
            topicId: redditTopicPosts.topicId,
          })
          .from(redditXCitations)
          .innerJoin(
            redditTopicPosts,
            eq(redditTopicPosts.externalId, redditXCitations.redditId),
          )
          .innerJoin(
            socialPosts,
            and(
              eq(socialPosts.platform, 'reddit'),
              eq(socialPosts.externalId, redditXCitations.redditId),
            ),
          ),
        db
          .select({
            externalId: xSearchCitations.externalId,
            sourceId: sql<string>`'x-search'`,
            lastSeenAt: xSearchCitations.discoveredAt,
            topicId: xSearchCitations.topicId,
          })
          .from(xSearchCitations),
      ),
    );
    const eligible = db.$with('eligible').as(
      db
        .select({
          externalId: citations.externalId,
          topicId: citations.topicId,
          refresh:
            sql<number>`case when ${socialPosts.externalId} is null then 0 else 1 end`.as(
              'refresh',
            ),
          sources: sql<number>`count(distinct ${citations.sourceId})`.as(
            'sources',
          ),
          lastSeen: sql<string>`max(${citations.lastSeenAt})`.as('last_seen'),
        })
        .from(citations)
        .innerJoin(
          topics,
          and(eq(topics.id, citations.topicId), eq(topics.enabled, true)),
        )
        .leftJoin(
          xEmbedChecks,
          eq(xEmbedChecks.externalId, citations.externalId),
        )
        .leftJoin(
          socialPosts,
          and(
            eq(socialPosts.platform, 'x'),
            eq(socialPosts.externalId, citations.externalId),
          ),
        )
        .where(
          or(
            isNull(xEmbedChecks.checkedAt),
            lt(xEmbedChecks.checkedAt, sql`now() - interval '1 day'`),
          ),
        )
        .groupBy(
          citations.externalId,
          citations.topicId,
          socialPosts.externalId,
        ),
    );
    const ranked = db.$with('ranked').as(
      db
        .select({
          externalId: eligible.externalId,
          refresh: eligible.refresh,
          sources: eligible.sources,
          lastSeen: eligible.lastSeen,
          // Window functions are SQL expressions; builders handle the surrounding CTEs.
          topicRank: sql<number>`row_number() over (
            partition by ${eligible.refresh}, ${eligible.topicId}
            order by ${eligible.sources} desc, ${eligible.lastSeen} desc,
              length(${eligible.externalId}) desc, ${eligible.externalId} desc
          )`.as('topic_rank'),
        })
        .from(eligible),
    );
    const rows = await db
      .with(citations, eligible, ranked)
      .select({ externalId: ranked.externalId })
      .from(ranked)
      .groupBy(ranked.externalId)
      .orderBy(
        sql`min(${ranked.refresh})`,
        sql`min(${ranked.topicRank})`,
        desc(sql`max(${ranked.sources})`),
        desc(sql`max(${ranked.lastSeen})`),
        desc(sql`length(${ranked.externalId})`),
        desc(ranked.externalId),
      )
      .limit(Math.min(50, Math.max(1, limit)));
    return rows.map((row) => row.externalId);
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
