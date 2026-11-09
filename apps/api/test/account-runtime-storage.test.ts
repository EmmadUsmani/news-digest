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
import { PostgresSessionRevocationRepository } from '../src/modules/accounts/database/session-revocation.repository';
import { PostgresSignInLinkRepository } from '../src/modules/accounts/database/sign-in-link.repository';

void test('composed accounts persist mailbox login and single-use friend sessions across runtimes without logging credentials', async (t) => {
  // Capture the real composed HTTP/storage flow, including refused and replayed
  // requests. Never include captured arguments in assertion failure output.
  const logCalls = ['log', 'info', 'warn', 'error', 'debug', 'trace'].map(
    (method) => t.mock.method(console, method as 'log', () => undefined),
  );
  assert.equal(process.env.NEWS_DIGEST_ISOLATED_TEST, '1');
  const disabled = prepareStoredAccountHttp({});
  assert.equal(disabled.middleware, null);
  await disabled.close();
  await disabled.close();
  const directory = await mkdtemp(join(tmpdir(), 'account-storage-'));
  const identities = new PostgresReaderIdentityRepository();
  const codes = new PostgresLoginCodeRepository();
  const sessions = new PostgresSessionRepository();
  const revocation = new PostgresSessionRevocationRepository();
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
      revocation,
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
      const principal = await stored.handlers!.authorization(
        cookie,
        new Date(),
      );
      assert.equal(principal?.freshAdmin, true);
      assert.ok(principal?.auditActor.userId);
      assert.equal(
        await stored.handlers!.authorization('invalid', new Date()),
        null,
      );
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
      const secondLogin = await post(
        'redeem',
        { email: env.ADMIN_EMAILS, code: existingCode },
        '192.0.2.52',
      );
      assert.equal(secondLogin.status, 204);
      const secondCookie = secondLogin.headers.get('set-cookie')!.split(';')[0];
      assert.notEqual(secondCookie, cookie);
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
      // Independent device sessions exercise the installed HTTP/storage path.
      const write = (path: string, body: unknown, session: string) =>
        fetch(`${base}/api/account/${path}`, {
          method: 'POST',
          headers: {
            Origin: origin,
            'Content-Type': 'application/json',
            'X-Forwarded-For': '192.0.2.54',
            Cookie: session,
          },
          body: JSON.stringify(body),
        });
      const empty = { version: 1, hiddenTopics: {}, bookmarks: {} };
      const copy = {
        title: 'Isolated saved story',
        url: 'https://example.test/story',
        attribution: 'Fixture publisher',
        excerpt: 'Fixture reporting',
        platform: 'web',
        editionId: 'fixture-edition',
      };
      const saved = {
        ...empty,
        hiddenTopics: { tech: { hidden: true, updatedAt: 100 } },
        bookmarks: { 'story:http': { copy, updatedAt: 100 } },
      };
      const save = await write('sync', saved, cookie);
      assert.equal(save.status, 200);
      assert.equal(save.headers.get('cache-control'), 'no-store');
      assert.deepEqual(await save.json(), saved);
      assert.deepEqual(
        await (await write('sync', empty, secondCookie)).json(),
        saved,
      );
      const removed = {
        ...saved,
        bookmarks: { 'story:http': { copy: null, updatedAt: 101 } },
      };
      assert.deepEqual(
        await (await write('sync', removed, secondCookie)).json(),
        removed,
      );
      // An offline device cannot resurrect an older bookmark.
      assert.deepEqual(
        await (await write('sync', saved, cookie)).json(),
        removed,
      );
      const issuedLink = await write(
        'links',
        { email: 'http-friend@example.test' },
        cookie,
      );
      assert.equal(issuedLink.status, 201);
      const friendLogin = await post(
        'link-redeem',
        { token: (await issuedLink.json()).token },
        forwarded,
      );
      assert.equal(friendLogin.status, 204);
      const friendCookie = friendLogin.headers.get('set-cookie')!.split(';')[0];
      assert.deepEqual(
        await (await write('sync', empty, friendCookie)).json(),
        empty,
      );
      const targetLink = await write(
        'links',
        { email: 'revoked-friend@example.test' },
        cookie,
      );
      const targetToken = (await targetLink.json()).token;
      const targetLogin = await post(
        'link-redeem',
        { token: targetToken },
        forwarded,
      );
      assert.equal(targetLogin.status, 204);
      const targetCookie = targetLogin.headers.get('set-cookie')!.split(';')[0];
      const target = await identities.findOrCreateVerified(
        'revoked-friend@example.test',
        new Date(),
      );
      // Two independently redeemed devices must both lose access through the
      // installed HTTP route, while the reader's saved state survives sign-out.
      const targetSecondLink = await write(
        'links',
        { email: 'revoked-friend@example.test' },
        cookie,
      );
      assert.equal(targetSecondLink.status, 201);
      const targetSecondLogin = await post(
        'link-redeem',
        { token: (await targetSecondLink.json()).token },
        forwarded,
      );
      assert.equal(targetSecondLogin.status, 204);
      const targetSecondCookie = targetSecondLogin.headers
        .get('set-cookie')!
        .split(';')[0];
      assert.notEqual(targetSecondCookie, targetCookie);
      assert.deepEqual(
        await (await write('sync', saved, targetCookie)).json(),
        saved,
      );
      assert.deepEqual(
        await (await write('sync', empty, targetSecondCookie)).json(),
        saved,
      );
      assert.equal(
        (await write('sessions/revoke', { userId: target }, friendCookie))
          .status,
        403,
      );
      // Refusal must leave both target devices usable.
      for (const device of [targetCookie, targetSecondCookie])
        assert.equal((await write('sync', empty, device)).status, 200);
      const httpRevoked = await write(
        'sessions/revoke',
        { userId: target },
        cookie,
      );
      assert.equal(httpRevoked.status, 200);
      assert.equal(httpRevoked.headers.get('cache-control'), 'no-store');
      assert.equal(httpRevoked.headers.get('set-cookie'), null);
      assert.deepEqual(await httpRevoked.json(), { revoked: 2 });
      for (const device of [targetCookie, targetSecondCookie]) {
        assert.equal((await write('sync', empty, device)).status, 401);
        const discovery = await fetch(`${base}/api/account/session`, {
          headers: { Cookie: device },
        });
        assert.deepEqual(await discovery.json(), {
          signedIn: false,
          isAdmin: false,
        });
      }
      const targetReturnLink = await write(
        'links',
        { email: 'revoked-friend@example.test' },
        cookie,
      );
      assert.equal(targetReturnLink.status, 201);
      const targetReturnLogin = await post(
        'link-redeem',
        { token: (await targetReturnLink.json()).token },
        forwarded,
      );
      assert.equal(targetReturnLogin.status, 204);
      const targetReturnCookie = targetReturnLogin.headers
        .get('set-cookie')!
        .split(';')[0];
      assert.deepEqual(
        await (await write('sync', empty, targetReturnCookie)).json(),
        saved,
      );
      const otherRuntime = compose();
      assert.equal(
        (
          await otherRuntime.revokeSessions(
            request({ userId: target }, friendCookie),
            new Date(),
          )
        ).status,
        403,
      );
      const revoked = await otherRuntime.revokeSessions(
        request({ userId: target }, cookie),
        new Date(),
      );
      assert.deepEqual(revoked, { status: 200, body: { revoked: 1 } });
      assert.equal((await write('sync', empty, targetCookie)).status, 401);
      assert.deepEqual(
        await (await write('sync', empty, friendCookie)).json(),
        empty,
      );
      assert.deepEqual(
        await (await write('sync', empty, cookie)).json(),
        removed,
      );
      assert.deepEqual(
        await otherRuntime.revokeSessions(
          request({ userId: target }, cookie),
          new Date(),
        ),
        { status: 200, body: { revoked: 0 } },
      );
      assert.equal((await write('logout', {}, cookie)).status, 204);
      assert.equal((await write('sync', empty, cookie)).status, 401);
      assert.deepEqual(
        await (await write('sync', empty, secondCookie)).json(),
        removed,
      );
      const rejoinLink = await write(
        'links',
        { email: env.ADMIN_EMAILS },
        secondCookie,
      );
      assert.equal(rejoinLink.status, 201);
      const rejoined = await post(
        'link-redeem',
        { token: (await rejoinLink.json()).token },
        forwarded,
      );
      assert.equal(rejoined.status, 204);
      const rejoinedCookie = rejoined.headers.get('set-cookie')!.split(';')[0];
      assert.deepEqual(
        await (await write('sync', empty, rejoinedCookie)).json(),
        removed,
      );
      // Deletion must invalidate outstanding credentials as well as active
      // devices, through the same installed transport and persistent storage.
      const friendLink = async () => {
        const issued = await write(
          'links',
          { email: 'http-friend@example.test' },
          secondCookie,
        );
        assert.equal(issued.status, 201);
        return (await issued.json()).token as string;
      };
      const friendSecondLogin = await post(
        'link-redeem',
        { token: await friendLink() },
        forwarded,
      );
      assert.equal(friendSecondLogin.status, 204);
      const friendSecondCookie = friendSecondLogin.headers
        .get('set-cookie')!
        .split(';')[0];
      const pendingFriendLink = await friendLink();
      assert.equal(
        (await post('code', { email: 'http-friend@example.test' }, forwarded))
          .status,
        202,
      );
      const pendingFriendCode = await new FileLoginCodeDelivery(
        directory,
      ).latest('http-friend@example.test', new Date());
      assert.ok(pendingFriendCode);
      assert.deepEqual(
        await (await write('sync', saved, friendSecondCookie)).json(),
        saved,
      );
      assert.equal((await write('logout-all', {}, secondCookie)).status, 204);
      assert.equal((await write('sync', empty, rejoinedCookie)).status, 401);
      assert.equal((await write('sync', empty, secondCookie)).status, 401);
      // Account revocation is scoped to its reader; the other reader survives.
      assert.deepEqual(
        await (await write('sync', empty, friendCookie)).json(),
        saved,
      );
      const deleted = await write(
        'delete',
        { confirmation: 'DELETE' },
        friendCookie,
      );
      assert.equal(deleted.status, 204);
      assert.match(deleted.headers.get('set-cookie')!, /Max-Age=0/);
      assert.equal((await write('sync', empty, friendCookie)).status, 401);
      assert.equal(
        (await write('sync', empty, friendSecondCookie)).status,
        401,
      );
      assert.equal(await identities.exists('http-friend@example.test'), false);
      assert.equal(
        await new FileLoginCodeDelivery(directory).latest(
          'http-friend@example.test',
          new Date(),
        ),
        null,
      );
      for (const [path, body] of [
        ['link-redeem', { token: pendingFriendLink }],
        [
          'redeem',
          { email: 'http-friend@example.test', code: pendingFriendCode },
        ],
      ] as const) {
        const replay = await post(path, body, forwarded);
        assert.equal(replay.status, 401);
        assert.equal(replay.headers.get('set-cookie'), null);
      }
      assert.equal(await identities.exists('http-friend@example.test'), false);

      assert.equal(
        (await post('code', { email: env.ADMIN_EMAILS }, forwarded)).status,
        202,
      );
      const cleanupCode = await new FileLoginCodeDelivery(directory).latest(
        env.ADMIN_EMAILS,
        new Date(),
      );
      assert.ok(cleanupCode);
      const cleanupLogin = await post(
        'redeem',
        { email: env.ADMIN_EMAILS, code: cleanupCode },
        forwarded,
      );
      assert.equal(cleanupLogin.status, 204);
      assert.equal(
        (
          await write(
            'delete',
            { confirmation: 'DELETE' },
            cleanupLogin.headers.get('set-cookie')!.split(';')[0],
          )
        ).status,
        204,
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
      [
        identities,
        codes,
        sessions,
        links,
        sync,
        recipients,
        revocation,
        ...deletions,
      ].map((repository) => repository.onModuleDestroy()),
    );
    await cache.quit();
    await rm(directory, { recursive: true, force: true });
    for (const logger of logCalls)
      assert.equal(logger.mock.callCount(), 0, 'account flow must not log');
  }
});
