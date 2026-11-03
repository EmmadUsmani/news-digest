import assert from 'node:assert/strict';
import { test } from 'node:test';

import { database } from '../src/libs/db/connections';
import { logger } from '../src/libs/observability/logging';

void test('real pg pool and transaction calls log durations without SQL, values or database errors', async (t) => {
  const records: Record<string, unknown>[] = [];
  t.mock.method(logger, 'warn', (record: Record<string, unknown>) =>
    records.push(record),
  );
  const pool = database();
  try {
    const result = await pool.query(
      'SELECT pg_sleep(0.27), $1::text AS value',
      ['private-parameter-marker'],
    );
    assert.equal(result.rows[0].value, 'private-parameter-marker');
    await new Promise<void>((resolve, reject) => {
      pool.query('SELECT pg_sleep(0.27)', (error) =>
        error ? reject(error) : resolve(),
      );
    });
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      await client.query('SELECT pg_sleep(0.27)');
      await assert.rejects(
        client.query(
          "DO $$ BEGIN PERFORM pg_sleep(0.27); RAISE EXCEPTION 'private-error-marker'; END $$",
        ),
        /private-error-marker/,
      );
      await client.query('ROLLBACK');
    } finally {
      client.release();
    }
    const slow = records.filter((row) => row.event === 'database.slow_query');
    assert.equal(slow.length, 4);
    assert.deepEqual(
      slow.map((row) => row.outcome),
      ['success', 'success', 'success', 'failure'],
    );
    assert.ok(slow.every((row) => Number(row.durationMs) >= 250));
    assert.doesNotMatch(
      JSON.stringify(slow),
      /pg_sleep|SELECT|private-|EXCEPTION/,
    );
  } finally {
    await pool.end();
  }
});
