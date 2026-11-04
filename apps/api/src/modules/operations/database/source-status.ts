import { and, asc, count, eq, exists } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/node-postgres';
import type { Pool } from 'pg';

import {
  contentObservations,
  contentSources,
  topics,
  topicSourceConnections,
} from '../../../libs/db/schema';

export async function readSourceStatus(db: Pool) {
  const orm = drizzle(db);
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
      active: exists(connected).mapWith(Boolean),
    })
    .from(contentSources)
    .leftJoin(
      contentObservations,
      eq(contentObservations.sourceId, contentSources.id),
    )
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
