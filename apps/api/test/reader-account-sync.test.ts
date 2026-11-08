import assert from 'node:assert/strict';
import { test } from 'node:test';

import { createReaderAccountSync } from '../../web/src/reader-account-sync';
import { emptyStore } from '../../web/src/reader-preference-store';

void test('prepared browser sync retains in-flight edits, merges devices and sends only cookie-authenticated state', async () => {
  let local = emptyStore();
  let calls = 0;
  let release!: (response: Response) => void;
  const remote = {
    ...emptyStore(),
    hiddenTopics: { remote: { hidden: true, updatedAt: 1 } },
    bookmarks: { removed: { copy: null, updatedAt: 3 } },
  };
  const client = createReaderAccountSync({
    read: () => local,
    write: (next) => {
      local = next;
    },
    fetch: async (url, init) => {
      calls++;
      assert.equal(url, '/api/account/sync');
      assert.equal(init?.credentials, 'same-origin');
      assert.equal(init?.redirect, 'error');
      assert.equal(init?.cache, 'no-store');
      assert.equal(init?.method, 'POST');
      assert.deepEqual(JSON.parse(init?.body as string), emptyStore());
      return new Promise<Response>((resolve) => {
        release = resolve;
      });
    },
  });
  const first = client.sync();
  assert.equal(client.sync(), first);
  await Promise.resolve();
  local.hiddenTopics.local = { hidden: false, updatedAt: 5 };
  release(Response.json(remote));
  await first;
  assert.equal(calls, 1);
  assert.deepEqual(local, {
    ...remote,
    hiddenTopics: {
      ...remote.hiddenTopics,
      local: { hidden: false, updatedAt: 5 },
    },
  });
});

void test('logout invalidates delayed responses even when transport ignores cancellation', async () => {
  let local = emptyStore();
  let calls = 0;
  let release!: (response: Response) => void;
  const client = createReaderAccountSync({
    read: () => local,
    write: (next) => {
      local = next;
    },
    fetch: async (_url, init) => {
      calls++;
      return new Promise<Response>((resolve) => {
        release = resolve;
        assert.equal(init?.signal?.aborted, false);
      });
    },
  });
  const pending = client.sync();
  await Promise.resolve();
  client.stop();
  local = emptyStore();
  release(
    Response.json({
      ...emptyStore(),
      hiddenTopics: { private: { hidden: true, updatedAt: 5 } },
    }),
  );
  await pending;
  await client.sync();
  assert.deepEqual(local, emptyStore());
  assert.equal(calls, 1);
});

void test('failed or malformed sync preserves local state, hides server details and allows retry', async () => {
  for (const response of [
    new Response('private storage detail', { status: 503 }),
    new Response('bad json'),
    Response.json({ ...emptyStore(), version: 2 }),
    Response.json({ ...emptyStore(), userId: 'forged' }),
    Response.json({
      ...emptyStore(),
      hiddenTopics: { bad: { hidden: true, updatedAt: -1 } },
    }),
    new Response('x'.repeat(16 * 1024 * 1024 + 1)),
  ]) {
    const local = emptyStore();
    let writes = 0;
    let attempt = 0;
    const client = createReaderAccountSync({
      read: () => local,
      write: () => {
        writes++;
      },
      fetch: async () =>
        ++attempt === 1 ? response : Response.json(emptyStore()),
    });
    await assert.rejects(client.sync(), {
      message: 'Could not sync saved items. Try again.',
    });
    assert.equal(writes, 0);
    await client.sync();
    assert.equal(writes, 1);
  }
});

void test('invalid local input rejects before transport and can be corrected for retry', async () => {
  let local = { ...emptyStore(), version: 2 } as unknown as ReturnType<
    typeof emptyStore
  >;
  let calls = 0;
  const client = createReaderAccountSync({
    read: () => local,
    write: (next) => {
      local = next;
    },
    fetch: async () => {
      calls++;
      return Response.json(emptyStore());
    },
  });
  await assert.rejects(client.sync());
  assert.equal(calls, 0);
  local = emptyStore();
  await client.sync();
  assert.equal(calls, 1);
});
