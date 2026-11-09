import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { test } from 'node:test';

import { AccountHandlers } from '../src/modules/accounts/adapters/account-handlers';
import { accountHttp } from '../src/modules/accounts/adapters/account-http';
import { AccountRequestBoundary } from '../src/modules/accounts/adapters/account-request';
import { mergeReaderSync } from '../src/modules/accounts/domain/reader-sync';

void test('prepared sync HTTP authenticates identity, validates writes and keeps private failures private', async () => {
  let enabled = false;
  let fail = false;
  let writes = 0;
  let state = { version: 1 as const, hiddenTopics: {}, bookmarks: {} };
  const token = 'a'.repeat(43);
  const handlers = new AccountHandlers(
    new AccountRequestBoundary('https://reader.example'),
    { request: async () => undefined },
    { redeem: async () => null },
    {
      authenticate: async (value) =>
        value === token
          ? {
              userId: 'cookie-reader',
              sessionId: 'private-session',
              isAdmin: false,
              cookie: 'renewed; Secure; HttpOnly',
            }
          : null,
      signOut: async () => '',
      signOutAllDevices: async () => '',
    },
    undefined,
    undefined,
    {
      merge: async (userId, incoming) => {
        assert.equal(userId, 'cookie-reader');
        if (fail) throw new Error('private storage details');
        writes++;
        state = mergeReaderSync(state, incoming);
        return state;
      },
    },
  );
  const server = createServer((req, res) =>
    accountHttp({
      enabled,
      handlers,
      client: () => 'trusted',
    })(req, res, () => {
      res.statusCode = 404;
      res.end();
    }),
  );
  await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', resolve));
  const address = server.address();
  assert.ok(address && typeof address !== 'string');
  const url = `http://127.0.0.1:${address.port}/api/account/sync`;
  const post = (
    body: unknown,
    cookie = `__Host-reader_session=${token}`,
    origin = 'https://reader.example',
  ) =>
    fetch(url, {
      method: 'POST',
      headers: {
        Cookie: cookie,
        Origin: origin,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });
  const empty = { version: 1, hiddenTopics: {}, bookmarks: {} };
  try {
    assert.equal((await post(empty)).status, 404);
    enabled = true;
    assert.equal((await fetch(url)).status, 404);
    assert.equal((await post(empty, '')).status, 401);
    assert.equal(
      (
        await post(
          empty,
          `__Host-reader_session=${token}`,
          'https://attacker.example',
        )
      ).status,
      400,
    );
    assert.equal((await post({ ...empty, userId: 'victim' })).status, 400);
    assert.equal(
      (
        await post({
          ...empty,
          hiddenTopics: { topic: { hidden: true, updatedAt: -1 } },
        })
      ).status,
      400,
    );
    for (const text of ['\ud800', '\udfff']) {
      const invalid = await post({
        ...empty,
        hiddenTopics: { [text]: { hidden: true, updatedAt: 1 } },
      });
      assert.equal(invalid.status, 400);
      assert.equal(await invalid.text(), '');
      assert.equal(invalid.headers.get('set-cookie'), null);
      assert.equal(invalid.headers.get('cache-control'), 'no-store');
    }
    for (const updatedAt of [253402300800000, 8_640_000_000_000_000]) {
      for (const kind of ['hiddenTopics', 'bookmarks']) {
        const change =
          kind === 'hiddenTopics'
            ? { hidden: true, updatedAt }
            : { copy: null, updatedAt };
        const invalid = await post({ ...empty, [kind]: { clock: change } });
        assert.equal(invalid.status, 400);
        assert.equal(await invalid.text(), '');
        assert.equal(invalid.headers.get('set-cookie'), null);
        assert.equal(invalid.headers.get('cache-control'), 'no-store');
      }
    }
    assert.equal(writes, 0);
    // A valid sync can exceed the small login-code body limit.
    const changes = {
      ...empty,
      hiddenTopics: Object.fromEntries(
        Array.from({ length: 70 }, (_, i) => [
          `topic-${i}`,
          { hidden: true, updatedAt: 2 },
        ]),
      ),
    };
    const saved = await post(changes);
    assert.equal(saved.status, 200);
    assert.equal(saved.headers.get('cache-control'), 'no-store');
    assert.equal(saved.headers.get('vary'), 'Cookie');
    assert.match(saved.headers.get('set-cookie') ?? '', /HttpOnly/);
    assert.deepEqual(await saved.json(), changes);
    const stale = await post({
      ...empty,
      hiddenTopics: { 'topic-0': { hidden: false, updatedAt: 1 } },
    });
    assert.deepEqual(await stale.json(), changes);
    const read = await post(empty);
    assert.deepEqual(await read.json(), changes);
    fail = true;
    const failed = await post(empty);
    assert.equal(failed.status, 503);
    assert.equal(await failed.text(), '');
    assert.equal(failed.headers.get('set-cookie'), null);
    assert.equal((await post('x'.repeat(16 * 1024 * 1024))).status, 413);
  } finally {
    await new Promise<void>((resolve, reject) =>
      server.close((error) => (error ? reject(error) : resolve())),
    );
  }
});
