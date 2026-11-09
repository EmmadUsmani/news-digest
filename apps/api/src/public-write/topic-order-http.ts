import type { IncomingMessage, ServerResponse } from 'node:http';

import type {
  AdminWriteAdmission,
  PublicAccessPrincipal,
} from '../public-access';
import { directLocalAdmin } from '../public-local-admin';

interface TopicOrderWriter {
  reorder(
    entry: AdminWriteAdmission,
    ids: string[],
  ): Promise<{
    outcome: 'changed' | 'unchanged' | 'catalog-changed';
  }>;
}

// Mounted by the guarded public write router before body parsers and general admission
// middleware: the writer owns admission and mutation in one transaction.
export function publicTopicOrderHttp(options: {
  enabled: boolean;
  origin: string;
  localToken?: string;
  authenticate: (
    request: IncomingMessage,
    now: Date,
  ) => Promise<PublicAccessPrincipal | null>;
  writer: TopicOrderWriter;
  now?: () => Date;
}) {
  const origin = new URL(options.origin);
  if (origin.protocol !== 'https:' || origin.origin !== options.origin)
    throw new Error('Topic order origin must be an HTTPS origin');
  return (
    request: IncomingMessage,
    response: ServerResponse,
    next: () => void,
  ) => {
    const target = request.url ?? '';
    if (!target.startsWith('/api/admin/topics/order')) return next();
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
      if (
        !options.enabled ||
        request.method !== 'PUT' ||
        target !== '/api/admin/topics/order'
      )
        return send(404);
      // Node can discard duplicate Content-Type values while normalizing
      // headers. Validate wire-level multiplicity before trusting that view.
      const count = (name: string) =>
        request.rawHeaders.filter(
          (value, index) => index % 2 === 0 && value.toLowerCase() === name,
        ).length;
      const local =
        count('origin') === 0 && directLocalAdmin(request, options.localToken);
      if (
        (!local && count('origin') !== 1) ||
        count('content-type') !== 1 ||
        (!local && request.headers.origin !== options.origin) ||
        !/^application\/json(?:\s*;\s*charset=utf-8)?$/i.test(
          request.headers['content-type'] ?? '',
        )
      )
        return send(400);
      const limit = 40000;
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
        !Object.hasOwn(body, 'ids') ||
        !Array.isArray((body as { ids?: unknown }).ids)
      )
        return send(400);
      const ids = (body as { ids: unknown[] }).ids;
      if (
        ids.length > 1000 ||
        new Set(ids).size !== ids.length ||
        ids.some(
          (id) =>
            typeof id !== 'string' ||
            !/^[0-9a-f]{8}(?:-[0-9a-f]{4}){3}-[0-9a-f]{12}$/.test(id),
        )
      )
        return send(400);
      // Recheck session freshness after the bounded upload has completed.
      const at = (options.now ?? (() => new Date()))();
      const principal = await options.authenticate(request, at);
      // Authentication can outlive the connection; do not begin a mutation
      // for a caller that has already disconnected.
      if (request.aborted || response.destroyed || response.writableEnded)
        return;
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
      const result = await options.writer.reorder(
        { actor, action: 'PUT', target, at },
        ids as string[],
      );
      if (result.outcome === 'catalog-changed') return send(409);
      send(200, { outcome: result.outcome });
    };
    void run().catch(() => {
      if (!response.headersSent) send(503);
      else response.end();
    });
  };
}
