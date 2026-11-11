import assert from 'node:assert/strict';
import type { IncomingMessage } from 'node:http';
import { test } from 'node:test';

import { redis } from '../src/libs/db/connections';
import { proxyClient } from '../src/modules/accounts/adapters/proxy-client';
import { RedisLoginCodeAdmission } from '../src/modules/accounts/adapters/redis-login-code-admission';

void test('login admission shares atomic private counters, expires and fails closed', async () => {
  const cache = redis();
  const key = 'isolated-admission-private-key-32-bytes';
  const limits = { email: 10, client: 50, windowMs: 600_000 };
  const first = new RedisLoginCodeAdmission(
    cache,
    key,
    async () => true,
    limits,
  );
  const second = new RedisLoginCodeAdmission(
    cache,
    key,
    async () => false,
    limits,
  );
  try {
    const results = await Promise.all(
      Array.from({ length: 40 }, (_, i) =>
        (i % 2 ? first : second).allow('reader@example.test', 'noisy-client'),
      ),
    );
    assert.equal(results.filter(Boolean).length, 10);
    assert.equal(
      await first.allow(' READER@example.test ', 'noisy-client'),
      false,
    );
    // Even many strangers naming this recipient cannot spend this client's
    // allowance; separate adapter instances still enforce each shared bucket.
    for (let i = 0; i < 20; i++) {
      for (let attempt = 0; attempt < 11; attempt++)
        await second.allow('reader@example.test', `stranger-${i}`);
    }
    assert.equal(
      await first.allow('reader@example.test', 'reader-client'),
      true,
    );
    assert.equal(await first.eligible('reader@example.test'), true);
    assert.equal(await second.eligible('reader@example.test'), false);
    const clientResults = await Promise.all(
      Array.from({ length: 75 }, (_, i) =>
        first.allow(`reader-${i}@example.test`, 'shared-client'),
      ),
    );
    assert.equal(clientResults.filter(Boolean).length, 50);
    const observed = proxyClient(['127.0.0.1']);
    const ipv6Results = await Promise.all(
      Array.from({ length: 20 }, (_, i) => {
        const visitor = `2001:db8:abcd:1234::${i + 1}`;
        const bucket = observed({
          socket: { remoteAddress: '127.0.0.1' },
          headers: { 'x-forwarded-for': visitor },
          rawHeaders: ['X-Forwarded-For', visitor],
        } as IncomingMessage);
        assert.ok(bucket);
        return (i % 2 ? first : second).allow('ipv6@example.test', bucket);
      }),
    );
    assert.equal(ipv6Results.filter(Boolean).length, 10);
    assert.equal(
      await first.allow('ipv6@example.test', '2001:db8:abcd:1235::/64'),
      true,
    );
    const keys = await cache.keys('accounts:login:*');
    assert.ok(keys.length > 0);
    assert.ok(
      keys.every((value) =>
        /^accounts:login:(email|client):[a-f0-9]{64}$/.test(value),
      ),
    );
    for (const value of keys) {
      const ttl = await cache.pttl(value);
      assert.ok(ttl > 0 && ttl <= limits.windowMs);
    }
    // Force the real Redis expiry boundary without waiting ten minutes.
    await Promise.all(keys.map((value) => cache.pexpireat(value, 1)));
    assert.equal(
      await first.allow('reader@example.test', 'shared-client'),
      true,
    );
    const unavailable = new RedisLoginCodeAdmission(
      {
        eval: async () => {
          throw new Error('private backend detail');
        },
      },
      key,
      async () => true,
    );
    assert.equal(
      await unavailable.allow('reader@example.test', 'client'),
      false,
    );
    assert.equal(await first.allow('reader@example.test', ''), false);
    assert.throws(
      () => new RedisLoginCodeAdmission(cache, 'short', async () => true),
    );
    assert.throws(
      () =>
        new RedisLoginCodeAdmission(cache, key, async () => true, {
          ...limits,
          email: 0,
        }),
    );
  } finally {
    const keys = await cache.keys('accounts:login:*');
    if (keys.length) await cache.del(...keys);
    await cache.quit();
  }
});
