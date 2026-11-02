import type { Pool } from 'pg';

interface DiscoveryCallEvidence {
  id: string;
  runId: string;
  requestedTopic: { id: string; name: string } | null;
  status: string;
  createdAt: Date;
  costMicros: number | null;
  heldMicros: number;
  postsFetched: number | null;
  profilesFetched: number | null;
  errorCode: string | null;
  topics: {
    topicId: string | null;
    name: string | null;
    citations: number;
    verifiedNow: number;
    datedNow: number;
  }[];
}

// Read-only UTC-day evidence. Verification is the current stored state, not
// proof that this search caused a new post to be verified or selected.
export async function readXDiscoveryReport(
  db: Pick<Pool, 'query'>,
  day: string,
) {
  if (
    !/^\d{4}-\d{2}-\d{2}$/.test(day) ||
    !Number.isFinite(Date.parse(day)) ||
    new Date(day).toISOString().slice(0, 10) !== day
  )
    throw new Error('Expected a valid UTC date (YYYY-MM-DD)');
  const { rows } = await db.query<DiscoveryCallEvidence>(
    `
    SELECT c.id,c.run_id AS "runId",c.requested_topic AS "requestedTopic",c.status,c.created_at AS "createdAt",
      c.cost_micros::float8 AS "costMicros",
      CASE WHEN c.status IN ('pending','uncertain') THEN c.reserved_micros ELSE 0 END::float8 AS "heldMicros",
      c.posts_fetched::float8 AS "postsFetched",c.profiles_fetched::float8 AS "profilesFetched",
      c.error_code AS "errorCode",
      COALESCE((SELECT jsonb_agg(y ORDER BY y."topicId" NULLS LAST) FROM (
        SELECT s.topic_id AS "topicId",t.name,
          count(*)::int AS citations,
          count(p.external_id)::int AS "verifiedNow",
          count(p.external_id) FILTER (WHERE p.published_at IS NOT NULL)::int AS "datedNow"
        FROM x_search_citations s LEFT JOIN topics t ON t.id=s.topic_id
        LEFT JOIN social_posts p ON p.platform='x' AND p.external_id=s.external_id
        WHERE s.call_id=c.id GROUP BY s.topic_id,t.name
      ) y),'[]'::jsonb) AS topics
    FROM x_discovery_calls c
    WHERE c.created_at >= $1::date::timestamp AT TIME ZONE 'UTC'
      AND c.created_at < ($1::date + 1)::timestamp AT TIME ZONE 'UTC'
    ORDER BY c.created_at,c.id`,
    [day],
  );
  return {
    day,
    calls: rows,
    costMicros: rows.reduce((total, row) => total + (row.costMicros ?? 0), 0),
    heldMicros: rows.reduce((total, row) => total + row.heldMicros, 0),
    note: 'Costs counted once per call; Requested topic is a reservation-time snapshot, including zero-yield calls; historical calls without a snapshot remain unattributed. Verified counts reflect current storage, not new additions, relevance or edition picks.',
  };
}
