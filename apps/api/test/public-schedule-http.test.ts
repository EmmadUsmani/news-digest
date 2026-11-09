import 'reflect-metadata';

import assert from 'node:assert/strict';
import type { AddressInfo } from 'node:net';
import test from 'node:test';

import { Module } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';

import {
  PUBLIC_SCHEDULE,
  PublicScheduleController,
} from '../src/public-read/schedule.controller';
import { PublicScheduleModule } from '../src/public-read/schedule.module';

void test('unregistered schedule transport projects GET/HEAD and hides invalid state and storage errors', async () => {
  const expected = {
    cadence: '0 15 * * *',
    timezone: 'UTC',
    coverageWindow: 'P1D',
    storyBudget: 5,
    postBudget: 5,
  };
  let value: unknown = { ...expected, profileId: 'private-owner' };
  let failure = false;
  let reads = 0;
  @Module({
    controllers: [PublicScheduleController],
    providers: [
      {
        provide: PUBLIC_SCHEDULE,
        useValue: {
          read: async () => {
            reads++;
            if (failure) throw new Error('private-database-credential');
            return value;
          },
        },
      },
    ],
  })
  class TestModule {}
  const app = await NestFactory.create(TestModule, { logger: false });
  await app.listen(0, '127.0.0.1');
  const address = app.getHttpServer().address() as AddressInfo;
  const url = `http://127.0.0.1:${address.port}/api/settings/schedule`;
  try {
    const get = await fetch(url);
    assert.equal(get.status, 200);
    assert.equal(get.headers.get('cache-control'), 'no-store');
    assert.deepEqual(await get.json(), expected);
    const head = await fetch(url, { method: 'HEAD' });
    assert.equal(head.status, 200);
    assert.equal(await head.text(), '');
    assert.equal(head.headers.get('cache-control'), 'no-store');
    for (const method of ['POST', 'PUT', 'PATCH', 'DELETE']) {
      const before = reads;
      assert.equal((await fetch(url, { method })).status, 404);
      assert.equal(reads, before);
    }
    for (const invalid of [
      undefined,
      { ...expected, storyBudget: 'private-invalid-budget' },
    ]) {
      value = invalid;
      const response = await fetch(url);
      assert.equal(response.status, 503);
      assert.equal(response.headers.get('cache-control'), 'no-store');
      assert.deepEqual(await response.json(), {
        message: 'Schedule settings unavailable',
        error: 'Service Unavailable',
        statusCode: 503,
      });
    }
    failure = true;
    const response = await fetch(url);
    assert.equal(response.status, 503);
    assert.deepEqual(await response.json(), {
      message: 'Schedule settings unavailable',
      error: 'Service Unavailable',
      statusCode: 503,
    });
  } finally {
    await app.close();
  }
});

void test('public schedule composition stays dependency-free when disabled and rejects unsafe enablement', async () => {
  let calls = 0;
  const getPool = () => {
    calls++;
    throw new Error('Must not open storage');
  };
  for (const env of [{}, { PUBLIC_MODE: '0', SYSTEM_OWNERSHIP: 'invalid' }]) {
    const app = await NestFactory.create(
      PublicScheduleModule.prepare(env, getPool),
      { logger: false },
    );
    try {
      await app.listen(0, '127.0.0.1');
      const address = app.getHttpServer().address() as AddressInfo;
      assert.equal(
        (await fetch(`http://127.0.0.1:${address.port}/api/settings/schedule`))
          .status,
        404,
      );
    } finally {
      await app.close();
    }
  }
  for (const env of [
    { PUBLIC_MODE: 'true' },
    { PUBLIC_MODE: '1' },
    { PUBLIC_MODE: '1', SYSTEM_OWNERSHIP: '1' },
    { PUBLIC_MODE: '1', READER_PUBLISHED_ONLY: '1' },
    { PUBLIC_MODE: '1', SYSTEM_OWNERSHIP: '0', READER_PUBLISHED_ONLY: '1' },
  ])
    assert.throws(() => PublicScheduleModule.prepare(env, getPool));
  assert.equal(calls, 0);
});
