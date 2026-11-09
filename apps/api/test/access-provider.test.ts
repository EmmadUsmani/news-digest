import 'reflect-metadata';

import assert from 'node:assert/strict';
import test from 'node:test';

import { Module } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';

import {
  ACCESS_HTTP,
  accessHttpProvider,
  type AccessHttpRuntime,
} from '../src/public-write/access-provider';

void test('Nest owns prepared access shutdown and mounts its middleware before parsers', async () => {
  let opened = 0;
  let closed = 0;
  const options = {
    enabled: false,
    origin: 'https://reader.example',
    env: {},
    legacyAccess:
      () => (_request: unknown, _response: unknown, next: () => void) =>
        next(),
  };
  const provider = accessHttpProvider(options, async (received) => {
    assert.equal(received, options);
    opened++;
    return {
      middleware: (request, response) => {
        assert.equal('body' in request, false);
        response.writeHead(413, { 'Cache-Control': 'no-store' }).end();
      },
      close: async () => {
        closed++;
      },
    };
  });
  assert.equal(opened, 0);
  @Module({ providers: [provider] })
  class TestModule {}
  const app = await NestFactory.create(TestModule, { logger: false });
  try {
    assert.equal(opened, 1);
    app.use(app.get<AccessHttpRuntime>(ACCESS_HTTP).middleware);
    await app.listen(0, '127.0.0.1');
    const response = await fetch(
      (await app.getUrl()) + '/api/account/request-code',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: '{malformed',
      },
    );
    assert.equal(response.status, 413);
    assert.equal(response.headers.get('cache-control'), 'no-store');
  } finally {
    await app.close();
  }
  assert.equal(closed, 1);
});

void test('access provider propagates startup refusal without publishing middleware', async () => {
  const provider = accessHttpProvider(
    {
      enabled: true,
      origin: 'https://reader.example',
      env: {},
      legacyAccess: () => assert.fail('legacy constructed'),
    },
    async () => {
      throw new Error('Access configuration refused');
    },
  );
  await assert.rejects(provider.useFactory(), /Access configuration refused/);
});
