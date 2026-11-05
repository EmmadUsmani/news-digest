import { Injectable, OnModuleDestroy } from '@nestjs/common';
import {
  and,
  asc,
  desc,
  DrizzleQueryError,
  eq,
  exists,
  gte,
  lt,
  notLike,
  sql,
} from 'drizzle-orm';
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
        and(
          eq(contentSources.enabled, true),
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
  async latest(window?: { topicId: string; start: Date; end: Date }) {
    const latestItems = this.orm
      .select({
        id: contentItems.id,
        title: contentItems.title,
        url: sql`${contentItems.canonicalUrl}`.as('url'),
        // Keep PostgreSQL's JSON timestamp representation, rather than mapping to Date.
        publishedAt: sql`${contentItems.publishedAt}`.as('publishedAt'),
        source: sql<string>`min(${contentSources.name})`.as('source'),
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
      .where(
        and(
          eq(topicSourceConnections.topicId, topics.id),
          notLike(contentItems.canonicalUrl, '%/betting/%'),
          window
            ? gte(contentItems.publishedAt, window.start.toISOString())
            : undefined,
          window
            ? lt(contentItems.publishedAt, window.end.toISOString())
            : undefined,
        ),
      )
      .groupBy(contentItems.id)
      .orderBy(desc(contentItems.publishedAt), asc(contentItems.id))
      .limit(window ? 500 : 5);
    return this.orm
      .select({
        topicId: topics.id,
        // Drizzle has no nested row-to-JSON aggregation builder. The correlated
        // query above owns joins, filters, grouping, ordering and the topic limit.
        items: sql`(select coalesce(jsonb_agg(r), '[]'::jsonb) from (${latestItems}) r)`,
      })
      .from(topics)
      .where(window ? eq(topics.id, window.topicId) : eq(topics.enabled, true))
      .orderBy(asc(topics.position));
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
