import { readFile } from 'node:fs/promises';
import { createServer } from 'node:http';
import { extname, join, resolve } from 'node:path';

import { startRuntimeMetrics } from '@digest/tool-metrics';

import { createPool, introspect } from './introspect.ts';
import { buildModel } from './model.ts';

// Live, read-only DB schema explorer. Every /api/schema request introspects the
// database, so new migrations appear without a rebuild or restart.
startRuntimeMetrics('schema', 9467);
const port = Number(process.env.SCHEMA_EXPLORER_PORT ?? 8200);
const repo = resolve(process.env.REPO_ROOT ?? process.cwd());
const metaPath = join(repo, 'docs/schema-meta.json');
const publicDir = resolve(import.meta.dirname, '../public');
const pool = createPool(
  process.env.SCHEMA_EXPLORER_DATABASE_URL ??
    'postgres://postgres@127.0.0.1:5432/news_digest',
);
const types: Record<string, string> = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.svg': 'image/svg+xml',
};

async function readMeta() {
  try {
    return JSON.parse(await readFile(metaPath, 'utf8')) as unknown;
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') return undefined;
    return { __error: String(error) };
  }
}

const server = createServer((req, res) => {
  void (async () => {
    const url = new URL(req.url ?? '/', 'http://localhost');
    try {
      if (req.method !== 'GET') {
        res.writeHead(405).end();
        return;
      }
      if (url.pathname === '/api/schema') {
        const meta = await readMeta();
        const broken =
          typeof meta === 'object' && meta !== null && '__error' in meta;
        const model = buildModel(
          await introspect(pool),
          broken ? undefined : meta,
        );
        if (broken)
          model.warnings.unshift(
            'docs/schema-meta.json could not be parsed; showing raw schema.',
          );
        res.writeHead(200, {
          'content-type': 'application/json',
          'cache-control': 'no-store',
        });
        res.end(JSON.stringify(model));
        return;
      }
      if (url.pathname === '/healthz') {
        await pool.query('SELECT 1');
        res.writeHead(200, { 'content-type': 'text/plain' }).end('ok');
        return;
      }
      const file = url.pathname === '/' ? 'index.html' : url.pathname.slice(1);
      const path = resolve(publicDir, file);
      if (!path.startsWith(publicDir + '/') || !types[extname(path)]) {
        res.writeHead(404).end('Not found');
        return;
      }
      const body = await readFile(path);
      res.writeHead(200, {
        'content-type': types[extname(path)],
        'cache-control': 'no-cache',
      });
      res.end(body);
    } catch (error) {
      const missing = (error as NodeJS.ErrnoException).code === 'ENOENT';
      console.error('schema-explorer request failed', url.pathname);
      if (!res.headersSent)
        res
          .writeHead(missing ? 404 : 500, { 'content-type': 'text/plain' })
          .end(missing ? 'Not found' : 'Schema explorer error');
    }
  })();
});

// Loopback only: the API exposes this under a subpath (see apps/api/src/internal-tools.ts).
server.listen(port, process.env.HOST ?? '127.0.0.1', () =>
  console.log(`schema-explorer listening on :${port}`),
);
for (const signal of ['SIGTERM', 'SIGINT'])
  process.on(signal, () => {
    server.close();
    void pool.end();
  });
