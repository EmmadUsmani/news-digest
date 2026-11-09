import type { IncomingMessage, ServerResponse } from 'node:http';

// Unregistered preparation. The caller must supply a proven visitor extractor;
// this boundary never interprets forwarding headers or authenticates a reader.
export function apiAdmissionHttp(options: {
  enabled: boolean;
  client: (request: IncomingMessage) => string | null;
  admission: () => { allow(client: string): Promise<boolean> };
}) {
  const admission = options.enabled ? options.admission() : null;
  return async (
    request: IncomingMessage,
    response: ServerResponse,
    next: () => void,
  ): Promise<void> => {
    const path = (request.url ?? '').split('?')[0];
    if (!admission || (path !== '/api' && !path.startsWith('/api/'))) {
      next();
      return;
    }
    let allowed = false;
    try {
      const client = options.client(request);
      allowed = !!client?.trim() && (await admission.allow(client));
    } catch {
      // Dependency and extraction failures must not grant an unlimited bypass.
    }
    if (!allowed) {
      response.setHeader('cache-control', 'no-store');
      response.writeHead(429).end();
      return;
    }
    next();
  };
}
