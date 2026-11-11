import { type IncomingMessage, request, type ServerResponse } from 'node:http';

import { isAdminTelemetryQuery } from './telemetry-query-policy';

// Internal tools run as separate loopback-only services (apps/docs-site,
// apps/schema-explorer). The API forwards their subpaths so everything shares
// the app's private exe.dev URL. A tool being down never affects the app.
export interface InternalTool {
  prefix: string;
  port: number;
  preservePrefix?: boolean;
  readerHandbook?: boolean;
  readerExplorer?: boolean;
  adminTelemetry?: boolean;
}

export const internalTools: InternalTool[] = [
  { prefix: '/docs', port: Number(process.env.DOCS_SITE_PORT ?? 8100) },
  { prefix: '/db', port: Number(process.env.SCHEMA_EXPLORER_PORT ?? 8200) },
  { prefix: '/logs', port: 9428, preservePrefix: true },
  { prefix: '/metrics', port: 8428, preservePrefix: true },
  { prefix: '/grafana', port: 3001, preservePrefix: true },
];

export function selectInternalTools(publicMode: boolean): InternalTool[] {
  if (!publicMode) return internalTools;
  return [
    { prefix: '/docs', port: 8110, readerHandbook: true },
    ...internalTools
      .filter((tool) => tool.prefix !== '/docs')
      .map((tool) =>
        tool.prefix === '/db'
          ? { ...tool, readerExplorer: true }
          : ['/logs', '/metrics'].includes(tool.prefix)
            ? { ...tool, adminTelemetry: true }
            : tool,
      ),
  ];
}

export function proxyInternalTools(tools: InternalTool[], host = '127.0.0.1') {
  return (req: IncomingMessage, res: ServerResponse, next: () => void) => {
    const url = req.url ?? '/';
    const tool = tools.find(
      (t) =>
        url === t.prefix ||
        url.startsWith(`${t.prefix}/`) ||
        url.startsWith(`${t.prefix}?`),
    );
    if (!tool) {
      next();
      return;
    }
    if (tool.adminTelemetry && !isAdminTelemetryQuery(req.method ?? '', url)) {
      res.writeHead(404, { 'cache-control': 'no-store' }).end();
      return;
    }
    const rest = url.slice(tool.prefix.length);
    const readerTool = tool.readerHandbook || tool.readerExplorer;
    const restrictedTool = readerTool || tool.adminTelemetry;
    if (
      tool.readerExplorer &&
      (req.method !== 'GET' ||
        !['', '/', '/app.js', '/style.css', '/api/schema'].includes(rest))
    ) {
      res.writeHead(404, { 'cache-control': 'no-store' }).end();
      return;
    }
    if (restrictedTool) res.setHeader('cache-control', 'no-store');
    if (tool.readerHandbook) {
      if (
        !['GET', 'HEAD'].includes(req.method ?? '') ||
        !['', '/', '/style.css'].includes(rest)
      ) {
        res.writeHead(404).end();
        return;
      }
      res.setHeader('cache-control', 'no-store');
      res.setHeader(
        'content-security-policy',
        "default-src 'none'; style-src 'self'; base-uri 'none'; frame-ancestors 'self'; form-action 'none'",
      );
    }
    // The tools use relative URLs, so they need the trailing slash.
    if (!rest.startsWith('/')) {
      res.writeHead(308, { location: `${tool.prefix}/${rest}` }).end();
      return;
    }
    const fail = () => {
      if (!res.headersSent)
        res.writeHead(502, { 'content-type': 'text/plain; charset=utf-8' });
      res.end(`${tool.prefix}/ is unavailable right now.`);
    };
    const upstream = request(
      {
        host,
        port: tool.port,
        method: req.method,
        path: tool.preservePrefix ? url : rest,
        headers: {
          ...(!restrictedTool && req.headers),
          host: `${host}:${tool.port}`,
        },
        timeout: 30000,
      },
      (response) => {
        if (
          readerTool &&
          (response.statusCode !== 200 ||
            response.headers[
              tool.readerExplorer
                ? 'x-digest-reader-explorer'
                : 'x-digest-reader-handbook'
            ] !== '1')
        ) {
          response.destroy();
          fail();
          return;
        }
        res.writeHead(response.statusCode ?? 502, {
          ...(restrictedTool
            ? {
                'content-type':
                  response.headers['content-type'] ?? 'text/plain',
              }
            : response.headers),
          'cache-control': 'no-store',
          ...(!restrictedTool && {
            vary: 'X-ExeDev-Email, ADMIN_LOCAL_TOKEN',
          }),
        });
        response.pipe(res);
      },
    );
    upstream.on('timeout', () => upstream.destroy());
    upstream.on('error', fail);
    if (restrictedTool) upstream.end();
    else req.pipe(upstream);
  };
}
