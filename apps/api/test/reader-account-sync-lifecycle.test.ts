import assert from 'node:assert/strict';
import { test } from 'node:test';

import {
  createReaderAccountSyncLifecycle,
  type ReaderSyncStatus,
} from '../../web/src/reader-account-sync-lifecycle';
import {
  emptyStore,
  type PreferenceStore,
} from '../../web/src/reader-preference-store';

function store() {
  let local = emptyStore();
  let listener: (() => void) | undefined;
  return {
    read: () => local,
    write: (next: PreferenceStore) => {
      local = next;
      listener?.();
    },
    subscribe: (changed: () => void) => {
      listener = changed;
      return () => {
        listener = undefined;
      };
    },
    clear: () => {
      local = emptyStore();
      listener?.();
    },
  };
}

void test('account lifecycle uploads in-flight edits and avoids server-write loops', async () => {
  const local = store();
  const statuses: ReaderSyncStatus[] = [];
  const sent: PreferenceStore[] = [];
  let release!: (response: Response) => void;
  const lifecycle = createReaderAccountSyncLifecycle({
    ...local,
    status: (status) => statuses.push(status),
    fetch: async (_url, init) => {
      const body = JSON.parse(init?.body as string) as PreferenceStore;
      sent.push(body);
      if (sent.length === 1)
        return new Promise<Response>((resolve) => {
          release = resolve;
        });
      return Response.json(body);
    },
  });
  const initial = lifecycle.sync();
  await new Promise<void>((resolve) => setImmediate(resolve));
  local.write({
    ...emptyStore(),
    hiddenTopics: { edited: { hidden: true, updatedAt: 2 } },
  });
  release(
    Response.json({
      ...emptyStore(),
      hiddenTopics: { remote: { hidden: true, updatedAt: 1 } },
    }),
  );
  await initial;
  assert.equal(sent.length, 2);
  assert.deepEqual(sent[1], local.read());
  assert.deepEqual(Object.keys(sent[1].hiddenTopics).sort(), [
    'edited',
    'remote',
  ]);
  assert.deepEqual(statuses, ['syncing', 'idle']);
  lifecycle.stop();
});

void test('failed automatic saves preserve choices and retry without spinning', async () => {
  const local = store();
  let calls = 0;
  const statuses: ReaderSyncStatus[] = [];
  const lifecycle = createReaderAccountSyncLifecycle({
    ...local,
    status: (status) => statuses.push(status),
    fetch: async (_url, init) =>
      ++calls === 1
        ? new Response('private detail', { status: 503 })
        : Response.json(JSON.parse(init?.body as string)),
  });
  local.write({
    ...emptyStore(),
    bookmarks: { removed: { copy: null, updatedAt: 3 } },
  });
  await assert.rejects(lifecycle.sync(), /Could not sync saved items/);
  assert.equal(calls, 1);
  assert.deepEqual(statuses, ['syncing', 'failed']);
  assert.equal(local.read().bookmarks.removed.updatedAt, 3);
  await lifecycle.sync();
  assert.equal(calls, 2);
  assert.equal(statuses.at(-1), 'idle');
  lifecycle.stop();
});

void test('logout unsubscribes and cancels before clearing; late state cannot cross accounts', async () => {
  const local = store();
  let release!: (response: Response) => void;
  let signal: AbortSignal | null | undefined;
  let calls = 0;
  const lifecycle = createReaderAccountSyncLifecycle({
    ...local,
    clear: () => {
      assert.equal(signal?.aborted, true);
      local.clear();
    },
    fetch: async (_url, init) => {
      calls++;
      signal = init?.signal;
      return new Promise<Response>((resolve) => {
        release = resolve;
      });
    },
  });
  const pending = lifecycle.sync();
  await new Promise<void>((resolve) => setImmediate(resolve));
  lifecycle.clearAfterLogout();
  release(
    Response.json({
      ...emptyStore(),
      hiddenTopics: { private: { hidden: true, updatedAt: 9 } },
    }),
  );
  await pending;
  assert.deepEqual(local.read(), emptyStore());
  local.write({
    ...emptyStore(),
    hiddenTopics: { next: { hidden: false, updatedAt: 10 } },
  });
  await lifecycle.sync();
  assert.equal(calls, 1);
});
