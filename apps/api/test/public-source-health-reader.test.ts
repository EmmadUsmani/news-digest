import 'reflect-metadata';

import assert from 'node:assert/strict';
import type { AddressInfo } from 'node:net';
import test from 'node:test';

import { NestFactory } from '@nestjs/core';
import { Pool } from 'pg';

import { PublicSourceHealthReader } from '../src/modules/ingestion/database/public-source-health.reader';
import { PublicSourceHealthModule } from '../src/public-read/source-health.module';

void test('public source health composition counts observations and never reads stored secrets or legacy ownership', async () => {
  assert.equal(process.env.NEWS_DIGEST_ISOLATED_TEST, '1');
  const pool = new Pool({ connectionString: process.env.DATABASE_URL, max: 1 });
  const app = await NestFactory.create(
    PublicSourceHealthModule.prepare(
      { PUBLIC_MODE: '1', SYSTEM_OWNERSHIP: '1', READER_PUBLISHED_ONLY: '1' },
      () => pool,
    ),
    { logger: false },
  );
  try {
    await pool.query('BEGIN');
    await pool.query('ALTER TABLE profiles RENAME TO private_owner_fixture');
    await pool.query(
      "ALTER TABLE content_sources ADD COLUMN private_future_column text DEFAULT 'private-token'",
    );
    await pool.query(
      "UPDATE content_sources SET url = 'https://owner:private-token@example.org', last_error = 'postgres://owner:private-token@localhost/db', last_attempt = NULL, last_success = NULL, last_item_count = 0",
    );
    const { rows: expected } = await pool.query(
      `SELECT s.id, s.name, NULL AS "lastAttempt", NULL AS "lastSuccess", 0 AS "lastItemCount", count(o.item_id)::int AS "storedItems", true AS "hasError" FROM content_sources s LEFT JOIN content_observations o ON o.source_id = s.id GROUP BY s.id ORDER BY s.id`,
    );
    assert.ok(expected.length > 0);
    const raw = await new PublicSourceHealthReader(pool).read();
    assert.ok(raw.every((row) => row.error === ''));
    assert.equal(JSON.stringify(raw).includes('private-token'), false);
    await app.listen(0, '127.0.0.1');
    const address = app.getHttpServer().address() as AddressInfo;
    const url = `http://127.0.0.1:${address.port}/api/admin/content/sources`;
    const response = await fetch(url);
    assert.equal(response.status, 200);
    assert.equal(response.headers.get('cache-control'), 'no-store');
    assert.deepEqual(await response.json(), expected);
    assert.equal(await (await fetch(url, { method: 'HEAD' })).text(), '');
    for (const method of ['POST', 'PUT', 'PATCH', 'DELETE'])
      assert.equal((await fetch(url, { method })).status, 404);
    await pool.query(
      "UPDATE content_sources SET last_error = NULL, last_attempt = '2026-11-09T10:00:00+02:00', last_success = '2026-11-09T09:59:00+02:00'",
    );
    const healthy = await (await fetch(url)).json();
    assert.ok(
      healthy.every(
        (row: {
          hasError: boolean;
          lastAttempt: string;
          lastSuccess: string;
        }) =>
          !row.hasError &&
          row.lastAttempt === '2026-11-09T08:00:00.000Z' &&
          row.lastSuccess === '2026-11-09T07:59:00.000Z',
      ),
    );
    await pool.query(
      'ALTER TABLE content_observations RENAME TO unavailable_observations',
    );
    const failure = await fetch(url);
    assert.equal(failure.status, 503);
    assert.deepEqual(await failure.json(), {
      message: 'Source health unavailable',
      error: 'Service Unavailable',
      statusCode: 503,
    });
    await app.close();
    await pool.query('ROLLBACK');
    assert.equal((await pool.query('SELECT 1 AS alive')).rows[0].alive, 1);
  } finally {
    await app.close();
    await pool.query('ROLLBACK');
    await pool.end();
  }
});
