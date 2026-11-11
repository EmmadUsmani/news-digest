import { execFile } from 'node:child_process';
import { readFile } from 'node:fs/promises';
import { createServer } from 'node:http';
import { join, relative, resolve } from 'node:path';
import { promisify } from 'node:util';

import { startRuntimeMetrics } from '@digest/tool-metrics';

import { listedPages, listTree, readAll } from './pages.ts';

// Serves docs/handbook as a site. Markdown is read from disk on every request
// and rendered in the browser (marked + Mermaid), so a `git pull` is enough to
// publish changes: no build, no restart.
const run = promisify(execFile);
startRuntimeMetrics('docs', 9466);
const port = Number(process.env.DOCS_SITE_PORT ?? 8100);
const repo = resolve(process.env.REPO_ROOT ?? process.cwd());
const handbook = join(repo, 'docs/handbook');
const publicDir = resolve(import.meta.dirname, '../public');
const assets = new Map([
  ['/', ['index.html', 'text/html; charset=utf-8']],
  ['/app.js', ['app.js', 'text/javascript; charset=utf-8']],
  ['/search.js', ['search.js', 'text/javascript; charset=utf-8']],
  ['/style.css', ['style.css', 'text/css; charset=utf-8']],
]);

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
      // Every page's Markdown in one response, for the search palette.
      if (url.pathname === '/api/pages') {
        json(res, await readAll(handbook));
        return;
      }
      if (url.pathname === '/api/page') {
        const path = url.searchParams.get('path');
        const page = listedPages(await listTree(handbook)).find(
          (entry) => entry.path === path,
        );
        if (!page) {
          res.writeHead(404).end('Not found');
          return;
        }
        const file = join(handbook, page.path);
        json(res, {
          path: page.path,
          markdown: await readFile(file, 'utf8'),
          updated: await lastUpdated(file),
        });
        return;
      }
      if (url.pathname === '/healthz') {
        res.writeHead(200, { 'content-type': 'text/plain' }).end('ok');
        return;
      }
      const asset = assets.get(url.pathname);
      if (!asset) {
        res.writeHead(404).end('Not found');
        return;
      }
      const [name, type] = asset;
      const body = await readFile(join(publicDir, name));
      res.writeHead(200, {
        'content-type': type,
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
