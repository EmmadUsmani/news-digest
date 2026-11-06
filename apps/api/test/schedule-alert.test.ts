import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';

import { database } from '../src/libs/db/connections';

void test('schedule alert aggregate respects due time, states and newer success', async () => {
  const pool = database();
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const clock = await client.query(
      'SELECT extract(epoch FROM now()) AS seconds',
    );
    const now = Number(clock.rows[0].seconds);
    const queryFile = readFileSync(
      'ops/observability/product-queries.yml',
      'utf8',
    );
    const query = queryFile
      .split('  query: |\n')[1]
      .split('  metrics:')[0]
      .trim();
    for (const [rows, expected, latestAge] of [
      ["(now() + interval '1 hour', 'pending')", 0, null],
      ["(now() - interval '20 minutes', 'pending')", 1200, 1200],
      ["(now() - interval '20 minutes', 'running')", 1200, 1200],
      ["(now() - interval '20 minutes', 'retrying')", 1200, 1200],
      ["(now() - interval '20 minutes', 'failed')", 1200, 1200],
      ["(now() - interval '20 minutes', 'succeeded')", 0, 1200],
      ["(now() - interval '49 hours', 'failed')", 0, 176400],
      [
        "(now() - interval '20 minutes', 'pending'), (now() + interval '1 hour', 'pending')",
        1200,
        1200,
      ],
      [
        "(now() - interval '25 hours', 'failed'), (now() - interval '20 minutes', 'succeeded')",
        0,
        1200,
      ],
    ] as const) {
      const result = await client.query(
        `WITH scheduled_ai_budget_days(scheduled_at, state) AS (VALUES ${rows}) ${query}`,
      );
      assert.equal(Number(result.rows[0].unsettled_seconds), expected);
      const timestamp = Number(result.rows[0].latest_due_timestamp_seconds);
      if (latestAge === null) assert.equal(timestamp, 0);
      else assert.ok(Math.abs(timestamp - (now - latestAge)) < 0.00001);
    }
  } finally {
    await client.query('ROLLBACK');
    client.release();
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

void test('Bluesky alerts derive from durable scheduled snapshots and exclude old/off/on-demand editions', async () => {
  const pool = database();
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    await client.query(`CREATE TEMP TABLE digest_previews
      (id int, created_at timestamptz, scheduled_key text, snapshot jsonb) ON COMMIT DROP`);
    const query = readFileSync('ops/observability/postgres-reader.sql', 'utf8')
      .split('CREATE OR REPLACE VIEW bluesky_edition_alert_metrics AS')[1]
      .split(';')[0];
    let id = 0;
    const add = async (
      result: string | null,
      slots = 1,
      picked = false,
      scheduled = true,
      old = false,
    ) => {
      id++;
      await client.query(
        `INSERT INTO digest_previews VALUES ($1, $2, $3, $4)`,
        [
          id,
          old ? '2026-11-05T10:00:00Z' : new Date(Date.UTC(2026, 10, 7, id)),
          scheduled ? String(id) : null,
          JSON.stringify({
            topics: [
              {
                ...(result === null
                  ? {}
                  : { blueskySelection: { result, openSlots: slots } }),
                posts: picked ? [{ platform: 'bluesky' }] : [],
              },
            ],
          }),
        ],
      );
    };
    const check = async (failed: number, chances: number) => {
      const read = async () => (await client.query(query)).rows[0];
      assert.deepEqual(await read(), {
        editing_failed: failed,
        no_pick_chances: chances,
      });
      // Fresh reads need no worker state, matching a collector/worker restart.
      assert.deepEqual(await read(), {
        editing_failed: failed,
        no_pick_chances: chances,
      });
    };
    await check(0, 0);
    await add(null, 1, false, true, true);
    await add('budget-refused', 1, false, false);
    await add('switched-off');
    await check(0, 0);
    await add('no-slot', 0);
    await check(0, 0);
    await add('editor-chose-none');
    await check(0, 1);
    await add('ai-editing-failed');
    await check(1, 2);
    await add('budget-refused');
    await check(1, 3);
    await add('switched-off');
    await check(0, 3);
    await add('no-slot', 0);
    await check(0, 3);
    await add('picks-made', 1, true);
    await check(0, 0);
    await add(null);
    await check(1, 0);
    await add('editor-chose-none');
    await check(0, 1);
    // A failed topic cannot be hidden by a successful sibling.
    await client.query(
      `UPDATE digest_previews SET snapshot = jsonb_set(snapshot, '{topics}',
      (snapshot->'topics') || '[{"blueskySelection":{"result":"ai-editing-failed","openSlots":1}}]'::jsonb)
      WHERE id = $1`,
      [id],
    );
    await check(1, 1);
  } finally {
    await client.query('ROLLBACK');
    client.release();
    await pool.end();
  }
});
