import type { IncomingMessage } from 'node:http';

import type { AccountHandlers } from './modules/accounts/adapters/account-handlers';
import {
  publicAccess,
  type PublicAccessPrincipal,
  type RecordAdminWrite,
} from './public-access';
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
  const authenticate = publicAccountAuthenticator(handlers, localToken);
  return publicAccess(
    true,
    (request) => authenticate(request, now()),
    recordAdminWrite,
    now,
  );
}

// Shared by atomic write handlers and ordinary authorization. Resolve the
// session after upload, using the caller's clock, and never trust proxy identity.
export function publicAccountAuthenticator(
  handlers: Pick<AccountHandlers, 'authorization'>,
  localToken?: string,
): (
  request: IncomingMessage,
  at: Date,
) => Promise<PublicAccessPrincipal | null> {
  return async (request, at) => {
    if (
      classifyPublicRoute(request.method ?? '', request.url ?? '') ===
        'admin' &&
      request.url?.startsWith('/api/admin/') &&
      directLocalAdmin(request, localToken)
    )
      return { freshAdmin: true, auditActor: { localScript: true } };
    return handlers.authorization(request.headers.cookie, at);
  };
}
