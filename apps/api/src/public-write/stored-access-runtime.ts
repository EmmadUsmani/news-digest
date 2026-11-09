import { database } from '../libs/db/connections';
import { prepareStoredAccountHttp } from '../modules/accounts/adapters/account-storage';
import { PostgresAdminWriteAdmissionRepository } from '../modules/accounts/database/admin-write-admission.repository';
import { prepareAccessRuntime } from './access-runtime';

type Options = Parameters<typeof prepareAccessRuntime>[0];
type StoredAccounts = ReturnType<typeof prepareStoredAccountHttp>;
type Dependencies = {
  accounts: (env: Readonly<Record<string, string | undefined>>) => {
    middleware: StoredAccounts['middleware'];
    handlers: ReturnType<Options['accounts']>;
    close: () => Promise<void>;
  };
  pool: Options['pool'];
  recorder: () => Pick<
    PostgresAdminWriteAdmissionRepository,
    'record' | 'onModuleDestroy'
  >;
};

// All account and access storage belongs to this runtime.
// The caller validates enablement and supplies the configured HTTPS origin.
export async function prepareStoredAccessRuntime(
  options: Pick<
    Options,
    'enabled' | 'origin' | 'legacyAccess' | 'localToken' | 'apiAdmission'
  > & {
    env: Readonly<Record<string, string | undefined>>;
  },
  dependencies: Dependencies = {
    accounts: prepareStoredAccountHttp,
    pool: database,
    recorder: () => new PostgresAdminWriteAdmissionRepository(),
  },
) {
  const disposers: (() => Promise<unknown>)[] = [];
  let closing: Promise<void> | undefined;
  const close = () =>
    (closing ??= (async () => {
      const results = await Promise.allSettled(
        disposers.map(async (dispose) => dispose()),
      );
      const failures = results.filter((result) => result.status === 'rejected');
      if (failures.length)
        throw new AggregateError(
          failures.map((failure): unknown => failure.reason),
          'Access storage shutdown failed',
        );
    })());
  try {
    // Private composition retains account endpoints if separately enabled.
    const accounts = dependencies.accounts(options.env);
    disposers.push(accounts.close);
    let recorder: ReturnType<typeof dependencies.recorder> | undefined;
    const access = await prepareAccessRuntime({
      ...options,
      accountTransport: accounts.middleware,
      accounts: () => accounts.handlers,
      pool: dependencies.pool,
      recordAdminWrite: async (entry) => {
        if (closing) throw new Error('Access storage closed');
        if (!recorder) {
          recorder = dependencies.recorder();
          disposers.push(() => recorder!.onModuleDestroy());
        }
        await recorder.record(entry);
      },
    });
    disposers.push(access.close);
    return {
      middleware: (...args: Parameters<typeof access.middleware>) => {
        if (closing) {
          args[1].writeHead(503, { 'Cache-Control': 'no-store' }).end();
          return;
        }
        return access.middleware(...args);
      },
      close,
    };
  } catch (error) {
    try {
      await close();
    } catch (cleanupError) {
      throw new AggregateError([error, cleanupError], 'Access startup failed');
    }
    throw error;
  }
}
