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
    if (options.publicMode) {
      // Public access is served through the configured HTTPS origin. Do not
      // derive security policy from spoofable forwarding/identity headers.
      response.setHeader('Strict-Transport-Security', 'max-age=31536000');
      response.setHeader('X-Content-Type-Options', 'nosniff');
      response.setHeader('Referrer-Policy', 'no-referrer');
      response.setHeader('X-Frame-Options', 'SAMEORIGIN');
      // These document restrictions preserve official embeds and same-origin
      // tool frames. Script/connect allowlists need their own browser review.
      response.setHeader(
        'Content-Security-Policy',
        "base-uri 'self'; object-src 'none'; frame-ancestors 'self'; form-action 'self'",
      );
    }
    if (accounts)
      return accounts(request, response, () => {
        void access(request, response, next);
      });
    return access(request, response, next);
  };
}
