import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { test } from 'node:test';

import { AccountHandlers } from '../src/modules/accounts/adapters/account-handlers';
import { accountHttp } from '../src/modules/accounts/adapters/account-http';
import { AccountRequestBoundary } from '../src/modules/accounts/adapters/account-request';
import { CryptoSessionTokens } from '../src/modules/accounts/adapters/session-tokens';
import { AdminSessionRevocation } from '../src/modules/accounts/application/admin-session-revocation';

void test('revocation HTTP is private, bounded, explicit and delegates atomic authorization', async () => {
  const token = 'a'.repeat(43);
  const userId = '11111111-1111-4111-8111-111111111111';
  const tokens = new CryptoSessionTokens();
  let enabled = true;
  let installed = true;
  let trusted = true;
  let authorized = true;
  let unavailable = false;
  let calls = 0;
  const revocation = new AdminSessionRevocation(
    {
      async revokeWithAudit(input) {
        calls++;
        assert.equal(input.issuerTokenHash, tokens.hash(token));
        assert.equal(input.targetUserId, userId);
        assert.deepEqual(input.adminEmails, ['admin@example.test']);
        assert.ok(Number.isFinite(input.now.getTime()));
        if (unavailable)
          throw new Error('private email/token database details');
        return authorized ? { revoked: 2 } : null;
      },
    },
    tokens,
    new Set(['admin@example.test']),
  );
  const handlers = () =>
    new AccountHandlers(
      new AccountRequestBoundary('https://reader.example'),
      { request: async () => false },
      { redeem: async () => null },
      {
        authenticate: async () => null,
        signOut: async () => '',
        signOutAllDevices: async () => '',
      },
      undefined,
      undefined,
      undefined,
      installed ? revocation : undefined,
    );
  const server = createServer((req, res) =>
    accountHttp({
      enabled,
      handlers: handlers(),
      client: () => (trusted ? 'trusted' : null),
    })(req, res, () => {
      res.statusCode = 404;
      res.end();
    }),
  );
  await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', resolve));
  const address = server.address();
  assert.ok(address && typeof address !== 'string');
  const url = `http://127.0.0.1:${address.port}/api/account/sessions/revoke`;
  const cookie = `__Host-reader_session=${token}`;
  const post = (
    body: unknown = { userId },
    overrides: Record<string, string> = {},
  ) =>
    fetch(url, {
      method: 'POST',
      headers: {
        Origin: 'https://reader.example',
        'Content-Type': 'application/json',
        Cookie: cookie,
        ...overrides,
      },
      body: JSON.stringify(body),
    });
  try {
    enabled = false;
    assert.equal((await post()).status, 404);
    enabled = true;
    installed = false;
    assert.equal((await post()).status, 404);
    installed = true;
    for (const method of ['GET', 'HEAD', 'DELETE', 'PUT'])
      assert.equal((await fetch(url, { method })).status, 404);
    assert.equal(
      (await post(undefined, { Origin: 'https://attacker.example' })).status,
      400,
    );
    assert.equal(
      (await post(undefined, { 'Content-Type': 'text/plain' })).status,
      400,
    );
    for (const body of [
      null,
      [],
      {},
      { userId: 1 },
      { userId: 'invalid' },
      { userId, email: 'private@example.test' },
    ])
      assert.equal((await post(body)).status, 400);
    assert.equal((await post(undefined, { Cookie: '' })).status, 401);
    assert.equal(
      (await post(undefined, { Cookie: cookie + '; ' + cookie })).status,
      401,
    );
    assert.equal((await post({ userId: 'x'.repeat(2100) })).status, 413);
    assert.equal((await fetch(url, { method: 'POST', body: '{' })).status, 400);
    trusted = false;
    assert.equal((await post()).status, 503);
    trusted = true;
    assert.equal(calls, 0);
    authorized = false;
    assert.equal((await post()).status, 403);
    authorized = true;
    const success = await post();
    assert.equal(success.status, 200);
    assert.equal(success.headers.get('cache-control'), 'no-store');
    assert.equal(success.headers.get('vary'), 'Cookie');
    assert.equal(success.headers.get('set-cookie'), null);
    assert.deepEqual(await success.json(), { revoked: 2 });
    unavailable = true;
    const failure = await post();
    assert.equal(failure.status, 503);
    assert.equal(await failure.text(), '');
    assert.equal(calls, 3);
  } finally {
    server.closeAllConnections();
    await new Promise<void>((resolve, reject) =>
      server.close((error) => (error ? reject(error) : resolve())),
    );
  }
});
