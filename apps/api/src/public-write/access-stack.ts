import type { IncomingMessage, ServerResponse } from 'node:http';

import { apiAdmissionHttp } from './api-admission-http';

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
  apiAdmission?: Omit<Parameters<typeof apiAdmissionHttp>[0], 'enabled'>;
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
  // Optional until visitor extraction is proven. Private rollback must not
  // construct the limiter or inspect client identity.
  const gate = options.apiAdmission
    ? apiAdmissionHttp({ ...options.apiAdmission, enabled: options.publicMode })
    : null;
  return (request, response, next) => {
    if (options.publicMode) {
      // Public access is served through the configured HTTPS origin. Do not
      // derive security policy from spoofable forwarding/identity headers.
      response.setHeader('Strict-Transport-Security', 'max-age=31536000');
      response.setHeader('X-Content-Type-Options', 'nosniff');
      response.setHeader('Referrer-Policy', 'no-referrer');
      response.setHeader('X-Frame-Options', 'SAMEORIGIN');
      // Only official X hosts and same-origin tools may supply frames.
      // Restrict document connections; widgets retain their own frame policy.
      response.setHeader(
        'Content-Security-Policy',
        "default-src 'none'; style-src 'self' 'unsafe-inline'; base-uri 'self'; object-src 'none'; frame-ancestors 'self'; form-action 'self'; script-src 'self' https://platform.twitter.com; script-src-attr 'none'; img-src 'self' https:; font-src 'self'; media-src 'self'; worker-src 'none'; connect-src 'self' https://syndication.twitter.com; frame-src 'self' https://platform.twitter.com https://syndication.twitter.com",
      );
    }
    const dispatch = () => {
      if (accounts)
        return accounts(request, response, () => {
          void access(request, response, next);
        });
      return access(request, response, next);
    };
    return gate ? gate(request, response, () => void dispatch()) : dispatch();
  };
}
