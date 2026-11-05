import assert from 'node:assert/strict';
import { createServer, type IncomingMessage } from 'node:http';
import type { AddressInfo } from 'node:net';
import { test } from 'node:test';

import { adminAccess, isAdmin } from '../src/admin-access';

function request(
  headers: IncomingMessage['headers'] = {},
  remoteAddress = '127.0.0.1',
) {
  return { headers, socket: { remoteAddress } } as IncomingMessage;
}

void test('admin identity requires an exact configured email or a direct local token', () => {
  const config = {
    emails: ' Owner@Example.com, other@example.com ',
    localToken: 'private-test-token',
  };
  assert.equal(isAdmin(request(), config), false);
  assert.equal(
    isAdmin(request({ 'x-exedev-email': 'owner@example.com' }), config),
    true,
  );
  for (const email of [
    'owner@example.com.evil',
    'owner',
    'other@example.com,owner@example.com',
    '',
  ]) {
    assert.equal(isAdmin(request({ 'x-exedev-email': email }), config), false);
  }
  assert.equal(
    isAdmin(request({ 'x-exedev-email': ['owner@example.com'] }), config),
    false,
  );
  assert.equal(
    isAdmin(request({ 'x-exedev-email': 'owner@example.com' }), {}),
    false,
  );
  for (const remote of ['127.0.0.1', '::1', '::ffff:127.0.0.1']) {
    assert.equal(
      isAdmin(
        request({ admin_local_token: config.localToken }, remote),
        config,
      ),
      true,
    );
    assert.equal(isAdmin(request({}, remote), config), false);
  }
  for (const name of [
    'forwarded',
    'x-forwarded-for',
    'x-forwarded-host',
    'x-forwarded-proto',
  ]) {
    assert.equal(
      isAdmin(
        request({ admin_local_token: config.localToken, [name]: '' }),
        config,
      ),
      false,
    );
  }
  assert.equal(
    isAdmin(
      request({ admin_local_token: config.localToken }, '192.0.2.1'),
      config,
    ),
    false,
  );
  for (const token of ['', 'incorrect', 'private-test-tokeX']) {
    assert.equal(isAdmin(request({ admin_local_token: token }), config), false);
  }
  assert.equal(
    isAdmin(request({ admin_local_token: config.localToken }), {}),
    false,
  );
});

void test('HTTP gate denies reserved admin routes and reports only uncached identity', async () => {
  const gate = adminAccess({
    emails: 'owner@example.com',
    localToken: 'test-token',
  });
  const server = createServer((req, res) =>
    gate(req, res, () => {
      const status =
        req.url === '/admin/missing'
          ? 404
          : req.url === '/admin/error'
            ? 500
            : 200;
      res.writeHead(status).end('downstream');
    }),
  );
  await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', resolve));
  const base = `http://127.0.0.1:${(server.address() as AddressInfo).port}`;
  try {
    for (const path of [
      '/admin',
      '/admin/',
      '/admin/topics?x=1',
      '/API/ADMIN/settings',
      '/api/admin',
      '/api/admin%2Feditions',
    ]) {
      for (const method of ['GET', 'HEAD', 'POST', 'PATCH', 'DELETE']) {
        const denied = await fetch(base + path, { method });
        assert.equal(denied.status, 404, `${method} ${path}`);
        assert.equal(denied.headers.get('cache-control'), 'no-store');
        assert.equal(
          denied.headers.get('vary'),
          'X-ExeDev-Email, ADMIN_LOCAL_TOKEN',
        );
        assert.equal(await denied.text(), '');
      }
      for (const headers of [
        { 'x-exedev-email': 'owner@example.com' },
        { ADMIN_LOCAL_TOKEN: 'test-token' },
      ]) {
        for (const method of ['GET', 'HEAD', 'POST']) {
          const authorized = await fetch(base + path, { headers, method });
          assert.equal(authorized.status, 200);
          assert.equal(authorized.headers.get('cache-control'), 'no-store');
          assert.equal(
            authorized.headers.get('vary'),
            'X-ExeDev-Email, ADMIN_LOCAL_TOKEN',
          );
        }
      }
    }
    for (const path of [
      '/',
      '/editions',
      '/api/editions/latest',
      '/administrator',
      '/api/administer',
      '/healthz',
    ]) {
      const reader = await fetch(base + path);
      assert.equal(await reader.text(), 'downstream');
      assert.equal(reader.headers.get('cache-control'), null);
      assert.equal(reader.headers.get('vary'), null);
    }
    for (const [headers, expected] of [
      [{}, false],
      [{ 'x-exedev-email': 'owner@example.com' }, true],
      [{ ADMIN_LOCAL_TOKEN: 'test-token' }, true],
      [
        { ADMIN_LOCAL_TOKEN: 'test-token', 'x-forwarded-for': '192.0.2.1' },
        false,
      ],
    ] as const) {
      const response = await fetch(`${base}/api/me`, { headers });
      assert.equal(response.headers.get('cache-control'), 'no-store');
      assert.deepEqual(await response.json(), { isAdmin: expected });
    }
    for (const [path, status] of [
      ['/admin/missing', 404],
      ['/admin/error', 500],
    ] as const) {
      const response = await fetch(base + path, {
        headers: { ADMIN_LOCAL_TOKEN: 'test-token' },
      });
      assert.equal(response.status, status);
      assert.equal(response.headers.get('cache-control'), 'no-store');
      assert.equal(
        response.headers.get('vary'),
        'X-ExeDev-Email, ADMIN_LOCAL_TOKEN',
      );
    }
    assert.equal((await fetch(`${base}/admin/%ZZ`)).status, 400);
  } finally {
    await new Promise<void>((resolve, reject) =>
      server.close((error) => (error ? reject(error) : resolve())),
    );
  }
});
