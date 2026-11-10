import 'reflect-metadata';

import assert from 'node:assert/strict';
import type { AddressInfo } from 'node:net';
import test from 'node:test';

import { NestFactory } from '@nestjs/core';

import { PublicPreviewReads } from '../src/public-read/previews';
import { PublicPreviewsModule } from '../src/public-read/previews.module';
import { classifyPublicRoute } from '../src/public-route-policy';
const env = {
  PUBLIC_MODE: '1',
  SYSTEM_OWNERSHIP: '1',
  READER_PUBLISHED_ONLY: '1',
};
const id = '00000000-0000-4000-8000-000000000001';
void test('prepared preview HTTP routes require published reads and exclude private operations', async () => {
  const calls: unknown[] = [];
  let failure = false;
  const reads = new PublicPreviewReads({
    async history(offset, published) {
      calls.push([offset, published]);
      if (failure) throw new Error('private-secret');
      return { entries: [], hasMore: false };
    },
    async latest(published) {
      calls.push(published);
      if (failure) throw new Error('private-secret');
      return null;
    },
    async find(key, published) {
      calls.push([key, published]);
      if (failure) throw new Error('private-secret');
      return null;
    },
  });
  const app = await NestFactory.create(
    PublicPreviewsModule.prepare(env, () => reads),
    { logger: false },
  );
  try {
    await app.listen(0, '127.0.0.1');
    const base = `http://127.0.0.1:${(app.getHttpServer().address() as AddressInfo).port}/api/admin/digest-previews`;
    const history = await fetch(base + '?offset=20');
    assert.equal(history.status, 200);
    assert.equal(history.headers.get('cache-control'), 'no-store');
    assert.deepEqual(await history.json(), { entries: [], hasMore: false });
    assert.equal((await fetch(base + '/latest')).status, 200);
    assert.equal((await fetch(base + '/' + id)).status, 404);
    assert.deepEqual(calls, [[20, true], true, [id, true]]);
    const count = calls.length;
    for (const suffix of [
      '?offset=-1',
      '?offset=01',
      '?offset=10000000',
      '?offset=0&offset=1',
      '/invalid',
    ])
      assert.equal((await fetch(base + suffix)).status, 400);
    assert.equal(calls.length, count);
    for (const suffix of ['', '/latest']) {
      const head = await fetch(base + suffix, { method: 'HEAD' });
      assert.equal(head.status, 200);
      assert.equal(head.headers.get('cache-control'), 'no-store');
      assert.equal(await head.text(), '');
    }
    for (const suffix of ['/' + id + '/cost', '/jobs/' + id])
      assert.equal((await fetch(base + suffix)).status, 404);
    for (const suffix of ['', '/tests', '/jobs'])
      for (const method of ['POST', 'PUT', 'PATCH', 'DELETE'])
        assert.equal((await fetch(base + suffix, { method })).status, 404);
    failure = true;
    for (const suffix of ['', '/latest', '/' + id]) {
      const response = await fetch(base + suffix);
      assert.equal(response.status, 503);
      assert.equal(response.headers.get('cache-control'), 'no-store');
      const body = await response.text();
      assert.match(body, /Editions unavailable/);
      assert.doesNotMatch(body, /private-secret/);
    }
    for (const suffix of ['', '/latest', '/' + id])
      assert.equal(
        classifyPublicRoute('GET', '/api/admin/digest-previews' + suffix),
        'admin',
      );
  } finally {
    await app.close();
  }
});
void test('prepared previews stays absent when disabled and validates before constructing a reader', async () => {
  let created = 0;
  const create = () => {
    created++;
    throw new Error('Reader must remain unopened');
  };
  for (const flags of [{}, { PUBLIC_MODE: '0' }]) {
    const app = await NestFactory.create(
      PublicPreviewsModule.prepare(flags, create),
      {
        logger: false,
      },
    );
    try {
      await app.listen(0, '127.0.0.1');
      const base = `http://127.0.0.1:${(app.getHttpServer().address() as AddressInfo).port}/api/admin/previews`;
      for (const method of ['GET', 'HEAD'])
        assert.equal((await fetch(base, { method })).status, 404);
    } finally {
      await app.close();
    }
  }
  for (const flags of [
    { PUBLIC_MODE: 'true' },
    { PUBLIC_MODE: '1' },
    { PUBLIC_MODE: '1', SYSTEM_OWNERSHIP: '1' },
    { ...env, READER_PUBLISHED_ONLY: '0' },
  ])
    assert.throws(() => PublicPreviewsModule.prepare(flags, create));
  assert.equal(created, 0);
});
