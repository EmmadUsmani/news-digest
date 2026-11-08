import {
  mergePreferences,
  parsePreferences,
  type PreferenceStore,
} from './reader-preference-store';

const byteLimit = 16 * 1024 * 1024;
const failure = () => new Error('Could not sync saved items. Try again.');

// Local storage recovery is deliberately forgiving; network state must instead
// reject any dropped, shortened or unexpected fields before touching local data.
function canonical(value: unknown): string {
  if (value !== null && typeof value === 'object') {
    if (Array.isArray(value)) throw failure();
    return JSON.stringify(
      Object.entries(value)
        .sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0))
        .map(([key, field]) => [key, canonical(field)]),
    );
  }
  return JSON.stringify(value);
}
function state(raw: string): PreferenceStore {
  const value: unknown = JSON.parse(raw);
  const parsed = parsePreferences(raw);
  if (
    canonical(value) !== canonical(parsed) ||
    Object.keys(parsed.hiddenTopics).length > 1000 ||
    Object.keys(parsed.bookmarks).length > 1000
  )
    throw failure();
  return parsed;
}
async function readResponse(response: Response): Promise<string> {
  if (!response.body) throw failure();
  const reader = response.body.getReader();
  const decoder = new TextDecoder('utf-8', { fatal: true });
  let bytes = 0;
  let raw = '';
  try {
    for (;;) {
      const chunk = await reader.read();
      if (chunk.done) return raw + decoder.decode();
      bytes += chunk.value.byteLength;
      if (bytes > byteLimit) throw failure();
      raw += decoder.decode(chunk.value, { stream: true });
    }
  } finally {
    await reader.cancel().catch(() => undefined);
    reader.releaseLock();
  }
}

// Prepared only: the account UI will create one instance after authentication,
// and stop it BEFORE clearing local data on logout or changing accounts.
export function createReaderAccountSync(options: {
  read: () => PreferenceStore;
  write: (state: PreferenceStore) => void;
  fetch?: typeof fetch;
}) {
  let stopped = false;
  let pending: Promise<void> | undefined;
  const abort = new AbortController();
  return {
    sync(): Promise<void> {
      if (stopped) return Promise.resolve();
      if (pending) return pending;
      pending = Promise.resolve().then(async () => {
        try {
          if (stopped) return;
          const body = JSON.stringify(options.read());
          state(body);
          if (new TextEncoder().encode(body).byteLength > byteLimit)
            throw failure();
          const response = await (options.fetch ?? fetch)('/api/account/sync', {
            method: 'POST',
            credentials: 'same-origin',
            cache: 'no-store',
            redirect: 'error',
            headers: { 'Content-Type': 'application/json' },
            body,
            signal: abort.signal,
          });
          if (!response.ok) throw failure();
          const remote = state(await readResponse(response));
          if (stopped) return;
          // Re-read after the response: edits made during the request must win
          // by timestamp too. The next sync sends these retained local edits.
          const merged = mergePreferences(remote, options.read());
          state(JSON.stringify(merged));
          options.write(merged);
        } catch {
          if (!stopped) throw failure();
        } finally {
          pending = undefined;
        }
      });
      return pending;
    },
    stop() {
      stopped = true;
      abort.abort();
    },
  };
}
