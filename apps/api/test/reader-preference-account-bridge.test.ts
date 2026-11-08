import assert from 'node:assert/strict';
import { test } from 'node:test';

import { createReaderAccountController } from '../../web/src/reader-account-controller';
import { createReaderPreferenceAccountBridge } from '../../web/src/reader-preference-account-bridge';
import {
  emptyStore,
  type PreferenceStore,
  storageKey,
} from '../../web/src/reader-preference-store';

const tick = () => new Promise<void>((resolve) => setImmediate(resolve));
function local(failing = false) {
  let state = emptyStore();
  let stored: string | null = null;
  let failed = false;
  const bridge = createReaderPreferenceAccountBridge({
    read: () => state,
    render: (next) => {
      state = next;
    },
    storageFailed: (next) => {
      failed = next;
    },
    storage: {
      setItem(key, value) {
        assert.equal(key, storageKey);
        if (failing) throw new Error();
        stored = value;
      },
      removeItem(key) {
        assert.equal(key, storageKey);
        if (failing) throw new Error();
        stored = null;
      },
    },
  });
  return { bridge, stored: () => stored, failed: () => failed };
}

void test('account bridge persists server state, reports local edits and unsubscribes', () => {
  const localStore = local();
  let notifications = 0;
  const unsubscribe = localStore.bridge.subscribe(() => {
    notifications++;
  });
  const state: PreferenceStore = {
    ...emptyStore(),
    hiddenTopics: { tech: { hidden: true, updatedAt: 1 } },
  };
  localStore.bridge.write(state);
  assert.deepEqual(JSON.parse(localStore.stored()!), state);
  assert.equal(localStore.bridge.read(), state);
  localStore.bridge.notifyLocalChange();
  assert.equal(notifications, 2);
  unsubscribe();
  localStore.bridge.clear();
  assert.equal(notifications, 2);
  assert.equal(localStore.stored(), null);
  assert.deepEqual(localStore.bridge.read(), emptyStore());
});

void test('blocked storage still updates the active reader and reports persistence failure', () => {
  const localStore = local(true);
  const state: PreferenceStore = {
    ...emptyStore(),
    hiddenTopics: { tech: { hidden: true, updatedAt: 1 } },
  };
  localStore.bridge.write(state);
  assert.equal(localStore.bridge.read(), state);
  assert.equal(localStore.failed(), true);
  localStore.bridge.clear();
  assert.deepEqual(localStore.bridge.read(), emptyStore());
  assert.equal(localStore.failed(), true);
});

void test('real account controller syncs React bridge changes and clears persisted choices on logout', async () => {
  const localStore = local();
  let uploads = 0;
  const controller = createReaderAccountController({
    ...localStore.bridge,
    fetch: async (input, init) => {
      if (input === '/api/account/session')
        return Response.json({ signedIn: true, isAdmin: false });
      if (input === '/api/account/logout')
        return new Response(null, { status: 204 });
      assert.equal(input, '/api/account/sync');
      uploads++;
      assert.equal(typeof init?.body, 'string');
      return Response.json(JSON.parse(init!.body as string));
    },
  });
  await controller.refresh();
  await tick();
  const first = uploads;
  localStore.bridge.write({
    ...emptyStore(),
    hiddenTopics: { tech: { hidden: true, updatedAt: 1 } },
  });
  await tick();
  assert.equal(uploads, first + 1);
  assert.equal(localStore.bridge.read().hiddenTopics.tech.hidden, true);
  await controller.signOut();
  assert.equal(localStore.stored(), null);
  assert.deepEqual(localStore.bridge.read(), emptyStore());
  await tick();
  assert.equal(uploads, first + 1);
  controller.stop();
});
