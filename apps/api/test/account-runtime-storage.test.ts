import assert from 'node:assert/strict';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import test from 'node:test';

import { redis } from '../src/libs/db/connections';
import { prepareAccountHandlers } from '../src/modules/accounts/adapters/account-runtime';
import { FileLoginCodeDelivery } from '../src/modules/accounts/adapters/file-login-code-delivery';
import { PostgresReaderIdentityRepository } from '../src/modules/accounts/database/identity.repository';
import { PostgresLoginCodeRepository } from '../src/modules/accounts/database/login-code.repository';
import { PostgresRecipientCoordination } from '../src/modules/accounts/database/recipient-coordination';
import { PostgresSessionRepository } from '../src/modules/accounts/database/session.repository';
import { PostgresSignInLinkRepository } from '../src/modules/accounts/database/sign-in-link.repository';

void test('composed accounts persist mailbox login and single-use friend sessions across runtimes', async () => {
  assert.equal(process.env.NEWS_DIGEST_ISOLATED_TEST, '1');
  const directory = await mkdtemp(join(tmpdir(), 'account-storage-'));
  const identities = new PostgresReaderIdentityRepository();
  const codes = new PostgresLoginCodeRepository();
  const sessions = new PostgresSessionRepository();
  const links = new PostgresSignInLinkRepository();
  const recipients = new PostgresRecipientCoordination();
  const cache = redis();
  const now = new Date();
  const origin = 'https://reader.example';
  const env = {
    ACCOUNTS_ENABLED: '1',
    ACCOUNT_ORIGIN: origin,
    ACCOUNT_SECRET_KEY: 'b2'.repeat(32),
    ACCOUNT_MAILBOX_PATH: directory,
    SIGNUP_MODE: 'invite',
    ADMIN_EMAILS: 'storage-owner@example.test',
  };
  const compose = () =>
    prepareAccountHandlers(env, () => ({
      recipients,
      identities,
      codes,
      sessions,
      links,
      cache,
      existingIdentity: async () => false,
    }))!;
  const request = (body: unknown, cookie: unknown = undefined) => ({
    origin,
    contentType: 'application/json',
    body,
    cookie,
  });
  try {
    const first = compose();
    const second = compose();
    const email = env.ADMIN_EMAILS;
    assert.equal(
      (await first.requestCode(request({ email }), '192.0.2.51', now)).status,
      202,
    );
    const code = await new FileLoginCodeDelivery(directory).latest(email, now);
    assert.ok(code);
    const redeemed = await second.redeemCode(
      request({ email, code }),
      '192.0.2.51',
      now,
    );
    assert.equal(redeemed.status, 204);
    const cookie = redeemed.cookie!.split(';')[0];
    assert.deepEqual((await first.current(cookie, now)).body, {
      signedIn: true,
      isAdmin: true,
    });
    assert.equal(
      (await first.redeemCode(request({ email, code }), '192.0.2.51', now))
        .status,
      401,
    );
    const issued = await first.issueLink(
      request({ email: 'storage-friend@example.test' }, cookie),
      now,
    );
    assert.equal(issued.status, 201);
    assert.ok(issued.body);
    const attempts = await Promise.all(
      [first, second].map((runtime) =>
        runtime.redeemLink(request({ token: issued.body.token }), now),
      ),
    );
    assert.deepEqual(
      attempts.map((result) => result.status).sort(),
      [204, 401],
    );
    const friendCookie = attempts
      .find((result) => result.status === 204)!
      .cookie!.split(';')[0];
    assert.deepEqual((await second.current(friendCookie, now)).body, {
      signedIn: true,
      isAdmin: false,
    });
    assert.equal(
      (
        await second.issueLink(
          request({ email: 'another@example.test' }, friendCookie),
          now,
        )
      ).status,
      403,
    );
    assert.equal(
      (await first.signOut(request({}, friendCookie), true, now)).status,
      204,
    );
    assert.equal(
      (await second.current(friendCookie, now)).body.signedIn,
      false,
    );
    assert.equal((await second.current(cookie, now)).body.isAdmin, true);
  } finally {
    await Promise.all(
      [identities, codes, sessions, links, recipients].map((repository) =>
        repository.onModuleDestroy(),
      ),
    );
    await cache.quit();
    await rm(directory, { recursive: true, force: true });
  }
});
