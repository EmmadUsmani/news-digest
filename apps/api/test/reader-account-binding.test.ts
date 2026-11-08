import assert from 'node:assert/strict';
import { test } from 'node:test';

import { bindReaderAccount } from '../../web/src/reader-account-binding';
import { emptyStore } from '../../web/src/reader-preference-store';

const tick = () => new Promise<void>((resolve) => setImmediate(resolve));
function fixture() {
  const browser = new EventTarget();
  const page = Object.assign(new EventTarget(), {
    visibilityState: 'visible',
  });
  let requests = 0;
  let clears = 0;
  let state = emptyStore();
  return {
    browser,
    page,
    read: () => state,
    write: (next: typeof state) => {
      state = next;
    },
    clear: () => {
      clears++;
    },
    subscribe: () => () => undefined,
    fetch: (() => {
      requests++;
      return Promise.resolve(
        Response.json({ signedIn: false, isAdmin: false }),
      );
    }) as typeof fetch,
    requests: () => requests,
    clears: () => clears,
  };
}

void test('disabled account binding leaves anonymous preferences and events alone', async () => {
  const options = fixture();
  assert.equal(bindReaderAccount({ ...options, enabled: false }), undefined);
  options.browser.dispatchEvent(new Event('focus'));
  options.page.dispatchEvent(new Event('visibilitychange'));
  await tick();
  assert.equal(options.requests(), 0);
  assert.equal(options.clears(), 0);
});

void test('account binding refreshes visible returns, coalesces events and removes listeners', async () => {
  const options = fixture();
  const binding = bindReaderAccount({ ...options, enabled: true });
  await tick();
  assert.equal(options.requests(), 1);
  options.page.visibilityState = 'hidden';
  options.browser.dispatchEvent(new Event('focus'));
  options.page.dispatchEvent(new Event('visibilitychange'));
  await tick();
  assert.equal(options.requests(), 1);
  options.page.visibilityState = 'visible';
  options.browser.dispatchEvent(new Event('focus'));
  options.page.dispatchEvent(new Event('visibilitychange'));
  await tick();
  assert.equal(options.requests(), 2);
  binding?.stop();
  options.browser.dispatchEvent(new Event('focus'));
  options.page.dispatchEvent(new Event('visibilitychange'));
  await binding?.refresh();
  assert.equal(options.requests(), 2);
  assert.equal(options.clears(), 0);
});

void test('unmount cancels discovery and ignores its delayed authenticated response', async () => {
  const options = fixture();
  let finish!: (response: Response) => void;
  let signal: AbortSignal | null | undefined;
  const states: string[] = [];
  const binding = bindReaderAccount({
    ...options,
    enabled: true,
    changed: (state) => {
      states.push(state.status);
    },
    fetch: (_url, init) => {
      signal = init?.signal;
      return new Promise<Response>((resolve) => {
        finish = resolve;
      });
    },
  });
  await tick();
  binding?.stop();
  assert.equal(signal?.aborted, true);
  finish(Response.json({ signedIn: true, isAdmin: false }));
  await tick();
  assert.deepEqual(states, ['checking', 'stopped']);
  assert.equal(options.clears(), 0);
});
