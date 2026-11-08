import type { IncomingMessage, ServerResponse } from 'node:http';

import type { AccountHandlers } from './account-handlers';

type Result = { status: number; body?: unknown; cookie?: string | null };

// Prepared middleware only: main does not install it. Client admission must be
// supplied by the deployment's verified proxy boundary, never forwarded headers.
// Install before any body parser so the stream limit applies before allocation.
export function accountHttp(options: {
  enabled: boolean;
  handlers: AccountHandlers;
  client: (request: IncomingMessage) => string | null;
}) {
  return (
    request: IncomingMessage,
    response: ServerResponse,
    next: () => void,
  ) => {
    const path = (request.url ?? '').split('?')[0];
    if (!path.startsWith('/api/account/')) return next();
    response.setHeader('Cache-Control', 'no-store');
    response.setHeader('Vary', 'Cookie');
    const send = (result: Result) => {
      response.statusCode = result.status;
      if (result.cookie) response.setHeader('Set-Cookie', result.cookie);
      if (result.body !== undefined) {
        response.setHeader('Content-Type', 'application/json; charset=utf-8');
        response.end(JSON.stringify(result.body));
      } else response.end();
    };
    const run = async () => {
      if (!options.enabled) return send({ status: 404 });
      const now = new Date();
      if (path === '/api/account/session' && request.method === 'GET')
        return send(
          await options.handlers.current(request.headers.cookie, now),
        );
      const routes = [
        '/api/account/code',
        '/api/account/redeem',
        '/api/account/logout',
        '/api/account/logout-all',
      ];
      if (request.method !== 'POST' || !routes.includes(path))
        return send({ status: 404 });
      const client = options.client(request);
      if (!client) return send({ status: 503 });
      // Bound streamed bodies, including chunked requests; do not trust length.
      const chunks: Buffer[] = [];
      let size = 0;
      for await (const chunk of request) {
        const bytes = Buffer.from(chunk as Uint8Array);
        size += bytes.length;
        if (size > 2048) return send({ status: 413 });
        chunks.push(bytes);
      }
      let body: unknown;
      try {
        body = JSON.parse(Buffer.concat(chunks).toString('utf8'));
      } catch {
        return send({ status: 400 });
      }
      const input = {
        origin: request.headers.origin,
        contentType: request.headers['content-type'],
        cookie: request.headers.cookie,
        body,
      };
      if (path === '/api/account/code')
        return send(await options.handlers.requestCode(input, client, now));
      if (path === '/api/account/redeem')
        return send(await options.handlers.redeemCode(input, client, now));
      return send(
        await options.handlers.signOut(
          input,
          path === '/api/account/logout-all',
          now,
        ),
      );
    };
    // No exception details, codes, identities or cookies reach logs/responses.
    void run().catch(() => {
      if (!response.headersSent) send({ status: 503 });
      else response.end();
    });
  };
}
