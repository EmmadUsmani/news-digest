import { useEffect, useRef, useState } from 'react';

import { createReaderPreferenceAccountBridge } from './reader-preference-account-bridge';
import {
  type BookmarkCopy,
  changeBookmark,
  emptyStore,
  mergePreferences,
  parsePreferences,
  type PreferenceStore,
  storageKey,
} from './reader-preference-store';

function read(): { store: PreferenceStore; failed: boolean; missing: boolean } {
  try {
    const raw = localStorage.getItem(storageKey);
    return {
      store: parsePreferences(raw),
      failed: false,
      missing: raw === null,
    };
  } catch {
    return { store: emptyStore(), failed: true, missing: false };
  }
}

export function useReaderPreferences() {
  const [initial] = useState(read);
  const [store, setRenderedStore] = useState(initial.store);
  const currentStore = useRef(store);
  const [storageFailed, setStorageFailed] = useState(initial.failed);
  const [bookmarkError, setBookmarkError] = useState<string | null>(null);
  const [accountStore] = useState(() =>
    createReaderPreferenceAccountBridge({
      read: () => currentStore.current,
      render: (next) => {
        currentStore.current = next;
        setRenderedStore(next);
        setBookmarkError(null);
      },
      storage: {
        setItem: (key, value) => localStorage.setItem(key, value),
        removeItem: (key) => localStorage.removeItem(key),
      },
      storageFailed: setStorageFailed,
    }),
  );
  const setStore = (next: PreferenceStore) => {
    currentStore.current = next;
    setRenderedStore(next);
    accountStore.notifyLocalChange();
  };
  useEffect(() => {
    const sync = (event: StorageEvent) => {
      if (event.key !== storageKey && event.key !== null) return;
      const { store: stored, failed, missing } = read();
      if (failed) {
        setStorageFailed(true);
        return;
      }
      // Removing the key or clearing site data is an explicit browser reset.
      // Do not restore the deleted choices from this tab's in-memory copy.
      // Read current storage so a newer write still wins over a queued reset.
      if (missing) {
        currentStore.current = stored;
        setRenderedStore(stored);
        setStorageFailed(false);
        setBookmarkError(null);
        accountStore.notifyLocalChange();
        return;
      }
      // Start with storage's ordering so identical unions do not bounce writes
      // between tabs. Retain changes absent from a concurrent stale write.
      const merged = mergePreferences(stored, currentStore.current);
      currentStore.current = merged;
      setRenderedStore(merged);
      accountStore.notifyLocalChange();
      if (JSON.stringify(merged) !== JSON.stringify(stored)) {
        try {
          localStorage.setItem(storageKey, JSON.stringify(merged));
          setStorageFailed(false);
        } catch {
          setStorageFailed(true);
        }
      } else {
        // A successful read confirms all current choices are already durable.
        setStorageFailed(false);
      }
    };
    window.addEventListener('storage', sync);
    return () => window.removeEventListener('storage', sync);
  }, [accountStore]);
  const setHidden = (id: string, hidden: boolean) => {
    // Re-read before updating so another tab's changes are retained. False is a
    // tombstone, not deletion: future account sync needs the restoration time.
    const stored = read();
    const merged = mergePreferences(currentStore.current, stored.store);
    const next: PreferenceStore = {
      ...merged,
      hiddenTopics: {
        ...merged.hiddenTopics,
        [id]: {
          hidden,
          updatedAt: Math.max(
            Date.now(),
            (merged.hiddenTopics[id]?.updatedAt ?? -1) + 1,
          ),
        },
      },
    };
    setStore(next);
    if (stored.failed) {
      setStorageFailed(true);
      return;
    }
    try {
      localStorage.setItem(storageKey, JSON.stringify(next));
      setStorageFailed(false);
    } catch {
      setStorageFailed(true);
    }
  };
  const setBookmark = (id: string, copy: BookmarkCopy | null) => {
    try {
      const stored = read();
      const next = changeBookmark(
        mergePreferences(currentStore.current, stored.store),
        id,
        copy,
      );
      setStore(next);
      setBookmarkError(null);
      if (stored.failed) {
        setStorageFailed(true);
        return;
      }
      try {
        localStorage.setItem(storageKey, JSON.stringify(next));
        setStorageFailed(false);
      } catch {
        setStorageFailed(true);
      }
    } catch (error) {
      setBookmarkError(
        error instanceof Error ? error.message : 'Could not save item.',
      );
    }
  };
  return {
    accountStore,
    hiddenTopics: store.hiddenTopics,
    bookmarks: store.bookmarks,
    setHidden,
    setBookmark,
    storageFailed,
    bookmarkError,
  };
}
