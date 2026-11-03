import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';

import { database } from '../src/libs/db/connections';

void test('statement timing exposes bounded identifiers and timings without text or elevated reader grants', async () => {
  const pool = database();
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    await client.query(
      'CREATE ROLE grafana_product; CREATE ROLE postgres_metrics; CREATE ROLE query_stats_denied',
    );
    await client.query(
      readFileSync('ops/observability/query-stats.sql', 'utf8'),
    );
    await client.query("SELECT length('private-query-stats-marker')");
    await client.query('SET LOCAL ROLE grafana_product');
    const stats = await client.query(
      'SELECT * FROM public.observability_query_stats()',
    );
    assert.ok(stats.rowCount && stats.rowCount > 0);
    assert.deepEqual(
      stats.fields.map((field) => field.name),
      [
        'query_id',
        'calls',
        'total_ms',
        'mean_ms',
        'rows',
        'shared_hits',
        'shared_reads',
        'stats_since',
      ],
    );
    assert.ok(
      !JSON.stringify(stats.rows).includes('private-query-stats-marker'),
    );
    for (const row of stats.rows) {
      assert.match(row.query_id, /^-?\d+$/);
      assert.ok(Number(row.calls) > 0);
      assert.ok(Number(row.total_ms) >= 0);
      assert.ok(Number(row.mean_ms) >= 0);
      assert.ok(row.stats_since instanceof Date);
    }
    const grants = await client.query(
      "SELECT pg_has_role(current_user, 'pg_read_all_stats', 'MEMBER') AS elevated",
    );
    assert.equal(grants.rows[0].elevated, false);
    await client.query(
      'RESET ROLE; SET LOCAL ROLE query_stats_denied; SAVEPOINT denied',
    );
    await assert.rejects(
      client.query('SELECT * FROM public.observability_query_stats()'),
      /permission denied/,
    );
    await client.query('ROLLBACK TO SAVEPOINT denied');
  } finally {
    await client.query('ROLLBACK');
    client.release();
    await pool.end();
  }
});
