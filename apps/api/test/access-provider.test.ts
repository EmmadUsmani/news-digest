import 'reflect-metadata';

import assert from 'node:assert/strict';
import { createServer } from 'node:http';
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
import { prepareAccessStack } from '../src/public-write/access-stack';
import { prepareConfiguredApiAdmission } from '../src/public-write/configured-api-admission';
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
    const provider = configuredAccessHttpProvider(
      env,
      async (options) => {
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
      },
      testAdmission,
    );
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
    testAdmission,
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
    for (const path of ['/api/admin/profile', '/grafana/', '/api/unknown']) {
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
    const unavailable = await fetch(base + '/api/admin/profile', {
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

function testAdmission(env: Readonly<Record<string, string | undefined>>) {
  const prepared = prepareConfiguredApiAdmission(
    {
      ...env,
      ACCOUNT_TRUSTED_PROXY_PEERS: '127.0.0.1',
      ACCOUNT_SECRET_KEY: 'ab'.repeat(32),
    },
    () => ({ eval: async () => 1, quit: async () => 'OK' }),
  );
  return prepared ? { ...prepared, client: () => 'offline-visitor' } : null;
}

void test('configured limiter validates before storage, cleans failed startup and aggregates shutdown', async () => {
  const env = {
    PUBLIC_MODE: '1',
    ACCOUNTS_ENABLED: '1',
    ACCOUNT_ORIGIN: 'https://reader.example',
  };
  await assert.rejects(
    configuredAccessHttpProvider(env, async () =>
      assert.fail('Storage opened'),
    ).useFactory(),
    /proxy peers/,
  );
  for (const cleanupFails of [false, true]) {
    let closed = 0;
    const admission = () => {
      const gate = testAdmission(env)!;
      return {
        ...gate,
        close: async () => {
          await gate.close();
          closed++;
          if (cleanupFails) throw new Error('Redis close failed');
        },
      };
    };
    const startup = new Error('Storage startup failed');
    await assert.rejects(
      configuredAccessHttpProvider(
        env,
        async (options) => {
          assert.ok(options.apiAdmission);
          throw startup;
        },
        admission,
      ).useFactory(),
      (error: unknown) => {
        if (cleanupFails) {
          assert.ok(error instanceof AggregateError);
          assert.equal(error.errors[0], startup);
          assert.equal(error.errors.length, 2);
        } else assert.equal(error, startup);
        return true;
      },
    );
    assert.equal(closed, 1);
    const runtime = await configuredAccessHttpProvider(
      env,
      async () => ({
        middleware: () => {},
        close: async () => {
          throw new Error('Storage close failed');
        },
      }),
      admission,
    ).useFactory();
    const closing = runtime.onModuleDestroy();
    assert.equal(runtime.onModuleDestroy(), closing);
    await assert.rejects(closing, (error: unknown) => {
      assert.ok(error instanceof AggregateError);
      assert.equal(error.errors.length, cleanupFails ? 2 : 1);
      return true;
    });
    assert.equal(closed, 2);
  }
});

void test('configured public provider enforces verified visitor denial before account dispatch', async () => {
  let allowed = false;
  let accounts = 0;
  const keys: unknown[] = [];
  const env = {
    PUBLIC_MODE: '1',
    ACCOUNTS_ENABLED: '1',
    ACCOUNT_ORIGIN: 'https://reader.example',
    ACCOUNT_TRUSTED_PROXY_PEERS: '127.0.0.1',
    ACCOUNT_SECRET_KEY: 'ab'.repeat(32),
  };
  const runtime = await configuredAccessHttpProvider(
    env,
    async (options) => ({
      middleware: prepareAccessStack({
        publicMode: true,
        apiAdmission: options.apiAdmission,
        accounts: (_request, _response, next) => {
          accounts++;
          next();
        },
        publicAccess: () => (_request, _response, next) => next(),
        legacyAccess: () => assert.fail(),
      }),
      close: async () => {},
    }),
    (config) =>
      prepareConfiguredApiAdmission(config, () => ({
        eval: async (...args) => {
          keys.push(args[2]);
          return allowed ? 1 : 0;
        },
        quit: async () => 'OK',
      })),
  ).useFactory();
  const server = createServer((req, res) =>
    runtime.middleware(req, res, () => res.writeHead(204).end()),
  );
  await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', resolve));
  const address = server.address();
  assert.ok(address && typeof address !== 'string');
  const base = `http://127.0.0.1:${address.port}`;
  try {
    for (const prefix of ['', '192.0.2.1, ', '192.0.2.2, 192.0.2.1, ']) {
      const response = await fetch(base + '/api/accounts/session', {
        headers: { 'x-forwarded-for': prefix + '203.0.113.10, 203.0.113.10' },
      });
      assert.equal(response.status, 429);
      assert.equal(response.headers.get('cache-control'), 'no-store');
    }
    assert.equal(new Set(keys).size, 1);
    assert.equal(accounts, 0);
    assert.equal((await fetch(base + '/healthz')).status, 204);
    allowed = true;
    assert.equal(
      (
        await fetch(base + '/api/editions/latest', {
          headers: { 'x-forwarded-for': '203.0.113.10, 203.0.113.10' },
        })
      ).status,
      204,
    );
    assert.equal(accounts, 2);
  } finally {
    server.closeAllConnections();
    await new Promise<void>((resolve) => server.close(() => resolve()));
    await runtime.onModuleDestroy();
  }
});
