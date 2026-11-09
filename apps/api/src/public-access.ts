import type { IncomingMessage, ServerResponse } from 'node:http';

import { classifyPublicRoute } from './public-route-policy';

export interface PublicAccessPrincipal {
  // The account adapter must recompute freshness and allowlisting per request.
  freshAdmin: boolean;
}

type Authenticate = (
  request: IncomingMessage,
) => Promise<PublicAccessPrincipal | null>;

// Preparation only. Install before every router/static/proxy handler when
// public mode is promoted; never compose with the legacy header-based guard.
export function publicAccess(enabled: boolean, authenticate: Authenticate) {
  return async (
    request: IncomingMessage,
    response: ServerResponse,
    next: () => void,
  ): Promise<void> => {
    if (!enabled) {
      next();
      return;
    }
    response.setHeader('cache-control', 'no-store');
    const access = classifyPublicRoute(request.method ?? '', request.url ?? '');
    if (access === null) {
      response.writeHead(404).end();
      return;
    }
    if (access === 'public-read') {
      next();
      return;
    }
    let principal: PublicAccessPrincipal | null;
    try {
      // No proxy identity header is an authorization credential here.
      principal = await authenticate(request);
    } catch {
      response.writeHead(503).end();
      return;
    }
    if (!principal || (access === 'admin' && !principal.freshAdmin)) {
      response.writeHead(404).end();
      return;
    }
    next();
  };
}
