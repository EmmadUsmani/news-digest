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
