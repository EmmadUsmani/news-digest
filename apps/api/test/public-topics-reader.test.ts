import 'reflect-metadata';

import assert from 'node:assert/strict';
import type { AddressInfo } from 'node:net';
import test from 'node:test';

import { ServiceUnavailableException } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { Pool } from 'pg';

import { PublicTopicsReader } from '../src/modules/topics/database/public-topics.reader';
import { PostgresTopicRepository } from '../src/modules/topics/database/topic.repository';
import { PublicTopicsModule } from '../src/public-read/topics.module';

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

void test('enabled public topics composition serves system storage and leaves shared pool open', async () => {
  assert.equal(process.env.NEWS_DIGEST_ISOLATED_TEST, '1');
  const pool = new Pool({ connectionString: process.env.DATABASE_URL, max: 1 });
  const app = await NestFactory.create(
    PublicTopicsModule.prepare(
      { PUBLIC_MODE: '1', SYSTEM_OWNERSHIP: '1', READER_PUBLISHED_ONLY: '1' },
      () => pool,
    ),
    { logger: false },
  );
  try {
    await pool.query('BEGIN');
    const expected = await new PublicTopicsReader(pool).read();
    assert.ok(expected.length > 0);
    await pool.query('ALTER TABLE profiles RENAME TO private_owner_fixture');
    await pool.query('UPDATE topics SET profile_id = NULL');
    await app.listen(0, '127.0.0.1');
    const address = app.getHttpServer().address() as AddressInfo;
    const url = `http://127.0.0.1:${address.port}/api/admin/topics`;
    const response = await fetch(url);
    assert.equal(response.status, 200);
    assert.equal(response.headers.get('cache-control'), 'no-store');
    assert.deepEqual(await response.json(), expected);
    const head = await fetch(url, { method: 'HEAD' });
    assert.equal(head.status, 200);
    assert.equal(await head.text(), '');
    for (const method of ['POST', 'PUT', 'PATCH', 'DELETE'])
      assert.equal((await fetch(url, { method })).status, 404);
    await pool.query("UPDATE topics SET queries = '{}'::jsonb WHERE id = $1", [
      expected[0].id,
    ]);
    const invalid = await fetch(url);
    assert.equal(invalid.status, 503);
    assert.deepEqual(await invalid.json(), {
      message: 'Topic settings unavailable',
      error: 'Service Unavailable',
      statusCode: 503,
    });
    await app.close();
    assert.equal((await pool.query('SELECT 1 AS alive')).rows[0].alive, 1);
  } finally {
    await app.close();
    await pool.query('ROLLBACK');
    await pool.end();
  }
});
