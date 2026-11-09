import assert from 'node:assert/strict';
import { mkdtemp, rm } from 'node:fs/promises';
import { createServer } from 'node:http';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import test from 'node:test';

import { redis } from '../src/libs/db/connections';
import { prepareAccountHandlers } from '../src/modules/accounts/adapters/account-runtime';
import { prepareStoredAccountHttp } from '../src/modules/accounts/adapters/account-storage';
import { FileLoginCodeDelivery } from '../src/modules/accounts/adapters/file-login-code-delivery';
import { PostgresAccountDeletionRepository } from '../src/modules/accounts/database/account-deletion.repository';
import { PostgresReaderIdentityRepository } from '../src/modules/accounts/database/identity.repository';
import { PostgresLoginCodeRepository } from '../src/modules/accounts/database/login-code.repository';
import { PostgresReaderSyncRepository } from '../src/modules/accounts/database/reader-sync.repository';
import { PostgresRecipientCoordination } from '../src/modules/accounts/database/recipient-coordination';
import { PostgresSessionRepository } from '../src/modules/accounts/database/session.repository';
import { PostgresSignInLinkRepository } from '../src/modules/accounts/database/sign-in-link.repository';

void test('composed accounts persist mailbox login and single-use friend sessions across runtimes', async () => {
  assert.equal(process.env.NEWS_DIGEST_ISOLATED_TEST, '1');
  const disabled = prepareStoredAccountHttp({});
  assert.equal(disabled.middleware, null);
  await disabled.close();
  await disabled.close();
  const directory = await mkdtemp(join(tmpdir(), 'account-storage-'));
  const identities = new PostgresReaderIdentityRepository();
  const codes = new PostgresLoginCodeRepository();
  const sessions = new PostgresSessionRepository();
  const links = new PostgresSignInLinkRepository();
  const sync = new PostgresReaderSyncRepository();
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
  const deletions: PostgresAccountDeletionRepository[] = [];
  const dependencies: Parameters<typeof prepareAccountHandlers>[1] = (
    cleanup,
  ) => {
    const deletion = new PostgresAccountDeletionRepository(cleanup, recipients);
    deletions.push(deletion);
    return {
      deletion,
      sync,
      recipients,
      identities,
      codes,
      sessions,
      links,
      cache,
      existingIdentity: async () => false,
    };
  };
  const compose = () => prepareAccountHandlers(env, dependencies)!;
  const request = (body: unknown, cookie: unknown = undefined) => ({
    origin,
    contentType: 'application/json',
    body,
    cookie,
  });
  try {
    const stored = prepareStoredAccountHttp({
      ...env,
      ACCOUNT_TRUSTED_PROXY_PEERS: '127.0.0.1',
    });
    const closed = prepareStoredAccountHttp({
      ...env,
      SIGNUP_MODE: 'off',
      ACCOUNT_TRUSTED_PROXY_PEERS: '127.0.0.1',
    });
    let middleware = stored.middleware!;
    const server = createServer((req, res) =>
      middleware(req, res, () => {
        res.writeHead(418).end();
      }),
    );
    await new Promise<void>((resolve) =>
      server.listen(0, '127.0.0.1', resolve),
    );
    try {
      const address = server.address();
      assert.ok(address && typeof address !== 'string');
      const base = `http://127.0.0.1:${address.port}`;
      const post = (path: string, body: unknown, forwarded?: string) =>
        fetch(`${base}/api/account/${path}`, {
          method: 'POST',
          headers: {
            Origin: origin,
            'Content-Type': 'application/json',
            ...(forwarded ? { 'X-Forwarded-For': forwarded } : {}),
          },
          body: JSON.stringify(body),
        });
      assert.equal((await fetch(`${base}/other`)).status, 418);
      assert.equal(
        (await post('code', { email: env.ADMIN_EMAILS })).status,
        503,
      );
      // Visitor-controlled prefixes are ignored; the documented appended IP wins.
      const forwarded = 'forged-prefix, 192.0.2.51';
      assert.equal(
        (await post('code', { email: env.ADMIN_EMAILS }, forwarded)).status,
        202,
      );
      const code = await new FileLoginCodeDelivery(directory).latest(
        env.ADMIN_EMAILS,
        new Date(),
      );
      assert.ok(code);
      const redeemed = await post(
        'redeem',
        { email: env.ADMIN_EMAILS, code },
        forwarded,
      );
      assert.equal(redeemed.status, 204);
      const cookie = redeemed.headers.get('set-cookie')!.split(';')[0];
      const current = await fetch(`${base}/api/account/session`, {
        headers: { Cookie: cookie },
      });
      assert.equal(await identities.exists(env.ADMIN_EMAILS), true);
      assert.equal(await identities.exists('unknown@example.test'), false);
      middleware = closed.middleware!;
      assert.equal(
        (await post('code', { email: env.ADMIN_EMAILS }, '192.0.2.52')).status,
        202,
      );
      const existingCode = await new FileLoginCodeDelivery(directory).latest(
        env.ADMIN_EMAILS,
        new Date(),
      );
      assert.ok(existingCode);
      assert.equal(
        (
          await post(
            'redeem',
            { email: env.ADMIN_EMAILS, code: existingCode },
            '192.0.2.52',
          )
        ).status,
        204,
      );
      assert.equal(
        (await post('code', { email: 'unknown@example.test' }, '192.0.2.53'))
          .status,
        202,
      );
      assert.equal(
        await new FileLoginCodeDelivery(directory).latest(
          'unknown@example.test',
          new Date(),
        ),
        null,
      );
      assert.equal(current.headers.get('cache-control'), 'no-store');
      assert.deepEqual(await current.json(), { signedIn: true, isAdmin: true });
      assert.equal(
        (await post('redeem', { email: env.ADMIN_EMAILS, code }, forwarded))
          .status,
        401,
      );
    } finally {
      await Promise.all([stored.close(), closed.close()]);
      await stored.close();
      server.closeAllConnections();
      await new Promise<void>((resolve, reject) =>
        server.close((error) => (error ? reject(error) : resolve())),
      );
    }
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
    const empty = { version: 1 as const, hiddenTopics: {}, bookmarks: {} };
    const changes = {
      ...empty,
      hiddenTopics: { tech: { hidden: true, updatedAt: now.getTime() } },
      bookmarks: { 'story:saved': { copy: null, updatedAt: now.getTime() } },
    };
    assert.equal((await first.syncReader(request(changes), now)).status, 401);
    assert.deepEqual(
      (await first.syncReader(request(changes, cookie), now)).body,
      changes,
    );
    assert.deepEqual(
      (await second.syncReader(request(empty, cookie), now)).body,
      changes,
    );
    assert.deepEqual(
      (await second.syncReader(request(empty, friendCookie), now)).body,
      empty,
    );
    const removed = {
      ...changes,
      hiddenTopics: { tech: { hidden: false, updatedAt: now.getTime() + 1 } },
    };
    assert.deepEqual(
      (await second.syncReader(request(removed, cookie), now)).body,
      removed,
    );
    assert.deepEqual(
      (await first.syncReader(request(changes, cookie), now)).body,
      removed,
    );
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
      (
        await first.deleteAccount(
          request({ confirmation: 'DELETE' }, friendCookie),
        )
      ).status,
      204,
    );
    assert.equal(
      (await second.current(friendCookie, now)).body.signedIn,
      false,
    );
    assert.equal((await second.current(cookie, now)).body.isAdmin, true);
    // The original mailbox proof is removed by the composed cleanup dependency.
    const deleted = await second.deleteAccount(
      request({ confirmation: 'DELETE' }, cookie),
    );
    assert.equal(deleted.status, 204);
    assert.match(deleted.cookie!, /Max-Age=0/);
    assert.equal(
      await new FileLoginCodeDelivery(directory).latest(email, now),
      null,
    );
    assert.equal((await first.current(cookie, now)).body.signedIn, false);
    assert.equal(
      (await second.syncReader(request(empty, cookie), now)).status,
      401,
    );
    assert.equal(
      (await first.deleteAccount(request({ confirmation: 'DELETE' }, cookie)))
        .status,
      401,
    );
  } finally {
    await Promise.all(
      [identities, codes, sessions, links, sync, recipients, ...deletions].map(
        (repository) => repository.onModuleDestroy(),
      ),
    );
    await cache.quit();
    await rm(directory, { recursive: true, force: true });
  }
});
