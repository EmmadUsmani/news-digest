import assert from 'node:assert/strict';
import { createServer, type Server } from 'node:http';
import type { AddressInfo } from 'node:net';
import { test } from 'node:test';

import { proxyInternalTools } from '../src/internal-tools';

async function listen(server: Server) {
  await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', resolve));
  return (server.address() as AddressInfo).port;
}
async function close(server: Server) {
  await new Promise<void>((resolve) => server.close(() => resolve()));
}

void test('forwards tool subpaths, redirects bare prefixes, passes others through', async () => {
  const tool = createServer((req, res) => {
    res.writeHead(200, { 'content-type': 'text/plain', 'x-tool': 'yes' });
    res.end(`tool saw ${req.url}`);
  });
  const toolPort = await listen(tool);
  const down = createServer();
  const downPort = await listen(down);
  await close(down); // a port with nothing listening
  const proxy = proxyInternalTools([
    { prefix: '/docs', port: toolPort },
    { prefix: '/db', port: downPort },
    { prefix: '/logs', port: toolPort, preservePrefix: true },
  ]);
  const app = createServer((req, res) =>
    proxy(req, res, () => {
      res.writeHead(200).end('app');
    }),
  );
  const base = `http://127.0.0.1:${await listen(app)}`;
  try {
    const page = await fetch(`${base}/docs/api/page?path=a.md`);
    assert.equal(page.status, 200);
    assert.equal(page.headers.get('x-tool'), 'yes');
    assert.equal(await page.text(), 'tool saw /api/page?path=a.md');

    const logs = await fetch(`${base}/logs/select/logsql/query?query=error`);
    assert.equal(
      await logs.text(),
      'tool saw /logs/select/logsql/query?query=error',
    );
    assert.equal(await (await fetch(`${base}/logstash`)).text(), 'app');

    const bare = await fetch(`${base}/docs`, { redirect: 'manual' });
    assert.equal(bare.status, 308);
    assert.equal(bare.headers.get('location'), '/docs/');

    assert.equal(await (await fetch(`${base}/documents`)).text(), 'app');
    assert.equal(await (await fetch(`${base}/api/status`)).text(), 'app');

    const unavailable = await fetch(`${base}/db/`);
    assert.equal(unavailable.status, 502);
    assert.match(await unavailable.text(), /\/db\/ is unavailable/);
  } finally {
    await close(app);
    await close(tool);
  }
});
