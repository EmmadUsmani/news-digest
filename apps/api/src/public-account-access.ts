import type { AccountHandlers } from './modules/accounts/adapters/account-handlers';
import { publicAccess } from './public-access';

// Preparation only: account/session-backed policy, not installed by main.
// The disabled path never constructs account resources.
export function publicAccountAccess(
  enabled: boolean,
  accounts: () => Pick<AccountHandlers, 'current'> | null,
  now: () => Date = () => new Date(),
) {
  if (!enabled) return publicAccess(false, () => Promise.resolve(null));
  const handlers = accounts();
  if (!handlers) throw new Error('Public authorization requires accounts');
  return publicAccess(true, async (request) => {
    // current() uses the strict cookie parser and recomputes admin freshness
    // and allowlisting from persisted sessions. No request identity is trusted.
    const result = await handlers.current(request.headers.cookie, now());
    if (!result.body.signedIn) return null;
    return { freshAdmin: result.body.isAdmin, cookie: result.cookie };
  });
}
