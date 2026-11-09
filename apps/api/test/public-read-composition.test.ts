import 'reflect-metadata';

import assert from 'node:assert/strict';
import type { AddressInfo } from 'node:net';
import test from 'node:test';

import { NestFactory } from '@nestjs/core';

import { PublicReadModule } from '../src/public-read/public-read.module';

void test('disabled public read composition exposes no routes and never opens storage', async () => {
  let opened = 0;
  const getPool = () => {
    opened++;
    throw new Error('Storage must remain closed');
  };
  for (const env of [{}, { PUBLIC_MODE: '0' }]) {
    const app = await NestFactory.create(
      PublicReadModule.prepare(env, getPool),
      {
        logger: false,
      },
    );
    try {
      await app.listen(0, '127.0.0.1');
      const address = app.getHttpServer().address() as AddressInfo;
      for (const path of [
        '/api/settings/schedule',
        '/api/admin/topics',
        '/api/admin/topics/sources',
        '/api/admin/content/sources',
        '/api/admin/content',
      ])
        for (const method of ['GET', 'HEAD'])
          assert.equal(
            (await fetch(`http://127.0.0.1:${address.port}${path}`, { method }))
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
    assert.throws(() => PublicReadModule.prepare(env, getPool));
  assert.equal(opened, 0);
});
