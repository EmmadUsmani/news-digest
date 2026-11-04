import { and, DrizzleQueryError, eq, exists, gte, lt, sql } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/node-postgres';
import type { Pool } from 'pg';

import {
  digestPreviews,
  socialPosts,
  topics,
  xDiscoveryCalls as calls,
  xSearchCitations as citations,
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
  // Qualify outer call columns because single-table projections can strip
  // qualifiers inside SQL expressions, allowing inner columns to shadow them.
  const callId = sql`${sql.identifier('x_discovery_calls')}.${sql.identifier('id')}`;
  const callCreatedAt = sql`${sql.identifier('x_discovery_calls')}.${sql.identifier('created_at')}`;
  // PostgreSQL set-returning JSON expansion has no query-builder equivalent.
  const editionTopic = sql`jsonb_array_elements(${digestPreviews.snapshot}->'topics') topic`;
  const editionPost = sql`jsonb_array_elements(topic->'posts') post`;
  const selected = exists(
    orm
      .select({ id: digestPreviews.id })
      .from(digestPreviews)
      .crossJoin(editionTopic)
      .crossJoin(editionPost)
      .where(
        and(
          gte(digestPreviews.createdAt, callCreatedAt),
          lt(
            digestPreviews.createdAt,
            sql`(${day}::date + 1)::timestamp AT TIME ZONE 'UTC'`,
          ),
          eq(sql`topic->>'id'`, sql`${citations.topicId}::text`),
          eq(sql`post->>'platform'`, 'x'),
          eq(sql`post->>'externalId'`, citations.externalId),
        ),
      ),
  );
  // Drizzle SQL aliases do not carry CTE qualification in embedded expressions.
  const verifiedHandle = sql`${sql.identifier('verified')}.${sql.identifier('handle')}`;
  const curatedHandle = sql`${sql.identifier('curated')}.${sql.identifier('handle')}`;
  const outsideList = sql`${verifiedHandle} IS NOT NULL AND ${curatedHandle} IS NULL`;
  const perTopic = orm
    .select({
      topicId: sql<string | null>`${citations.topicId}`.as('topicId'),
      name: topics.name,
      citations: sql<number>`count(*)::int`.as('citations'),
      selectedInDay: sql<number>`count(*) FILTER (WHERE ${selected})::int`.as(
        'selectedInDay',
      ),
      outsideListSelectedInDay:
        sql<number>`count(*) FILTER (WHERE ${selected} AND ${outsideList})::int`.as(
          'outsideListSelectedInDay',
        ),
      outsideListVerifiedNow:
        sql<number>`count(${verified.externalId}) FILTER (WHERE ${outsideList})::int`.as(
          'outsideListVerifiedNow',
        ),
      outsideListNewVerifiedNow:
        sql<number>`count(${verified.externalId}) FILTER (WHERE ${citations.newCandidate} AND ${outsideList})::int`.as(
          'outsideListNewVerifiedNow',
        ),
      unknownAuthorVerifiedNow:
        sql<number>`count(${verified.externalId}) FILTER (WHERE ${verifiedHandle} IS NULL)::int`.as(
          'unknownAuthorVerifiedNow',
        ),
      newCandidates:
        sql<number>`count(*) FILTER (WHERE ${citations.newCandidate})::int`.as(
          'newCandidates',
        ),
      newVerifiedNow:
        sql<number>`count(${verified.externalId}) FILTER (WHERE ${citations.newCandidate})::int`.as(
          'newVerifiedNow',
        ),
      unknownBaseline:
        sql<number>`count(*) FILTER (WHERE ${citations.newCandidate} IS NULL)::int`.as(
          'unknownBaseline',
        ),
      verifiedNow: sql<number>`count(${verified.externalId})::int`.as(
        'verifiedNow',
      ),
      datedNow:
        sql<number>`count(${verified.externalId}) FILTER (WHERE ${verified.publishedAt} IS NOT NULL)::int`.as(
          'datedNow',
        ),
    })
    .from(citations)
    .leftJoin(topics, eq(topics.id, citations.topicId))
    .leftJoin(verified, eq(verified.externalId, citations.externalId))
    .leftJoin(curated, eq(curatedHandle, verifiedHandle))
    .where(eq(citations.callId, callId))
    .groupBy(citations.topicId, topics.name);
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
      // JSON aggregation preserves the report's nested shape and empty arrays.
      topics: sql<DiscoveryCallEvidence['topics']>`COALESCE((
        SELECT jsonb_agg(y ORDER BY y."topicId" NULLS LAST)
        FROM (${perTopic}) y
      ),'[]'::jsonb)`,
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
