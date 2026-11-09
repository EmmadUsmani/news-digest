import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import type { AddressInfo } from 'node:net';
import { test } from 'node:test';

import type { PublicAccessPrincipal } from '../src/public-access';
import { publicAccess } from '../src/public-access';

void test('prepared public authorization enforces route classes over real HTTP', async () => {
  let enabled = true;
  let principal: PublicAccessPrincipal | null = null;
  let calls = 0;
  let fail = false;
  const server = createServer((request, response) => {
    void publicAccess(enabled, async () => {
      calls++;
      if (fail) throw new Error('private storage detail');
      return principal;
    })(request, response, () => response.writeHead(204).end());
  });
  await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', resolve));
  const base = `http://127.0.0.1:${(server.address() as AddressInfo).port}`;
  const check = async (path: string, status: number, method = 'GET') => {
    const response = await fetch(`${base}${path}`, {
      method,
      headers: {
        'x-exedev-email': 'owner@example.com',
        admin_local_token: 'forged',
      },
    });
    assert.equal(response.status, status, `${method} ${path}`);
    if (enabled)
      assert.equal(response.headers.get('cache-control'), 'no-store');
    assert.equal(await response.text(), '');
  };
  try {
    await check('/api/editions/latest', 204);
    await check('/api/editions/latest', 204, 'HEAD');
    await check('/api/account/code', 204, 'POST');
    await check('/api/admin/unknown', 404);
    await check('/api/%65ditions', 404);
    assert.equal(calls, 0);
    await check('/api/admin/profile', 404);
    await check('/api/account/sync', 404, 'POST');
    principal = { freshAdmin: false };
    await check('/api/account/sync', 204, 'POST');
    await check('/api/admin/profile', 404);
    await check('/api/admin/topics', 404, 'POST');
    principal = { freshAdmin: true };
    await check('/api/admin/profile', 204);
    await check('/api/admin/topics', 204, 'POST');
    await check('/api/admin/unknown', 404);
    fail = true;
    await check('/api/admin/profile', 503);
    await check('/api/editions/latest', 204);
    const before = calls;
    enabled = false;
    await check('/api/admin/unknown', 204);
    assert.equal(calls, before);
  } finally {
    server.closeAllConnections();
    await new Promise<void>((resolve, reject) =>
      server.close((error) => (error ? reject(error) : resolve())),
    );
  }
});
