// Read-only live cost/yield report. No HTTP, inference or edition publication.
import { database } from '../src/libs/db/connections';

async function main() {
  const db = database();
  try {
    const { rows } = await db.query(`
      SELECT c.id,c.created_at AS "createdAt",c.status,c.model,c.search_type AS "searchType",
        c.cost_micros::float8 AS "costMicros",
        c.reserved_micros::float8 AS "reservationMicros",
        c.input_tokens::float8 AS "inputTokens",c.output_tokens::float8 AS "outputTokens",
        c.posts_fetched::float8 AS "postsFetched",c.profiles_fetched::float8 AS "profilesFetched",
        c.error_code AS "errorCode",
        count(s.external_id)::int AS citations,
        count(s.verification_url)::int AS "namedCitations",
        count(p.external_id)::int AS "currentlyVerifiedPosts",
        count(*) FILTER (WHERE v.error IS NOT NULL)::int AS "unavailableChecks"
      FROM (SELECT * FROM x_discovery_calls ORDER BY created_at DESC,id DESC LIMIT 20) c
      LEFT JOIN x_search_citations s ON s.call_id=c.id
      LEFT JOIN social_posts p ON p.platform='x' AND p.external_id=s.external_id
      LEFT JOIN x_embed_checks v ON v.external_id=s.external_id
      GROUP BY c.id,c.created_at,c.status,c.model,c.search_type,c.cost_micros,c.reserved_micros,
        c.input_tokens,c.output_tokens,c.posts_fetched,c.profiles_fetched,c.error_code
      ORDER BY c.created_at DESC,c.id DESC
    `);
    console.log(
      JSON.stringify({
        note: 'Current verification state, not editorial quality, window eligibility or proof that this call caused verification. Costs use configured ledger rates, not a provider invoice.',
        calls: rows,
      }),
    );
  } finally {
    await db.end();
  }
}
void main().catch(() => {
  console.error('X discovery report unavailable');
  process.exitCode = 1;
});
