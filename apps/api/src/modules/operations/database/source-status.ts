import { and, asc, count, eq, exists, sql } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/node-postgres';
import type { Pool } from 'pg';

import {
  contentItems,
  contentObservations,
  contentSources,
  topics,
  topicSourceConnections,
} from '../../../libs/db/schema';

export async function readSourceStatus(db: Pool, end = new Date()) {
  const orm = drizzle(db);
  const cutoff = end.toISOString();
  const day = new Date(end.getTime() - 86_400_000).toISOString();
  const week = new Date(end.getTime() - 7 * 86_400_000).toISOString();
  const connected = orm
    .select({ id: topicSourceConnections.sourceId })
    .from(topicSourceConnections)
    .innerJoin(topics, eq(topics.id, topicSourceConnections.topicId))
    .where(
      and(
        eq(topicSourceConnections.sourceId, contentSources.id),
        eq(topics.enabled, true),
      ),
    );
  const rows = await orm
    .select({
      id: contentSources.id,
      name: contentSources.name,
      lastAttempt: contentSources.lastAttempt,
      lastSuccess: contentSources.lastSuccess,
      error: contentSources.lastError,
      lastItemCount: contentSources.lastItemCount,
      storedItems: count(contentObservations.itemId),
      // Filtered aggregates keep empty sources and count publication windows in one scan.
      items24h:
        sql<number>`count(*) filter (where ${contentItems.publishedAt} >= ${day}::timestamptz and ${contentItems.publishedAt} < ${cutoff}::timestamptz)`.mapWith(
          Number,
        ),
      items7d:
        sql<number>`count(*) filter (where ${contentItems.publishedAt} >= ${week}::timestamptz and ${contentItems.publishedAt} < ${cutoff}::timestamptz)`.mapWith(
          Number,
        ),
      enabled: contentSources.enabled,
      active: and(eq(contentSources.enabled, true), exists(connected))!.mapWith(
        Boolean,
      ),
    })
    .from(contentSources)
    .leftJoin(
      contentObservations,
      eq(contentObservations.sourceId, contentSources.id),
    )
    .leftJoin(contentItems, eq(contentItems.id, contentObservations.itemId))
    .groupBy(contentSources.id)
    .orderBy(asc(contentSources.name));
  // Normalize database timestamps to the existing HTTP UTC representation.
  return rows.map((row) => ({
    ...row,
    lastAttempt:
      row.lastAttempt === null ? null : new Date(row.lastAttempt).toISOString(),
    lastSuccess:
      row.lastSuccess === null ? null : new Date(row.lastSuccess).toISOString(),
  }));
}
