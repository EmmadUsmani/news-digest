import { useEffect, useRef, useState } from 'react';

import {
  bindReaderAccount,
  initialAccountState,
} from './reader-account-binding';
import type { createReaderPreferenceAccountBridge } from './reader-preference-account-bridge';

// Prepared integration only: account activation follows phase 1 acceptance.
// The caller supplies the account gate; there is no default-on build flag.
export function useReaderAccount(
  enabled: boolean,
  store: ReturnType<typeof createReaderPreferenceAccountBridge>,
) {
  const [state, setState] = useState(initialAccountState);
  const binding = useRef<ReturnType<typeof bindReaderAccount>>(undefined);
  useEffect(() => {
    let active = true;
    const mounted = bindReaderAccount({
      ...store,
      enabled,
      browser: window,
      page: document,
      changed: (next) => {
        if (active) setState(next);
      },
    });
    binding.current = mounted;
    return () => {
      active = false;
      binding.current = undefined;
      mounted?.stop();
    };
  }, [enabled, store]);
  return {
    ...(enabled ? state : initialAccountState),
    refresh: () => binding.current?.refresh() ?? Promise.resolve(),
    retrySync: () => binding.current?.retrySync() ?? Promise.resolve(),
    signOut: (allDevices = false) =>
      binding.current?.signOut(allDevices) ?? Promise.resolve(),
  };
}
