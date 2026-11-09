import { prepareStoredAccessRuntime } from './stored-access-runtime';

export const ACCESS_HTTP = Symbol('ACCESS_HTTP');
export type AccessHttpRuntime = {
  middleware: Awaited<
    ReturnType<typeof prepareStoredAccessRuntime>
  >['middleware'];
  onModuleDestroy: () => Promise<void>;
};

// Prepared only: do not register alongside ACCOUNT_HTTP. This provider owns
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
