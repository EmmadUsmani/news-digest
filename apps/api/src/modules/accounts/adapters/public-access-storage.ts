import { publicAccountAccess } from '../../../public-account-access';
import { PostgresAdminWriteAdmissionRepository } from '../database/admin-write-admission.repository';
import type { AccountHandlers } from './account-handlers';

// Prepared only: main does not install this policy. Account resources remain
// owned by the caller; this composition owns only its admission recorder.
export function prepareStoredPublicAccess(
  enabled: boolean,
  accounts: () => Pick<AccountHandlers, 'authorization'> | null,
  now: () => Date = () => new Date(),
  localToken?: string,
) {
  let closed = false;
  let recorder: PostgresAdminWriteAdmissionRepository | undefined;
  const middleware = publicAccountAccess(
    enabled,
    accounts,
    now,
    localToken,
    async (entry) => {
      if (closed) throw new Error('Public authorization storage closed');
      recorder ??= new PostgresAdminWriteAdmissionRepository();
      await recorder.record(entry);
    },
  );
  let closing: Promise<void> | undefined;
  return {
    middleware: (...args: Parameters<typeof middleware>) => {
      if (closed) {
        args[1].writeHead(503, { 'Cache-Control': 'no-store' }).end();
        return Promise.resolve();
      }
      return middleware(...args);
    },
    close: () => {
      closed = true;
      return (closing ??= recorder?.onModuleDestroy() ?? Promise.resolve());
    },
  };
}
