import 'reflect-metadata';

import assert from 'node:assert/strict';
import test from 'node:test';

import { ServiceUnavailableException } from '@nestjs/common';
import { Pool } from 'pg';

import { PublicTopicsReader } from '../src/modules/topics/database/public-topics.reader';
import { PostgresTopicRepository } from '../src/modules/topics/database/topic.repository';

void test('public topic reader selects the complete system catalog without legacy ownership or future columns', async () => {
  assert.equal(process.env.NEWS_DIGEST_ISOLATED_TEST, '1');
  const pool = new Pool({ connectionString: process.env.DATABASE_URL, max: 1 });
  const reader = new PublicTopicsReader(pool);
  const legacy = new PostgresTopicRepository();
  const previous = process.env.SYSTEM_OWNERSHIP;
  try {
    process.env.SYSTEM_OWNERSHIP = '1';
    const expected = (await legacy.listDefault()).map(
      ({ profileId: _owner, ...row }) => row,
    );
    assert.ok(expected.length > 0);
    await pool.query('BEGIN');
    await pool.query('ALTER TABLE profiles RENAME TO private_owner_fixture');
    await pool.query(
      "ALTER TABLE topics ADD COLUMN private_future_column text DEFAULT 'private-marker'",
    );
    // Null ownership must not hide a system topic, even with the old flag off.
    await pool.query('UPDATE topics SET profile_id = NULL');
    for (const flag of [undefined, '0', '1']) {
      if (flag === undefined) delete process.env.SYSTEM_OWNERSHIP;
      else process.env.SYSTEM_OWNERSHIP = flag;
      assert.deepEqual(await reader.read(), expected);
    }
    const changed = await reader.read();
    changed[0].sources.push('caller-mutation');
    assert.deepEqual(await reader.read(), expected);
    await pool.query("UPDATE topics SET queries = '{}'::jsonb WHERE id = $1", [
      expected[0].id,
    ]);
    await assert.rejects(reader.read(), (error: unknown) => {
      assert.ok(error instanceof ServiceUnavailableException);
      assert.deepEqual(error.getResponse(), {
        message: 'Topic settings unavailable',
        error: 'Service Unavailable',
        statusCode: 503,
      });
      return true;
    });
  } finally {
    if (previous === undefined) delete process.env.SYSTEM_OWNERSHIP;
    else process.env.SYSTEM_OWNERSHIP = previous;
    await pool.query('ROLLBACK');
    await pool.end();
    await legacy.onModuleDestroy();
  }
  await assert.rejects(reader.read(), (error: unknown) => {
    assert.ok(error instanceof ServiceUnavailableException);
    assert.equal(error.message, 'Topic settings unavailable');
    return true;
  });
});
