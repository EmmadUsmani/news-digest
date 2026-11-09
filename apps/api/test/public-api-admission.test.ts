import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import test from 'node:test';

import { redis } from '../src/libs/db/connections';
import { RedisPreferenceAdmission } from '../src/modules/accounts/adapters/redis-preference-admission';
import { prepareAccessStack } from '../src/public-write/access-stack';
import { RedisApiAdmission } from '../src/public-write/redis-api-admission';

void test('public API admission shares an atomic private expiring client allowance', async () => {
  const cache = redis();
  const key = 'isolated-public-api-private-key-32-bytes';
  const limits = { requests: 12, windowMs: 60_000 };
  const first = new RedisApiAdmission(cache, key, limits);
  const second = new RedisApiAdmission(cache, key, limits);
  try {
    const results = await Promise.all(
      Array.from({ length: 40 }, (_, i) =>
        (i % 2 ? first : second).allow('203.0.113.7'),
      ),
    );
    assert.equal(results.filter(Boolean).length, 12);
    assert.equal(await first.allow('203.0.113.8'), true);
    const keys = await cache.keys('public:api:client:*');
    assert.equal(keys.length, 2);
    assert.ok(
      keys.every((value) => /^public:api:client:[a-f0-9]{64}$/.test(value)),
    );
    for (const value of keys) {
      const ttl = await cache.pttl(value);
      assert.ok(ttl > 0 && ttl <= limits.windowMs);
    }
    // A refused burst must not turn a fixed window into a sliding lockout.
    await Promise.all(keys.map((value) => cache.pexpire(value, 15_000)));
    assert.equal(await first.allow('203.0.113.7'), false);
    for (const value of keys) assert.ok((await cache.pttl(value)) <= 15_000);
    await Promise.all(keys.map((value) => cache.pexpireat(value, 1)));
    assert.equal(await second.allow('203.0.113.7'), true);
    let calls = 0;
    const unavailable = new RedisApiAdmission(
      {
        eval: async () => {
          calls++;
          throw new Error('private backend detail');
        },
      },
      key,
    );
    assert.equal(await unavailable.allow(''), false);
    assert.equal(await unavailable.allow(' '.repeat(10)), false);
    assert.equal(await unavailable.allow('x'.repeat(257)), false);
    assert.equal(calls, 0);
    assert.equal(await unavailable.allow('203.0.113.7'), false);
    assert.equal(calls, 1);
    assert.throws(() => new RedisApiAdmission(cache, 'short'));
    for (const invalid of [0, -1, 1.5, Infinity]) {
      assert.throws(
        () =>
          new RedisApiAdmission(cache, key, { ...limits, requests: invalid }),
      );
      assert.throws(
        () =>
          new RedisApiAdmission(cache, key, { ...limits, windowMs: invalid }),
      );
    }
  } finally {
    const keys = await cache.keys('public:api:client:*');
    if (keys.length) await cache.del(...keys);
    await cache.quit();
  }
});

void test('preference allowance is reader-scoped and independent of general API traffic', async () => {
  const cache = redis();
  const key = 'isolated-preference-private-key-32-bytes';
  const limits = { requests: 3, windowMs: 60_000 };
  const a = new RedisPreferenceAdmission(cache, key, limits);
  const b = new RedisPreferenceAdmission(cache, key, limits);
  try {
    const results = await Promise.all(
      Array.from({ length: 12 }, (_, i) =>
        (i % 2 ? a : b).allow('authenticated-reader'),
      ),
    );
    assert.equal(results.filter(Boolean).length, 3);
    assert.equal(await a.allow('other-reader'), true);
    assert.equal(
      await new RedisApiAdmission(cache, key).allow('authenticated-reader'),
      true,
    );
    const keys = await cache.keys('accounts:preferences:user:*');
    assert.equal(keys.length, 2);
    assert.ok(
      keys.every((value) =>
        /^accounts:preferences:user:[a-f0-9]{64}$/.test(value),
      ),
    );
    await Promise.all(keys.map((value) => cache.pexpire(value, 15_000)));
    assert.equal(await a.allow('authenticated-reader'), false);
    for (const value of keys)
      assert.ok(
        (await cache.pttl(value)) > 0 && (await cache.pttl(value)) <= 15_000,
      );
    await Promise.all(keys.map((value) => cache.pexpireat(value, 1)));
    assert.equal(await b.allow('authenticated-reader'), true);
    const unavailable = new RedisPreferenceAdmission(
      {
        eval: async () => {
          throw new Error('private');
        },
      },
      key,
    );
    assert.equal(await unavailable.allow('reader'), false);
    for (const value of ['', ' ', 'x'.repeat(257)])
      assert.equal(await a.allow(value), false);
    assert.throws(() => new RedisPreferenceAdmission(cache, 'short'));
    assert.throws(
      () =>
        new RedisPreferenceAdmission(cache, key, { requests: 0, windowMs: 1 }),
    );
  } finally {
    const keys = [
      ...(await cache.keys('accounts:preferences:user:*')),
      ...(await cache.keys('public:api:client:*')),
    ];
    if (keys.length) await cache.del(...keys);
    await cache.quit();
  }
});

void test('public HTTP instances share Redis allowance and refuse during connection loss', async () => {
  const caches = [redis(), redis()];
  const key = 'isolated-http-api-private-key-32-bytes';
  let identity: string | null = 'fixture-visitor-a';
  let accounts = 0;
  let authorization = 0;
  const servers = caches.map((cache) => {
    const stack = prepareAccessStack({
      publicMode: true,
      apiAdmission: {
        // Injected fixture identity: no production forwarding-header claim.
        client: () => identity,
        admission: () =>
          new RedisApiAdmission(cache, key, { requests: 6, windowMs: 60_000 }),
      },
      accounts: (_req, _res, next) => {
        accounts++;
        next();
      },
      publicAccess: () => (_req, res) => {
        authorization++;
        res.writeHead(204).end();
      },
      legacyAccess: () => {
        throw new Error('public must not construct legacy access');
      },
    });
    return createServer((req, res) => {
      void stack(req, res, () => {
        throw new Error('unexpected fallthrough');
      });
    });
  });
  const request = async (instance: number, path = '/api/topics') => {
    const address = servers[instance].address();
    assert.ok(address && typeof address !== 'string');
    return fetch(`http://127.0.0.1:${address.port}${path}`, {
      headers: {
        'x-forwarded-for': 'forged-prefix',
        'x-exedev-email': 'forged-identity',
      },
      signal: AbortSignal.timeout(5000),
    });
  };
  const refused = async (instance: number) => {
    const before = [accounts, authorization];
    const response = await request(instance);
    assert.equal(response.status, 429);
    assert.equal(response.headers.get('cache-control'), 'no-store');
    assert.equal(response.headers.get('x-content-type-options'), 'nosniff');
    assert.equal(await response.text(), '');
    assert.deepEqual([accounts, authorization], before);
  };
  try {
    await Promise.all(caches.map((cache) => cache.ping()));
    await Promise.all(
      servers.map(
        (server) =>
          new Promise<void>((resolve) =>
            server.listen(0, '127.0.0.1', resolve),
          ),
      ),
    );
    const responses = await Promise.all(
      Array.from({ length: 20 }, (_, i) => request(i % 2)),
    );
    assert.equal(
      responses.filter((response) => response.status === 204).length,
      6,
    );
    assert.equal(
      responses.filter((response) => response.status === 429).length,
      14,
    );
    assert.deepEqual([accounts, authorization], [6, 6]);
    await refused(0);
    identity = 'fixture-visitor-b';
    assert.equal((await request(1)).status, 204);
    identity = null;
    await refused(0);
    identity = 'fixture-visitor-a';
    const keys = await caches[1].keys('public:api:client:*');
    assert.equal(keys.length, 2);
    assert.ok(
      keys.every((value) => /^public:api:client:[a-f0-9]{64}$/.test(value)),
    );
    await Promise.all(keys.map((value) => caches[1].pexpireat(value, 1)));
    assert.equal((await request(1)).status, 204);
    // A closed real Redis connection must fail closed, without mocking eval.
    caches[0].disconnect();
    await refused(0);
    assert.equal((await request(0, '/healthz')).status, 204);
    await caches[0].connect();
    assert.equal((await request(0)).status, 204);
    await Promise.all(servers.map((_, i) => request(i)));
    assert.equal(
      await caches[1].get((await caches[1].keys('public:api:client:*'))[0]),
      '4',
    );
  } finally {
    await Promise.all(
      servers.map(
        (server) =>
          new Promise<void>((resolve, reject) =>
            server.close((error) => (error ? reject(error) : resolve())),
          ),
      ),
    );
    const keys = await caches[1].keys('public:api:client:*');
    if (keys.length) await caches[1].del(...keys);
    for (const cache of caches) cache.disconnect();
  }
});
