import { and, DrizzleQueryError, eq, exists, sql } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/node-postgres';

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
    return (
      // Two window rankings and grouped minimum ordering retain publisher/topic fairness.
      (
        await drizzle(this.db).execute<{
          id: string;
          url: string;
          host: string;
        }>(
          sql`WITH publishers AS (
        SELECT i.id,i.canonical_url AS url,s.article_discovery_host AS host,
          i.published_at,t.id AS topic_id,t.position,
          row_number() OVER(PARTITION BY t.id,s.id ORDER BY i.published_at DESC,i.id) AS publisher_rank
        FROM content_items i JOIN content_observations o ON o.item_id=i.id
        JOIN content_sources s ON s.id=o.source_id
        JOIN topic_source_connections c ON c.source_id=s.id
        JOIN topics t ON t.id=c.topic_id AND t.enabled
        LEFT JOIN article_x_discovery_checks v ON v.item_id=i.id
        WHERE s.article_discovery_host IS NOT NULL
          AND i.canonical_url LIKE 'https://' || s.article_discovery_host || '/%'
          AND i.published_at >= now()-interval '3 days' AND i.published_at <= now()
          AND NOT EXISTS (
            SELECT 1 FROM article_x_discovery_checks failed
            JOIN content_items checked ON checked.id=failed.item_id
            WHERE failed.last_error IS NOT NULL
              AND failed.checked_at > now()-interval '1 day'
              AND checked.canonical_url LIKE 'https://' || s.article_discovery_host || '/%'
          )
          AND (v.item_id IS NULL OR v.checked_at < now() -
               CASE WHEN v.last_error IS NULL THEN interval '7 days' ELSE interval '1 day' END)
      ), ranked AS (
        SELECT *,row_number() OVER(PARTITION BY topic_id
          ORDER BY publisher_rank,published_at DESC,id) AS rank FROM publishers
      ) SELECT id,url,host FROM ranked GROUP BY id,url,host
        ORDER BY min(rank),min(position),id LIMIT 8`,
        )
      ).rows
    );
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
