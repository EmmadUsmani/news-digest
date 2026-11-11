import { readFile } from 'node:fs/promises';
import { createServer } from 'node:http';

// Public-mode upstream for /docs/. It has no operational handbook or proxy fallback.
const files = new Map(
  await Promise.all(
    [
      ['/', 'index.html', 'text/html; charset=utf-8'],
      ['/style.css', 'style.css', 'text/css; charset=utf-8'],
    ].map(
      async ([route, file, type]) =>
        [
          route,
          {
            type,
            body: await readFile(new URL(`../reader/${file}`, import.meta.url)),
          },
        ] as const,
    ),
  ),
);

const server = createServer((req, res) => {
  if (req.method !== 'GET' && req.method !== 'HEAD') {
    res.writeHead(405, { allow: 'GET, HEAD' }).end();
    return;
  }
  const file = files.get(req.url ?? '');
  if (!file) {
    res.writeHead(404).end();
    return;
  }
  res.writeHead(200, {
    'content-type': file.type,
    'content-length': file.body.length,
    'cache-control': 'no-cache',
    'x-digest-reader-handbook': '1',
  });
  res.end(req.method === 'HEAD' ? undefined : file.body);
});

server.listen(Number(process.env.READER_DOCS_PORT ?? 8110), '127.0.0.1');
