import { adminAccess } from '../admin-access';
import { AccountRequestBoundary } from '../modules/accounts/adapters/account-request';
import { prepareStoredAccessRuntime } from './stored-access-runtime';

export const ACCESS_HTTP = Symbol('ACCESS_HTTP');
export type AccessHttpRuntime = {
  middleware: Awaited<
    ReturnType<typeof prepareStoredAccessRuntime>
  >['middleware'];
  onModuleDestroy: () => Promise<void>;
};

// Replaces ACCOUNT_HTTP. This provider owns
// both account transport and authorization, before Nest installs body parsers.
export function accessHttpProvider(
  options: Parameters<typeof prepareStoredAccessRuntime>[0],
  prepare = prepareStoredAccessRuntime,
) {
  return {
    provide: ACCESS_HTTP,
    useFactory: async (): Promise<AccessHttpRuntime> => {
      const runtime = await prepare(options);
      return {
        middleware: runtime.middleware,
        onModuleDestroy: () => runtime.close(),
      };
    },
  };
}

// Public mode stays default-off pending phase acceptance. Validate public
// prerequisites before opening any storage.
export function configuredAccessHttpProvider(
  env: Readonly<Record<string, string | undefined>>,
  prepare = prepareStoredAccessRuntime,
) {
  return {
    provide: ACCESS_HTTP,
    useFactory: async (): Promise<AccessHttpRuntime> => {
      const mode = env.PUBLIC_MODE ?? '0';
      if (mode !== '0' && mode !== '1')
        throw new Error('Invalid public access enable flag');
      const enabled = mode === '1';
      const origin = env.ACCOUNT_ORIGIN ?? '';
      if (enabled) {
        if (env.ACCOUNTS_ENABLED !== '1')
          throw new Error('Public access requires enabled accounts');
        new AccountRequestBoundary(origin);
      }
      return accessHttpProvider(
        {
          enabled,
          origin,
          env,
          localToken: env.ADMIN_LOCAL_TOKEN,
          legacyAccess: () =>
            adminAccess({
              emails: env.ADMIN_EMAILS,
              localToken: env.ADMIN_LOCAL_TOKEN,
            }),
        },
        prepare,
      ).useFactory();
    },
  };
}
