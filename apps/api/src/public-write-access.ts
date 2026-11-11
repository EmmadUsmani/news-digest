import type { IncomingMessage, ServerResponse } from 'node:http';

import { AccountRequestBoundary } from './modules/accounts/adapters/account-request';
import { directLocalAdmin } from './public-local-admin';
import { classifyPublicRoute } from './public-route-policy';
import { isAdminTelemetryQuery } from './telemetry-query-policy';

// Preparation only: install before authorization and every downstream router.
// This checks request provenance, never grants permission to perform a write.
export function publicWriteAccess(
  enabled: boolean,
  origin: string,
  localToken?: string,
) {
  const boundary = enabled ? new AccountRequestBoundary(origin) : null;
  return (
    request: IncomingMessage,
    response: ServerResponse,
    next: () => void,
  ): void => {
    if (!boundary || request.method === 'GET' || request.method === 'HEAD') {
      next();
      return;
    }
    response.setHeader('cache-control', 'no-store');
    const access = classifyPublicRoute(request.method ?? '', request.url ?? '');
    if (access === null) {
      response.writeHead(404).end();
      return;
    }
    const count = (name: string) =>
      request.rawHeaders.filter(
        (value, index) => index % 2 === 0 && value.toLowerCase() === name,
      ).length;
    // Origin is optional only for authenticated direct-local admin scripts.
    // An explicitly supplied foreign Origin is refused even for scripts.
    const local =
      access === 'admin' &&
      request.url?.startsWith('/api/admin/') &&
      directLocalAdmin(request, localToken) &&
      count('origin') === 0;
    if (
      count('content-type') !== 1 ||
      (!local && count('origin') !== 1) ||
      !boundary.acceptsWrite(
        local ? origin : request.headers.origin,
        // Native telemetry reads use forms, validated and bounded by the proxy.
        // Keep the exact same-origin and duplicate-header checks here.
        isAdminTelemetryQuery(request.method ?? '', request.url ?? '')
          ? 'application/json'
          : request.headers['content-type'],
      )
    ) {
      response.writeHead(403).end();
      return;
    }
    next();
  };
}
