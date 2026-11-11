import 'reflect-metadata';

import assert from 'node:assert/strict';
import test from 'node:test';

import { Module } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import type { Pool } from 'pg';

import {
  ACCESS_HTTP,
  type AccessHttpRuntime,
  configuredAccessHttpProvider,
} from '../src/public-write/access-provider';
import { prepareConfiguredApiAdmission } from '../src/public-write/configured-api-admission';
import { prepareStoredAccessRuntime } from '../src/public-write/stored-access-runtime';

// Exercise the configured Nest boundary with storage/session stand-ins. No live
// accounts, proxy identities, external services or mutations participate.
void test('public readiness HTTP matrix admits reviewed explorer reads and closes unaudited tools', async () => {
  let principal: 'anonymous' | 'reader' | 'admin' = 'anonymous';
  let authentication = 0;
  let downstream = 0;
  let closed = 0;
  const provider = configuredAccessHttpProvider(
    {
      PUBLIC_MODE: '1',
      ACCOUNTS_ENABLED: '1',
      ACCOUNT_ORIGIN: 'https://reader.example',
      ADMIN_EMAILS: 'owner@example.test',
      ADMIN_LOCAL_TOKEN: 'test-local-token',
    },
    (options) =>
      prepareStoredAccessRuntime(options, {
        accounts: () => ({
          middleware: (_request, _response, next) => next(),
          handlers: {
            authorization: async () => {
              authentication++;
              return principal === 'anonymous'
                ? null
                : {
                    freshAdmin: principal === 'admin',
                    auditActor: {
                      userId: '11111111-1111-4111-8111-111111111111',
                    },
                    cookie: null,
                  };
            },
          },
          close: async () => {
            closed++;
          },
        }),
        pool: () =>
          ({
            connect: () =>
              assert.fail('Readiness refusal opened a transaction'),
            end: async () => {
              closed++;
            },
          }) as unknown as Pool,
        recorder: () => assert.fail('Readiness refusal opened audit storage'),
      }),
    testAdmission,
  );
  @Module({ providers: [provider] })
  class ReadinessModule {}
  const app = await NestFactory.create(ReadinessModule, { logger: false });
  try {
    app.use(app.get<AccessHttpRuntime>(ACCESS_HTTP).middleware);
    app.use((_request: unknown, response: { end: () => void }) => {
      downstream++;
      response.end();
    });
    await app.listen(0, '127.0.0.1');
    const base = await app.getUrl();
    for (const actor of ['anonymous', 'reader', 'admin', 'reader'] as const) {
      principal = actor;
      // Even a valid session or local token cannot grant an unclassified tool.
      for (const path of [
        '/logs',
        '/logs/',
        '/metrics',
        '/grafana/',
        '/docs/api/tree',
        '/db/api/rows',
        '/db/api/schema?rows=1',
        '/queues/',
        '/api/me',
        '/api/unknown',
        '/assets/missing.js',
        '/theme.js.map',
        '/%6detrics',
        '/api//admin/topics',
        '/api/admin/topics%2fsources',
      ]) {
        for (const method of ['GET', 'HEAD', 'POST']) {
          const before = [authentication, downstream];
          const response = await fetch(base + path, {
            method,
            headers: {
              'X-ExeDev-Email': 'owner@example.test',
              admin_local_token: 'test-local-token',
              'X-Forwarded-For': '203.0.113.7',
              Origin: 'https://reader.example',
              'Content-Type': 'application/json',
            },
          });
          assert.equal(response.status, 404, `${actor} ${method} ${path}`);
          assert.equal(await response.text(), '');
          assert.equal(response.headers.get('cache-control'), 'no-store');
          assert.equal(response.headers.get('set-cookie'), null);
          assert.ok(response.headers.get('content-security-policy'));
          assert.deepEqual([authentication, downstream], before);
        }
      }
      for (const path of [
        '/',
        '/saved',
        '/editions',
        '/privacy',
        '/healthz',
        '/api/editions',
        '/api/editions/latest',
        '/api/admin/status/alerts',
        '/api/admin/status',
        '/api/admin/topics',
      ]) {
        for (const method of ['GET', 'HEAD']) {
          const before = authentication;
          assert.equal((await fetch(base + path, { method })).status, 200);
          assert.equal(authentication, before, path);
        }
      }
      for (const path of [
        '/db',
        '/db/',
        '/db/app.js',
        '/db/style.css',
        '/db/api/schema',
      ]) {
        const before = authentication;
        const response = await fetch(base + path);
        assert.equal(response.status, 200, `${actor} GET ${path}`);
        assert.equal(response.headers.get('cache-control'), 'no-store');
        assert.equal(authentication, before);
        for (const method of ['HEAD', 'POST']) {
          const untouched = [authentication, downstream];
          assert.equal((await fetch(base + path, { method })).status, 404);
          assert.deepEqual([authentication, downstream], untouched);
        }
      }
      for (const path of [
        '/api/admin/profile',
        '/metrics/api/v1/query?query=up',
        '/metrics/api/v1/query_range?query=up',
        '/logs/select/logsql/query?query=error&limit=1',
      ]) {
        const before = downstream;
        assert.equal(
          (await fetch(base + path)).status,
          actor === 'admin' ? 200 : 404,
        );
        assert.equal(downstream, before + (actor === 'admin' ? 1 : 0));
      }
      // Provenance precedes session resolution, even for a fresh administrator.
      for (const path of [
        '/api/admin/profile/schedule',
        '/api/admin/topics/order',
      ]) {
        const before = [authentication, downstream];
        const response = await fetch(base + path, {
          method: 'PUT',
          headers: {
            Origin: 'https://foreign.example',
            'Content-Type': 'application/json',
          },
          body: '{}',
        });
        assert.equal(
          response.status,
          path.endsWith('/order') ? 400 : 403,
          path,
        );
        assert.deepEqual([authentication, downstream], before);
      }
    }
    // Direct-local credentials cannot open unreviewed tool routes.
    const before = [authentication, downstream];
    for (const path of [
      '/logs',
      '/metrics',
      '/queues/',
      '/docs/api/tree',
      '/db/api/rows',
    ]) {
      assert.equal(
        (
          await fetch(base + path, {
            headers: { admin_local_token: 'test-local-token' },
          })
        ).status,
        404,
      );
    }
    assert.deepEqual([authentication, downstream], before);
  } finally {
    await app.close();
  }
  assert.equal(closed, 2);
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
