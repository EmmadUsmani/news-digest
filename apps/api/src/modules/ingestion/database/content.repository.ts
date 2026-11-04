import { Injectable, OnModuleDestroy } from '@nestjs/common';
import { and, asc, DrizzleQueryError, eq, exists, sql } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/node-postgres';

import { database } from '../../../libs/db/connections';
import {
  contentItems,
  contentObservations,
  contentSources,
  topics,
  topicSourceConnections,
  xLinkCitations,
} from '../../../libs/db/schema';
import { ContentItem, ContentRepository, Source } from '../domain/ports';
import { extractXLinks } from '../domain/x-links';
@Injectable()
export class PostgresContentRepository
  extends ContentRepository
  implements OnModuleDestroy
{
  readonly db = database();
  private readonly orm = drizzle(this.db);
  async sources(): Promise<Source[]> {
    return this.orm
      .select({
        id: contentSources.id,
        topicId: contentSources.topicId,
        name: contentSources.name,
        kind: contentSources.kind,
        url: contentSources.url,
      })
      .from(contentSources)
      .where(
        exists(
          this.orm
            .select({ id: topicSourceConnections.sourceId })
            .from(topicSourceConnections)
            .innerJoin(topics, eq(topics.id, topicSourceConnections.topicId))
            .where(
              and(
                eq(topicSourceConnections.sourceId, contentSources.id),
                eq(topics.enabled, true),
              ),
            ),
        ),
      )
      .orderBy(asc(contentSources.id)) as Promise<Source[]>;
  }
  async store(source: Source, items: ContentItem[]) {
    await this.orm
      .transaction(async (tx) => {
        for (const item of items) {
          const [row] = await tx
            .insert(contentItems)
            .values({
              canonicalUrl: item.url,
              title: item.title,
              excerpt: item.excerpt,
              author: item.author,
              publishedAt: item.publishedAt,
              imageUrl: item.imageUrl,
              engagement: item.engagement,
            })
            .onConflictDoUpdate({
              target: contentItems.canonicalUrl,
              set: {
                title: sql`excluded.title`,
                excerpt: sql`excluded.excerpt`,
                engagement: sql`${contentItems.engagement} || excluded.engagement`,
              },
            })
            .returning({ id: contentItems.id });
          await tx
            .insert(contentObservations)
            .values({ sourceId: source.id, itemId: row.id })
            .onConflictDoNothing();
          // Revalidate at the persistence boundary; source content is untrusted.
          const links = extractXLinks(
            [
              item.url,
              ...(item.xLinks ?? []).map(
                (link) => link.verificationUrl ?? link.url,
              ),
            ].join(' '),
          );
          for (const link of links) {
            await tx
              .insert(xLinkCitations)
              .values({
                externalId: link.externalId,
                itemId: row.id,
                sourceId: source.id,
                canonicalUrl: link.url,
                citingEngagement: item.engagement,
                verificationUrl: link.verificationUrl ?? null,
              })
              .onConflictDoUpdate({
                target: [
                  xLinkCitations.externalId,
                  xLinkCitations.itemId,
                  xLinkCitations.sourceId,
                ],
                set: {
                  lastSeenAt: sql`now()`,
                  citingEngagement: sql`excluded.citing_engagement`,
                  verificationUrl: sql`coalesce(excluded.verification_url, ${xLinkCitations.verificationUrl})`,
                },
              });
          }
        }
        await tx
          .update(contentSources)
          .set({
            lastAttempt: sql`now()`,
            lastSuccess: sql`now()`,
            lastError: null,
            lastItemCount: items.length,
          })
          .where(eq(contentSources.id, source.id));
      })
      .catch((error: unknown) => {
        if (error instanceof DrizzleQueryError && error.cause)
          throw error.cause;
        throw error;
      });
  }
  async failed(source: Source, message: string) {
    await this.orm
      .update(contentSources)
      .set({ lastAttempt: sql`now()`, lastError: message.slice(0, 300) })
      .where(eq(contentSources.id, source.id));
  }
  async latest() {
    return (
      // Nested per-topic top-five JSON aggregation preserves PostgreSQL timestamp JSON
      // and aggregation semantics that the query builder cannot express directly.
      (
        await this.orm.execute(
          sql`SELECT t.id AS "topicId", COALESCE((SELECT jsonb_agg(r) FROM (SELECT i.id,i.title,i.canonical_url AS url,i.published_at AS "publishedAt", min(s.name) AS source FROM content_items i JOIN content_observations o ON o.item_id=i.id JOIN content_sources s ON s.id=o.source_id JOIN topic_source_connections c ON c.source_id=s.id WHERE c.topic_id=t.id AND i.canonical_url NOT LIKE '%/betting/%' GROUP BY i.id ORDER BY i.published_at DESC LIMIT 5) r),'[]') AS items FROM topics t WHERE t.enabled ORDER BY t.position`,
        )
      ).rows
    );
  }
  async status() {
    return this.orm
      .select({
        id: contentSources.id,
        name: contentSources.name,
        url: contentSources.url,
        topicId: contentSources.topicId,
        lastAttempt: sql`${contentSources.lastAttempt}`.mapWith(
          (value: string) => new Date(value),
        ),
        lastSuccess: sql`${contentSources.lastSuccess}`.mapWith(
          (value: string) => new Date(value),
        ),
        error: contentSources.lastError,
        lastItemCount: contentSources.lastItemCount,
        storedItems: sql<number>`count(${contentObservations.itemId})::int`,
      })
      .from(contentSources)
      .leftJoin(
        contentObservations,
        eq(contentObservations.sourceId, contentSources.id),
      )
      .groupBy(contentSources.id)
      .orderBy(asc(contentSources.id));
  }
  async onModuleDestroy() {
    await this.db.end();
  }
}
