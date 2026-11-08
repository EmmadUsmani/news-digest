import assert from 'node:assert/strict';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import test from 'node:test';

import { prepareAccountHandlers } from '../src/modules/accounts/adapters/account-runtime';
import { FileLoginCodeDelivery } from '../src/modules/accounts/adapters/file-login-code-delivery';
import type { LoginCodeChallenge } from '../src/modules/accounts/domain/login-code';
import type { ReaderSession } from '../src/modules/accounts/domain/session';

const env = {
  ACCOUNTS_ENABLED: '1',
  ACCOUNT_ORIGIN: 'https://reader.example',
  ACCOUNT_SECRET_KEY: 'a1'.repeat(32),
  ACCOUNT_MAILBOX_PATH: '/tmp/account-runtime-test',
  SIGNUP_MODE: 'invite',
  ADMIN_EMAILS: ' OWNER@example.com ',
};

void test('disabled composition never opens dependencies; invalid config fails before resources', () => {
  const forbidden = (): never => {
    throw new Error('dependencies opened');
  };
  assert.equal(prepareAccountHandlers({}, forbidden), null);
  assert.equal(
    prepareAccountHandlers({ ...env, ACCOUNTS_ENABLED: '0' }, forbidden),
    null,
  );
  for (const patch of [
    { ACCOUNTS_ENABLED: 'true' },
    { ACCOUNT_ORIGIN: 'http://reader.example' },
    { ACCOUNT_SECRET_KEY: 'invalid' },
    { ACCOUNT_MAILBOX_PATH: 'relative' },
    { SIGNUP_MODE: 'open' },
    { SIGNUP_MODE: 'unknown' },
    { ADMIN_EMAILS: 'bad-email' },
  ])
    assert.throws(
      () => prepareAccountHandlers({ ...env, ...patch }, forbidden),
      (error: Error) => !error.message.includes('dependencies opened'),
    );
});

void test('composed stand-in flow verifies codes, hashes sessions, rejects replay and logs out', async () => {
  const directory = await mkdtemp(join(tmpdir(), 'account-runtime-'));
  let challenge: LoginCodeChallenge | null = null;
  let saved: ReaderSession | null = null;
  const now = new Date();
  try {
    const handlers = prepareAccountHandlers(
      { ...env, ACCOUNT_MAILBOX_PATH: directory },
      () => ({
        identities: {
          findOrCreateVerified: async (email) => {
            assert.equal(email, 'owner@example.com');
            return 'verified-user';
          },
        },
        existingIdentity: async () => false,
        cache: { eval: async () => 1 },
        codes: {
          replace: async (value) => {
            challenge = value;
          },
          consume: async (email, _now, matches) => {
            if (
              !challenge ||
              challenge.email !== email ||
              !matches(challenge.codeHash)
            )
              return false;
            challenge = null;
            return true;
          },
        },
        sessions: {
          create: async (input) => {
            saved = {
              ...input,
              id: 'session-id',
              email: 'owner@example.com',
              createdAt: input.now,
              cookieRenewedAt: input.now,
            };
            return saved;
          },
          findByTokenHash: async (hash) =>
            saved?.tokenHash === hash ? saved : null,
          claimCookieRenewal: async () => false,
          deleteByTokenHash: async () => {
            saved = null;
          },
          deleteByUserId: async () => {
            saved = null;
          },
        },
      }),
    )!;
    const request = {
      origin: env.ACCOUNT_ORIGIN,
      contentType: 'application/json',
      cookie: undefined,
      body: { email: 'owner@example.com' },
    };
    assert.equal(
      (await handlers.requestCode(request, 'verified-client', now)).status,
      202,
    );
    const code = await new FileLoginCodeDelivery(directory).latest(
      'owner@example.com',
      now,
    );
    assert.match(code!, /^\d{6}$/);
    const redeem = { ...request, body: { ...request.body, code } };
    const result = await handlers.redeemCode(redeem, 'verified-client', now);
    assert.equal(result.status, 204);
    const cookie = result.cookie!.split(';')[0];
    assert.ok(!JSON.stringify(saved).includes(cookie.split('=')[1]));
    assert.deepEqual((await handlers.current(cookie, now)).body, {
      signedIn: true,
      isAdmin: true,
    });
    assert.equal(
      (await handlers.redeemCode(redeem, 'verified-client', now)).status,
      401,
    );
    assert.equal(
      (await handlers.signOut({ ...request, cookie }, true, now)).status,
      204,
    );
    assert.deepEqual((await handlers.current(cookie, now)).body, {
      signedIn: false,
      isAdmin: false,
    });
  } finally {
    await rm(directory, { recursive: true, force: true });
  }
});
