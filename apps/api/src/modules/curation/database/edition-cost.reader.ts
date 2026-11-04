import { and, desc, eq, gte, lte, sql } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/node-postgres';
import type { Pool, PoolClient } from 'pg';

import {
  digestPreviews as editions,
  llmCalls as calls,
} from '../../../libs/db/schema';

// Accept the caller's transaction client so admission can read measurements
// while holding the same ledger lock. No provider calls or ledger mutations.
export async function readFullAiEditionCosts(
  db: Pool | PoolClient,
  now: Date,
  limit = 10,
): Promise<number[]> {
  if (
    !Number.isFinite(now.getTime()) ||
    !Number.isSafeInteger(limit) ||
    limit < 1 ||
    limit > 100
  )
    throw new Error('Invalid edition cost measurement range');
  const orm = drizzle(db);
  const measured = orm
    .select({
      runId: calls.runId,
      cost: sql<string>`sum(${calls.costMicros}) FILTER (WHERE ${calls.status}='succeeded')`.as(
        'cost',
      ),
      unresolved:
        sql<boolean>`bool_or(${calls.status} IN ('pending','uncertain'))`.as(
          'unresolved',
        ),
      verification: sql<boolean>`bool_or(${calls.purpose}='verification')`.as(
        'verification',
      ),
    })
    .from(calls)
    .groupBy(calls.runId)
    .as('measured');
  const result = await orm
    .select({ cost: measured.cost })
    .from(editions)
    .innerJoin(measured, eq(measured.runId, sql`${editions.id}::text`))
    .where(
      and(
        gte(
          editions.createdAt,
          sql`${now.toISOString()}::timestamptz - interval '30 days'`,
        ),
        lte(editions.createdAt, now.toISOString()),
        eq(measured.unresolved, false),
        eq(measured.verification, false),
        sql`${measured.cost} > 0`,
        // JSON array expansion and per-topic completeness have no query-builder
        // equivalent. Keep the immutable snapshot checks inside this adapter.
        sql`${editions.snapshot}->>'method'='editorial-v1'
        AND jsonb_typeof(${editions.snapshot}->'topics')='array'
        AND jsonb_array_length(${editions.snapshot}->'topics') > 0
        AND NOT EXISTS (
          SELECT 1 FROM jsonb_array_elements(${editions.snapshot}->'topics') topic
          WHERE topic->'editorial'->>'mode' IS DISTINCT FROM 'ai'
            OR topic->'postEditorial'->>'mode' IS DISTINCT FROM 'ai'
            OR topic->'editorial'->'unscoredIds' IS DISTINCT FROM '[]'::jsonb
            OR topic->'postEditorial'->'unscoredIds' IS DISTINCT FROM '[]'::jsonb
        )`,
      ),
    )
    .orderBy(desc(editions.createdAt), desc(editions.id))
    .limit(limit);
  return result.map(({ cost }) => {
    const value = Number(cost);
    if (!Number.isSafeInteger(value) || value <= 0)
      throw new Error('Invalid measured edition cost');
    return value;
  });
}

// A published edition's UUID is also the LLM run_id. Do not infer attribution
// from timestamps: manual jobs can overlap the scheduled worker.
export async function readEditionCost(
  db: Pool | PoolClient,
  editionId: string,
) {
  const rows = await drizzle(db)
    .select({
      model: calls.model,
      purpose: calls.purpose,
      calls: sql<number>`count(*)::int`,
      succeeded: sql<number>`count(*) FILTER (WHERE ${calls.status}='succeeded')::int`,
      failed: sql<number>`count(*) FILTER (WHERE ${calls.status}='failed')::int`,
      unresolved: sql<number>`count(*) FILTER (WHERE ${calls.status} IN ('pending','uncertain'))::int`,
      costMicros: sql<number>`COALESCE(sum(${calls.costMicros}),0)::float8`,
      reservedMicros: sql<number>`COALESCE(sum(${calls.reservedMicros}) FILTER (WHERE ${calls.status} IN ('pending','uncertain')),0)::float8`,
    })
    .from(calls)
    .where(eq(calls.runId, editionId))
    .groupBy(calls.model, calls.purpose)
    .orderBy(calls.model, calls.purpose);
  return {
    costMicros: rows.reduce((sum, row) => sum + row.costMicros, 0),
    reservedMicros: rows.reduce((sum, row) => sum + row.reservedMicros, 0),
    calls: rows.reduce((sum, row) => sum + row.calls, 0),
    byModelAndPurpose: rows,
  };
}
