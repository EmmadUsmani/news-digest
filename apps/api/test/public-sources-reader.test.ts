import 'reflect-metadata';

import assert from 'node:assert/strict';
import type { AddressInfo } from 'node:net';
import test from 'node:test';

import { NestFactory } from '@nestjs/core';
import { Pool } from 'pg';

import { PostgresTopicRepository } from '../src/modules/topics/database/topic.repository';
import { PublicSourcesModule } from '../src/public-read/sources.module';

void test('public source composition projects the complete stored catalog without ownership and keeps the shared pool open', async () => {
  assert.equal(process.env.NEWS_DIGEST_ISOLATED_TEST, '1');
  const pool = new Pool({ connectionString: process.env.DATABASE_URL, max: 1 });
  const legacy = new PostgresTopicRepository();
  const catalog = await legacy.catalog();
  await legacy.onModuleDestroy();
  assert.ok(catalog.length > 0);
  const expected = catalog.map(({ id, name, url }) => ({
    id,
    name,
    origin: new URL(url).origin,
  }));
  const app = await NestFactory.create(
    PublicSourcesModule.prepare(
      { PUBLIC_MODE: '1', SYSTEM_OWNERSHIP: '1', READER_PUBLISHED_ONLY: '1' },
      () => pool,
    ),
    { logger: false },
  );
  try {
    await pool.query('BEGIN');
    await pool.query('ALTER TABLE profiles RENAME TO private_owner_fixture');
    await pool.query(
      "ALTER TABLE content_sources ADD COLUMN private_future_column text DEFAULT 'private-marker'",
    );
    await pool.query(
      "UPDATE content_sources SET url = url || '?token=private-token#private-token'",
    );
    await app.listen(0, '127.0.0.1');
    const address = app.getHttpServer().address() as AddressInfo;
    const url = `http://127.0.0.1:${address.port}/api/admin/topics/sources`;
    const response = await fetch(url);
    assert.equal(response.status, 200);
    assert.equal(response.headers.get('cache-control'), 'no-store');
    assert.deepEqual(await response.json(), expected);
    const head = await fetch(url, { method: 'HEAD' });
    assert.equal(head.status, 200);
    assert.equal(await head.text(), '');
    for (const method of ['POST', 'PUT', 'PATCH', 'DELETE'])
      assert.equal((await fetch(url, { method })).status, 404);
    await pool.query(
      "UPDATE content_sources SET url = 'https://localhost/private-token' WHERE id = $1",
      [catalog[0].id],
    );
    const invalid = await fetch(url);
    assert.equal(invalid.status, 503);
    assert.deepEqual(await invalid.json(), {
      message: 'Source catalog unavailable',
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
