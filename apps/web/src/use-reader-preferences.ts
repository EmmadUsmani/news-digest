import { useEffect, useRef, useState } from 'react';

import {
  type BookmarkCopy,
  changeBookmark,
  emptyStore,
  mergePreferences,
  parsePreferences,
  type PreferenceStore,
  storageKey,
} from './reader-preference-store';

function read(): PreferenceStore {
  try {
    return parsePreferences(localStorage.getItem(storageKey));
  } catch {
    return emptyStore();
  }
}

export function useReaderPreferences() {
  const [store, setRenderedStore] = useState(read);
  const currentStore = useRef(store);
  const setStore = (next: PreferenceStore) => {
    currentStore.current = next;
    setRenderedStore(next);
  };
  const [storageFailed, setStorageFailed] = useState(false);
  useEffect(() => {
    const sync = (event: StorageEvent) => {
      if (event.key !== storageKey && event.key !== null) return;
      const stored = read();
      // Start with storage's ordering so identical unions do not bounce writes
      // between tabs. Retain changes absent from a concurrent stale write.
      const merged = mergePreferences(stored, currentStore.current);
      currentStore.current = merged;
      setRenderedStore(merged);
      if (JSON.stringify(merged) !== JSON.stringify(stored)) {
        try {
          localStorage.setItem(storageKey, JSON.stringify(merged));
          setStorageFailed(false);
        } catch {
          setStorageFailed(true);
        }
      }
    };
    window.addEventListener('storage', sync);
    return () => window.removeEventListener('storage', sync);
  }, []);
  const setHidden = (id: string, hidden: boolean) => {
    // Re-read before updating so another tab's changes are retained. False is a
    // tombstone, not deletion: future account sync needs the restoration time.
    const merged = mergePreferences(currentStore.current, read());
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
    try {
      localStorage.setItem(storageKey, JSON.stringify(next));
      setStorageFailed(false);
    } catch {
      setStorageFailed(true);
    }
  };
  const [bookmarkError, setBookmarkError] = useState<string | null>(null);
  const setBookmark = (id: string, copy: BookmarkCopy | null) => {
    try {
      const next = changeBookmark(
        mergePreferences(currentStore.current, read()),
        id,
        copy,
      );
      setStore(next);
      setBookmarkError(null);
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
    hiddenTopics: store.hiddenTopics,
    bookmarks: store.bookmarks,
    setHidden,
    setBookmark,
    storageFailed,
    bookmarkError,
  };
}
