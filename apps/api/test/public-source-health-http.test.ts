import 'reflect-metadata';

import assert from 'node:assert/strict';
import type { AddressInfo } from 'node:net';
import test from 'node:test';

import { Module } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';

import {
  PUBLIC_SOURCE_HEALTH,
  PublicSourceHealthController,
} from '../src/public-read/source-health.controller';
import { PublicSourceHealthModule } from '../src/public-read/source-health.module';

void test('unregistered source health transport withholds stored errors and rejects malformed health over HTTP', async () => {
  const source = {
    id: 'publisher',
    name: 'Publisher',
    url: 'https://feeds.publisher.org/private-token?key=private-token#private-token',
    futureColumn: 'private-token',
    lastAttempt: '2026-11-09T09:00:00+01:00',
    lastSuccess: null,
    lastItemCount: 0,
    storedItems: 42,
    error: 'postgres://owner:private-token@localhost/private-token',
  };
  const expected = [
    {
      id: source.id,
      name: source.name,
      lastAttempt: '2026-11-09T08:00:00.000Z',
      lastSuccess: null,
      lastItemCount: 0,
      storedItems: 42,
      hasError: true,
    },
  ];
  let value: unknown = [source];
  let failure = false;
  let reads = 0;
  @Module({
    controllers: [PublicSourceHealthController],
    providers: [
      {
        provide: PUBLIC_SOURCE_HEALTH,
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
  const url = `http://127.0.0.1:${address.port}/api/admin/content/sources`;
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
      [source, { ...source, lastAttempt: 'private-token' }],
      [{ ...source, storedItems: -1 }],
      [{ ...source, error: { secret: 'private-token' } }],
      [{ ...source, name: null }],
    ]) {
      value = invalid;
      const response = await fetch(url);
      assert.equal(response.status, 503);
      assert.equal(response.headers.get('cache-control'), 'no-store');
      assert.deepEqual(await response.json(), {
        message: 'Source health unavailable',
        error: 'Service Unavailable',
        statusCode: 503,
      });
    }
    failure = true;
    const response = await fetch(url);
    assert.equal(response.status, 503);
    assert.deepEqual(await response.json(), {
      message: 'Source health unavailable',
      error: 'Service Unavailable',
      statusCode: 503,
    });
  } finally {
    await app.close();
  }
});

void test('public source health composition stays dependency-free when disabled and rejects unsafe enablement', async () => {
  let calls = 0;
  const getPool = () => {
    calls++;
    throw new Error('Must not open storage');
  };
  for (const env of [{}, { PUBLIC_MODE: '0', SYSTEM_OWNERSHIP: 'invalid' }]) {
    const app = await NestFactory.create(
      PublicSourceHealthModule.prepare(env, getPool),
      { logger: false },
    );
    try {
      await app.listen(0, '127.0.0.1');
      const address = app.getHttpServer().address() as AddressInfo;
      assert.equal(
        (
          await fetch(
            `http://127.0.0.1:${address.port}/api/admin/content/sources`,
          )
        ).status,
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
    assert.throws(() => PublicSourceHealthModule.prepare(env, getPool));
  assert.equal(calls, 0);
});
