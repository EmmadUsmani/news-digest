import type { AccountHandlers } from './modules/accounts/adapters/account-handlers';
import { publicAccess } from './public-access';
import { directLocalAdmin } from './public-local-admin';
import { classifyPublicRoute } from './public-route-policy';

// Preparation only: account/session-backed policy, not installed by main.
// The disabled path never constructs account resources.
export function publicAccountAccess(
  enabled: boolean,
  accounts: () => Pick<AccountHandlers, 'current'> | null,
  now: () => Date = () => new Date(),
  localToken?: string,
) {
  if (!enabled) return publicAccess(false, () => Promise.resolve(null));
  const handlers = accounts();
  if (!handlers) throw new Error('Public authorization requires accounts');
  return publicAccess(true, async (request) => {
    // Script credentials never impersonate a reader or enter account routes.
    if (
      classifyPublicRoute(request.method ?? '', request.url ?? '') ===
        'admin' &&
      request.url?.startsWith('/api/admin/') &&
      directLocalAdmin(request, localToken)
    )
      return { freshAdmin: true };
    // current() uses the strict cookie parser and recomputes admin freshness
    // and allowlisting from persisted sessions. No request identity is trusted.
    const result = await handlers.current(request.headers.cookie, now());
    if (!result.body.signedIn) return null;
    return { freshAdmin: result.body.isAdmin, cookie: result.cookie };
  });
}
