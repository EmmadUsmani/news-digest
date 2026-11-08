import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { test } from 'node:test';

import { database } from '../src/libs/db/connections';

void test('system settings migration copies configured owner schedule, enforces one row and fails without an owner schedule', async () => {
  assert.equal(process.env.NEWS_DIGEST_ISOLATED_TEST, '1');
  const pool = database();
  const client = await pool.connect();
  const migration = await readFile(
    'drizzle/0011_system_edition_settings.sql',
    'utf8',
  );
  const owner = '00000000-0000-4000-8000-000000000001';
  try {
    await client.query('BEGIN');
    await client.query('DROP TABLE edition_settings');
    await client.query(
      `UPDATE digest_schedules SET cadence='17 21 * * *', timezone='Pacific/Auckland', coverage_window='PT12H', story_budget=0, post_budget=20 WHERE profile_id=$1`,
      [owner],
    );
    await client.query(
      "INSERT INTO profiles(id,name) VALUES ('00000000-0000-4000-8000-000000000099','Foreign schedule fixture')",
    );
    await client.query(
      "INSERT INTO digest_schedules(profile_id,cadence) VALUES ('00000000-0000-4000-8000-000000000099','1 2 * * *')",
    );
    await client.query(migration);
    const expected = [
      {
        id: 1,
        cadence: '17 21 * * *',
        timezone: 'Pacific/Auckland',
        coverage_window: 'PT12H',
        story_budget: 0,
        post_budget: 20,
      },
    ];
    assert.deepEqual(
      (await client.query('SELECT * FROM edition_settings')).rows,
      expected,
    );
    for (const query of [
      'UPDATE edition_settings SET id=2',
      'INSERT INTO edition_settings SELECT * FROM edition_settings',
      'UPDATE edition_settings SET story_budget=-1',
      'UPDATE edition_settings SET story_budget=21',
      'UPDATE edition_settings SET post_budget=-1',
      'UPDATE edition_settings SET post_budget=21',
      'UPDATE edition_settings SET timezone=NULL',
    ]) {
      await client.query('SAVEPOINT invalid');
      await assert.rejects(client.query(query));
      await client.query('ROLLBACK TO SAVEPOINT invalid');
      assert.deepEqual(
        (await client.query('SELECT * FROM edition_settings')).rows,
        expected,
      );
    }
    await client.query('DROP TABLE edition_settings');
    await client.query('DELETE FROM digest_schedules WHERE profile_id=$1', [
      owner,
    ]);
    await client.query('SAVEPOINT missing');
    await assert.rejects(
      client.query(migration),
      /Default profile schedule missing/,
    );
    await client.query('ROLLBACK TO SAVEPOINT missing');
    assert.equal(
      (await client.query("SELECT to_regclass('edition_settings') AS name"))
        .rows[0].name,
      null,
    );
  } finally {
    await client.query('ROLLBACK');
    client.release();
    await pool.end();
  }
});
