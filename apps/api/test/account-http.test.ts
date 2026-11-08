import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { test } from 'node:test';

import { AccountHandlers } from '../src/modules/accounts/adapters/account-handlers';
import { accountHttp } from '../src/modules/accounts/adapters/account-http';
import { AccountRequestBoundary } from '../src/modules/accounts/adapters/account-request';

void test('account HTTP boundary gates routes, streams bounded bodies and hides credentials and failures', async () => {
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
