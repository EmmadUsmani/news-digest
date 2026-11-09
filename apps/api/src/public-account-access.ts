import type { AccountHandlers } from './modules/accounts/adapters/account-handlers';
import { publicAccess, type RecordAdminWrite } from './public-access';
import { directLocalAdmin } from './public-local-admin';
import { classifyPublicRoute } from './public-route-policy';

// Preparation only: account/session-backed policy, not installed by main.
// The disabled path never constructs account resources.
export function publicAccountAccess(
  enabled: boolean,
  accounts: () => Pick<AccountHandlers, 'authorization'> | null,
  now: () => Date = () => new Date(),
  localToken?: string,
  recordAdminWrite?: RecordAdminWrite,
) {
  if (!enabled) return publicAccess(false, () => Promise.resolve(null));
  const handlers = accounts();
  if (!handlers) throw new Error('Public authorization requires accounts');
  return publicAccess(
    true,
    async (request) => {
      // Script credentials never impersonate a reader or enter account routes.
      if (
        classifyPublicRoute(request.method ?? '', request.url ?? '') ===
          'admin' &&
        request.url?.startsWith('/api/admin/') &&
        directLocalAdmin(request, localToken)
      )
        return { freshAdmin: true, auditActor: { localScript: true } };
      // Recompute freshness and allowlisting from persisted sessions; identity
      // stays inside authorization and never enters a current-session response.
      return handlers.authorization(request.headers.cookie, now());
    },
    recordAdminWrite,
    now,
  );
}
