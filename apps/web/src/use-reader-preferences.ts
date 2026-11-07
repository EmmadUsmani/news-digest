import { useEffect, useState } from 'react';

const storageKey = 'news-digest.reader-preferences.v1';
type Change = { hidden: boolean; updatedAt: number };
type Store = { version: 1; hiddenTopics: Record<string, Change> };
const empty = (): Store => ({ version: 1, hiddenTopics: {} });
function read(): Store {
  try {
    const value = JSON.parse(localStorage.getItem(storageKey) ?? 'null');
    if (
      value?.version !== 1 ||
      typeof value.hiddenTopics !== 'object' ||
      !value.hiddenTopics
    )
      return empty();
    const entries = Object.entries(value.hiddenTopics).filter(
      ([id, change]) =>
        id.length <= 200 &&
        change &&
        typeof change === 'object' &&
        'hidden' in change &&
        typeof change.hidden === 'boolean' &&
        'updatedAt' in change &&
        typeof change.updatedAt === 'number' &&
        Number.isFinite(change.updatedAt),
    );
    return {
      version: 1,
      hiddenTopics: Object.fromEntries(entries) as Record<string, Change>,
    };
  } catch {
    return empty();
  }
}

export function useReaderPreferences() {
  const [store, setStore] = useState(read);
  const [storageFailed, setStorageFailed] = useState(false);
  useEffect(() => {
    const sync = (event: StorageEvent) => {
      if (event.key === storageKey || event.key === null) setStore(read());
    };
    window.addEventListener('storage', sync);
    return () => window.removeEventListener('storage', sync);
  }, []);
  const setHidden = (id: string, hidden: boolean) => {
    // Re-read before updating so another tab's changes are retained. False is a
    // tombstone, not deletion: future account sync needs the restoration time.
    const merged = { ...store.hiddenTopics };
    for (const [key, change] of Object.entries(read().hiddenTopics)) {
      if (!merged[key] || change.updatedAt >= merged[key].updatedAt)
        merged[key] = change;
    }
    const next: Store = {
      ...store,
      hiddenTopics: {
        ...merged,
        [id]: { hidden, updatedAt: Date.now() },
      },
    };
    setStore(next);
    try {
      localStorage.setItem(storageKey, JSON.stringify(next));
      setStorageFailed(false);
    } catch {
      setStorageFailed(true);
    }
  };
  return { hiddenTopics: store.hiddenTopics, setHidden, storageFailed };
}
