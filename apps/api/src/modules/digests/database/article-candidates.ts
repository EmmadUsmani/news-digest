import { and, desc, eq, gte, lt, sql } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/node-postgres';
import type { PoolClient } from 'pg';

import {
  contentItems as items,
  contentObservations as observations,
  contentSources as sources,
  topicSourceConnections as connections,
} from '../../../libs/db/schema';
import type { Candidate } from '../domain/rank';

// Shared by edition selection and pre-edition reaction discovery.
export async function loadArticleCandidates(
  client: Pick<PoolClient, 'query'>,
  topicId: string,
  start: Date,
  end: Date,
): Promise<Candidate[]> {
  const rows = await drizzle(client as PoolClient)
    .select({
      id: items.id,
      title: items.title,
      url: items.canonicalUrl,
      excerpt: items.excerpt,
      imageUrl: items.imageUrl,
      publisher: items.publisher,
      publishedAt: items.publishedAt,
      // Drizzle has no builder for DISTINCT, ordered PostgreSQL array aggregates.
      sources: sql<
        string[]
      >`array_agg(DISTINCT ${sources.name} ORDER BY ${sources.name})`,
      points: sql<string | null>`${items.engagement}->>'points'`,
    })
    .from(items)
    .innerJoin(observations, eq(observations.itemId, items.id))
    .innerJoin(sources, eq(sources.id, observations.sourceId))
    .innerJoin(connections, eq(connections.sourceId, sources.id))
    .where(
      and(
        eq(connections.topicId, topicId),
        gte(items.publishedAt, start.toISOString()),
        lt(items.publishedAt, end.toISOString()),
      ),
    )
    .groupBy(items.id)
    .orderBy(desc(items.publishedAt), items.id)
    .limit(200);
  return rows.map((row) => ({
    ...row,
    publishedAt: new Date(row.publishedAt).toISOString(),
    points: Number(row.points ?? 0),
  }));
}
