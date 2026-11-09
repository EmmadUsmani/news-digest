import type { IncomingMessage, ServerResponse } from 'node:http';

import type {
  AdminWriteAdmission,
  PublicAccessPrincipal,
} from '../public-access';

interface SourceWriter {
  setEnabled(
    entry: AdminWriteAdmission,
    id: string,
    enabled: boolean,
  ): Promise<
    | { outcome: 'changed' | 'unchanged'; id: string; enabled: boolean }
    | { outcome: 'not-found' }
  >;
}

// Uninstalled preparation. Mount before body parsers and the general admission
// middleware: the writer owns admission and mutation in one transaction.
export function publicSourceHttp(options: {
  enabled: boolean;
  origin: string;
  authenticate: (
    request: IncomingMessage,
    now: Date,
  ) => Promise<PublicAccessPrincipal | null>;
  writer: SourceWriter;
  now?: () => Date;
}) {
  const origin = new URL(options.origin);
  if (origin.protocol !== 'https:' || origin.origin !== options.origin)
    throw new Error('Source write origin must be an HTTPS origin');
  return (
    request: IncomingMessage,
    response: ServerResponse,
    next: () => void,
  ) => {
    const target = request.url ?? '';
    if (!target.startsWith('/api/admin/topics/sources/')) return next();
    response.setHeader('Cache-Control', 'no-store');
    response.setHeader('Vary', 'Cookie');
    const send = (status: number, body?: unknown) => {
      response.statusCode = status;
      if (body !== undefined) {
        response.setHeader('Content-Type', 'application/json; charset=utf-8');
        response.end(JSON.stringify(body));
      } else response.end();
    };
    const run = async () => {
      const match =
        /^\/api\/admin\/topics\/sources\/([a-zA-Z0-9_-]{1,200})\/enabled$/.exec(
          target,
        );
      if (!options.enabled || request.method !== 'PUT' || !match)
        return send(404);
      // Node can discard duplicate Content-Type values while normalizing
      // headers. Validate wire-level multiplicity before trusting that view.
      const count = (name: string) =>
        request.rawHeaders.filter(
          (value, index) => index % 2 === 0 && value.toLowerCase() === name,
        ).length;
      if (
        count('origin') !== 1 ||
        count('content-type') !== 1 ||
        request.headers.origin !== options.origin ||
        !/^application\/json(?:\s*;\s*charset=utf-8)?$/i.test(
          request.headers['content-type'] ?? '',
        )
      )
        return send(400);
      const limit = 2048;
      if (Number(request.headers['content-length'] ?? 0) > limit)
        return send(413);
      const chunks: Buffer[] = [];
      let size = 0;
      for await (const chunk of request) {
        const bytes = Buffer.from(chunk as Uint8Array);
        size += bytes.length;
        if (size > limit) return send(413);
        chunks.push(bytes);
      }
      let body: unknown;
      try {
        body = JSON.parse(Buffer.concat(chunks).toString('utf8'));
      } catch {
        return send(400);
      }
      if (
        !body ||
        typeof body !== 'object' ||
        Array.isArray(body) ||
        Object.keys(body).length !== 1 ||
        !Object.hasOwn(body, 'enabled') ||
        typeof (body as { enabled?: unknown }).enabled !== 'boolean'
      )
        return send(400);
      // Recheck session freshness after the bounded upload has completed.
      const at = (options.now ?? (() => new Date()))();
      const principal = await options.authenticate(request, at);
      if (principal?.cookie) response.setHeader('Set-Cookie', principal.cookie);
      if (!principal?.freshAdmin) return send(404);
      const actor = principal.auditActor;
      if (
        !actor ||
        !('userId' in actor
          ? /^[0-9a-f]{8}(?:-[0-9a-f]{4}){3}-[0-9a-f]{12}$/.test(actor.userId)
          : actor.localScript === true)
      )
        return send(503);
      const result = await options.writer.setEnabled(
        { actor, action: 'PUT', target, at },
        match[1],
        (body as { enabled: boolean }).enabled,
      );
      if (result.outcome === 'not-found') return send(404);
      // Explicit projection prevents future adapter fields entering responses.
      send(200, {
        outcome: result.outcome,
        id: result.id,
        enabled: result.enabled,
      });
    };
    void run().catch(() => {
      if (!response.headersSent) send(503);
      else response.end();
    });
  };
}
