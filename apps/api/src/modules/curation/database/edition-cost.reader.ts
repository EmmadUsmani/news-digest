import type { Pool, PoolClient } from 'pg';

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
  const result = await db.query<{ cost: string }>(
    `SELECT calls.cost FROM digest_previews d
     CROSS JOIN LATERAL (
       SELECT sum(cost_micros) FILTER (WHERE status='succeeded') AS cost,
         bool_or(status IN ('pending','uncertain')) AS unresolved,
         bool_or(purpose='verification') AS verification
       FROM llm_calls WHERE run_id=d.id::text
     ) calls
     WHERE d.created_at >= $1::timestamptz - interval '30 days'
       AND d.created_at <= $1 AND d.snapshot->>'method'='editorial-v1'
       AND jsonb_typeof(d.snapshot->'topics')='array'
       AND jsonb_array_length(d.snapshot->'topics') > 0
       AND NOT EXISTS (
         SELECT 1 FROM jsonb_array_elements(d.snapshot->'topics') topic
         WHERE topic->'editorial'->>'mode' IS DISTINCT FROM 'ai'
           OR topic->'postEditorial'->>'mode' IS DISTINCT FROM 'ai'
           OR topic->'editorial'->'unscoredIds' IS DISTINCT FROM '[]'::jsonb
           OR topic->'postEditorial'->'unscoredIds' IS DISTINCT FROM '[]'::jsonb
       ) AND calls.unresolved=false AND calls.verification=false AND calls.cost > 0
     ORDER BY d.created_at DESC,d.id DESC LIMIT $2`,
    [now, limit],
  );
  return result.rows.map(({ cost }) => {
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
  const { rows } = await db.query<{
    model: string;
    purpose: string;
    calls: number;
    succeeded: number;
    failed: number;
    unresolved: number;
    costMicros: number;
    reservedMicros: number;
  }>(
    `SELECT model,purpose,count(*)::int AS calls,
      count(*) FILTER (WHERE status='succeeded')::int AS succeeded,
      count(*) FILTER (WHERE status='failed')::int AS failed,
      count(*) FILTER (WHERE status IN ('pending','uncertain'))::int AS unresolved,
      COALESCE(sum(cost_micros),0)::float8 AS "costMicros",
      COALESCE(sum(reserved_micros) FILTER (WHERE status IN ('pending','uncertain')),0)::float8 AS "reservedMicros"
     FROM llm_calls WHERE run_id=$1 GROUP BY model,purpose ORDER BY model,purpose`,
    [editionId],
  );
  return {
    costMicros: rows.reduce((sum, row) => sum + row.costMicros, 0),
    reservedMicros: rows.reduce((sum, row) => sum + row.reservedMicros, 0),
    calls: rows.reduce((sum, row) => sum + row.calls, 0),
    byModelAndPurpose: rows,
  };
}
