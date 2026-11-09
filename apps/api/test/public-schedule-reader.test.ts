import 'reflect-metadata';

import assert from 'node:assert/strict';
import type { AddressInfo } from 'node:net';
import test from 'node:test';

import { ServiceUnavailableException } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { Pool } from 'pg';

import { PublicScheduleReader } from '../src/modules/profiles/database/public-schedule.reader';
import { PublicScheduleModule } from '../src/public-read/schedule.module';

void test('public schedule reads only system settings with no legacy tables or flag dependency', async () => {
  assert.equal(process.env.NEWS_DIGEST_ISOLATED_TEST, '1');
  // A single connection keeps the adapter inside this rolled-back transaction.
  const pool = new Pool({ connectionString: process.env.DATABASE_URL, max: 1 });
  const reader = new PublicScheduleReader(pool);
  const previous = process.env.SYSTEM_OWNERSHIP;
  const expected = {
    cadence: '17 8 * * *',
    timezone: 'Pacific/Auckland',
    coverageWindow: 'PT12H',
    storyBudget: 3,
    postBudget: 7,
  };
  try {
    await pool.query('BEGIN');
    await pool.query('ALTER TABLE profiles RENAME TO private_owner_fixture');
    await pool.query(
      'ALTER TABLE digest_schedules RENAME TO private_schedule_fixture',
    );
    await pool.query(
      'UPDATE edition_settings SET cadence=$1,timezone=$2,coverage_window=$3,story_budget=$4,post_budget=$5 WHERE id=1',
      Object.values(expected),
    );
    for (const flag of [undefined, '0', '1']) {
      if (flag === undefined) delete process.env.SYSTEM_OWNERSHIP;
      else process.env.SYSTEM_OWNERSHIP = flag;
      assert.deepEqual(await reader.read(), expected);
    }
    const callerResult = await reader.read();
    callerResult.storyBudget = 20;
    assert.deepEqual(await reader.read(), expected);
    await pool.query('DELETE FROM edition_settings');
    await assert.rejects(reader.read(), (error: unknown) => {
      assert.ok(error instanceof ServiceUnavailableException);
      assert.deepEqual(error.getResponse(), {
        message: 'Schedule settings unavailable',
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
  }
  await assert.rejects(reader.read(), (error: unknown) => {
    assert.ok(error instanceof ServiceUnavailableException);
    assert.equal(error.message, 'Schedule settings unavailable');
    return true;
  });
});

void test('enabled public schedule composition serves system storage and leaves shared pool open', async () => {
  assert.equal(process.env.NEWS_DIGEST_ISOLATED_TEST, '1');
  const pool = new Pool({ connectionString: process.env.DATABASE_URL, max: 1 });
  const expected = {
    cadence: '17 8 * * *',
    timezone: 'UTC',
    coverageWindow: 'PT12H',
    storyBudget: 3,
    postBudget: 7,
  };
  const app = await NestFactory.create(
    PublicScheduleModule.prepare(
      { PUBLIC_MODE: '1', SYSTEM_OWNERSHIP: '1', READER_PUBLISHED_ONLY: '1' },
      () => pool,
    ),
    { logger: false },
  );
  try {
    await pool.query('BEGIN');
    await pool.query(
      'UPDATE edition_settings SET cadence=$1,timezone=$2,coverage_window=$3,story_budget=$4,post_budget=$5 WHERE id=1',
      Object.values(expected),
    );
    await app.listen(0, '127.0.0.1');
    const address = app.getHttpServer().address() as AddressInfo;
    const url = `http://127.0.0.1:${address.port}/api/settings/schedule`;
    const response = await fetch(url);
    assert.equal(response.status, 200);
    assert.equal(response.headers.get('cache-control'), 'no-store');
    assert.deepEqual(await response.json(), expected);
    assert.equal(await (await fetch(url, { method: 'HEAD' })).text(), '');
    assert.equal((await fetch(url, { method: 'PUT' })).status, 404);
    await pool.query('DELETE FROM edition_settings');
    const missing = await fetch(url);
    assert.equal(missing.status, 503);
    assert.deepEqual(await missing.json(), {
      message: 'Schedule settings unavailable',
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
