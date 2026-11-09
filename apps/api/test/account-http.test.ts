import assert from 'node:assert/strict';
import { createServer, request } from 'node:http';
import { test } from 'node:test';

import { AccountHandlers } from '../src/modules/accounts/adapters/account-handlers';
import { accountHttp } from '../src/modules/accounts/adapters/account-http';
import { AccountRequestBoundary } from '../src/modules/accounts/adapters/account-request';

void test('account HTTP boundary gates routes, streams bounded bodies and hides credentials and failures', async (t) => {
  const logCalls = ['log', 'info', 'warn', 'error', 'debug', 'trace'].map(
    (method) => t.mock.method(console, method as 'log', () => undefined),
  );
  let calls = 0;
  let enabled = false;
  let trusted = true;
  const handlers = new AccountHandlers(
    new AccountRequestBoundary('https://reader.example'),
    {
      request: async () => {
        calls++;
        throw new Error('private@example.com secret');
      },
    },
    {
      redeem: async () => {
        calls++;
        return {
          sessionId: 'private-id',
          cookie: '__Host-reader_session=secret; Secure; HttpOnly; Path=/',
        };
      },
    },
    {
      authenticate: async () => null,
      signOut: async () => 'cleared',
      signOutAllDevices: async () => 'cleared',
    },
  );
  const server = createServer((req, res) =>
    accountHttp({
      enabled,
      handlers,
      client: () => (trusted ? 'verified-client' : null),
    })(req, res, () => {
      res.statusCode = 418;
      res.end();
    }),
  );
  await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', resolve));
  const address = server.address();
  assert.ok(address && typeof address !== 'string');
  const base = `http://127.0.0.1:${address.port}`;
  const post = (
    path: string,
    body: string,
    origin = 'https://reader.example',
  ) =>
    fetch(`${base}/api/account/${path}`, {
      method: 'POST',
      headers: {
        Origin: origin,
        'Content-Type': 'application/json',
        'X-Forwarded-For': 'spoofed',
      },
      body,
    });
  try {
    assert.equal((await post('redeem', '{}')).status, 404);
    assert.equal(calls, 0);
    enabled = true;
    assert.equal((await fetch(`${base}/other`)).status, 418);
    const session = await fetch(`${base}/api/account/session`);
    assert.equal(session.headers.get('cache-control'), 'no-store');
    assert.equal(session.headers.get('vary'), 'Cookie');
    assert.deepEqual(await session.json(), { signedIn: false, isAdmin: false });
    trusted = false;
    assert.equal((await post('redeem', '{}')).status, 503);
    trusted = true;
    assert.equal((await post('redeem', 'x'.repeat(2049))).status, 413);
    assert.equal((await post('redeem', '{')).status, 400);
    const payload = JSON.stringify({
      email: 'reader@example.com',
      code: '123456',
    });
    assert.equal(
      (await post('redeem', payload, 'https://attacker.example')).status,
      400,
    );
    assert.equal(calls, 0);
    const redeemed = await post('redeem', payload);
    assert.equal(redeemed.status, 204);
    assert.match(redeemed.headers.get('set-cookie') ?? '', /HttpOnly/);
    assert.equal(await redeemed.text(), '');
    const failed = await post(
      'code',
      JSON.stringify({ email: 'reader@example.com' }),
    );
    assert.equal(failed.status, 503);
    assert.equal(await failed.text(), '');
  } finally {
    await new Promise<void>((resolve, reject) =>
      server.close((error) => (error ? reject(error) : resolve())),
    );
    // Check only counts: failed assertions must never print captured credentials.
    for (const logger of logCalls)
      assert.equal(logger.mock.callCount(), 0, 'account HTTP must not log');
  }
});

void test('account deletion requires explicit same-origin confirmation and session ownership', async () => {
  const token = 'a'.repeat(43);
  const calls: string[] = [];
  let enabled = false;
  let installed = true;
  let trusted = true;
  let failure = false;
  let deleted = false;
  const makeHandlers = () =>
    new AccountHandlers(
      new AccountRequestBoundary('https://reader.example'),
      {
        request: async () => {
          throw new Error('unexpected code request');
        },
      },
      {
        redeem: async () => {
          throw new Error('unexpected exchange');
        },
      },
      {
        authenticate: async () => {
          throw new Error('unexpected renewal');
        },
        signOut: async () => {
          throw new Error('unexpected logout');
        },
        signOutAllDevices: async () => {
          throw new Error('unexpected logout');
        },
      },
      undefined,
      installed
        ? {
            execute: async (credential) => {
              calls.push(credential);
              if (failure) throw new Error('private database account details');
              if (credential !== token || deleted) return false;
              deleted = true;
              return true;
            },
          }
        : undefined,
    );
  const server = createServer((req, res) =>
    accountHttp({
      enabled,
      handlers: makeHandlers(),
      client: () => (trusted ? 'verified' : null),
    })(req, res, () => {
      res.statusCode = 418;
      res.end();
    }),
  );
  await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', resolve));
  const address = server.address();
  assert.ok(address && typeof address !== 'string');
  const url = `http://127.0.0.1:${address.port}/api/account/delete`;
  const request = (
    body: unknown = { confirmation: 'DELETE' },
    headers: Record<string, string> = {},
    method = 'POST',
  ) =>
    fetch(url, {
      method,
      headers: {
        Origin: 'https://reader.example',
        'Content-Type': 'application/json',
        Cookie: `__Host-reader_session=${token}`,
        ...headers,
      },
      ...(method === 'POST' ? { body: JSON.stringify(body) } : {}),
    });
  try {
    assert.equal((await request()).status, 404);
    enabled = true;
    installed = false;
    assert.equal((await request()).status, 404);
    installed = true;
    for (const method of ['GET', 'HEAD', 'DELETE'])
      assert.equal((await request(undefined, {}, method)).status, 404);
    for (const body of [
      null,
      [],
      {},
      { confirmation: true },
      { confirmation: 'delete' },
      { confirmation: 'DELETE', userId: 'victim' },
      { confirmation: 'DELETE', email: 'victim@example.com' },
    ]) {
      assert.equal((await request(body)).status, 400);
    }
    assert.equal(
      (await request(undefined, { Origin: 'https://attacker.example' })).status,
      400,
    );
    assert.equal(
      (await request(undefined, { 'Content-Type': 'text/plain' })).status,
      400,
    );
    assert.equal((await request(undefined, { Cookie: '' })).status, 401);
    assert.equal(
      (
        await request(undefined, {
          Cookie: `__Host-reader_session=${token}; __Host-reader_session=${token}`,
        })
      ).status,
      401,
    );
    trusted = false;
    assert.equal((await request()).status, 503);
    trusted = true;
    assert.deepEqual(calls, []);
    assert.equal(
      (
        await request(undefined, {
          Cookie: `__Host-reader_session=${'b'.repeat(43)}`,
        })
      ).status,
      401,
    );
    failure = true;
    const failed = await request();
    assert.equal(failed.status, 503);
    assert.equal(await failed.text(), '');
    assert.equal(failed.headers.get('set-cookie'), null);
    assert.equal(failed.headers.get('cache-control'), 'no-store');
    failure = false;
    const success = await request();
    assert.equal(success.status, 204);
    assert.equal(await success.text(), '');
    assert.match(
      success.headers.get('set-cookie') ?? '',
      /^__Host-reader_session=;.*HttpOnly; Secure; SameSite=Lax; Max-Age=0$/,
    );
    assert.equal(success.headers.get('cache-control'), 'no-store');
    assert.equal(success.headers.get('vary'), 'Cookie');
    const replay = await request();
    assert.equal(replay.status, 401);
    assert.equal(replay.headers.get('set-cookie'), null);
    assert.deepEqual(calls, ['b'.repeat(43), token, token, token]);
  } finally {
    await new Promise<void>((resolve, reject) =>
      server.close((error) => (error ? reject(error) : resolve())),
    );
  }
});

void test('oversized declared and chunked account requests receive 413 before upload ends', async () => {
  let calls = 0;
  const handlers = {
    acceptsWrite: () => true,
    redeemCode: async () => {
      calls++;
      return { status: 204 };
    },
    syncReader: async () => {
      calls++;
      return { status: 204 };
    },
  } as unknown as AccountHandlers;
  const server = createServer((req, res) =>
    accountHttp({ enabled: true, handlers, client: () => 'verified' })(
      req,
      res,
      () => res.end(),
    ),
  );
  await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', resolve));
  const address = server.address();
  assert.ok(address && typeof address !== 'string');
  try {
    for (const [path, limit] of [
      ['/api/account/redeem', 2048],
      ['/api/account/sync', 16 * 1024 * 1024],
    ] as const) {
      for (const declared of [false, true]) {
        const status = await new Promise<number | undefined>(
          (resolve, reject) => {
            const upload = request({
              hostname: '127.0.0.1',
              port: address.port,
              path,
              method: 'POST',
              headers: declared
                ? { 'Content-Length': String(limit + 1) }
                : { 'Transfer-Encoding': 'chunked' },
            });
            upload.on('error', reject);
            upload.setTimeout(3000, () =>
              upload.destroy(new Error('No bounded upload response')),
            );
            upload.on('response', (response) => {
              response.resume();
              response.on('end', () => {
                resolve(response.statusCode);
                upload.destroy();
              });
            });
            // Leave the body unfinished: rejection must not wait for the sender.
            upload.write(declared ? 'x' : 'x'.repeat(limit + 1));
          },
        );
        assert.equal(status, 413);
        assert.equal(calls, 0);
      }
    }
  } finally {
    server.closeAllConnections();
    await new Promise<void>((resolve) => server.close(() => resolve()));
  }
});

void test('invalid account write headers reject unfinished uploads before reading bodies', async () => {
  let calls = 0;
  const boundary = new AccountRequestBoundary('https://reader.example');
  const handlers = {
    acceptsWrite: (origin: unknown, contentType: unknown) =>
      boundary.acceptsWrite(origin, contentType),
    redeemCode: async () => {
      calls++;
      return { status: 204 };
    },
    syncReader: async () => {
      calls++;
      return { status: 204 };
    },
  } as unknown as AccountHandlers;
  const server = createServer((req, res) =>
    accountHttp({ enabled: true, handlers, client: () => 'verified' })(
      req,
      res,
      () => res.end(),
    ),
  );
  await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', resolve));
  const address = server.address();
  assert.ok(address && typeof address !== 'string');
  try {
    for (const path of ['/api/account/redeem', '/api/account/sync']) {
      for (const headers of [
        {
          Origin: 'https://attacker.example',
          'Content-Type': 'application/json',
        },
        { Origin: 'https://reader.example', 'Content-Type': 'text/plain' },
        { 'Content-Type': 'application/json' },
        { Origin: 'https://reader.example' },
      ]) {
        const status = await new Promise<number | undefined>(
          (resolve, reject) => {
            const upload = request({
              hostname: '127.0.0.1',
              port: address.port,
              path,
              method: 'POST',
              headers: { ...headers, 'Transfer-Encoding': 'chunked' },
            });
            upload.on('error', reject);
            upload.setTimeout(3000, () =>
              upload.destroy(new Error('Invalid headers waited for upload')),
            );
            upload.on('response', (response) => {
              response.resume();
              response.on('end', () => {
                resolve(response.statusCode);
                upload.destroy();
              });
            });
            upload.write('{');
          },
        );
        assert.equal(status, 400);
        assert.equal(calls, 0);
      }
    }
  } finally {
    server.closeAllConnections();
    await new Promise<void>((resolve) => server.close(() => resolve()));
  }
});

void test('a slow account upload cannot redeem with the pre-upload expiry time', async (t) => {
  const started = Date.parse('2026-11-09T04:00:00Z');
  const expires = started + 60_000;
  t.mock.timers.enable({ apis: ['Date'], now: started });
  let checkedAt: number | undefined;
  let received!: () => void;
  const firstChunk = new Promise<void>((resolve) => {
    received = resolve;
  });
  const handlers = new AccountHandlers(
    new AccountRequestBoundary('https://reader.example'),
    { request: async () => undefined },
    {
      redeem: async (_email, _code, _client, now) => {
        checkedAt = now.getTime();
        return checkedAt < expires
          ? { sessionId: 'session', cookie: 'session=issued' }
          : null;
      },
    },
    {
      authenticate: async () => null,
      signOut: async () => 'cleared',
      signOutAllDevices: async () => 'cleared',
    },
  );
  const middleware = accountHttp({
    enabled: true,
    handlers,
    client: () => 'verified',
  });
  const server = createServer((req, res) => {
    middleware(req, res, () => {
      res.statusCode = 404;
      res.end();
    });
    req.once('data', received);
  });
  await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', resolve));
  const address = server.address();
  assert.ok(address && typeof address !== 'string');
  const upload = request({
    hostname: '127.0.0.1',
    port: address.port,
    path: '/api/account/redeem',
    method: 'POST',
    headers: {
      Origin: 'https://reader.example',
      'Content-Type': 'application/json',
    },
  });
  const result = new Promise<{ status: number | undefined; cookie: unknown }>(
    (resolve, reject) => {
      upload.on('error', reject);
      upload.on('response', (response) => {
        response.resume();
        response.on('end', () =>
          resolve({
            status: response.statusCode,
            cookie: response.headers['set-cookie'],
          }),
        );
      });
    },
  );
  try {
    upload.write('{');
    await firstChunk;
    assert.equal(checkedAt, undefined);
    t.mock.timers.tick(120_000);
    upload.end('"email":"reader@example.com","code":"123456"}');
    const response = await result;
    assert.equal(response.status, 401);
    assert.equal(response.cookie, undefined);
    assert.equal(checkedAt, started + 120_000);
  } finally {
    upload.destroy();
    server.closeAllConnections();
    await new Promise<void>((resolve) => server.close(() => resolve()));
  }
});
