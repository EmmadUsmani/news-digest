import assert from 'node:assert/strict';
import { createServer, type Server } from 'node:http';
import type { AddressInfo } from 'node:net';
import { test } from 'node:test';

import assetReview from '../../../docs/native-telemetry-asset-review.json';
import { adminAccess } from '../src/admin-access';
import { proxyInternalTools, selectInternalTools } from '../src/internal-tools';
import { publicAccess } from '../src/public-access';
import { telemetryContentSecurityPolicy } from '../src/telemetry-query-policy';

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

void test('public telemetry proxy admits fresh-admin queries without forwarding credentials or upstream cookies', async () => {
  let actor: 'anonymous' | 'reader' | 'stale-admin' | 'admin' = 'anonymous';
  const seen: string[] = [];
  const tool = createServer((req, res) => {
    assert.deepEqual(Object.keys(req.headers).sort(), ['connection', 'host']);
    seen.push(req.url!);
    res.writeHead(200, {
      'content-type': 'application/json',
      'set-cookie': 'upstream=secret',
      'x-private': 'secret',
      'cache-control': 'public, max-age=3600',
    });
    res.end('{"fixture":true}');
  });
  const port = await listen(tool);
  const proxy = proxyInternalTools(
    selectInternalTools(true)
      .filter(({ prefix }) => ['/logs', '/metrics'].includes(prefix))
      .map((entry) => ({ ...entry, port })),
  );
  const guard = publicAccess(true, async () =>
    actor === 'anonymous' ? null : { freshAdmin: actor === 'admin' },
  );
  const server = createServer((req, res) => {
    void guard(req, res, () => proxy(req, res, () => assert.fail('escaped')));
  });
  const base = `http://127.0.0.1:${await listen(server)}`;
  const headers = {
    Cookie: 'session=secret',
    Authorization: 'Bearer secret',
    'X-ExeDev-Email': 'owner@example.test',
    admin_local_token: 'forged',
  };
  const assets = Object.values(assetReview.assets).flatMap(Object.keys);
  const queries = [
    '/metrics/prometheus/vmui/config.json',
    '/metrics/prometheus/vmui/custom-dashboards',
    '/metrics/prometheus/vmui/timezone',
    '/metrics/vmui/dashboards/perJobUsage.json',
    '/logs/select/buildinfo',
    '/logs/select/tenant_ids',
    ...assets,
    '/metrics/api/v1/query?query=up',
    '/metrics/api/v1/query_range?query=up&start=1&end=2&step=1',
    '/logs/select/logsql/query?query=error&limit=1',
    '/logs/select/logsql/hits?query=_time:1m&limit=1',
    '/logs/select/logsql/stats_query?query=_time:1m&limit=1',
    '/logs/select/logsql/stats_query_range?query=_time:1m&limit=1',
    '/logs/select/logsql/field_names?query=_time:1m&limit=1',
    '/logs/select/logsql/field_values?query=_time:1m&limit=1',
    '/logs/select/logsql/stream_field_names?query=_time:1m&limit=1',
    '/logs/select/logsql/stream_field_values?query=_time:1m&limit=1',
    '/logs/select/logsql/query_time_range?query=_time:1m&limit=1',
  ];
  try {
    for (const principal of [
      'anonymous',
      'reader',
      'stale-admin',
      'admin',
    ] as const) {
      actor = principal;
      for (const path of queries) {
        const before = seen.length;
        const response = await fetch(base + path, { headers });
        assert.equal(response.status, actor === 'admin' ? 200 : 404);
        assert.equal(response.headers.get('cache-control'), 'no-store');
        assert.equal(response.headers.get('set-cookie'), null);
        assert.equal(response.headers.get('x-private'), null);
        if (actor === 'admin' && assets.includes(path)) {
          assert.equal(
            response.headers.get('content-security-policy'),
            telemetryContentSecurityPolicy,
          );
          assert.equal(
            response.headers.get('x-content-type-options'),
            'nosniff',
          );
        }
        assert.equal(
          await response.text(),
          actor === 'admin' ? '{"fixture":true}' : '',
        );
        assert.equal(seen.length, before + (actor === 'admin' ? 1 : 0));
        for (const method of ['HEAD', 'DELETE']) {
          assert.equal(
            (await fetch(base + path, { method, headers })).status,
            404,
          );
        }
      }
    }
    assert.deepEqual(seen, queries);
    for (const path of [
      ...assets.map((path) => path + '?extra=1'),
      ...assets.map((path) => path + '/unreviewed'),
      '/logs/select/tenant_ids?extra=1',
      '/logs/select/tenant_ids/',
      '/logs/select/%74enant_ids',
      '/metrics/prometheus/vmui/config.json?extra=1',
      '/metrics/vmui/assets/unreviewed.js',
      '/metrics/internal/force_merge',
      '/metrics/api/v1/admin/tsdb/delete_series?match[]=up',
      '/metrics/snapshot/create',
      '/metrics/api/v1/query/',
      '/metrics/api/v1/%71uery',
      '/logs/insert/jsonline',
      '/logs/select/logsql/tail?query=*',
      '/metrics/',
      '/logs/',
    ]) {
      assert.equal((await fetch(base + path, { headers })).status, 404, path);
    }
    for (const path of [
      ...queries.slice(0, 6),
      ...assets,
      ...assets.map((path) => path + '?extra=1'),
    ]) {
      assert.equal(
        (await fetch(base + path, { method: 'POST', headers })).status,
        404,
      );
    }
    assert.deepEqual(seen, queries);
    // Defense in depth: the restricted proxy denies writes without the gate.
    const direct = createServer((req, res) => proxy(req, res, () => res.end()));
    const directBase = `http://127.0.0.1:${await listen(direct)}`;
    try {
      assert.equal(
        (
          await fetch(directBase + '/metrics/api/v1/query?query=up', {
            method: 'POST',
          })
        ).status,
        415,
      );
      assert.equal(
        (await fetch(directBase + '/metrics/internal/force_merge')).status,
        404,
      );
    } finally {
      await close(direct);
    }
    await close(tool);
    const unavailable = await fetch(base + queries[0], { headers });
    assert.equal(unavailable.status, 502);
    assert.equal(unavailable.headers.get('cache-control'), 'no-store');
    assert.doesNotMatch(await unavailable.text(), /secret|ECONNREFUSED/);
    assert.equal(
      selectInternalTools(false).some((entry) => entry.adminTelemetry),
      false,
    );
  } finally {
    await Promise.all([close(server), close(tool)]);
  }
});

void test('telemetry POST forwards bounded forms only and refuses bodies before upstream access', async () => {
  const seen: string[] = [];
  const tool = createServer((req, res) => {
    assert.equal(req.method, 'POST');
    assert.deepEqual(Object.keys(req.headers).sort(), [
      'connection',
      'content-length',
      'content-type',
      'host',
    ]);
    assert.equal(
      req.headers['content-type'],
      'application/x-www-form-urlencoded',
    );
    let body = '';
    req.on('data', (chunk: Buffer) => {
      body += chunk.toString();
    });
    req.on('end', () => {
      seen.push(body);
      res.writeHead(200, { 'set-cookie': 'private=1' }).end('fixture');
    });
  });
  const port = await listen(tool);
  const proxy = proxyInternalTools(
    selectInternalTools(true).map((entry) => ({ ...entry, port })),
  );
  let freshAdmin = false;
  const guard = publicAccess(
    true,
    async () => ({ freshAdmin }),
    async () => assert.fail('read query audited as mutation'),
  );
  const server = createServer((req, res) => {
    void guard(req, res, () => proxy(req, res, () => assert.fail('escaped')));
  });
  const base = `http://127.0.0.1:${await listen(server)}`;
  const path = '/metrics/prometheus/api/v1/query_range';
  const headers = {
    'Content-Type': 'application/x-www-form-urlencoded',
    Cookie: 'secret=1',
    Authorization: 'secret',
  };
  try {
    const body = 'query=up&start=1&end=2&step=1';
    assert.equal(
      (await fetch(base + path, { method: 'POST', headers, body })).status,
      404,
    );
    assert.deepEqual(seen, []);
    freshAdmin = true;
    const response = await fetch(base + path, {
      method: 'POST',
      headers,
      body,
    });
    assert.equal(response.status, 200);
    assert.equal(response.headers.get('cache-control'), 'no-store');
    assert.equal(response.headers.get('set-cookie'), null);
    assert.equal(await response.text(), 'fixture');
    assert.deepEqual(seen, [body]);
    for (const contentType of [
      'application/json',
      'text/plain',
      'multipart/form-data',
    ]) {
      assert.equal(
        (
          await fetch(base + path, {
            method: 'POST',
            headers: { 'Content-Type': contentType },
            body,
          })
        ).status,
        415,
      );
    }
    assert.equal(
      (
        await fetch(base + path, {
          method: 'POST',
          headers: { ...headers, 'Content-Encoding': 'gzip' },
          body,
        })
      ).status,
      415,
    );
    assert.equal(
      (
        await fetch(base + path, {
          method: 'POST',
          headers,
          body: 'q'.repeat(16385),
        })
      ).status,
      415,
    );
    // A chunked body has no declared size; enforce the limit while reading too.
    const { request } = await import('node:http');
    const chunkedStatus = await new Promise<number>((resolve, reject) => {
      const req = request(base + path, { method: 'POST', headers }, (res) => {
        res.resume();
        resolve(res.statusCode!);
      });
      req.on('error', reject);
      req.write('q'.repeat(8192));
      req.end('q'.repeat(8193));
    });
    assert.equal(chunkedStatus, 413);
    const timeoutStatus = await new Promise<number>((resolve, reject) => {
      const req = request(base + path, { method: 'POST', headers }, (res) => {
        res.resume();
        resolve(res.statusCode!);
        req.destroy();
      });
      req.on('error', reject);
      req.write('query=');
    });
    assert.equal(timeoutStatus, 408);
    assert.deepEqual(seen, [body]);
    assert.equal(
      (
        await fetch(base + '/metrics/internal/force_merge', {
          method: 'POST',
          headers,
          body,
        })
      ).status,
      404,
    );
    assert.equal(
      (
        await fetch(base + '/logs/select/logsql/tail', {
          method: 'POST',
          headers,
          body,
        })
      ).status,
      404,
    );
    assert.deepEqual(seen, [body]);
  } finally {
    await close(server);
    await close(tool);
  }
});
