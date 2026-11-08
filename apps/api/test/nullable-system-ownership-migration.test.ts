import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { test } from 'node:test';

import { database } from '../src/libs/db/connections';

void test('nullable ownership migration preserves rows, permits system ownership and retains foreign keys', async () => {
  assert.equal(process.env.NEWS_DIGEST_ISOLATED_TEST, '1');
  const pool = database();
  const client = await pool.connect();
  const tables = [
    'topics',
    'digest_previews',
    'edition_job_requests',
    'edition_job_failures',
  ];
  try {
    await client.query('BEGIN');
    const owner = '00000000-0000-4000-8000-000000000001';
    await client.query(
      `INSERT INTO edition_job_requests(job_id,profile_id) VALUES ('nullable-owner-request',$1)`,
      [owner],
    );
    await client.query(
      `INSERT INTO edition_job_failures(job_id,profile_id,duration_ms) VALUES ('nullable-owner-failure',$1,17)`,
      [owner],
    );
    await client.query(
      `INSERT INTO digest_previews(profile_id,window_start,window_end,snapshot) VALUES ($1,'2026-11-01T00:00:00Z','2026-11-02T00:00:00Z','{"topics":[],"fixture":true}')`,
      [owner],
    );
    const before = new Map<string, unknown>();
    for (const table of tables) {
      await client.query(
        `ALTER TABLE ${table} ALTER COLUMN profile_id SET NOT NULL`,
      );
      before.set(
        table,
        (await client.query(`SELECT * FROM ${table} ORDER BY 1`)).rows,
      );
    }
    await client.query(
      await readFile('drizzle/0012_nullable_system_ownership.sql', 'utf8'),
    );
    for (const table of tables) {
      assert.deepEqual(
        (await client.query(`SELECT * FROM ${table} ORDER BY 1`)).rows,
        before.get(table),
      );
      // Saved editions are immutable: ownership must be chosen at insertion.
      const nullWrite =
        table === 'digest_previews'
          ? `INSERT INTO digest_previews(profile_id,window_start,window_end,snapshot) VALUES (NULL,'2026-11-01T00:00:00Z','2026-11-02T00:00:00Z','{"topics":[]}') RETURNING *`
          : `UPDATE ${table} SET profile_id=NULL RETURNING *`;
      const changed = await client.query(nullWrite);
      assert.ok(changed.rowCount! > 0, `${table} has a representative row`);
      assert.ok(changed.rows.every((row) => row.profile_id === null));
      await client.query('SAVEPOINT invalid_owner');
      const invalidWrite =
        table === 'digest_previews'
          ? `INSERT INTO digest_previews(profile_id,window_start,window_end,snapshot) VALUES ('ffffffff-ffff-4fff-8fff-ffffffffffff','2026-11-01T00:00:00Z','2026-11-02T00:00:00Z','{}')`
          : `UPDATE ${table} SET profile_id='ffffffff-ffff-4fff-8fff-ffffffffffff'`;
      await assert.rejects(client.query(invalidWrite), /foreign key/);
      await client.query('ROLLBACK TO SAVEPOINT invalid_owner');
    }
    const schedule = await client.query(
      `SELECT is_nullable FROM information_schema.columns WHERE table_name='digest_schedules' AND column_name='profile_id'`,
    );
    assert.equal(schedule.rows[0].is_nullable, 'NO');
  } finally {
    await client.query('ROLLBACK');
    client.release();
    await pool.end();
  }
});
