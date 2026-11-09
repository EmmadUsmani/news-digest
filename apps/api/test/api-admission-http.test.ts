import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import test from 'node:test';

import { apiAdmissionHttp } from '../src/public-write/api-admission-http';

void test('prepared API admission refuses before downstream work without leaking identity', async () => {
  let identity: string | null = 'verified-visitor';
  let fail = false;
  let extractFails = false;
  let calls = 0;
  let downstream = 0;
  const clients: string[] = [];
  const gate = apiAdmissionHttp({
    enabled: true,
    client: () => {
      if (extractFails) throw new Error('private extractor detail');
      return identity;
    },
    admission: () => ({
      allow: async (client) => {
        clients.push(client);
        if (fail) throw new Error('private Redis detail');
        return ++calls <= 2;
      },
    }),
  });
  const server = createServer((req, res) => {
    void gate(req, res, () => {
      downstream++;
      res.writeHead(204).end();
    });
  });
  await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', resolve));
  const address = server.address();
  assert.ok(address && typeof address !== 'string');
  const base = `http://127.0.0.1:${address.port}`;
  try {
    for (const method of ['GET', 'HEAD']) {
      assert.equal(
        (await fetch(`${base}/api/editions?limit=1`, { method })).status,
        204,
      );
    }
    for (const method of ['GET', 'HEAD', 'POST', 'PUT', 'DELETE']) {
      const response = await fetch(`${base}/api/account/preferences`, {
        method,
        headers: { 'x-forwarded-for': 'forged', cookie: 'forged-session' },
      });
      assert.equal(response.status, 429);
      assert.equal(response.headers.get('cache-control'), 'no-store');
      assert.equal(await response.text(), '');
    }
    assert.equal(downstream, 2);
    assert.ok(clients.every((client) => client === 'verified-visitor'));
    identity = null;
    const before = clients.length;
    assert.equal((await fetch(`${base}/api`)).status, 429);
    identity = '   ';
    assert.equal((await fetch(`${base}/api?query=1`)).status, 429);
    assert.equal(clients.length, before);
    identity = 'verified-visitor';
    fail = true;
    assert.equal((await fetch(`${base}/api/topics`)).status, 429);
    extractFails = true;
    assert.equal((await fetch(`${base}/api/topics`)).status, 429);
    for (const path of ['/healthz', '/', '/assets/app.js', '/apiary']) {
      assert.equal((await fetch(`${base}${path}`)).status, 204);
    }
    assert.equal(downstream, 6);
  } finally {
    await new Promise<void>((resolve, reject) =>
      server.close((error) => (error ? reject(error) : resolve())),
    );
  }
});

void test('disabled API admission opens no dependency and preserves private routing', async () => {
  const gate = apiAdmissionHttp({
    enabled: false,
    client: () => {
      throw new Error('must not extract');
    },
    admission: () => {
      throw new Error('must not open Redis');
    },
  });
  let passed = false;
  await gate({ url: '/api/topics' } as never, {} as never, () => {
    passed = true;
  });
  assert.equal(passed, true);
});
