import type { IncomingMessage, ServerResponse } from 'node:http';

import { classifyPublicRoute } from './public-route-policy';

export interface PublicAccessPrincipal {
  // The account adapter must recompute freshness and allowlisting per request.
  freshAdmin: boolean;
  auditActor?: { userId: string } | { localScript: true };
  cookie?: string | null;
}

type Authenticate = (
  request: IncomingMessage,
) => Promise<PublicAccessPrincipal | null>;

export interface AdminWriteAdmission {
  actor: NonNullable<PublicAccessPrincipal['auditActor']>;
  action: string;
  target: string;
  at: Date;
}

// Resolve only after durable persistence. This records admission, not success;
// controller-level transactional audit is still required for mutation outcomes.
export type RecordAdminWrite = (entry: AdminWriteAdmission) => Promise<void>;

// Preparation only. Install before every router/static/proxy handler when
// public mode is promoted; never compose with the legacy header-based guard.
export function publicAccess(
  enabled: boolean,
  authenticate: Authenticate,
  recordAdminWrite?: RecordAdminWrite,
  now: () => Date = () => new Date(),
) {
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
    if (principal?.cookie) response.setHeader('set-cookie', principal.cookie);
    if (!principal || (access === 'admin' && !principal.freshAdmin)) {
      response.writeHead(404).end();
      return;
    }
    if (access === 'admin' && !['GET', 'HEAD'].includes(request.method ?? '')) {
      const supplied = principal.auditActor;
      const actor =
        supplied &&
        'userId' in supplied &&
        /^[0-9a-f]{8}(?:-[0-9a-f]{4}){3}-[0-9a-f]{12}$/.test(supplied.userId)
          ? { userId: supplied.userId }
          : supplied &&
              'localScript' in supplied &&
              supplied.localScript === true
            ? { localScript: true as const }
            : null;
      if (!recordAdminWrite || !actor) {
        response.writeHead(503).end();
        return;
      }
      try {
        await recordAdminWrite({
          actor,
          action: request.method!,
          // Never persist query strings, bodies, headers or credentials.
          target: request.url!.split('?')[0],
          at: now(),
        });
      } catch {
        response.writeHead(503).end();
        return;
      }
    }
    next();
  };
}
