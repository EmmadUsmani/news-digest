// Read-only cached-score evidence. No provider requests or response text output.
import { database } from '../src/libs/db/connections';

async function main() {
  const start = process.argv[2];
  const end = process.argv[3];
  if (
    !start ||
    !end ||
    !Number.isFinite(Date.parse(start)) ||
    !Number.isFinite(Date.parse(end)) ||
    Date.parse(start) >= Date.parse(end)
  )
    throw new Error('Expected START END timestamps with START before END');
  const db = database();
  try {
    await db.query('BEGIN READ ONLY');
    await db.query("SET LOCAL statement_timeout = '15s'");
    const { rows } = await db.query(
      `WITH scores AS (
        SELECT CASE WHEN cache_key LIKE 'social-triage-item-v1:%'
          THEN 'social' ELSE 'article' END AS kind, response
        FROM llm_cache
        WHERE created_at >= $1::timestamptz AND created_at < $2::timestamptz
          AND (cache_key LIKE 'triage-item-v1:%' OR cache_key LIKE 'social-triage-item-v1:%')
      ), fields AS (
        SELECT kind, field,
          CASE WHEN jsonb_typeof(response->field) = 'string'
            THEN char_length(response->>field) END AS characters,
          CASE WHEN field = 'event' THEN 80 ELSE 100 END AS guidance_limit
        FROM scores CROSS JOIN (VALUES ('event'), ('rationale')) AS f(field)
      )
      SELECT kind, field, count(*)::int AS scores,
        count(characters)::int AS "stringValues",
        count(*) FILTER (WHERE characters IS NULL)::int AS "missingOrNonString",
        min(characters)::int AS minimum, round(avg(characters), 2)::float8 AS mean,
        percentile_disc(0.5) WITHIN GROUP (ORDER BY characters) AS median,
        percentile_disc(0.95) WITHIN GROUP (ORDER BY characters) AS p95,
        max(characters)::int AS maximum,
        count(*) FILTER (WHERE characters > guidance_limit)::int AS "overPromptGuidance",
        count(*) FILTER (WHERE characters > CASE WHEN field = 'event' THEN 160 ELSE 300 END)::int AS "overSchemaLimit"
      FROM fields GROUP BY kind, field ORDER BY kind, field`,
      [start, end],
    );
    await db.query('ROLLBACK');
    console.log(
      JSON.stringify({
        start,
        end,
        note: 'Successful per-item cache writes in the half-open creation window, not raw model responses or an exact edition pool. Cache reuse, failed attempts and repairs are absent. Lengths are Unicode code points, not tokens or JavaScript UTF-16 schema lengths. Prompt guidance is 80 event/100 rationale; schema limits are 160/300. No text, IDs, secrets or paid calls; no latency prediction.',
        fields: rows,
      }),
    );
  } finally {
    await db.end();
  }
}
void main().catch(() => {
  console.error(
    'Triage length report failed; expected valid START END timestamps and a reachable database',
  );
  process.exitCode = 1;
});
