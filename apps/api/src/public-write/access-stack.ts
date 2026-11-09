import type { IncomingMessage, ServerResponse } from 'node:http';

type Middleware = (
  request: IncomingMessage,
  response: ServerResponse,
  next: () => void,
) => unknown;

// Prepared only. Mount before body parsers, proxies and controllers. Public
// authorization replaces the legacy identity-header guard rather than falling
// through to it. Account endpoints retain their own bounded request handlers.
export function prepareAccessStack(options: {
  publicMode: boolean;
  accounts: Middleware | null;
  publicAccess: () => Middleware;
  legacyAccess: () => Middleware;
}): Middleware {
  if (options.publicMode && !options.accounts)
    throw new Error('Public access requires account transport');
  const access = options.publicMode
    ? options.publicAccess()
    : options.legacyAccess();
  const accounts = options.accounts;
  return (request, response, next) => {
    if (accounts)
      return accounts(request, response, () => {
        void access(request, response, next);
      });
    return access(request, response, next);
  };
}
