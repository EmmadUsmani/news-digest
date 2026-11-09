import assert from 'node:assert/strict';
import { createServer, request } from 'node:http';
import type { AddressInfo } from 'node:net';
import { test } from 'node:test';

import { publicAccountAccess } from '../src/public-account-access';
import { directLocalAdmin } from '../src/public-local-admin';

void test('prepared local credentials restrict admin HTTP access without reader impersonation', async () => {
  let reads = 0;
  const access = publicAccountAccess(
    true,
    () => ({
      async current() {
        reads++;
        return { body: { signedIn: false as const } };
      },
    }),
    undefined,
    'script-secret',
  );
  const server = createServer((req, res) => {
    void access(req, res, () => res.writeHead(204).end());
  });
  await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', resolve));
  const port = (server.address() as AddressInfo).port;
  async function check(path: string, headers: string[], expected: number) {
    await new Promise<void>((resolve, reject) => {
      const req = request(
        {
          host: '127.0.0.1',
          port,
          path,
          method:
            path.startsWith('/api/account/') && !path.endsWith('/session')
              ? 'POST'
              : 'GET',
          headers: [...headers, 'Host', 'localhost', 'Connection', 'close'],
        },
        (res) => {
          assert.equal(res.statusCode, expected);
          assert.equal(res.headers['set-cookie'], undefined);
          res.resume();
          res.on('end', resolve);
        },
      );
      req.on('error', reject);
      req.end();
    });
  }
  const token = ['admin_local_token', 'script-secret'];
  try {
    await check('/api/admin/topics', token, 204);
    assert.equal(reads, 0);
    for (const header of [
      'forwarded',
      'x-forwarded-for',
      'x-forwarded-host',
      'x-forwarded-proto',
    ])
      await check('/api/admin/topics', [...token, header, ''], 404);
    await check('/api/admin/topics', [...token, ...token], 404);
    await check('/api/admin/topics', ['admin_local_token', 'wrong'], 404);
    await check(
      '/api/admin/topics',
      ['x-exedev-email', 'owner@example.test'],
      404,
    );
    await check('/api/account/logout', token, 404);
    await check('/api/account/links', token, 404);
    await check('/unlisted', token, 404);
    await check('/api/account/session', token, 204);
  } finally {
    await new Promise<void>((resolve, reject) =>
      server.close((err) => (err ? reject(err) : resolve())),
    );
  }
});

void test('local token refuses non-loopback peers and absent configuration', () => {
  for (const remoteAddress of ['192.0.2.1', undefined, '127.0.0.2']) {
    assert.equal(
      directLocalAdmin({ socket: { remoteAddress } } as never, 'secret'),
      false,
    );
  }
  assert.equal(directLocalAdmin({ socket: {} } as never, undefined), false);
});
