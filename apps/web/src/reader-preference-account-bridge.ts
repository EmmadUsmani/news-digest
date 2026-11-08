import {
  emptyStore,
  type PreferenceStore,
  storageKey,
} from './reader-preference-store';

// Stable bridge shared by React and the prepared account controller. Local edits
// and cross-tab updates notify synchronously, including edits during an upload.
export function createReaderPreferenceAccountBridge(options: {
  read: () => PreferenceStore;
  render: (state: PreferenceStore) => void;
  storage: Pick<Storage, 'setItem' | 'removeItem'>;
  storageFailed: (failed: boolean) => void;
}) {
  const listeners = new Set<() => void>();
  const changed = () => {
    for (const listener of listeners) listener();
  };
  const apply = (state: PreferenceStore, clear: boolean) => {
    options.render(state);
    try {
      if (clear) options.storage.removeItem(storageKey);
      else options.storage.setItem(storageKey, JSON.stringify(state));
      options.storageFailed(false);
    } catch {
      // Keep the active page correct even when browser storage is unavailable.
      options.storageFailed(true);
    }
    changed();
  };
  return {
    read: options.read,
    write: (state: PreferenceStore) => apply(state, false),
    clear: () => apply(emptyStore(), true),
    subscribe(listener: () => void) {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },
    notifyLocalChange: changed,
  };
}
