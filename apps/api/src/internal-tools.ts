import { type IncomingMessage, request, type ServerResponse } from 'node:http';

// Internal tools run as separate loopback-only services (apps/docs-site,
// apps/schema-explorer). The API forwards their subpaths so everything shares
// the app's private exe.dev URL. A tool being down never affects the app.
export interface InternalTool {
  prefix: string;
  port: number;
  preservePrefix?: boolean;
}

export const internalTools: InternalTool[] = [
  { prefix: '/docs', port: Number(process.env.DOCS_SITE_PORT ?? 8100) },
  { prefix: '/db', port: Number(process.env.SCHEMA_EXPLORER_PORT ?? 8200) },
  { prefix: '/logs', port: 9428, preservePrefix: true },
  { prefix: '/metrics', port: 8428, preservePrefix: true },
  { prefix: '/grafana', port: 3001, preservePrefix: true },
];

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
    const rest = url.slice(tool.prefix.length);
    // The tools use relative URLs, so they need the trailing slash.
    if (!rest.startsWith('/')) {
      res.writeHead(308, { location: `${tool.prefix}/${rest}` }).end();
      return;
    }
    const upstream = request(
      {
        host,
        port: tool.port,
        method: req.method,
        path: tool.preservePrefix ? url : rest,
        headers: { ...req.headers, host: `${host}:${tool.port}` },
        timeout: 30000,
      },
      (response) => {
        res.writeHead(response.statusCode ?? 502, response.headers);
        response.pipe(res);
      },
    );
    const fail = () => {
      if (!res.headersSent)
        res.writeHead(502, { 'content-type': 'text/plain; charset=utf-8' });
      res.end(`${tool.prefix}/ is unavailable right now.`);
    };
    upstream.on('timeout', () => upstream.destroy());
    upstream.on('error', fail);
    req.pipe(upstream);
  };
}
