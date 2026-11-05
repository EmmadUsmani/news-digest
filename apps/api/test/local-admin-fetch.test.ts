import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import type { AddressInfo } from 'node:net';
import { test } from 'node:test';

import { createLocalAdminFetch } from '../../../scripts/lib/local-admin-fetch';
import { adminAccess, isAdmin } from '../src/admin-access';

void test('local script credentials are limited to protected local APIs and tools', async () => {
  let credentialsRead = 0;
  const requests: Array<{ url: string; init?: RequestInit }> = [];
  const read = createLocalAdminFetch(
    () => {
      credentialsRead++;
      return 'test-secret';
    },
    async (input, init) => {
      requests.push({
        url: input instanceof Request ? input.url : input.toString(),
        init,
      });
      return new Response('{}');
    },
  );
  for (const url of [
    'http://127.0.0.1:8000/healthz',
    'http://127.0.0.1:8000/docs-other/',
    'http://127.0.0.1:8000/db-other/',
    'http://127.0.0.1:8000/queues-other/',
    'http://localhost:8000/queues/api/queues',
    'https://example.com/queues/',
    'http://127.0.0.1:8000/queues/../healthz',
    'https://example.com/docs/api/tree',
    'http://localhost:8000/docs/api/tree',
    'http://127.0.0.1:8000/docs/../healthz',
    'http://127.0.0.1:8880/api/v1/alerts',
    'https://example.com/api/admin/status',
    'http://127.0.0.1:8000/api/administer/status',
    'http://127.0.0.1:8000/api/admin/../../healthz',
  ])
    await read(url);
  assert.equal(credentialsRead, 0);
  assert.ok(requests.every(({ init }) => !init?.headers));
  await read(
    new Request('http://127.0.0.1:8000/api/admin/status', {
      headers: { accept: 'application/json' },
    }),
    { headers: { 'x-test': 'kept' } },
  );
  assert.equal(credentialsRead, 1);
  const last = requests.at(-1)!.init!;
  const headers = new Headers(last.headers);
  assert.equal(headers.get('ADMIN_LOCAL_TOKEN'), 'test-secret');
  assert.equal(headers.get('accept'), 'application/json');
  assert.equal(headers.get('x-test'), 'kept');
  assert.equal(last.redirect, 'error');
  for (const path of [
    '/docs',
    '/docs/',
    '/docs/api/tree',
    '/db',
    '/db/api/schema',
    '/queues',
    '/queues/',
    '/queues/api/queues',
    '/queues/static/main.js',
  ]) {
    await read(`http://127.0.0.1:8000${path}`);
    assert.equal(
      new Headers(requests.at(-1)!.init!.headers).get('ADMIN_LOCAL_TOKEN'),
      'test-secret',
    );
    assert.equal(requests.at(-1)!.init!.redirect, 'error');
  }
  for (const token of [undefined, '', 'bad\nvalue']) {
    await assert.rejects(
      createLocalAdminFetch(() => token)(
        'http://127.0.0.1:8000/api/admin/status',
      ),
      /Local admin token is missing or invalid/,
    );
  }
});

void test('script request passes the HTTP admin gate and refuses redirects', async () => {
  const gate = adminAccess({ localToken: 'test-secret' });
  let reachedRedirect = false;
  const server = createServer((req, res) =>
    gate(req, res, () => {
      if (
        ['/docs/', '/queues/'].some((prefix) => req.url?.startsWith(prefix)) &&
        !isAdmin(req, { localToken: 'test-secret' })
      ) {
        res.writeHead(404).end();
        return;
      }
      if (req.url === '/api/admin/redirect') {
        res.writeHead(302, { location: '/destination' }).end();
      } else {
        if (req.url === '/destination') reachedRedirect = true;
        res
          .writeHead(200, { 'content-type': 'application/json' })
          .end('{"ok":true}');
      }
    }),
  );
  await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', resolve));
  const port = (server.address() as AddressInfo).port;
  // Preserve the client's fixed credential origin while sending to an isolated server.
  const read = createLocalAdminFetch(
    () => 'test-secret',
    (input, init) =>
      fetch(
        (input instanceof Request ? input.url : input.toString()).replace(
          ':8000/',
          `:${port}/`,
        ),
        init,
      ),
  );
  try {
    const response = await read('http://127.0.0.1:8000/api/admin/status');
    assert.equal(
      (await fetch(`http://127.0.0.1:${port}/docs/api/tree`)).status,
      404,
    );
    const toolResponse = await read('http://127.0.0.1:8000/docs/api/tree');
    assert.equal(
      (await fetch(`http://127.0.0.1:${port}/queues/api/queues`)).status,
      404,
    );
    assert.equal(
      (await read('http://127.0.0.1:8000/queues/api/queues')).status,
      200,
    );
    assert.equal(toolResponse.status, 200);
    assert.deepEqual(await toolResponse.json(), { ok: true });
    assert.equal(response.status, 200);
    assert.equal(response.headers.get('cache-control'), 'no-store');
    await assert.rejects(read('http://127.0.0.1:8000/api/admin/redirect'));
    assert.equal(reachedRedirect, false);
  } finally {
    await new Promise<void>((resolve, reject) =>
      server.close((error) => (error ? reject(error) : resolve())),
    );
  }
});
