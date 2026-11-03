import type { PoolClient } from 'pg';

import type { Candidate } from '../domain/rank';

// Shared by edition selection and pre-edition reaction discovery.
export async function loadArticleCandidates(
  client: Pick<PoolClient, 'query'>,
  topicId: string,
  start: Date,
  end: Date,
): Promise<Candidate[]> {
  return (
    await client.query<
      Omit<Candidate, 'publishedAt' | 'points'> & {
        publishedAt: Date;
        points: string | null;
      }
    >(
      `SELECT i.id,i.title,i.canonical_url AS url,i.excerpt,i.image_url AS "imageUrl",i.published_at AS "publishedAt",array_agg(DISTINCT s.name ORDER BY s.name) AS sources,i.engagement->>'points' AS points FROM content_items i JOIN content_observations o ON o.item_id=i.id JOIN content_sources s ON s.id=o.source_id JOIN topic_source_connections c ON c.source_id=s.id WHERE c.topic_id=$1 AND i.published_at >= $2 AND i.published_at < $3 GROUP BY i.id ORDER BY i.published_at DESC,i.id LIMIT 200`,
      [topicId, start, end],
    )
  ).rows.map((row) => ({
    ...row,
    publishedAt: row.publishedAt.toISOString(),
    points: Number(row.points ?? 0),
  }));
}
