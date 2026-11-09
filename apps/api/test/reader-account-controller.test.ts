import assert from 'node:assert/strict';
import { test } from 'node:test';

import { createReaderAccountController } from '../../web/src/reader-account-controller';
import {
  emptyStore,
  type PreferenceStore,
} from '../../web/src/reader-preference-store';

const path = (input: RequestInfo | URL) =>
  typeof input === 'string'
    ? input
    : input instanceof URL
      ? input.href
      : input.url;

const tick = () => new Promise<void>((resolve) => setImmediate(resolve));
function local() {
  let state: PreferenceStore = {
    ...emptyStore(),
    hiddenTopics: { local: { hidden: true, updatedAt: 1 } },
  };
  let listener: (() => void) | undefined;
  let clears = 0;
  return {
    read: () => state,
    write: (next: PreferenceStore) => {
      state = next;
      listener?.();
    },
    subscribe: (changed: () => void) => {
      listener = changed;
      return () => {
        listener = undefined;
      };
    },
    clear: () => {
      clears++;
      state = emptyStore();
      listener?.();
    },
    clears: () => clears,
  };
}

void test('controller stays disconnected until refresh, validates session and starts sync', async () => {
  const store = local();
  const calls: string[] = [];
  const controller = createReaderAccountController({
    ...store,
    fetch: async (url, init) => {
      calls.push(path(url));
      assert.equal(init?.credentials, 'same-origin');
      assert.equal(init?.cache, 'no-store');
      assert.equal(init?.redirect, 'error');
      return Response.json(
        path(url).endsWith('/session')
          ? { signedIn: true, isAdmin: false }
          : JSON.parse(init?.body as string),
      );
    },
  });
  assert.deepEqual(calls, []);
  const first = controller.refresh();
  assert.equal(controller.refresh(), first);
  await first;
  await tick();
  assert.deepEqual(calls, ['/api/account/session', '/api/account/sync']);
  assert.equal(store.clears(), 0);
  controller.stop();
});

void test('logout invalidates delayed discovery and prevents refresh until completion', async () => {
  const store = local();
  let discover!: (response: Response) => void;
  let logout!: (response: Response) => void;
  const calls: string[] = [];
  const controller = createReaderAccountController({
    ...store,
    fetch: async (url, init) => {
      calls.push(path(url));
      if (path(url).endsWith('/session'))
        return new Promise((resolve) => {
          discover = resolve;
        });
      assert.equal(url, '/api/account/logout-all');
      assert.equal(init?.method, 'POST');
      assert.equal(init?.body, '{}');
      return new Promise((resolve) => {
        logout = resolve;
      });
    },
  });
  const discovery = controller.refresh();
  await tick();
  const signingOut = controller.signOut(true);
  await controller.refresh();
  discover(Response.json({ signedIn: true, isAdmin: true }));
  await discovery;
  logout(new Response(null, { status: 204 }));
  await signingOut;
  assert.deepEqual(calls, ['/api/account/session', '/api/account/logout-all']);
  assert.equal(store.clears(), 1);
  assert.deepEqual(store.read(), emptyStore());
  controller.stop();
});

void test('failed logout preserves choices and pauses uploads until explicit refresh', async () => {
  const store = local();
  let syncs = 0;
  const controller = createReaderAccountController({
    ...store,
    fetch: async (url, init) => {
      if (path(url).endsWith('/session'))
        return Response.json({ signedIn: true, isAdmin: false });
      if (path(url).endsWith('/logout'))
        return new Response('private server details', { status: 503 });
      syncs++;
      return Response.json(JSON.parse(init?.body as string));
    },
  });
  await controller.refresh();
  await tick();
  await assert.rejects(controller.signOut(), {
    message: 'Could not sign out. Try again.',
  });
  assert.equal(store.clears(), 0);
  store.write(store.read());
  await tick();
  assert.equal(syncs, 1);
  await controller.refresh();
  await tick();
  assert.equal(syncs, 2);
  controller.stop();
});

void test('lost session clears former account state; initial signed-out session preserves anonymous state', async () => {
  const store = local();
  let signedIn = false;
  const controller = createReaderAccountController({
    ...store,
    fetch: async (url, init) =>
      Response.json(
        path(url).endsWith('/session')
          ? { signedIn, isAdmin: false }
          : JSON.parse(init?.body as string),
      ),
  });
  await controller.refresh();
  assert.equal(store.clears(), 0);
  signedIn = true;
  await controller.refresh();
  await tick();
  signedIn = false;
  await controller.refresh();
  assert.equal(store.clears(), 1);
  controller.stop();
});

void test('malformed or oversized session state never starts sync or reveals server details', async () => {
  for (const body of [
    { signedIn: false, isAdmin: true },
    { signedIn: true, isAdmin: false, email: 'private@example.test' },
    'x'.repeat(1025),
  ]) {
    let calls = 0;
    const store = local();
    const controller = createReaderAccountController({
      ...store,
      fetch: async () => {
        calls++;
        return Response.json(body);
      },
    });
    await assert.rejects(controller.refresh(), {
      message: 'Could not check sign-in. Try again.',
    });
    assert.equal(calls, 1);
    assert.equal(store.clears(), 0);
    controller.stop();
  }
});

void test('logout cancels a late sync response before clearing local account state', async () => {
  const store = local();
  let release!: (response: Response) => void;
  let signal: AbortSignal | null | undefined;
  const controller = createReaderAccountController({
    ...store,
    fetch: async (url, init) => {
      if (path(url).endsWith('/session'))
        return Response.json({ signedIn: true, isAdmin: false });
      if (path(url).endsWith('/logout'))
        return new Response(null, { status: 204 });
      signal = init?.signal;
      return new Promise((resolve) => {
        release = resolve;
      });
    },
  });
  await controller.refresh();
  await tick();
  const old = store.read();
  await controller.signOut();
  assert.equal(signal?.aborted, true);
  release(Response.json(old));
  await tick();
  assert.equal(store.clears(), 1);
  assert.deepEqual(store.read(), emptyStore());
  controller.stop();
});

void test('stopping before discovery starts performs no request or local clearing', async () => {
  const store = local();
  let calls = 0;
  const controller = createReaderAccountController({
    ...store,
    fetch: async () => {
      calls++;
      throw new Error();
    },
  });
  const pending = controller.refresh();
  controller.stop();
  await pending;
  await controller.refresh();
  await controller.signOut();
  assert.equal(calls, 0);
  assert.equal(store.clears(), 0);
});

void test('deletion pauses sync, retains choices on refusal and clears only after confirmed success', async () => {
  const store = local();
  let release!: (response: Response) => void;
  let deleteResponse!: (response: Response) => void;
  let syncSignal: AbortSignal | null | undefined;
  let deletions = 0;
  let latestStatus = '';
  const controller = createReaderAccountController({
    ...store,
    changed: (state) => {
      latestStatus = state.status;
    },
    fetch: async (url, init) => {
      if (path(url).endsWith('/session'))
        return Response.json({ signedIn: true, isAdmin: false });
      if (path(url).endsWith('/delete')) {
        deletions++;
        assert.equal(init?.method, 'POST');
        assert.deepEqual(JSON.parse(init?.body as string), {
          confirmation: 'DELETE',
        });
        return new Promise((resolve) => {
          deleteResponse = resolve;
        });
      }
      assert.equal(path(url), '/api/account/sync');
      syncSignal = init?.signal;
      return new Promise((resolve) => {
        release = resolve;
      });
    },
  });
  await controller.refresh();
  await tick();
  const old = store.read();
  const refused = controller.deleteAccount();
  assert.equal(latestStatus, 'deleting');
  assert.equal(syncSignal?.aborted, true);
  await controller.refresh();
  await controller.signOut();
  await controller.deleteAccount();
  assert.equal(deletions, 1);
  deleteResponse(new Response(null, { status: 503 }));
  await assert.rejects(refused, {
    message: 'Could not delete account. Try again.',
  });
  assert.equal(store.clears(), 0);
  assert.deepEqual(store.read(), old);
  const deleted = controller.deleteAccount();
  assert.equal(store.clears(), 0);
  deleteResponse(new Response(null, { status: 204 }));
  await deleted;
  release(Response.json(old));
  await tick();
  assert.equal(store.clears(), 1);
  assert.deepEqual(store.read(), emptyStore());
  assert.equal(latestStatus, 'idle');
  controller.stop();
  await controller.deleteAccount();
  assert.equal(deletions, 2);
});
