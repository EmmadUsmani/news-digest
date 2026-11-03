import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';

import { database } from '../src/libs/db/connections';

void test('schedule alert aggregate respects due time, states and newer success', async () => {
  const pool = database();
  try {
    const queryFile = readFileSync(
      'ops/observability/product-queries.yml',
      'utf8',
    );
    const query = queryFile
      .split('  query: |\n')[1]
      .split('  metrics:')[0]
      .trim();
    for (const [rows, expected] of [
      ["(now() + interval '1 hour', 'pending')", 0],
      ["(now() - interval '20 minutes', 'pending')", 1200],
      ["(now() - interval '20 minutes', 'running')", 1200],
      ["(now() - interval '20 minutes', 'retrying')", 1200],
      ["(now() - interval '20 minutes', 'failed')", 1200],
      ["(now() - interval '20 minutes', 'succeeded')", 0],
      ["(now() - interval '49 hours', 'failed')", 0],
      [
        "(now() - interval '20 minutes', 'pending'), (now() + interval '1 hour', 'pending')",
        1200,
      ],
      [
        "(now() - interval '25 hours', 'failed'), (now() - interval '20 minutes', 'succeeded')",
        0,
      ],
    ] as const) {
      const result = await pool.query(
        `WITH scheduled_ai_budget_days(scheduled_at, state) AS (VALUES ${rows}) ${query}`,
      );
      assert.equal(Number(result.rows[0].unsettled_seconds), expected);
    }
  } finally {
    await pool.end();
  }
});

void test('provider alert aggregate uses UTC periods, empty providers and unresolved holds from older periods', async () => {
  const pool = database();
  try {
    const query = readFileSync('ops/observability/product-queries.yml', 'utf8')
      .split('news_digest_provider:')[1]
      .split('  query: |\n')[1]
      .split('  metrics:')[0]
      .trim();
    // Deliberately use a non-UTC session; boundaries must remain UTC.
    await pool.query("SET TIME ZONE 'Pacific/Honolulu'");
    const result = await pool.query(`
      WITH llm_calls(created_at, status, cost_micros, reserved_micros) AS (VALUES
        (date_trunc('day', now() AT TIME ZONE 'UTC') AT TIME ZONE 'UTC', 'succeeded', 100000, 200000),
        (date_trunc('month', now() AT TIME ZONE 'UTC') AT TIME ZONE 'UTC' - interval '1 second', 'succeeded', 900000, 900000),
        (now() - interval '40 days', 'pending', NULL, 30000),
        (now() - interval '40 days', 'uncertain', NULL, 40000),
        (now(), 'failed', 0, 500000)),
      x_discovery_calls(created_at, status, cost_micros, reserved_micros) AS (
        SELECT created_at, status, cost_micros, reserved_micros FROM llm_calls WHERE false
      )
      ${query.replace('WITH providers', ', providers')}`);
    assert.equal(result.rows.length, 4);
    for (const row of result.rows) {
      assert.equal(
        Number(row.committed_usd),
        row.provider === 'anthropic' ? 0.17 : 0,
      );
    }
    const empty = await pool.query(`
      WITH llm_calls(created_at, status, cost_micros, reserved_micros) AS (
        SELECT now(), 'succeeded', 100000, 200000 WHERE false
      ), x_discovery_calls AS (SELECT * FROM llm_calls)
      ${query.replace('WITH providers', ', providers')}`);
    assert.equal(empty.rows.length, 4);
    assert.ok(empty.rows.every((row) => Number(row.committed_usd) === 0));
  } finally {
    await pool.end();
  }
});
