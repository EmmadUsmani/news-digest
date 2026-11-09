import assert from 'node:assert/strict';
import { createServer, request } from 'node:http';
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

void test('stalled API admission refuses within its deadline and late results cannot dispatch', async () => {
  let mode: 'stall' | 'recover' = 'stall';
  const pending: Array<{
    resolve: (allowed: boolean) => void;
    reject: (error: Error) => void;
  }> = [];
  let downstream = 0;
  const gate = apiAdmissionHttp({
    enabled: true,
    timeoutMs: 25,
    client: () => 'verified-visitor',
    admission: () => ({
      allow: () =>
        mode === 'recover'
          ? Promise.resolve(true)
          : new Promise<boolean>((resolve, reject) =>
              pending.push({ resolve, reject }),
            ),
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
    for (let attempt = 0; attempt < 2; attempt++) {
      const response = await fetch(`${base}/api/account/session`, {
        signal: AbortSignal.timeout(2000),
      });
      assert.equal(response.status, 429);
      assert.equal(response.headers.get('cache-control'), 'no-store');
      assert.equal(await response.text(), '');
    }
    assert.equal(downstream, 0);
    assert.equal(pending.length, 2);
    pending[0].resolve(true);
    pending[1].reject(new Error('private late Redis detail'));
    await new Promise<void>((resolve) => setImmediate(resolve));
    assert.equal(downstream, 0);
    assert.equal((await fetch(`${base}/healthz`)).status, 204);
    mode = 'recover';
    assert.equal((await fetch(`${base}/api/account/session`)).status, 204);
    assert.equal(downstream, 2);
  } finally {
    server.closeAllConnections();
    await new Promise<void>((resolve, reject) =>
      server.close((error) => (error ? reject(error) : resolve())),
    );
  }
});

void test('API admission rejects invalid deadlines before opening its dependency', () => {
  for (const timeoutMs of [0, -1, 1.5, Infinity, NaN, 2_147_483_648]) {
    assert.throws(
      () =>
        apiAdmissionHttp({
          enabled: true,
          timeoutMs,
          client: () => null,
          admission: () => {
            throw new Error('must not open Redis');
          },
        }),
      /timeout must be a positive integer/,
    );
  }
});

void test('disconnected API callers cannot dispatch after pending admission settles', async () => {
  let downstream = 0;
  let settle: (allowed: boolean) => void = () => {};
  let started: () => void = () => {};
  let closed: () => void = () => {};
  let finished: () => void = () => {};
  const gate = apiAdmissionHttp({
    enabled: true,
    client: () => 'verified-visitor',
    admission: () => ({
      allow: () =>
        new Promise<boolean>((resolve) => {
          settle = resolve;
          started();
        }),
    }),
  });
  const server = createServer((req, res) => {
    res.once('close', () => closed());
    void gate(req, res, () => {
      downstream++;
      res.writeHead(204).end();
    }).finally(() => finished());
  });
  await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', resolve));
  const address = server.address();
  assert.ok(address && typeof address !== 'string');
  try {
    for (const allowed of [true, false]) {
      const admissionStarted = new Promise<void>((resolve) => {
        started = resolve;
      });
      const connectionClosed = new Promise<void>((resolve) => {
        closed = resolve;
      });
      const gateFinished = new Promise<void>((resolve) => {
        finished = resolve;
      });
      const caller = request(
        `http://127.0.0.1:${address.port}/api/account/session`,
      );
      caller.on('error', () => {});
      caller.end();
      await admissionStarted;
      caller.destroy();
      await connectionClosed;
      settle(allowed);
      await gateFinished;
      assert.equal(downstream, 0);
    }
  } finally {
    server.closeAllConnections();
    await new Promise<void>((resolve, reject) =>
      server.close((error) => (error ? reject(error) : resolve())),
    );
  }
});
