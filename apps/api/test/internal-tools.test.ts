import assert from 'node:assert/strict';
import { createServer, type Server } from 'node:http';
import type { AddressInfo } from 'node:net';
import { test } from 'node:test';

import { adminAccess } from '../src/admin-access';
import { proxyInternalTools, selectInternalTools } from '../src/internal-tools';
import { publicAccess } from '../src/public-access';

async function listen(server: Server) {
  await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', resolve));
  return (server.address() as AddressInfo).port;
}
async function close(server: Server) {
  await new Promise<void>((resolve) => server.close(() => resolve()));
}

void test('forwards tool subpaths, redirects bare prefixes, passes others through', async () => {
  const tool = createServer((req, res) => {
    res.writeHead(200, {
      'content-type': 'text/plain',
      'x-tool': 'yes',
      'cache-control': 'public, max-age=86400',
      vary: 'Accept',
    });
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
    assert.equal(page.headers.get('cache-control'), 'no-store');
    assert.match(page.headers.get('vary') ?? '', /ADMIN_LOCAL_TOKEN/);
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
    assert.equal(await (await fetch(`${base}/api/admin/status`)).text(), 'app');

    const unavailable = await fetch(`${base}/db/`);
    assert.equal(unavailable.status, 502);
    assert.match(await unavailable.text(), /\/db\/ is unavailable/);
  } finally {
    await close(app);
    await close(tool);
  }
});

void test('public handbook isolates the reader upstream and rolls back to guarded owner docs', async () => {
  const owner = 'owner@example.test';
  const secretHeaders = {
    'x-exedev-email': owner,
    admin_local_token: 'test-secret',
    cookie: 'session=secret',
  };
  const upstreamRequests: unknown[] = [];
  let expectedUpstream = true;
  const reader = createServer((req, res) => {
    upstreamRequests.push([req.method, req.url, Object.keys(req.headers)]);
    res
      .writeHead(200, {
        'content-type': 'text/css',
        'set-cookie': 'upstream=forbidden',
        ...(expectedUpstream && { 'x-digest-reader-handbook': '1' }),
        'content-security-policy': 'default-src *',
      })
      .end('reader');
  });
  const privateDocs = createServer((_req, res) => res.end('owner handbook'));
  const readerPort = await listen(reader);
  const privatePort = await listen(privateDocs);
  const mount = (mode: boolean) => {
    const selected = selectInternalTools(mode).filter(
      ({ prefix }) => prefix === '/docs',
    );
    assert.equal(selected.length, 1);
    const proxy = proxyInternalTools([
      { ...selected[0], port: mode ? readerPort : privatePort },
    ]);
    const guard = mode
      ? publicAccess(true, async () =>
          assert.fail('reader route authenticated'),
        )
      : adminAccess({ emails: owner });
    return createServer((req, res) => {
      void guard(req, res, () =>
        proxy(req, res, () => assert.fail('docs path escaped proxy')),
      );
    });
  };
  const pub = mount(true);
  const priv = mount(false);
  const base = `http://127.0.0.1:${await listen(pub)}`;
  const rollback = `http://127.0.0.1:${await listen(priv)}`;
  try {
    const redirect = await fetch(base + '/docs', { redirect: 'manual' });
    assert.equal(redirect.status, 308);
    assert.equal(redirect.headers.get('location'), '/docs/');
    assert.equal(redirect.headers.get('cache-control'), 'no-store');

    const css = await fetch(base + '/docs/style.css', {
      headers: secretHeaders,
    });
    assert.equal(await css.text(), 'reader');
    assert.equal(css.headers.get('content-type'), 'text/css');
    assert.equal(css.headers.get('set-cookie'), null);
    assert.match(
      css.headers.get('content-security-policy') ?? '',
      /default-src 'none'/,
    );
    const head = await fetch(base + '/docs/', { method: 'HEAD' });
    assert.equal(head.status, 200);
    assert.equal(await head.text(), '');
    for (const path of [
      '/docs/api/tree',
      '/docs/api/search?q=test',
      '/docs/files/test.png',
      '/docs/?q=test',
      '/docs/%73tyle.css',
    ]) {
      for (const method of ['GET', 'HEAD', 'POST'])
        assert.equal(
          (await fetch(base + path, { method, headers: secretHeaders })).status,
          404,
          path,
        );
    }
    assert.equal(
      (await fetch(base + '/docs/', { method: 'POST' })).status,
      404,
    );
    assert.deepEqual(upstreamRequests, [
      ['GET', '/style.css', ['host', 'connection']],
      ['HEAD', '/', ['host', 'connection']],
    ]);

    expectedUpstream = false;
    const wrongUpstream = await fetch(base + '/docs/');
    assert.equal(wrongUpstream.status, 502);
    assert.doesNotMatch(await wrongUpstream.text(), /^reader$/);

    await close(reader);
    const down = await fetch(base + '/docs/');
    assert.equal(down.status, 502);
    assert.equal(down.headers.get('cache-control'), 'no-store');
    assert.equal((await fetch(rollback + '/docs/')).status, 404);
    assert.equal(
      await (
        await fetch(rollback + '/docs/api/tree', { headers: secretHeaders })
      ).text(),
      'owner handbook',
    );
  } finally {
    await Promise.all([
      close(pub),
      close(priv),
      close(reader),
      close(privateDocs),
    ]);
  }
});

void test('reader explorer refuses private responses and forwards only exact structural routes without credentials', async () => {
  let structural = false;
  const requests: string[] = [];
  const upstream = createServer((req, res) => {
    requests.push(req.url!);
    assert.equal(req.headers.cookie, undefined);
    assert.equal(req.headers.admin_local_token, undefined);
    res
      .writeHead(200, {
        ...(structural && { 'x-digest-reader-explorer': '1' }),
        'set-cookie': 'private=forbidden',
        'content-type': 'application/json',
      })
      .end(structural ? 'structural' : 'private catalog');
  });
  const port = await listen(upstream);
  const selected = selectInternalTools(true).find((t) => t.prefix === '/db')!;
  assert.equal(selected.readerExplorer, true);
  assert.equal(
    selectInternalTools(false).find((t) => t.prefix === '/db')!.readerExplorer,
    undefined,
  );
  const proxy = proxyInternalTools([{ ...selected, port }]);
  const admission = publicAccess(true, () => {
    throw new Error('anonymous explorer must not authenticate');
  });
  const app = createServer((req, res) => {
    void admission(req, res, () =>
      proxy(req, res, () => res.writeHead(404).end()),
    );
  });
  const base = 'http://127.0.0.1:' + (await listen(app));
  try {
    const denied = await fetch(base + '/db/api/schema');
    assert.equal(denied.status, 502);
    assert.doesNotMatch(await denied.text(), /private catalog/);
    structural = true;
    const accepted = await fetch(base + '/db/api/schema', {
      headers: { cookie: 'secret', admin_local_token: 'secret' },
    });
    assert.equal(await accepted.text(), 'structural');
    assert.equal(accepted.headers.get('set-cookie'), null);
    assert.equal(accepted.headers.get('cache-control'), 'no-store');
    const before = requests.length;
    for (const path of [
      '/db/api/schema?rows=1',
      '/db/api/rows',
      '/db/healthz',
      '/db/%61pp.js',
      '/db/../api/schema',
    ])
      assert.equal((await fetch(base + path)).status, 404, path);
    assert.equal(
      (await fetch(base + '/db/api/schema', { method: 'POST' })).status,
      404,
    );
    assert.equal(requests.length, before);
    for (const path of ['/db/', '/db/app.js', '/db/style.css'])
      assert.equal((await fetch(base + path)).status, 200);
  } finally {
    await close(app);
    await close(upstream);
  }
});
