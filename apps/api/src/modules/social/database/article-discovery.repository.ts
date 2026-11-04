import {
  and,
  asc,
  DrizzleQueryError,
  eq,
  exists,
  isNotNull,
  isNull,
  notExists,
  or,
  sql,
} from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/node-postgres';
import { alias } from 'drizzle-orm/pg-core';

import { database } from '../../../libs/db/connections';
import {
  articleXDiscoveryChecks,
  contentItems,
  contentObservations,
  contentSources,
  topics,
  topicSourceConnections,
  xLinkCitations,
} from '../../../libs/db/schema';
import { extractXLinks } from '../../ingestion/public/discovery';
import type {
  ArticleDiscoveryRepository,
  DiscoveryArticle,
} from '../domain/article-discovery.port';
import type { DiscoveredLink } from '../domain/collection.port';

export class PostgresArticleDiscoveryRepository implements ArticleDiscoveryRepository {
  readonly db = database();
  async candidates(): Promise<DiscoveryArticle[]> {
    const db = drizzle(this.db);
    const failed = alias(articleXDiscoveryChecks, 'failed');
    const checked = alias(contentItems, 'checked');
    const publishers = db.$with('publishers').as(
      db
        .select({
          id: contentItems.id,
          url: contentItems.canonicalUrl,
          host: contentSources.articleDiscoveryHost,
          publishedAt: contentItems.publishedAt,
          topicId: sql<string>`${topics.id}`.as('topic_id'),
          position: topics.position,
          // Window ranks interleave publishers before ranking each topic.
          publisherRank:
            sql<number>`row_number() over(partition by ${topics.id}, ${contentSources.id} order by ${contentItems.publishedAt} desc, ${contentItems.id})`.as(
              'publisher_rank',
            ),
        })
        .from(contentItems)
        .innerJoin(
          contentObservations,
          eq(contentObservations.itemId, contentItems.id),
        )
        .innerJoin(
          contentSources,
          eq(contentSources.id, contentObservations.sourceId),
        )
        .innerJoin(
          topicSourceConnections,
          eq(topicSourceConnections.sourceId, contentSources.id),
        )
        .innerJoin(
          topics,
          and(
            eq(topics.id, topicSourceConnections.topicId),
            eq(topics.enabled, true),
          ),
        )
        .leftJoin(
          articleXDiscoveryChecks,
          eq(articleXDiscoveryChecks.itemId, contentItems.id),
        )
        .where(
          and(
            isNotNull(contentSources.articleDiscoveryHost),
            sql`${contentItems.canonicalUrl} like 'https://' || ${contentSources.articleDiscoveryHost} || '/%'`,
            sql`${contentItems.publishedAt} >= now() - interval '3 days'`,
            sql`${contentItems.publishedAt} <= now()`,
            notExists(
              db
                .select({ id: failed.itemId })
                .from(failed)
                .innerJoin(checked, eq(checked.id, failed.itemId))
                .where(
                  and(
                    isNotNull(failed.lastError),
                    sql`${failed.checkedAt} > now() - interval '1 day'`,
                    sql`${checked.canonicalUrl} like 'https://' || ${contentSources.articleDiscoveryHost} || '/%'`,
                  ),
                ),
            ),
            or(
              isNull(articleXDiscoveryChecks.itemId),
              sql`${articleXDiscoveryChecks.checkedAt} < now() - case when ${articleXDiscoveryChecks.lastError} is null then interval '7 days' else interval '1 day' end`,
            ),
          ),
        ),
    );
    const ranked = db.$with('ranked').as(
      db
        .select({
          id: publishers.id,
          url: publishers.url,
          host: publishers.host,
          position: publishers.position,
          rank: sql<number>`row_number() over(partition by ${publishers.topicId} order by ${publishers.publisherRank}, ${publishers.publishedAt} desc, ${publishers.id})`.as(
            'rank',
          ),
        })
        .from(publishers),
    );
    const rows = await db
      .with(publishers, ranked)
      .select({ id: ranked.id, url: ranked.url, host: ranked.host })
      .from(ranked)
      .groupBy(ranked.id, ranked.url, ranked.host)
      .orderBy(
        asc(sql`min(${ranked.rank})`),
        asc(sql`min(${ranked.position})`),
        asc(ranked.id),
      )
      .limit(8);
    // The query excludes null hosts before ranking.
    return rows.map((row) => ({ ...row, host: row.host! }));
  }

  async record(article: DiscoveryArticle, links: DiscoveredLink[] | null) {
    const validated = extractXLinks(
      (links ?? []).map((l) => l.verificationUrl ?? l.url).join(' '),
    );
    await drizzle(this.db)
      .transaction(async (tx) => {
        for (const link of validated) {
          await tx
            .insert(xLinkCitations)
            .select(
              tx
                .select({
                  externalId: sql<string>`${link.externalId}`.as('external_id'),
                  itemId: contentItems.id,
                  sourceId: contentSources.id,
                  canonicalUrl: sql<string>`${link.url}`.as('canonical_url'),
                  citingEngagement: contentItems.engagement,
                  firstSeenAt: sql<string>`now()`.as('first_seen_at'),
                  lastSeenAt: sql<string>`now()`.as('last_seen_at'),
                  verificationUrl: sql<
                    string | null
                  >`${link.verificationUrl ?? null}`.as('verification_url'),
                })
                .from(contentItems)
                .innerJoin(
                  contentObservations,
                  eq(contentObservations.itemId, contentItems.id),
                )
                .innerJoin(
                  contentSources,
                  eq(contentSources.id, contentObservations.sourceId),
                )
                .where(
                  and(
                    eq(contentItems.id, article.id),
                    eq(contentSources.articleDiscoveryHost, article.host),
                    exists(
                      tx
                        .select({ id: topics.id })
                        .from(topicSourceConnections)
                        .innerJoin(
                          topics,
                          eq(topics.id, topicSourceConnections.topicId),
                        )
                        .where(
                          and(
                            eq(
                              topicSourceConnections.sourceId,
                              contentSources.id,
                            ),
                            eq(topics.enabled, true),
                          ),
                        ),
                    ),
                  ),
                ),
            )
            .onConflictDoUpdate({
              target: [
                xLinkCitations.externalId,
                xLinkCitations.itemId,
                xLinkCitations.sourceId,
              ],
              set: {
                lastSeenAt: sql`now()`,
                verificationUrl: sql`coalesce(excluded.verification_url, ${xLinkCitations.verificationUrl})`,
              },
            });
        }
        const values = {
          itemId: article.id,
          lastError:
            links === null ? 'Public publisher page unavailable' : null,
          linkCount: validated.length,
        };
        await tx
          .insert(articleXDiscoveryChecks)
          .values(values)
          .onConflictDoUpdate({
            target: articleXDiscoveryChecks.itemId,
            set: { ...values, checkedAt: sql`now()` },
          });
      })
      .catch((error: unknown) => {
        // Preserve the repository's PostgreSQL errors after Drizzle rolls back.
        throw error instanceof DrizzleQueryError && error.cause
          ? error.cause
          : error;
      });
  }
}
