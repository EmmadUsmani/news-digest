import { timingSafeEqual } from 'node:crypto';
import type { IncomingMessage, ServerResponse } from 'node:http';

export interface AdminAccessConfig {
  emails?: string;
  localToken?: string;
}

function header(request: IncomingMessage, name: string) {
  const value = request.headers[name];
  return typeof value === 'string' ? value : undefined;
}

export function isAdmin(request: IncomingMessage, config: AdminAccessConfig) {
  const email = header(request, 'x-exedev-email')?.trim().toLowerCase();
  const allowed = (config.emails ?? '')
    .split(',')
    .map((entry) => entry.trim().toLowerCase())
    .filter(Boolean);
  if (email && allowed.includes(email)) return true;

  // Never grant access on the socket address alone. Forwarded traffic may
  // reach the app over loopback; local tokens are only for direct VM scripts.
  const remote = request.socket.remoteAddress;
  const directLocal =
    (remote === '127.0.0.1' ||
      remote === '::1' ||
      remote === '::ffff:127.0.0.1') &&
    !Object.keys(request.headers).some(
      (name) => name.startsWith('x-forwarded-') || name === 'forwarded',
    );
  const supplied = header(request, 'admin_local_token');
  const expected = config.localToken;
  if (!directLocal || !supplied || !expected) return false;
  const actualBytes = Buffer.from(supplied);
  const expectedBytes = Buffer.from(expected);
  return (
    actualBytes.length === expectedBytes.length &&
    timingSafeEqual(actualBytes, expectedBytes)
  );
}

export function adminAccess(config: AdminAccessConfig) {
  return (
    request: IncomingMessage,
    response: ServerResponse,
    next: () => void,
  ) => {
    // Express matches paths case-insensitively; check decoded paths as well.
    let path: string;
    try {
      path = decodeURIComponent(
        (request.url ?? '/').split('?')[0],
      ).toLowerCase();
    } catch {
      response.writeHead(400).end();
      return;
    }
    if (path === '/api/me' && request.method === 'GET') {
      response
        .writeHead(200, {
          'content-type': 'application/json',
          'cache-control': 'no-store',
          vary: 'X-ExeDev-Email, ADMIN_LOCAL_TOKEN',
        })
        .end(JSON.stringify({ isAdmin: isAdmin(request, config) }));
      return;
    }
    const protectedPath = ['/admin', '/api/admin'].some(
      (prefix) => path === prefix || path.startsWith(`${prefix}/`),
    );
    if (protectedPath && !isAdmin(request, config)) {
      response.writeHead(404, { 'cache-control': 'no-store' }).end();
      return;
    }
    next();
  };
}
