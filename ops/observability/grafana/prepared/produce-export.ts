// PREPARED ONLY: trusted application-side producer; never expose its pool to Grafana.
import type { Pool, PoolClient } from 'pg';

import type { ExportSnapshot } from './refresh-export';

export async function produceExport(
  connection: Pool | PoolClient,
  now = new Date(),
): Promise<ExportSnapshot> {
  // One statement gives all aggregates the same database snapshot. The UTC
  // half-open range excludes future UTC days and retains at most 30 days.
  const today = now.toISOString().slice(0, 10);
  const result = await connection.query<{ snapshot: ExportSnapshot }>(
    `WITH published AS (
      SELECT date_trunc('day', published_at AT TIME ZONE 'UTC') AS day, snapshot
      FROM public.digest_previews
      WHERE published_at >= ($1::date - 29)::timestamp AT TIME ZONE 'UTC'
        AND published_at < ($1::date + 1)::timestamp AT TIME ZONE 'UTC'
    ), editions AS (
      SELECT day, count(*)::bigint AS editions FROM published GROUP BY day
    ), content AS (
      SELECT day, count(t.topic)::bigint AS topics,
        coalesce(sum(CASE WHEN jsonb_typeof(t.topic->'stories') = 'array'
          THEN jsonb_array_length(t.topic->'stories') ELSE 0 END),0)::bigint AS stories,
        coalesce(sum(CASE WHEN jsonb_typeof(t.topic->'posts') = 'array'
          THEN jsonb_array_length(t.topic->'posts') ELSE 0 END),0)::bigint AS posts
      FROM published LEFT JOIN LATERAL jsonb_array_elements(
        CASE WHEN jsonb_typeof(snapshot->'topics') = 'array'
          THEN snapshot->'topics' ELSE '[]'::jsonb END
      ) AS t(topic) ON true GROUP BY day
    ) SELECT jsonb_build_object(
      'days', coalesce((SELECT jsonb_agg(jsonb_build_object(
        'day',to_char(e.day,'YYYY-MM-DD'),'editions',e.editions,
        'topics',c.topics,'stories',c.stories,'posts',c.posts) ORDER BY e.day)
        FROM editions e JOIN content c USING(day)), '[]'::jsonb),
      'sources',count(*),
      'enabled',count(*) FILTER (WHERE enabled),
      'errors',count(*) FILTER (WHERE enabled AND last_error IS NOT NULL)
    ) AS snapshot FROM public.content_sources`,
    [today],
  );
  return result.rows[0].snapshot;
}
