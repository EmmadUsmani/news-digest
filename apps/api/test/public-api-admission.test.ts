import assert from 'node:assert/strict';
import test from 'node:test';

import { redis } from '../src/libs/db/connections';
import { RedisPreferenceAdmission } from '../src/modules/accounts/adapters/redis-preference-admission';
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
