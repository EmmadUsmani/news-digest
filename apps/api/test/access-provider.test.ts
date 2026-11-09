import 'reflect-metadata';

import assert from 'node:assert/strict';
import test from 'node:test';

import { Module } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import type { Pool } from 'pg';

import {
  ACCESS_HTTP,
  accessHttpProvider,
  type AccessHttpRuntime,
  configuredAccessHttpProvider,
} from '../src/public-write/access-provider';
import { prepareStoredAccessRuntime } from '../src/public-write/stored-access-runtime';

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

void test('configured access refuses invalid public prerequisites before storage opens', async () => {
  for (const env of [
    { PUBLIC_MODE: 'true' },
    { PUBLIC_MODE: '1' },
    { PUBLIC_MODE: '1', ACCOUNTS_ENABLED: '0' },
    { PUBLIC_MODE: '1', ACCOUNTS_ENABLED: '1' },
    {
      PUBLIC_MODE: '1',
      ACCOUNTS_ENABLED: '1',
      ACCOUNT_ORIGIN: 'http://reader.example',
    },
    {
      PUBLIC_MODE: '1',
      ACCOUNTS_ENABLED: '1',
      ACCOUNT_ORIGIN: 'https://reader.example/path',
    },
  ]) {
    let opened = false;
    const provider = configuredAccessHttpProvider(env, async () => {
      opened = true;
      throw new Error('Storage must remain unopened');
    });
    await assert.rejects(provider.useFactory());
    assert.equal(opened, false);
  }
});

void test('configured access selects private defaults and forwards public configuration lazily', async () => {
  for (const env of [
    {},
    { PUBLIC_MODE: '0', ACCOUNT_ORIGIN: 'unused invalid origin' },
    {
      PUBLIC_MODE: '1',
      ACCOUNTS_ENABLED: '1',
      ACCOUNT_ORIGIN: 'https://reader.example',
      ADMIN_EMAILS: 'owner@example.test',
      ADMIN_LOCAL_TOKEN: 'local-test-token',
    },
  ]) {
    let opened = 0;
    let closed = 0;
    const middleware = () => {};
    const provider = configuredAccessHttpProvider(env, async (options) => {
      opened++;
      assert.equal(options.enabled, env.PUBLIC_MODE === '1');
      assert.equal(options.origin, env.ACCOUNT_ORIGIN ?? '');
      assert.equal(options.env, env);
      assert.equal(options.localToken, env.ADMIN_LOCAL_TOKEN);
      assert.equal(typeof options.legacyAccess(), 'function');
      return {
        middleware,
        close: async () => {
          closed++;
        },
      };
    });
    assert.equal(opened, 0);
    const runtime = await provider.useFactory();
    assert.equal(opened, 1);
    assert.equal(runtime.middleware, middleware);
    await runtime.onModuleDestroy();
    assert.equal(closed, 1);
  }
});

void test('registered access module preserves private HTTP behavior with one runtime', async () => {
  const { AccessModule } = await import('../src/public-write/access.module');
  const { ACCOUNT_HTTP } =
    await import('../src/modules/accounts/accounts.module');
  const keys = ['PUBLIC_MODE', 'ACCOUNTS_ENABLED', 'ADMIN_EMAILS'] as const;
  const previous = keys.map((key) => process.env[key]);
  process.env.PUBLIC_MODE = '0';
  process.env.ACCOUNTS_ENABLED = '0';
  process.env.ADMIN_EMAILS = 'owner@example.test';
  const app = await NestFactory.create(AccessModule, {
    logger: false,
    abortOnError: false,
  });
  try {
    assert.throws(() => app.get(ACCOUNT_HTTP));
    app.use(app.get<AccessHttpRuntime>(ACCESS_HTTP).middleware);
    app.use((_request: unknown, response: { end: (body: string) => void }) => {
      response.end('downstream');
    });
    await app.listen(0, '127.0.0.1');
    const url = await app.getUrl();
    assert.equal((await fetch(url + '/api/admin/settings')).status, 404);
    const allowed = await fetch(url + '/api/admin/settings', {
      headers: { 'X-ExeDev-Email': 'owner@example.test' },
    });
    assert.equal(await allowed.text(), 'downstream');
    assert.deepEqual(await (await fetch(url + '/api/me')).json(), {
      isAdmin: false,
    });
    assert.equal(
      await (await fetch(url + '/api/editions')).text(),
      'downstream',
    );
    assert.equal(
      await (
        await fetch(url + '/api/account/request-code', { method: 'POST' })
      ).text(),
      'downstream',
    );
  } finally {
    await app.close();
    keys.forEach((key, index) => {
      const value = previous[index];
      if (value === undefined) delete process.env[key];
      else process.env[key] = value;
    });
  }
});

void test('configured public Nest runtime refuses proxy identities and writes before controllers', async () => {
  let authenticated = 0;
  let sessionUnavailable = false;
  let downstream = 0;
  const closed: string[] = [];
  const provider = configuredAccessHttpProvider(
    {
      PUBLIC_MODE: '1',
      ACCOUNTS_ENABLED: '1',
      ACCOUNT_ORIGIN: 'https://reader.example',
      ADMIN_EMAILS: 'owner@example.test',
    },
    (options) =>
      prepareStoredAccessRuntime(options, {
        accounts: () => ({
          middleware: (_request, _response, next) => next(),
          handlers: {
            authorization: async () => {
              authenticated++;
              if (sessionUnavailable)
                throw new Error('Session storage unavailable');
              return null;
            },
          },
          close: async () => {
            closed.push('accounts');
          },
        }),
        pool: () =>
          ({
            connect: () => assert.fail('Refused requests opened a transaction'),
            end: async () => {
              closed.push('sources');
            },
          }) as unknown as Pool,
        recorder: () =>
          assert.fail('Refused requests opened admission storage'),
      }),
  );
  @Module({ providers: [provider] })
  class PublicTestModule {}
  const app = await NestFactory.create(PublicTestModule, { logger: false });
  try {
    app.use(app.get<AccessHttpRuntime>(ACCESS_HTTP).middleware);
    app.use((_request: unknown, response: { end: (body: string) => void }) => {
      downstream++;
      response.end('reader');
    });
    await app.listen(0, '127.0.0.1');
    const base = await app.getUrl();
    assert.equal(
      await (await fetch(base + '/api/editions/latest')).text(),
      'reader',
    );
    assert.equal(authenticated, 0);
    for (const path of ['/api/admin/topics', '/grafana/', '/api/unknown']) {
      const response = await fetch(base + path, {
        headers: { 'X-ExeDev-Email': 'owner@example.test' },
      });
      assert.equal(response.status, 404, path);
      assert.equal(response.headers.get('cache-control'), 'no-store');
    }
    assert.equal(authenticated, 1);
    for (const path of [
      '/api/admin/topics',
      '/api/admin/topics/sources/example/enabled',
    ]) {
      const method = path.endsWith('/enabled') ? 'PUT' : 'POST';
      const before = authenticated;
      const refused = await fetch(base + path, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: '{malformed',
      });
      assert.equal(refused.status, method === 'PUT' ? 400 : 403, path);
      assert.equal(authenticated, before);
      const anonymous = await fetch(base + path, {
        method,
        headers: {
          Origin: 'https://reader.example',
          'Content-Type': 'application/json',
          'X-ExeDev-Email': 'owner@example.test',
        },
        body: '{"enabled":true}',
      });
      assert.equal(anonymous.status, 404, path);
      assert.equal(authenticated, before + 1);
    }
    sessionUnavailable = true;
    const unavailable = await fetch(base + '/api/admin/topics', {
      headers: { 'X-ExeDev-Email': 'owner@example.test' },
    });
    assert.equal(unavailable.status, 503);
    assert.equal(await unavailable.text(), '');
    assert.equal(downstream, 1);
  } finally {
    await app.close();
  }
  assert.deepEqual(closed.sort(), ['accounts', 'sources']);
});
