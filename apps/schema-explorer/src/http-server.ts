import { readFile } from 'node:fs/promises';
import { createServer } from 'node:http';
import { extname, resolve } from 'node:path';

import type { SchemaModel } from './model.ts';
import { buildPublicModel } from './public-model.ts';

const types: Record<string, string> = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.svg': 'image/svg+xml',
};

export function createExplorerServer(options: {
  loadModel: () => Promise<SchemaModel>;
  health: () => Promise<unknown>;
  publicDir: string;
  structuralOnly: boolean;
}) {
  return createServer((req, res) => {
    void (async () => {
      const url = new URL(req.url ?? '/', 'http://localhost');
      try {
        if (req.method !== 'GET') {
          res.writeHead(405).end();
          return;
        }
        if (url.pathname === '/api/schema') {
          const model = await options.loadModel();
          res.writeHead(200, {
            'content-type': 'application/json',
            'cache-control': 'no-store',
          });
          res.end(
            JSON.stringify(
              options.structuralOnly ? buildPublicModel(model) : model,
            ),
          );
          return;
        }
        if (url.pathname === '/healthz') {
          await options.health();
          res.writeHead(200, { 'content-type': 'text/plain' }).end('ok');
          return;
        }
        const file =
          url.pathname === '/' ? 'index.html' : url.pathname.slice(1);
        const path = resolve(options.publicDir, file);
        if (
          !path.startsWith(options.publicDir + '/') ||
          !types[extname(path)]
        ) {
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
}
