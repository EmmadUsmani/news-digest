// Explicit installed-loopback check; public mode and the live API are unchanged.
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { createServer } from 'node:http';
import type { AddressInfo } from 'node:net';

import {
  proxyInternalTools,
  selectInternalTools,
} from '../apps/api/src/internal-tools';

async function main() {
  const server = createServer((req, res) =>
    proxyInternalTools(selectInternalTools(true))(req, res, () =>
      res.writeHead(404).end(),
    ),
  );
  await new Promise<void>((done) => server.listen(0, '127.0.0.1', done));
  const base = `http://127.0.0.1:${(server.address() as AddressInfo).port}`;
  try {
    for (const [route, file] of [
      ['/', 'index.html'],
      ['/style.css', 'style.css'],
    ]) {
      const expected = await readFile(`apps/docs-site/reader/${file}`, 'utf8');
      for (const method of ['GET', 'HEAD']) {
        const direct = await fetch(`http://127.0.0.1:8110${route}`, { method });
        assert.equal(direct.status, 200);
        assert.equal(direct.headers.get('x-digest-reader-handbook'), '1');
        assert.equal(await direct.text(), method === 'HEAD' ? '' : expected);
        const response = await fetch(`${base}/docs${route}`, {
          method,
          headers: {
            Cookie: 'private=must-not-propagate',
            Authorization: 'Bearer invalid',
          },
        });
        assert.equal(response.status, 200);
        assert.equal(response.headers.get('cache-control'), 'no-store');
        assert.equal(response.headers.get('set-cookie'), null);
        assert.ok(
          response.headers
            .get('content-security-policy')
            ?.includes("default-src 'none'"),
        );
        assert.equal(await response.text(), method === 'HEAD' ? '' : expected);
      }
    }
    const redirect = await fetch(`${base}/docs`, { redirect: 'manual' });
    assert.equal(redirect.status, 308);
    assert.equal(redirect.headers.get('location'), '/docs/');
    for (const path of [
      '/api/tree',
      '/api/search?q=backup',
      '/README.md',
      '/images/test.png',
      '/?query=1',
    ]) {
      assert.equal((await fetch(`http://127.0.0.1:8110${path}`)).status, 404);
      assert.equal((await fetch(`${base}/docs${path}`)).status, 404);
    }
    assert.equal(
      (await fetch('http://127.0.0.1:8110/', { method: 'POST' })).status,
      405,
    );
    assert.equal(
      (await fetch(`${base}/docs/`, { method: 'POST' })).status,
      404,
    );
    assert.equal(
      (await fetch('http://127.0.0.1:8000/docs/', { redirect: 'manual' }))
        .status,
      404,
    );
    console.log(
      'Installed reader handbook: exact GET/HEAD bodies, public proxy, legacy-route/write refusals and live private admission pass.',
    );
  } finally {
    server.closeAllConnections();
    await new Promise<void>((done) => server.close(() => done()));
  }
}
main().catch((error: unknown) => {
  console.error(error);
  process.exitCode = 1;
});
