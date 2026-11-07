import { useEffect, useState } from 'react';

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
  const [store, setStore] = useState(read);
  const [storageFailed, setStorageFailed] = useState(false);
  useEffect(() => {
    const sync = (event: StorageEvent) => {
      if (event.key === storageKey || event.key === null)
        setStore((current) => mergePreferences(current, read()));
    };
    window.addEventListener('storage', sync);
    return () => window.removeEventListener('storage', sync);
  }, []);
  const setHidden = (id: string, hidden: boolean) => {
    // Re-read before updating so another tab's changes are retained. False is a
    // tombstone, not deletion: future account sync needs the restoration time.
    const merged = mergePreferences(store, read());
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
      const next = changeBookmark(mergePreferences(store, read()), id, copy);
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
