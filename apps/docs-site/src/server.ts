import { execFile } from 'node:child_process';
import { readFile } from 'node:fs/promises';
import { createServer } from 'node:http';
import { extname, join, relative, resolve } from 'node:path';
import { promisify } from 'node:util';

import { startRuntimeMetrics } from '@digest/tool-metrics';

import { listTree, safePath } from './pages.ts';

// Serves docs/handbook as a site. Markdown is read from disk on every request
// and rendered in the browser (marked + Mermaid), so a `git pull` is enough to
// publish changes: no build, no restart.
const run = promisify(execFile);
startRuntimeMetrics('docs', 9466);
const port = Number(process.env.DOCS_SITE_PORT ?? 8100);
const repo = resolve(process.env.REPO_ROOT ?? process.cwd());
const handbook = join(repo, 'docs/handbook');
const docs = join(repo, 'docs');
const publicDir = resolve(import.meta.dirname, '../public');
const types: Record<string, string> = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.webp': 'image/webp',
  '.svg': 'image/svg+xml',
};
const IMAGES = ['.png', '.jpg', '.jpeg', '.gif', '.webp', '.svg'];

async function lastUpdated(file: string) {
  try {
    const { stdout } = await run(
      'git',
      ['log', '-1', '--format=%cs', '--', relative(repo, file)],
      { cwd: repo, timeout: 5000 },
    );
    return stdout.trim() || null;
  } catch {
    return null;
  }
}
function json(res: import('node:http').ServerResponse, body: unknown) {
  res.writeHead(200, {
    'content-type': 'application/json',
    'cache-control': 'no-store',
  });
  res.end(JSON.stringify(body));
}

const server = createServer((req, res) => {
  void (async () => {
    const url = new URL(req.url ?? '/', 'http://localhost');
    try {
      if (req.method !== 'GET') {
        res.writeHead(405).end();
        return;
      }
      if (url.pathname === '/api/tree') {
        json(res, await listTree(handbook));
        return;
      }
      if (url.pathname === '/api/page') {
        const file = safePath(handbook, url.searchParams.get('path') ?? '', [
          '.md',
        ]);
        if (!file) {
          res.writeHead(404).end('Not found');
          return;
        }
        json(res, {
          path: relative(handbook, file).split('\\').join('/'),
          markdown: await readFile(file, 'utf8'),
          updated: await lastUpdated(file),
        });
        return;
      }
      if (url.pathname === '/healthz') {
        res.writeHead(200, { 'content-type': 'text/plain' }).end('ok');
        return;
      }
      // Images referenced from docs (e.g. ../screenshots/x.png).
      if (url.pathname.startsWith('/files/')) {
        const file = safePath(
          docs,
          decodeURIComponent(url.pathname.slice('/files/'.length)),
          IMAGES,
        );
        if (!file) {
          res.writeHead(404).end('Not found');
          return;
        }
        const body = await readFile(file);
        res.writeHead(200, {
          'content-type': types[extname(file).toLowerCase()],
          'cache-control': 'no-cache',
        });
        res.end(body);
        return;
      }
      const name = url.pathname === '/' ? 'index.html' : url.pathname.slice(1);
      const file = safePath(publicDir, name, ['.html', '.js', '.css']);
      if (!file) {
        res.writeHead(404).end('Not found');
        return;
      }
      const body = await readFile(file);
      res.writeHead(200, {
        'content-type': types[extname(file)],
        'cache-control': 'no-cache',
      });
      res.end(body);
    } catch (error) {
      const missing = (error as NodeJS.ErrnoException).code === 'ENOENT';
      if (!missing) console.error('docs-site request failed', url.pathname);
      if (!res.headersSent)
        res
          .writeHead(missing ? 404 : 500, { 'content-type': 'text/plain' })
          .end(missing ? 'Not found' : 'Docs site error');
    }
  })();
});

// Loopback only: the API exposes this under a subpath (see apps/api/src/internal-tools.ts).
server.listen(port, process.env.HOST ?? '127.0.0.1', () =>
  console.log(`docs-site listening on :${port}`),
);
for (const signal of ['SIGTERM', 'SIGINT'])
  process.on(signal, () => server.close());
