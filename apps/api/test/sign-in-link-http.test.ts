import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { test } from 'node:test';

import { AccountHandlers } from '../src/modules/accounts/adapters/account-handlers';
import { accountHttp } from '../src/modules/accounts/adapters/account-http';
import { AccountRequestBoundary } from '../src/modules/accounts/adapters/account-request';
import { CryptoSessionTokens } from '../src/modules/accounts/adapters/session-tokens';
import { SignInLinks } from '../src/modules/accounts/application/sign-in-links';

void test('private link HTTP issuance and redemption enforce admin, origin, previews and single use', async () => {
  const adminToken = 'a'.repeat(43);
  let freshAdmin = true;
  let consumed = false;
  let storedHash = '';
  let audits = 0;
  const tokens = new CryptoSessionTokens();
  const sessions = {
    authenticate: async (token: string) =>
      token === adminToken
        ? {
            userId: 'admin',
            sessionId: 'admin-session',
            isAdmin: freshAdmin,
            cookie: null,
          }
        : null,
    issueVerifiedIdentity: async () => ({
      sessionId: 'private-session',
      cookie: '__Host-reader_session=reader; Secure; HttpOnly; Path=/',
    }),
    signOut: async () => '',
    signOutAllDevices: async () => '',
  };
  const links = new SignInLinks(
    {
      issueWithAudit: async (link, issuer) => {
        assert.equal(issuer, 'admin');
        assert.equal(link.email, 'friend@example.com');
        storedHash = link.tokenHash;
        audits++;
      },
      findRecipient: async (hash) =>
        hash === storedHash && !consumed ? 'friend@example.com' : null,
      consume: async (hash) => {
        if (hash !== storedHash || consumed) return null;
        consumed = true;
        return 'friend@example.com';
      },
    },
    tokens,
    { findOrCreateVerified: async () => 'friend' },
    sessions,
    { run: async (_email, work) => work() },
  );
  const handlers = new AccountHandlers(
    new AccountRequestBoundary('https://reader.example'),
    { request: async () => false },
    { redeem: async () => null },
    sessions,
    links,
  );
  const server = createServer((req, res) =>
    accountHttp({ enabled: true, handlers, client: () => 'trusted' })(
      req,
      res,
      () => res.end(),
    ),
  );
  await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', resolve));
  const address = server.address();
  assert.ok(address && typeof address !== 'string');
  const base = `http://127.0.0.1:${address.port}/api/account/`;
  const post = (
    path: string,
    body: unknown,
    cookie = '',
    origin = 'https://reader.example',
  ) =>
    fetch(base + path, {
      method: 'POST',
      headers: {
        Origin: origin,
        'Content-Type': 'application/json',
        Cookie: cookie,
      },
      body: JSON.stringify(body),
    });
  try {
    const recipient = { email: 'Friend@example.com' };
    const cookie = `__Host-reader_session=${adminToken}`;
    assert.equal((await post('links', recipient)).status, 401);
    freshAdmin = false;
    assert.equal((await post('links', recipient, cookie)).status, 403);
    freshAdmin = true;
    assert.equal(
      (await post('links', recipient, cookie, 'https://attacker.example'))
        .status,
      400,
    );
    assert.equal(audits, 0);
    const issued = await post('links', recipient, cookie);
    assert.equal(issued.status, 201);
    assert.equal(issued.headers.get('cache-control'), 'no-store');
    const result = (await issued.json()) as {
      url: string;
      token: string;
      expiresAt: string;
    };
    assert.match(result.token, /^[A-Za-z0-9_-]{43}$/);
    assert.equal(
      result.url,
      `https://reader.example/account/sign-in#${result.token}`,
    );
    const link = new URL(result.url);
    assert.equal(link.search, '');
    assert.equal(link.pathname.includes(result.token), false);
    const preview = await fetch(
      base.replace('/api/account/', '/account/sign-in'),
    );
    assert.equal(preview.status, 200);
    assert.match(
      preview.headers.get('content-security-policy') ?? '',
      /frame-ancestors 'none'/,
    );
    assert.equal(preview.headers.get('referrer-policy'), 'no-referrer');
    assert.equal((await preview.text()).includes(result.token), false);
    assert.equal(consumed, false);
    assert.notEqual(storedHash, result.token);
    assert.equal(audits, 1);
    for (const method of ['GET', 'HEAD'])
      assert.equal((await fetch(base + 'link-redeem', { method })).status, 404);
    assert.equal(
      (
        await post('link-redeem', {
          token: result.token,
          email: 'attacker@example.com',
        })
      ).status,
      400,
    );
    assert.equal(
      (
        await post(
          'link-redeem',
          { token: result.token },
          '',
          'https://attacker.example',
        )
      ).status,
      400,
    );
    assert.equal(consumed, false);
    const redeemed = await post('link-redeem', { token: result.token });
    assert.equal(redeemed.status, 204);
    assert.match(redeemed.headers.get('set-cookie') ?? '', /HttpOnly/);
    assert.equal(await redeemed.text(), '');
    assert.equal(
      (await post('link-redeem', { token: result.token })).status,
      401,
    );
  } finally {
    await new Promise<void>((resolve, reject) =>
      server.close((error) => (error ? reject(error) : resolve())),
    );
  }
});
