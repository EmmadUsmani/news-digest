import {
  createReaderAccountSyncLifecycle,
  type ReaderSyncStatus,
} from './reader-account-sync-lifecycle';

type Session = { signedIn: boolean; isAdmin: boolean };
type Status = 'idle' | 'checking' | 'signing-out' | 'failed' | 'stopped';
type SyncOptions = Parameters<typeof createReaderAccountSyncLifecycle>[0];

// Prepared UI boundary only. Construct after the accounts feature gate is on;
// construction itself makes no requests and never reads an identity into storage.
export function createReaderAccountController(
  options: Omit<SyncOptions, 'status'> & {
    changed?: (state: {
      session: Session | null;
      status: Status;
      sync: ReaderSyncStatus;
    }) => void;
  },
) {
  let session: Session | null = null;
  let status: Status = 'idle';
  let syncStatus: ReaderSyncStatus = 'stopped';
  let lifecycle:
    ReturnType<typeof createReaderAccountSyncLifecycle> | undefined;
  let stopped = false;
  let revision = 0;
  let pending: Promise<void> | undefined;
  const abort = new AbortController();
  const report = () => options.changed?.({ session, status, sync: syncStatus });
  const pause = () => {
    lifecycle?.stop();
    lifecycle = undefined;
  };
  const request = (path: string, method: 'GET' | 'POST') =>
    (options.fetch ?? fetch)(path, {
      method,
      credentials: 'same-origin',
      cache: 'no-store',
      redirect: 'error',
      signal: abort.signal,
      ...(method === 'POST'
        ? { headers: { 'Content-Type': 'application/json' }, body: '{}' }
        : {}),
    });
  const refresh = (): Promise<void> => {
    if (stopped || status === 'signing-out') return Promise.resolve();
    if (pending) return pending;
    const current = ++revision;
    status = 'checking';
    report();
    pending = Promise.resolve().then(async () => {
      try {
        if (stopped || current !== revision) return;
        const response = await request('/api/account/session', 'GET');
        if (!response.ok || !response.body) throw new Error();
        const reader = response.body.getReader();
        let raw = '';
        let size = 0;
        const decoder = new TextDecoder('utf-8', { fatal: true });
        try {
          for (;;) {
            const chunk = await reader.read();
            if (chunk.done) break;
            size += chunk.value.byteLength;
            if (size > 1024) throw new Error();
            raw += decoder.decode(chunk.value, { stream: true });
          }
          raw += decoder.decode();
        } finally {
          await reader.cancel().catch(() => undefined);
          reader.releaseLock();
        }
        const value = JSON.parse(raw) as Session;
        if (
          !value ||
          typeof value.signedIn !== 'boolean' ||
          typeof value.isAdmin !== 'boolean' ||
          (!value.signedIn && value.isAdmin) ||
          Object.keys(value).sort().join(',') !== 'isAdmin,signedIn'
        )
          throw new Error();
        if (stopped || current !== revision) return;
        pause();
        // Session loss must not leave account data displayed as anonymous data.
        if (session?.signedIn && !value.signedIn) options.clear();
        session = value;
        status = 'idle';
        if (value.signedIn) {
          lifecycle = createReaderAccountSyncLifecycle({
            ...options,
            status: (next) => {
              syncStatus = next;
              report();
            },
          });
          void lifecycle.sync().catch(() => undefined);
        }
        report();
      } catch {
        if (!stopped && current === revision) {
          pause();
          status = 'failed';
          report();
          throw new Error('Could not check sign-in. Try again.');
        }
      } finally {
        if (current === revision) pending = undefined;
      }
    });
    return pending;
  };
  return {
    refresh,
    retrySync: () => lifecycle?.sync() ?? Promise.resolve(),
    async signOut(allDevices = false) {
      if (stopped || status === 'signing-out') return;
      const current = ++revision;
      pending = undefined;
      // Stop uploads and invalidate session discovery before sending logout.
      status = 'signing-out';
      pause();
      report();
      try {
        const response = await request(
          allDevices ? '/api/account/logout-all' : '/api/account/logout',
          'POST',
        );
        if (response.status !== 204) throw new Error();
        if (stopped || current !== revision) return;
        options.clear();
        session = { signedIn: false, isAdmin: false };
        status = 'idle';
        report();
      } catch {
        if (!stopped && current === revision) {
          // Retain choices on failure; explicit refresh can resume syncing.
          status = 'failed';
          report();
          throw new Error('Could not sign out. Try again.');
        }
      }
    },
    stop() {
      if (stopped) return;
      stopped = true;
      revision++;
      status = 'stopped';
      pause();
      abort.abort();
      report();
    },
  };
}
