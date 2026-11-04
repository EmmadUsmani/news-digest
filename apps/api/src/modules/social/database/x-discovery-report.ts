import { and, DrizzleQueryError, eq, gte, lt, sql } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/node-postgres';
import type { Pool } from 'pg';

import {
  socialPosts,
  topics,
  xDiscoveryCalls as calls,
} from '../../../libs/db/schema';
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
  const orm = drizzle(db as Pool);
  // PostgreSQL set-returning JSON expansion remains a SQL table expression.
  const handles = sql`jsonb_array_elements_text(${topics.accounts}) AS handle`;
  const curated = orm.$with('curated').as(
    orm
      .selectDistinct({
        handle: sql<string>`lower(regexp_replace(handle, '^@', ''))`.as(
          'handle',
        ),
      })
      .from(topics)
      .crossJoin(handles),
  );
  const verified = orm.$with('verified').as(
    orm
      .select({
        externalId: socialPosts.externalId,
        publishedAt: socialPosts.publishedAt,
        handle: sql<string | null>`lower(substring(${socialPosts.authorUrl} from
        '^https://(?:x[.]com|twitter[.]com)/([A-Za-z0-9_]{1,15})/?(?:[?#].*)?$'))`.as(
          'handle',
        ),
      })
      .from(socialPosts)
      .where(eq(socialPosts.platform, 'x')),
  );
  // Lateral JSON expansion, correlated edition membership and filtered aggregates
  // stay in a SQL expression; the surrounding CTEs and call query use builders.
  // Qualify correlated columns explicitly: single-table selects otherwise strip
  // table qualifiers inside SQL expressions, allowing inner columns to shadow them.
  const callId = sql`${sql.identifier('x_discovery_calls')}.${sql.identifier('id')}`;
  const callCreatedAt = sql`${sql.identifier('x_discovery_calls')}.${sql.identifier('created_at')}`;
  const rows = await orm
    .with(curated, verified)
    .select({
      id: calls.id,
      runId: calls.runId,
      requestedTopic: sql<
        DiscoveryCallEvidence['requestedTopic']
      >`${calls.requestedTopic}`,
      searchType: sql<DiscoveryCallEvidence['searchType']>`${calls.searchType}`,
      status: calls.status,
      createdAt: calls.createdAt,
      costMicros: sql<number | null>`${calls.costMicros}::float8`,
      heldMicros: sql<number>`CASE WHEN ${calls.status} IN ('pending','uncertain') THEN ${calls.reservedMicros} ELSE 0 END::float8`,
      postsFetched: sql<number | null>`${calls.postsFetched}::float8`,
      profilesFetched: sql<number | null>`${calls.profilesFetched}::float8`,
      errorCode: calls.errorCode,
      topics: sql<DiscoveryCallEvidence['topics']>`
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
          WHERE d.created_at >= ${callCreatedAt}
            AND d.created_at < (${day}::date + 1)::timestamp AT TIME ZONE 'UTC'
            AND topic->>'id'=s.topic_id::text
            AND post->>'platform'='x' AND post->>'externalId'=s.external_id
        ) AS selected) picked
        WHERE s.call_id=${callId} GROUP BY s.topic_id,t.name
      ) y),'[]'::jsonb)`,
    })
    .from(calls)
    .where(
      and(
        gte(calls.createdAt, sql`${day}::date::timestamp AT TIME ZONE 'UTC'`),
        lt(
          calls.createdAt,
          sql`(${day}::date + 1)::timestamp AT TIME ZONE 'UTC'`,
        ),
      ),
    )
    .orderBy(calls.createdAt, calls.id)
    .catch((error: unknown) => {
      // Keep the adapter's native PostgreSQL errors for existing callers.
      throw error instanceof DrizzleQueryError && error.cause
        ? error.cause
        : error;
    });
  // Schema timestamps are strings; retain the report's Date API.
  const evidence: DiscoveryCallEvidence[] = rows.map((row) => ({
    ...row,
    createdAt: new Date(row.createdAt),
  }));
  return {
    day,
    calls: evidence,
    byTopicAndSearchType: summarizeDiscovery(evidence),
    summaryNote:
      'Groups use reservation-time topic IDs and recorded search types; the first snapshot supplies the name. Missing topic snapshots remain unattributed and have no summarized yield. Costs and holds count once per call; yield includes only citations matching the requested topic. Known cost/fetched sums are incomplete when their unknown-call counters are nonzero. Yield and outside-list counts use current verification/lists, count posts rather than accounts, and do not establish relevance or causation.',
    costMicros: evidence.reduce(
      (total, row) => total + (row.costMicros ?? 0),
      0,
    ),
    heldMicros: evidence.reduce((total, row) => total + row.heldMicros, 0),
    note: 'selectedInDay counts cited posts appearing in at least one same-topic edition published after the call and before the UTC day ends, once per call/topic despite repeated editions. It is not incremental selection or causal attribution; later-day editions are excluded. Outside-list selection uses current verified authors/lists, not historical membership. Outside-list counts compare officially verified author URLs against all current topic account lists (including disabled topics), case-insensitively; they are post counts, not distinct accounts. Unknown authors are excluded. List edits and verification changes can change these counts; no historical list membership is claimed. Search type is captured before HTTP; historical types remain unknown. Costs counted once per call; Requested topic is a reservation-time snapshot, including zero-yield calls; historical calls without a snapshot remain unattributed. New candidates were absent from verified storage and all earlier X search citations at save time; newVerifiedNow counts those currently verified, once across searches. Historical baselines remain unknown. Discovery and verification counts alone do not establish causation, relevance or edition picks.',
  };
}
