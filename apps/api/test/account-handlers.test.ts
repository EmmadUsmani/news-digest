import assert from 'node:assert/strict';
import test from 'node:test';

import { AccountHandlers } from '../src/modules/accounts/adapters/account-handlers';
import { AccountRequestBoundary } from '../src/modules/accounts/adapters/account-request';

function setup() {
  const calls: unknown[][] = [];
  const token = 'a'.repeat(43);
  const handlers = new AccountHandlers(
    new AccountRequestBoundary('https://reader.example'),
    {
      request: async (...args) => {
        calls.push(['request', ...args]);
        return { accepted: true };
      },
    },
    {
      redeem: async (...args) => {
        calls.push(['redeem', ...args]);
        return args[1] === '123456'
          ? { sessionId: 'secret-id', cookie: 'secure-cookie' }
          : null;
      },
    },
    {
      authenticate: async () => ({
        userId: 'verified-user',
        sessionId: 'secret-id',
        isAdmin: false,
        cookie: null,
      }),
      signOut: async () => 'cleared-cookie',
      signOutAllDevices: async (userId) => {
        calls.push(['all', userId]);
        return 'cleared-cookie';
      },
    },
  );
  return {
    handlers,
    calls,
    request: {
      origin: 'https://reader.example',
      contentType: 'application/json',
      body: { email: 'reader@example.com' },
      cookie: `__Host-reader_session=${token}`,
    },
  };
}
const now = new Date('2026-11-08T19:00:00Z');

void test('account handlers reject cross-origin and injected identity before side effects', async () => {
  const { handlers, calls, request } = setup();
  assert.equal(
    (
      await handlers.requestCode(
        { ...request, origin: 'https://attacker.example' },
        'trusted-client',
        now,
      )
    ).status,
    400,
  );
  assert.equal(
    (
      await handlers.redeemCode(
        {
          ...request,
          body: { email: 'reader@example.com', code: '123456', isAdmin: true },
        },
        'trusted-client',
        now,
      )
    ).status,
    400,
  );
  assert.equal(
    (await handlers.signOut({ ...request, origin: undefined }, true, now))
      .status,
    400,
  );
  assert.deepEqual(calls, []);
});

void test('account handlers use verified exchange cookies and generic rejection', async () => {
  const { handlers, calls, request } = setup();
  const started = performance.now();
  assert.deepEqual(await handlers.requestCode(request, 'trusted-client', now), {
    status: 202,
    body: { accepted: true },
  });
  assert.ok(
    performance.now() - started >= 990,
    'HTTP response waits for the sign-in floor',
  );
  assert.deepEqual(
    await handlers.redeemCode(
      { ...request, body: { email: 'reader@example.com', code: '123456' } },
      'trusted-client',
      now,
    ),
    { status: 204, cookie: 'secure-cookie' },
  );
  assert.equal(
    (
      await handlers.redeemCode(
        { ...request, body: { email: 'reader@example.com', code: 'wrong' } },
        'trusted-client',
        now,
      )
    ).status,
    401,
  );
  assert.equal(calls[0][2], 'trusted-client');
});

void test('session responses hide credentials and all-device logout uses authenticated identity', async () => {
  const { handlers, calls, request } = setup();
  assert.deepEqual(await handlers.current(request.cookie, now), {
    status: 200,
    body: { signedIn: true, isAdmin: false },
    cookie: null,
  });
  assert.deepEqual(await handlers.current(undefined, now), {
    status: 200,
    body: { signedIn: false, isAdmin: false },
    cookie: null,
  });
  assert.equal(
    (await handlers.signOut({ ...request, cookie: undefined }, true, now))
      .status,
    401,
  );
  assert.deepEqual(
    await handlers.signOut(
      { ...request, body: { userId: 'attacker' } },
      true,
      now,
    ),
    { status: 204, cookie: 'cleared-cookie' },
  );
  assert.deepEqual(calls, [['all', 'verified-user']]);
});

void test('preference admission uses authenticated identity and refuses before sync mutation', async () => {
  const empty = { version: 1 as const, hiddenTopics: {}, bookmarks: {} };
  const request = {
    origin: 'https://reader.example',
    contentType: 'application/json',
    body: empty as unknown,
    cookie: `__Host-reader_session=${'a'.repeat(43)}`,
  };
  let authenticated = true;
  let mode: 'allow' | 'deny' | 'fail' = 'deny';
  const identities: string[] = [];
  let writes = 0;
  const handlers = new AccountHandlers(
    new AccountRequestBoundary('https://reader.example'),
    { request: async () => ({ accepted: true }) },
    { redeem: async () => null },
    {
      authenticate: async () =>
        authenticated
          ? {
              userId: 'verified-reader',
              sessionId: 'private-session',
              isAdmin: false,
              cookie: null,
            }
          : null,
      signOut: async () => '',
      signOutAllDevices: async () => '',
    },
    undefined,
    undefined,
    {
      read: async () => empty,
      merge: async () => {
        writes++;
        return empty;
      },
    },
    undefined,
    {
      allow: async (userId) => {
        identities.push(userId);
        if (mode === 'fail') throw new Error('private Redis detail');
        return mode === 'allow';
      },
    },
  );
  assert.deepEqual(await handlers.syncReader(request, now), { status: 429 });
  mode = 'fail';
  assert.deepEqual(await handlers.syncReader(request, now), { status: 429 });
  assert.equal(writes, 0);
  mode = 'allow';
  assert.equal((await handlers.syncReader(request, now)).status, 200);
  assert.equal(writes, 1);
  assert.deepEqual(identities, Array(3).fill('verified-reader'));
  assert.equal(
    (
      await handlers.syncReader(
        { ...request, origin: 'https://attacker.example' },
        now,
      )
    ).status,
    400,
  );
  assert.equal(
    (
      await handlers.syncReader(
        { ...request, body: { ...empty, userId: 'forged' } },
        now,
      )
    ).status,
    400,
  );
  authenticated = false;
  assert.equal((await handlers.syncReader(request, now)).status, 401);
  assert.equal(identities.length, 3);
  assert.equal(writes, 1);
});
