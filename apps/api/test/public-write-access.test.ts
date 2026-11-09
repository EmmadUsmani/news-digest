import assert from 'node:assert/strict';
import { createServer, request } from 'node:http';
import type { AddressInfo } from 'node:net';
import { test } from 'node:test';

import { publicWriteAccess } from '../src/public-write-access';

void test('prepared write provenance refuses cross-site and ambiguous HTTP requests', async () => {
  const origin = 'https://news.example.com';
  let enabled = true;
  let reached = 0;
  const server = createServer((req, res) => {
    publicWriteAccess(enabled, enabled ? origin : 'invalid', 'local-secret')(
      req,
      res,
      () => {
        reached++;
        res.writeHead(204).end();
      },
    );
  });
  await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', resolve));
  const port = (server.address() as AddressInfo).port;
  const check = (
    status: number,
    headers: string[],
    path = '/api/admin/topics',
    method = 'POST',
  ) =>
    new Promise<void>((resolve, reject) => {
      const req = request(
        {
          host: '127.0.0.1',
          port,
          path,
          method,
          headers: ['Host', '127.0.0.1', ...headers],
        },
        (res) => {
          try {
            assert.equal(res.statusCode, status);
            if (enabled && method !== 'GET' && method !== 'HEAD')
              assert.equal(res.headers['cache-control'], 'no-store');
            res.resume();
            res.on('end', resolve);
          } catch (error) {
            reject(error instanceof Error ? error : new Error(String(error)));
          }
        },
      );
      req.on('error', reject);
      req.end();
    });
  const json = ['Content-Type', 'application/json'];
  const browser = [...json, 'Origin', origin];
  const local = [...json, 'ADMIN_LOCAL_TOKEN', 'local-secret'];
  try {
    await check(204, browser);
    await check(403, [...browser, 'Origin', origin]);
    await check(403, [...browser, ...json]);
    await check(403, json);
    await check(403, [...json, 'Origin', 'null']);
    await check(403, [...json, 'Origin', `${origin}.evil.test`]);
    await check(403, ['Content-Type', 'text/plain', 'Origin', origin]);
    await check(403, ['Origin', origin]);
    assert.equal(reached, 1);
    await check(204, local);
    await check(403, [...local, 'X-Forwarded-For', '127.0.0.1']);
    await check(403, [...local, 'Origin', 'https://evil.test']);
    await check(403, local, '/api/account/links');
    await check(403, local, '/api/account/code');
    await check(204, browser, '/api/account/code');
    await check(204, browser, '/api/account/logout');
    await check(
      204,
      browser,
      '/api/admin/topics/00000000-0000-0000-0000-000000000001',
      'DELETE',
    );
    await check(404, browser, '/api/unknown');
    await check(404, browser, '/api/%61dmin/topics');
    await check(204, [], '/api/editions/latest', 'GET');
    await check(204, [], '/api/editions/latest', 'HEAD');
    assert.equal(reached, 7);
    enabled = false;
    await check(204, [], '/api/unknown');
  } finally {
    server.closeAllConnections();
    await new Promise<void>((resolve) => server.close(() => resolve()));
  }
  assert.equal(reached, 8);
});
