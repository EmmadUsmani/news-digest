import assert from 'node:assert/strict';
import { createHmac, randomBytes } from 'node:crypto';
import { mkdtemp, readdir, rm } from 'node:fs/promises';
import { createServer } from 'node:http';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import test from 'node:test';

import { redis } from '../src/libs/db/connections';
import { configuredAccessHttpProvider } from '../src/public-write/access-provider';

void test('configured public runtime preserves a verified visitor allowance across real storage restart and private rollback', async () => {
  assert.equal(process.env.NEWS_DIGEST_ISOLATED_TEST, '1');
  const directory = await mkdtemp(join(tmpdir(), 'public-runtime-'));
  const key = randomBytes(32).toString('hex');
  const env = {
    PUBLIC_MODE: '1',
    ACCOUNTS_ENABLED: '1',
    ACCOUNT_ORIGIN: 'https://reader.example',
    ACCOUNT_SECRET_KEY: key,
    ACCOUNT_MAILBOX_PATH: directory,
    ACCOUNT_TRUSTED_PROXY_PEERS: '127.0.0.1',
    SIGNUP_MODE: 'invite',
    ADMIN_EMAILS: 'isolated-owner@example.test',
  };
  const cache = redis();
  const visitors = ['203.0.113.71', '203.0.113.72'];
  const keys = visitors.map(
    (visitor) =>
      `public:api:client:${createHmac('sha256', key).update(`public-api\0${visitor}`).digest('hex')}`,
  );
  let runtime = await configuredAccessHttpProvider(env).useFactory();
  let downstream = 0;
  const server = createServer((request, response) =>
    runtime.middleware(request, response, () => {
      downstream++;
      response.writeHead(204).end();
    }),
  );
  try {
    await new Promise<void>((resolve) =>
      server.listen(0, '127.0.0.1', resolve),
    );
    const address = server.address();
    assert.ok(address && typeof address !== 'string');
    const base = `http://127.0.0.1:${address.port}`;
    const headers = (index: number, visitor = visitors[0]) => ({
      'X-Forwarded-For': [
        ...['192.0.2.1', '198.51.100.1'].slice(0, index % 3),
        visitor,
        visitor,
      ].join(', '),
    });
    // No downstream controller stands in for account transport: this response
    // comes from the configured stored account handlers themselves.
    const session = await fetch(base + '/api/account/session', {
      headers: headers(0),
    });
    assert.equal(session.status, 200);
    assert.deepEqual(await session.json(), { signedIn: false, isAdmin: false });
    assert.equal(downstream, 0);
    const admitted = await Promise.all(
      Array.from({ length: 119 }, async (_, index) => {
        const response = await fetch(base + '/api/editions/latest', {
          headers: headers(index),
        });
        await response.arrayBuffer();
        return response.status;
      }),
    );
    assert.ok(admitted.every((status) => status === 204));
    assert.equal(downstream, 119);
    const refused = async (path: string, index = 0) => {
      const response = await fetch(base + path, { headers: headers(index) });
      assert.equal(response.status, 429);
      assert.equal(await response.text(), '');
      assert.equal(response.headers.get('cache-control'), 'no-store');
      assert.equal(response.headers.get('set-cookie'), null);
      assert.equal(response.headers.get('x-content-type-options'), 'nosniff');
    };
    for (let index = 0; index < 3; index++)
      await refused('/api/account/session', index);
    assert.equal(downstream, 119);
    assert.equal(await cache.get(keys[0]), '123');
    const ttl = await cache.pttl(keys[0]);
    assert.ok(ttl > 0 && ttl <= 60_000);
    await runtime.onModuleDestroy();
    await runtime.onModuleDestroy();
    runtime = await configuredAccessHttpProvider(env).useFactory();
    await refused('/api/editions/latest');
    assert.ok((await cache.pttl(keys[0])) <= ttl);
    assert.equal(
      (
        await fetch(base + '/api/editions/latest', {
          headers: headers(2, visitors[1]),
        })
      ).status,
      204,
    );
    const code = await fetch(base + '/api/account/code', {
      method: 'POST',
      headers: {
        ...headers(1, visitors[1]),
        Origin: env.ACCOUNT_ORIGIN,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email: env.ADMIN_EMAILS }),
    });
    assert.equal(code.status, 202);
    await code.arrayBuffer();
    assert.equal((await readdir(directory)).length, 1);
    assert.equal((await fetch(base + '/healthz')).status, 204);
    assert.equal((await fetch(base + '/privacy')).status, 204);
    // No verified forwarding entry fails closed, without minting a Redis key.
    assert.equal((await fetch(base + '/api/account/session')).status, 429);
    assert.equal(await cache.get(keys[0]), '124');
    assert.equal(await cache.get(keys[1]), '2');
    await runtime.onModuleDestroy();
    runtime = await configuredAccessHttpProvider({
      ...env,
      PUBLIC_MODE: '0',
    }).useFactory();
    assert.equal((await fetch(base + '/api/editions/latest')).status, 204);
    assert.equal(await cache.get(keys[0]), '124');
    assert.equal((await fetch(base + '/api/account/session')).status, 200);
  } finally {
    server.closeAllConnections();
    await new Promise<void>((resolve, reject) =>
      server.close((error) => (error ? reject(error) : resolve())),
    );
    await runtime.onModuleDestroy();
    await cache.del(...keys);
    await cache.quit();
    await rm(directory, { recursive: true, force: true });
  }
});
