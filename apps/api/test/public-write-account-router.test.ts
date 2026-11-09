import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import test from 'node:test';

import type { Pool } from 'pg';

import { prepareAccountPublicWriteRouter } from '../src/public-write/account-router';

void test('disabled account write routing is lazy and missing accounts refuse before storage', async () => {
  const unexpected = () => {
    throw new Error('unexpected resource');
  };
  const options = {
    enabled: false,
    origin: 'unused',
    pool: unexpected,
    accounts: unexpected,
    recordAdminWrite: unexpected,
  };
  const runtime = await prepareAccountPublicWriteRouter(options);
  let forwarded = false;
  runtime.middleware(null!, null!, () => {
    forwarded = true;
  });
  await runtime.close();
  assert.equal(forwarded, true);
  await assert.rejects(
    prepareAccountPublicWriteRouter({
      ...options,
      enabled: true,
      accounts: () => null,
    }),
    /requires accounts/,
  );
});

void test('account write routing shares fresh session checks and keeps source refusals out of standalone admission', async () => {
  const at = new Date('2026-11-09T12:00:00Z');
  let freshAdmin = false;
  let unavailable = false;
  let authenticated = 0;
  let admissions = 0;
  let legacy = 0;
  let closed = 0;
  let connections = 0;
  const runtime = await prepareAccountPublicWriteRouter({
    enabled: true,
    origin: 'https://reader.example',
    localToken: 'local-secret',
    now: () => at,
    pool: () =>
      ({
        query: async () => {
          connections++;
          throw new Error('isolated storage unavailable');
        },
        end: async () => {
          closed++;
        },
      }) as unknown as Pool,
    accounts: () => ({
      authorization: async (cookie, now) => {
        authenticated++;
        assert.equal(cookie, 'session=test');
        assert.equal(now, at);
        if (unavailable) throw new Error('private session failure');
        return {
          freshAdmin,
          auditActor: { userId: '11111111-1111-4111-8111-111111111111' },
          cookie: 'renewed=test; Secure',
        };
      },
    }),
    recordAdminWrite: async () => {
      admissions++;
    },
  });
  const server = createServer((req, res) =>
    runtime.middleware(req, res, () => {
      legacy++;
      res.writeHead(204).end();
    }),
  );
  try {
    await new Promise<void>((resolve) =>
      server.listen(0, '127.0.0.1', resolve),
    );
    const address = server.address();
    assert.ok(address && typeof address !== 'string');
    const call = (path: string) =>
      fetch(`http://127.0.0.1:${address.port}${path}`, {
        method: 'PUT',
        headers: {
          cookie: 'session=test',
          origin: 'https://reader.example',
          localToken: 'local-secret',
          'content-type': 'application/json',
        },
        body: '{"enabled":true}',
      });
    const refused = await call('/api/admin/topics/sources/example/enabled');
    assert.equal(refused.status, 404);
    assert.equal(refused.headers.get('set-cookie'), 'renewed=test; Secure');
    assert.equal(
      (await call('/api/admin/topics/sources/example/enabled')).status,
      404,
    );
    assert.deepEqual([admissions, legacy], [0, 0]);
    freshAdmin = true;
    assert.equal((await call('/api/admin/profile/schedule')).status, 204);
    assert.equal((await call('/api/admin/topics/order')).status, 400);
    assert.deepEqual([admissions, legacy], [1, 1]);
    const beforeRefusals = authenticated;
    for (const headers of [
      { 'content-type': 'application/json' },
      { origin: 'https://foreign.example', 'content-type': 'application/json' },
      { origin: 'https://reader.example', 'content-type': 'text/plain' },
      { origin: 'https://reader.example' },
    ]) {
      const refusedWrite = await fetch(
        `http://127.0.0.1:${address.port}/api/admin/topics/order`,
        { method: 'PUT', headers: { cookie: 'session=test', ...headers } },
      );
      assert.equal(refusedWrite.status, 400);
      assert.equal(refusedWrite.headers.get('cache-control'), 'no-store');
      assert.equal(await refusedWrite.text(), '');
    }
    assert.equal(authenticated, beforeRefusals);
    assert.deepEqual([admissions, legacy], [1, 1]);
    const beforeLocal = authenticated;
    const localWrite = await fetch(
      `http://127.0.0.1:${address.port}/api/admin/topics/sources/example/enabled`,
      {
        method: 'PUT',
        headers: {
          ADMIN_LOCAL_TOKEN: 'local-secret',
          'content-type': 'application/json',
        },
        body: '{"enabled":true}',
      },
    );
    assert.equal(localWrite.status, 503);
    assert.equal(await localWrite.text(), '');
    assert.equal(connections, 1);
    assert.equal(authenticated, beforeLocal);
    assert.deepEqual([admissions, legacy], [1, 1]);
    unavailable = true;
    const failed = await call('/api/admin/topics/sources/example/enabled');
    assert.equal(failed.status, 503);
    assert.equal(await failed.text(), '');
    assert.deepEqual([admissions, legacy], [1, 1]);
  } finally {
    server.closeAllConnections();
    await new Promise<void>((resolve) => server.close(() => resolve()));
    await runtime.close();
    assert.equal(closed, 1);
  }
});
