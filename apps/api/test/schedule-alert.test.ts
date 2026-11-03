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
