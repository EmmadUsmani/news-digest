import { eq, sql } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/node-postgres';
import type { Pool } from 'pg';

import { contentObservations, contentSources } from '../../../libs/db/schema';

// Preparation only. Never fetch stored error text, URLs or ownership. The
// caller owns the pool; this reader has no dependency on the legacy profile.
export class PublicSourceHealthReader {
  constructor(private readonly pool: Pool) {}

  read() {
    return drizzle(this.pool)
      .select({
        id: contentSources.id,
        name: contentSources.name,
        lastAttempt: sql`${contentSources.lastAttempt}`.mapWith(
          (value: string) => new Date(value),
        ),
        lastSuccess: sql`${contentSources.lastSuccess}`.mapWith(
          (value: string) => new Date(value),
        ),
        lastItemCount: contentSources.lastItemCount,
        storedItems: sql<number>`count(${contentObservations.itemId})::int`,
        error: sql<
          string | null
        >`case when ${contentSources.lastError} is null then null else '' end`,
      })
      .from(contentSources)
      .leftJoin(
        contentObservations,
        eq(contentObservations.sourceId, contentSources.id),
      )
      .groupBy(contentSources.id)
      .orderBy(contentSources.id);
  }
}
