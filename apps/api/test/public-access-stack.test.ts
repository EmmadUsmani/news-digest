import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import test from 'node:test';

import { adminAccess } from '../src/admin-access';
import { publicAccess } from '../src/public-access';
import { prepareAccessStack } from '../src/public-write/access-stack';

void test('public access stack replaces legacy identity headers and keeps account transport first', async () => {
  let authentication = 0;
  let downstream = 0;
  const middleware = prepareAccessStack({
    publicMode: true,
    accounts: (request, response, next) => {
      if (request.url === '/api/account/session') {
        response.writeHead(204).end();
        return;
      }
      next();
    },
    publicAccess: () =>
      publicAccess(true, async () => {
        authentication++;
        return null;
      }),
    legacyAccess: () => {
      throw new Error('Legacy authorization must not be constructed');
    },
  });
  const server = createServer((request, response) =>
    middleware(request, response, () => {
      downstream++;
      response.writeHead(204).end();
    }),
  );
  await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', resolve));
  const address = server.address();
  assert.ok(address && typeof address !== 'string');
  const base = `http://127.0.0.1:${address.port}`;
  try {
    for (const [method, path, status] of [
      ['GET', '/api/account/session', 204],
      ['GET', '/api/editions/latest', 204],
      ['HEAD', '/api/editions/latest', 204],
      ['GET', '/unclassified', 404],
    ] as const) {
      const response = await fetch(base + path, {
        method,
        headers: { 'x-forwarded-proto': 'http' },
      });
      assert.equal(response.status, status);
      assert.equal(
        response.headers.get('strict-transport-security'),
        'max-age=31536000',
      );
      assert.equal(response.headers.get('x-content-type-options'), 'nosniff');
      assert.equal(response.headers.get('referrer-policy'), 'no-referrer');
      assert.equal(response.headers.get('x-frame-options'), 'SAMEORIGIN');
      assert.equal(
        response.headers.get('content-security-policy'),
        "base-uri 'self'; object-src 'none'; frame-ancestors 'self'; form-action 'self'; font-src 'self'; media-src 'self'; worker-src 'none'; connect-src 'self' https://syndication.twitter.com; frame-src 'self' https://platform.twitter.com https://syndication.twitter.com",
      );
    }
    downstream = 0;
    assert.equal((await fetch(base + '/api/account/session')).status, 204);
    assert.deepEqual([authentication, downstream], [0, 0]);
    assert.equal((await fetch(base + '/api/editions/latest')).status, 204);
    assert.equal(
      (
        await fetch(base + '/api/admin/topics', {
          headers: { 'x-exedev-email': 'owner@example.com' },
        })
      ).status,
      404,
    );
    assert.equal((await fetch(base + '/docs/')).status, 404);
    assert.deepEqual([authentication, downstream], [1, 1]);
  } finally {
    server.closeAllConnections();
    await new Promise<void>((resolve, reject) =>
      server.close((error) => (error ? reject(error) : resolve())),
    );
  }
});

void test('private stack constructs only legacy access; missing public accounts fail before construction', () => {
  let calls = 0;
  const middleware = prepareAccessStack({
    publicMode: false,
    accounts: null,
    publicAccess: () => {
      throw new Error('Unexpected public resources');
    },
    legacyAccess: () => adminAccess({ emails: 'owner@example.com' }),
  });
  middleware(
    { url: '/', method: 'GET', headers: {}, socket: {} } as never,
    {} as never,
    () => calls++,
  );
  assert.equal(calls, 1);
  assert.throws(() =>
    prepareAccessStack({
      publicMode: true,
      accounts: null,
      publicAccess: () => {
        calls++;
        throw new Error('Unexpected construction');
      },
      legacyAccess: () => {
        calls++;
        throw new Error('Unexpected construction');
      },
    }),
  );
  assert.equal(calls, 1);
});
