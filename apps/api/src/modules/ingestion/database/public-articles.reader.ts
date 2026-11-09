import { and, asc, desc, eq, notLike, sql } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/node-postgres';
import type { Pool } from 'pg';

import {
  contentItems,
  contentObservations,
  contentSources,
  topics,
  topicSourceConnections,
} from '../../../libs/db/schema';
import { readPublicArticles } from '../../../public-read/articles';

// Disconnected preparation: text and hostname review precedes route promotion.
// Always reads the system catalog; the caller retains pool ownership.
export class PublicArticlesReader {
  constructor(private readonly pool: Pool) {}

  read() {
    return readPublicArticles(async () => {
      const db = drizzle(this.pool);
      const latestItems = db
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
          ),
        )
        .groupBy(contentItems.id)
        .orderBy(desc(contentItems.publishedAt), asc(contentItems.id))
        .limit(5);
      return db
        .select({
          topicId: topics.id,
          // Drizzle has no nested row-to-JSON aggregation builder. The correlated
          // query above owns joins, filters, grouping, ordering and the topic limit.
          items: sql`(select coalesce(jsonb_agg(r), '[]'::jsonb) from (${latestItems}) r)`,
        })
        .from(topics)
        .where(eq(topics.enabled, true))
        .orderBy(asc(topics.position), asc(topics.id));
    });
  }
}
