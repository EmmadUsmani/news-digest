import { createReaderAccountSync } from './reader-account-sync';
import type { PreferenceStore } from './reader-preference-store';

export type ReaderSyncStatus = 'idle' | 'syncing' | 'failed' | 'stopped';

// Prepared account integration: instantiate only after authentication. The store
// subscription includes local edits and cross-tab changes, but no identity data.
export function createReaderAccountSyncLifecycle(options: {
  read: () => PreferenceStore;
  write: (state: PreferenceStore) => void;
  subscribe: (changed: () => void) => () => void;
  clear: () => void;
  status?: (status: ReaderSyncStatus) => void;
  fetch?: typeof fetch;
}) {
  let stopped = false;
  let applying = false;
  let dirty = false;
  let pending: Promise<void> | undefined;
  const client = createReaderAccountSync({
    read: options.read,
    write: (state) => {
      applying = true;
      try {
        options.write(state);
      } finally {
        applying = false;
      }
    },
    fetch: options.fetch,
  });
  const sync = (): Promise<void> => {
    if (stopped) return Promise.resolve();
    if (pending) return pending;
    options.status?.('syncing');
    pending = Promise.resolve().then(async () => {
      try {
        do {
          dirty = false;
          await client.sync();
          // A local edit during a request survives the merge and needs its own
          // upload. Applying server state alone must never cause another request.
        } while (dirty && !stopped);
        if (!stopped) options.status?.('idle');
      } catch (error) {
        if (!stopped) {
          options.status?.('failed');
          throw error;
        }
      } finally {
        pending = undefined;
      }
    });
    return pending;
  };
  const unsubscribe = options.subscribe(() => {
    if (stopped || applying) return;
    dirty = true;
    // Automatic attempts report failure through status. Retry remains explicit
    // or follows the next edit; outages must not create a busy retry loop.
    void sync().catch(() => undefined);
  });
  const stop = () => {
    if (stopped) return;
    stopped = true;
    client.stop();
    unsubscribe();
    options.status?.('stopped');
  };
  return {
    sync,
    stop,
    clearAfterLogout() {
      // Call after server logout succeeds. Cancel before clearing so even an
      // uncancellable delayed response cannot put private data back locally.
      stop();
      options.clear();
    },
  };
}
