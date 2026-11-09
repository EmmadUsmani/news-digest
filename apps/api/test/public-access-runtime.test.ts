import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import test from 'node:test';

import type { Pool } from 'pg';

import { prepareAccessRuntime } from '../src/public-write/access-runtime';

void test('combined public runtime keeps accounts first, refuses proxy identity and owns shutdown', async () => {
  let acquired = 0;
  let closed = 0;
  let downstream = 0;
  let authentication = 0;
  let admitted = true;
  let admissionCalls = 0;
  const runtime = await prepareAccessRuntime({
    enabled: true,
    origin: 'https://reader.example',
    apiAdmission: {
      client: () => 'verified-visitor',
      admission: () => ({
        allow: async () => {
          admissionCalls++;
          return admitted;
        },
      }),
    },
    pool: () => {
      acquired++;
      return {
        end: async () => {
          closed++;
        },
      } as unknown as Pool;
    },
    accounts: () => ({
      authorization: async () => {
        authentication++;
        return null;
      },
    }),
    accountTransport: (request, response, next) => {
      if (request.url === '/api/account/session') response.writeHead(204).end();
      else next();
    },
    recordAdminWrite: () => {
      throw new Error('Unexpected audit admission');
    },
    legacyAccess: () => {
      throw new Error('Unexpected legacy guard');
    },
  });
  const server = createServer((request, response) =>
    runtime.middleware(request, response, () => {
      downstream++;
      response.writeHead(204).end();
    }),
  );
  await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', resolve));
  const address = server.address();
  assert.ok(address && typeof address !== 'string');
  const base = `http://127.0.0.1:${address.port}`;
  try {
    assert.equal((await fetch(base + '/api/account/session')).status, 204);
    assert.equal((await fetch(base + '/api/editions/latest')).status, 204);
    assert.equal(
      (
        await fetch(base + '/api/admin/topics', {
          headers: { 'x-exedev-email': 'owner@example.com' },
        })
      ).status,
      404,
    );
    assert.equal(
      (
        await fetch(base + '/api/admin/topics/sources/hn/enabled', {
          method: 'PUT',
          headers: {
            origin: 'https://evil.example',
            'content-type': 'application/json',
          },
          body: '{"enabled":true}',
        })
      ).status,
      400,
    );
    assert.deepEqual([acquired, authentication, downstream], [1, 1, 1]);
    assert.equal(admissionCalls, 4);
    admitted = false;
    for (const path of [
      '/api/account/session',
      '/api/editions/latest',
      '/api/admin/topics',
    ]) {
      assert.equal((await fetch(base + path)).status, 429);
    }
    assert.deepEqual([acquired, authentication, downstream], [1, 1, 1]);
    admitted = true;
    assert.equal((await fetch(base + '/api/editions/latest')).status, 204);
    assert.equal(downstream, 2);
  } finally {
    server.closeAllConnections();
    await new Promise<void>((resolve, reject) =>
      server.close((error) => (error ? reject(error) : resolve())),
    );
    const closing = runtime.close();
    assert.equal(runtime.close(), closing);
    await closing;
  }
  assert.equal(closed, 1);
});

void test('combined private runtime acquires no public resources; missing transport refuses before acquisition', async () => {
  const unexpected = () => {
    throw new Error('Unexpected resource');
  };
  const options = {
    enabled: false,
    origin: 'unused',
    pool: unexpected,
    accounts: unexpected,
    accountTransport: null,
    recordAdminWrite: unexpected,
    legacyAccess:
      () => (_request: unknown, _response: unknown, next: () => void) =>
        next(),
  };
  const runtime = await prepareAccessRuntime(options);
  let forwarded = false;
  runtime.middleware(null!, null!, () => {
    forwarded = true;
  });
  assert.equal(forwarded, true);
  await runtime.close();
  await assert.rejects(
    prepareAccessRuntime({ ...options, enabled: true }),
    /requires account transport/,
  );
  const failure = new Error('Legacy construction failed');
  await assert.rejects(
    prepareAccessRuntime({
      ...options,
      legacyAccess: () => {
        throw failure;
      },
    }),
    (error: unknown) => error === failure,
  );
});
