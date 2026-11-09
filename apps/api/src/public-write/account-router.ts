import type { AccountHandlers } from '../modules/accounts/adapters/account-handlers';
import { publicAccess, type RecordAdminWrite } from '../public-access';
import { publicAccountAuthenticator } from '../public-account-access';
import { publicWriteAccess } from '../public-write-access';
import { prepareOwnedPublicWriteRouter } from './owned-router';

// Uninstalled preparation. Accounts and the ordinary admission recorder remain
// caller-owned; source writes use only their own transactional admission.
export async function prepareAccountPublicWriteRouter(options: {
  enabled: boolean;
  origin: string;
  pool: Parameters<typeof prepareOwnedPublicWriteRouter>[0]['pool'];
  accounts: () => Pick<AccountHandlers, 'authorization'> | null;
  recordAdminWrite: RecordAdminWrite;
  localToken?: string;
  now?: () => Date;
}) {
  const handlers = options.enabled ? options.accounts() : null;
  if (options.enabled && !handlers)
    throw new Error('Public write routing requires accounts');
  const authenticate = handlers
    ? publicAccountAuthenticator(handlers, options.localToken)
    : () => Promise.resolve(null);
  const now = options.now ?? (() => new Date());
  return prepareOwnedPublicWriteRouter({
    ...options,
    authenticate,
    authorize: () => {
      const provenance = publicWriteAccess(
        true,
        options.origin,
        options.localToken,
      );
      const authorize = publicAccess(
        true,
        (request) => authenticate(request, now()),
        options.recordAdminWrite,
        now,
      );
      return (request, response, next) =>
        provenance(request, response, () => {
          void authorize(request, response, next);
        });
    },
  });
}
