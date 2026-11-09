import assert from 'node:assert/strict';
import { createServer, request } from 'node:http';
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
    await check('/api/admin/topics', 503, 'POST');
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

void test('disconnected public admin requests stop after pending authentication or audit', async () => {
  for (const pending of ['authentication', 'audit'] as const) {
    let release!: () => void;
    let entered!: () => void;
    const started = new Promise<void>((resolve) => {
      entered = resolve;
    });
    const blocked = new Promise<void>((resolve) => {
      release = resolve;
    });
    let pause = true;
    let audits = 0;
    let writes = 0;
    let finished!: () => void;
    const done = new Promise<void>((resolve) => {
      finished = resolve;
    });
    const gate = publicAccess(
      true,
      async () => {
        if (pause && pending === 'authentication') {
          entered();
          await blocked;
        }
        return { freshAdmin: true, auditActor: { localScript: true } };
      },
      async () => {
        audits++;
        if (pause && pending === 'audit') {
          entered();
          await blocked;
        }
      },
    );
    let closed!: () => void;
    const disconnected = new Promise<void>((resolve) => {
      closed = resolve;
    });
    const server = createServer((req, res) => {
      res.on('close', closed);
      void gate(req, res, () => {
        writes++;
        res.writeHead(204).end();
      }).finally(finished);
    });
    await new Promise<void>((resolve) =>
      server.listen(0, '127.0.0.1', resolve),
    );
    const port = (server.address() as AddressInfo).port;
    try {
      const client = request({
        host: '127.0.0.1',
        port,
        path: '/api/admin/topics',
        method: 'POST',
      });
      client.on('error', () => undefined);
      client.end();
      await started;
      client.destroy();
      await disconnected;
      release();
      await done;
      assert.equal(writes, 0, pending);
      assert.equal(audits, pending === 'audit' ? 1 : 0, pending);
      pause = false;
      const response = await fetch(
        `http://127.0.0.1:${port}/api/admin/topics`,
        { method: 'POST' },
      );
      assert.equal(response.status, 204);
      assert.equal(writes, 1);
      assert.equal(audits, pending === 'audit' ? 2 : 1);
    } finally {
      release();
      server.closeAllConnections();
      await new Promise<void>((resolve) => server.close(() => resolve()));
    }
  }
});
