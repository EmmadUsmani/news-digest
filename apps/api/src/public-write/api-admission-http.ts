import type { IncomingMessage, ServerResponse } from 'node:http';

// Unregistered preparation. The caller must supply a proven visitor extractor;
// this boundary never interprets forwarding headers or authenticates a reader.
export function apiAdmissionHttp(options: {
  enabled: boolean;
  client: (request: IncomingMessage) => string | null;
  admission: () => { allow(client: string): Promise<boolean> };
  timeoutMs?: number;
}) {
  const timeoutMs = options.timeoutMs ?? 3000;
  if (
    !Number.isSafeInteger(timeoutMs) ||
    timeoutMs <= 0 ||
    timeoutMs > 2_147_483_647
  )
    throw new Error(
      'API admission timeout must be a positive integer within the timer range',
    );
  const admission = options.enabled ? options.admission() : null;
  return async (
    request: IncomingMessage,
    response: ServerResponse,
    next: () => void,
  ): Promise<void> => {
    const path = (request.url ?? '').split('?')[0];
    // Tool requests can query stores or render documents outside /api. Share
    // the visitor allowance before any account, authorization or proxy work.
    const limited = ['/api', '/docs', '/db', '/logs', '/metrics'].some(
      (prefix) => path === prefix || path.startsWith(`${prefix}/`),
    );
    if (!admission || !limited) {
      next();
      return;
    }
    let allowed = false;
    let timer: ReturnType<typeof setTimeout> | undefined;
    try {
      const client = options.client(request);
      allowed =
        !!client?.trim() &&
        (await Promise.race([
          admission.allow(client),
          new Promise<false>((resolve) => {
            timer = setTimeout(() => resolve(false), timeoutMs);
          }),
        ]));
    } catch {
      // Dependency and extraction failures must not grant an unlimited bypass.
    } finally {
      clearTimeout(timer);
    }
    // A disconnected caller must not start account or controller work after
    // an asynchronous admission check finishes.
    if (request.aborted || response.destroyed || response.writableEnded) return;
    if (!allowed) {
      response.setHeader('cache-control', 'no-store');
      response.writeHead(429).end();
      return;
    }
    next();
  };
}
