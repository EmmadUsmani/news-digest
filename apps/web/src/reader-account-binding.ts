import { createReaderAccountController } from './reader-account-controller';

type ControllerOptions = Parameters<typeof createReaderAccountController>[0];
export type ReaderAccountState = Parameters<
  NonNullable<ControllerOptions['changed']>
>[0];
export const initialAccountState: ReaderAccountState = {
  session: null,
  status: 'idle',
  sync: 'stopped',
};

// One mounted reader owns one controller. The disabled path must not discover
// sessions, subscribe to browser events or touch the reader's local choices.
export function bindReaderAccount(
  options: ControllerOptions & {
    enabled: boolean;
    browser: Pick<Window, 'addEventListener' | 'removeEventListener'>;
    page: Pick<
      Document,
      'visibilityState' | 'addEventListener' | 'removeEventListener'
    >;
  },
) {
  if (!options.enabled) return undefined;
  const controller = createReaderAccountController(options);
  const refresh = () => {
    if (options.page.visibilityState === 'visible') {
      void controller.refresh().catch(() => undefined);
    }
  };
  options.browser.addEventListener('focus', refresh);
  options.page.addEventListener('visibilitychange', refresh);
  void controller.refresh().catch(() => undefined);
  return {
    refresh: controller.refresh,
    retrySync: controller.retrySync,
    signOut: controller.signOut,
    stop() {
      options.browser.removeEventListener('focus', refresh);
      options.page.removeEventListener('visibilitychange', refresh);
      controller.stop();
    },
  };
}
