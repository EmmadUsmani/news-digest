import assert from 'node:assert/strict';
import test from 'node:test';

import { redis } from '../src/libs/db/connections';
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
