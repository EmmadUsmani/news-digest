import { DrizzleQueryError, sql } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/node-postgres';
import type { Pool } from 'pg';

import { summarizeDiscovery } from '../domain/discovery-summary';

interface DiscoveryCallEvidence {
  id: string;
  runId: string;
  requestedTopic: { id: string; name: string } | null;
  searchType: 'open-topic' | 'account-list' | 'story-reactions' | null;
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
    newCandidates: number;
    newVerifiedNow: number;
    unknownBaseline: number;
    outsideListVerifiedNow: number;
    outsideListNewVerifiedNow: number;
    unknownAuthorVerifiedNow: number;
    selectedInDay: number;
    outsideListSelectedInDay: number;
  }[];
}

// Read-only UTC-day evidence. Verification is the current stored state, not
// proof that this search caused a post to be verified or selected.
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
  // Lateral JSON expansion, correlated edition membership and filtered aggregates
  // stay in a typed SQL template: the builder cannot express this report directly.
  const result = await drizzle(db as Pool)
    .execute<
      Omit<DiscoveryCallEvidence, 'createdAt'> & { createdAt: Date | string }
    >(
      sql`
    WITH curated AS (
      SELECT DISTINCT lower(regexp_replace(handle, '^@', '')) AS handle
      FROM topics CROSS JOIN LATERAL jsonb_array_elements_text(accounts) AS handle
    ), verified AS (
      SELECT p.*, lower(substring(p.author_url from
        '^https://(?:x[.]com|twitter[.]com)/([A-Za-z0-9_]{1,15})/?(?:[?#].*)?$')) AS handle
      FROM social_posts p WHERE p.platform='x'
    )
    SELECT c.id,c.run_id AS "runId",c.requested_topic AS "requestedTopic",c.search_type AS "searchType",c.status,c.created_at AS "createdAt",
      c.cost_micros::float8 AS "costMicros",
      CASE WHEN c.status IN ('pending','uncertain') THEN c.reserved_micros ELSE 0 END::float8 AS "heldMicros",
      c.posts_fetched::float8 AS "postsFetched",c.profiles_fetched::float8 AS "profilesFetched",
      c.error_code AS "errorCode",
      COALESCE((SELECT jsonb_agg(y ORDER BY y."topicId" NULLS LAST) FROM (
        SELECT s.topic_id AS "topicId",t.name,
          count(*)::int AS citations,
          count(*) FILTER (WHERE picked.selected)::int AS "selectedInDay",
          count(*) FILTER (WHERE picked.selected AND p.handle IS NOT NULL AND a.handle IS NULL)::int AS "outsideListSelectedInDay",
          count(p.external_id) FILTER (WHERE p.handle IS NOT NULL AND a.handle IS NULL)::int AS "outsideListVerifiedNow",
          count(p.external_id) FILTER (WHERE s.new_candidate AND p.handle IS NOT NULL AND a.handle IS NULL)::int AS "outsideListNewVerifiedNow",
          count(p.external_id) FILTER (WHERE p.handle IS NULL)::int AS "unknownAuthorVerifiedNow",
          count(*) FILTER (WHERE s.new_candidate)::int AS "newCandidates",
          count(p.external_id) FILTER (WHERE s.new_candidate)::int AS "newVerifiedNow",
          count(*) FILTER (WHERE s.new_candidate IS NULL)::int AS "unknownBaseline",
          count(p.external_id)::int AS "verifiedNow",
          count(p.external_id) FILTER (WHERE p.published_at IS NOT NULL)::int AS "datedNow"
        FROM x_search_citations s LEFT JOIN topics t ON t.id=s.topic_id
        LEFT JOIN verified p ON p.external_id=s.external_id
        LEFT JOIN curated a ON a.handle=p.handle
        CROSS JOIN LATERAL (SELECT EXISTS (
          SELECT 1 FROM digest_previews d
          CROSS JOIN LATERAL jsonb_array_elements(d.snapshot->'topics') topic
          CROSS JOIN LATERAL jsonb_array_elements(topic->'posts') post
          WHERE d.created_at >= c.created_at
            AND d.created_at < (${day}::date + 1)::timestamp AT TIME ZONE 'UTC'
            AND topic->>'id'=s.topic_id::text
            AND post->>'platform'='x' AND post->>'externalId'=s.external_id
        ) AS selected) picked
        WHERE s.call_id=c.id GROUP BY s.topic_id,t.name
      ) y),'[]'::jsonb) AS topics
    FROM x_discovery_calls c
    WHERE c.created_at >= ${day}::date::timestamp AT TIME ZONE 'UTC'
      AND c.created_at < (${day}::date + 1)::timestamp AT TIME ZONE 'UTC'
    ORDER BY c.created_at,c.id`,
    )
    .catch((error: unknown) => {
      // Keep the adapter's native PostgreSQL errors for existing callers.
      throw error instanceof DrizzleQueryError && error.cause
        ? error.cause
        : error;
    });
  // Drizzle leaves execute() timestamps as strings; retain the report's Date API.
  const rows: DiscoveryCallEvidence[] = result.rows.map((row) => ({
    ...row,
    createdAt: new Date(row.createdAt),
  }));
  return {
    day,
    calls: rows,
    byTopicAndSearchType: summarizeDiscovery(rows),
    summaryNote:
      'Groups use reservation-time topic IDs and recorded search types; the first snapshot supplies the name. Missing topic snapshots remain unattributed and have no summarized yield. Costs and holds count once per call; yield includes only citations matching the requested topic. Known cost/fetched sums are incomplete when their unknown-call counters are nonzero. Yield and outside-list counts use current verification/lists, count posts rather than accounts, and do not establish relevance or causation.',
    costMicros: rows.reduce((total, row) => total + (row.costMicros ?? 0), 0),
    heldMicros: rows.reduce((total, row) => total + row.heldMicros, 0),
    note: 'selectedInDay counts cited posts appearing in at least one same-topic edition published after the call and before the UTC day ends, once per call/topic despite repeated editions. It is not incremental selection or causal attribution; later-day editions are excluded. Outside-list selection uses current verified authors/lists, not historical membership. Outside-list counts compare officially verified author URLs against all current topic account lists (including disabled topics), case-insensitively; they are post counts, not distinct accounts. Unknown authors are excluded. List edits and verification changes can change these counts; no historical list membership is claimed. Search type is captured before HTTP; historical types remain unknown. Costs counted once per call; Requested topic is a reservation-time snapshot, including zero-yield calls; historical calls without a snapshot remain unattributed. New candidates were absent from verified storage and all earlier X search citations at save time; newVerifiedNow counts those currently verified, once across searches. Historical baselines remain unknown. Discovery and verification counts alone do not establish causation, relevance or edition picks.',
  };
}
