import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import test from 'node:test';

import type { Pool } from 'pg';

import { prepareStoredAccessRuntime } from '../src/public-write/stored-access-runtime';

void test('stored access shares account identity, lazily records writes and closes every owner after failure', async () => {
  const closed: string[] = [];
  let recorded = 0;
  let constructed = 0;
  const runtime = await prepareStoredAccessRuntime(
    {
      enabled: true,
      origin: 'https://reader.example',
      env: {},
      legacyAccess: () => assert.fail('Legacy guard constructed'),
    },
    {
      accounts: () => ({
        middleware: (_request, _response, next) => next(),
        handlers: {
          authorization: async () => ({
            freshAdmin: true,
            auditActor: { userId: '00000000-0000-4000-8000-000000000001' },
            cookie: null,
          }),
        },
        close: async () => {
          closed.push('accounts');
          throw new Error('Account cleanup failed');
        },
      }),
      pool: () =>
        ({
          end: async () => {
            closed.push('sources');
          },
        }) as unknown as Pool,
      recorder: () => {
        constructed++;
        return {
          record: async (entry) => {
            assert.deepEqual(entry.actor, {
              userId: '00000000-0000-4000-8000-000000000001',
            });
            recorded++;
          },
          onModuleDestroy: async () => {
            closed.push('recorder');
          },
        };
      },
    },
  );
  const server = createServer((request, response) =>
    runtime.middleware(request, response, () => response.writeHead(204).end()),
  );
  await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', resolve));
  const address = server.address();
  assert.ok(address && typeof address !== 'string');
  const base = `http://127.0.0.1:${address.port}`;
  try {
    assert.equal((await fetch(base + '/api/editions/latest')).status, 204);
    assert.equal(constructed, 0);
    assert.equal(
      (
        await fetch(base + '/api/admin/topics', {
          method: 'POST',
          headers: {
            origin: 'https://reader.example',
            'content-type': 'application/json',
          },
          body: '{}',
        })
      ).status,
      204,
    );
    assert.equal(recorded, 1);
    const closing = runtime.close();
    assert.equal(runtime.close(), closing);
    await assert.rejects(closing, AggregateError);
    assert.deepEqual(closed.sort(), ['accounts', 'recorder', 'sources']);
    assert.equal((await fetch(base + '/api/editions/latest')).status, 503);
    assert.equal(constructed, 1);
  } finally {
    server.closeAllConnections();
    await new Promise<void>((resolve) => server.close(() => resolve()));
  }
});

void test('stored public startup refuses disabled accounts and cleans their resources', async () => {
  let closed = 0;
  await assert.rejects(
    prepareStoredAccessRuntime(
      {
        enabled: true,
        origin: 'https://reader.example',
        env: {},
        legacyAccess: () => assert.fail(),
      },
      {
        accounts: () => ({
          middleware: null,
          handlers: null,
          close: async () => {
            closed++;
          },
        }),
        pool: () => assert.fail('Source storage acquired'),
        recorder: () => assert.fail('Recorder acquired'),
      },
    ),
    /requires account transport/,
  );
  assert.equal(closed, 1);
});

void test('stored runtime forwards public admission before accounts and leaves private rollback dependency-free', async () => {
  for (const enabled of [true, false]) {
    let constructed = 0;
    let accountRequests = 0;
    let allowed = false;
    let closed = 0;
    const runtime = await prepareStoredAccessRuntime(
      {
        enabled,
        origin: 'https://reader.example',
        env: {},
        legacyAccess: () => (_request, _response, next) => next(),
        apiAdmission: {
          client: () => 'verified-visitor',
          admission: () => {
            constructed++;
            assert.ok(enabled);
            return { allow: async () => allowed };
          },
        },
      },
      {
        accounts: () => ({
          middleware: (_request, _response, next) => {
            accountRequests++;
            next();
          },
          handlers: {
            authorization: async () => ({
              freshAdmin: false,
              auditActor: null,
              cookie: null,
            }),
          },
          close: async () => {
            closed++;
          },
        }),
        pool: () =>
          ({
            end: async () => {
              closed++;
            },
          }) as unknown as Pool,
        recorder: () =>
          assert.fail('Refused and reader requests never record writes'),
      },
    );
    const server = createServer((request, response) =>
      runtime.middleware(request, response, () =>
        response.writeHead(204).end(),
      ),
    );
    await new Promise<void>((resolve) =>
      server.listen(0, '127.0.0.1', resolve),
    );
    const address = server.address();
    assert.ok(address && typeof address !== 'string');
    const base = `http://127.0.0.1:${address.port}`;
    try {
      const refused = await fetch(base + '/api/accounts/session');
      assert.equal(refused.status, enabled ? 429 : 204);
      assert.equal(accountRequests, enabled ? 0 : 1);
      assert.equal(constructed, enabled ? 1 : 0);
      if (enabled) {
        assert.equal(refused.headers.get('cache-control'), 'no-store');
        assert.equal(refused.headers.get('x-content-type-options'), 'nosniff');
        assert.equal(await refused.text(), '');
      }
      allowed = true;
      assert.equal((await fetch(base + '/api/editions/latest')).status, 204);
      assert.equal(accountRequests, enabled ? 1 : 2);
      await runtime.close();
      assert.equal(closed, enabled ? 2 : 1);
      assert.equal((await fetch(base + '/api/editions/latest')).status, 503);
      assert.equal(accountRequests, enabled ? 1 : 2);
    } finally {
      await runtime.close();
      server.closeAllConnections();
      await new Promise<void>((resolve) => server.close(() => resolve()));
    }
  }
});

void test('stored runtime releases account and write storage when admission construction fails', async () => {
  const closed: string[] = [];
  await assert.rejects(
    prepareStoredAccessRuntime(
      {
        enabled: true,
        origin: 'https://reader.example',
        env: {},
        legacyAccess: () => assert.fail(),
        apiAdmission: {
          client: () => assert.fail(),
          admission: () => {
            throw new Error('Admission configuration invalid');
          },
        },
      },
      {
        accounts: () => ({
          middleware: (_request, _response, next) => next(),
          handlers: { authorization: async () => assert.fail() },
          close: async () => {
            closed.push('accounts');
          },
        }),
        pool: () =>
          ({
            end: async () => {
              closed.push('writes');
            },
          }) as unknown as Pool,
        recorder: () => assert.fail(),
      },
    ),
    /Admission configuration invalid/,
  );
  assert.deepEqual(closed.sort(), ['accounts', 'writes']);
});
