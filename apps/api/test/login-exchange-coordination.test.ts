import assert from 'node:assert/strict';
import { test } from 'node:test';

import { LoginExchange } from '../src/modules/accounts/application/login-exchange';

void test('exchange holds normalized recipient through proof, identity and session completion', async () => {
  let locked = false;
  let release!: () => void;
  const waiting = new Promise<void>((resolve) => {
    release = resolve;
  });
  const calls: string[] = [];
  const exchange = new LoginExchange(
    {
      async redeem() {
        assert.ok(locked);
        calls.push('proof');
        return 'reader@example.test';
      },
    },
    {
      async findOrCreateVerified(email) {
        assert.ok(locked);
        assert.equal(email, 'reader@example.test');
        calls.push('identity');
        return 'user';
      },
    },
    {
      async issueVerifiedIdentity() {
        assert.ok(locked);
        calls.push('session');
        return { sessionId: 'session', cookie: 'private-cookie' };
      },
    },
    {
      async run(email, work) {
        assert.equal(email, 'reader@example.test');
        await waiting;
        locked = true;
        try {
          return await work();
        } finally {
          locked = false;
        }
      },
    },
  );
  const pending = exchange.redeem(
    ' READER@Example.test ',
    '123456',
    'client',
    new Date(),
  );
  assert.deepEqual(calls, []);
  release();
  await pending;
  assert.deepEqual(calls, ['proof', 'identity', 'session']);
  assert.equal(locked, false);
});

void test('exchange rejects invalid recipients and lock failure without consuming proof', async () => {
  let proofs = 0;
  const exchange = new LoginExchange(
    {
      async redeem() {
        proofs++;
        return null;
      },
    },
    {
      async findOrCreateVerified() {
        throw new Error('unexpected identity');
      },
    },
    {
      async issueVerifiedIdentity() {
        throw new Error('unexpected session');
      },
    },
    {
      async run() {
        throw new Error('lock unavailable');
      },
    },
  );
  assert.equal(
    await exchange.redeem('invalid', '123456', 'client', new Date()),
    null,
  );
  await assert.rejects(
    exchange.redeem('reader@example.test', '123456', 'client', new Date()),
    /lock unavailable/,
  );
  assert.equal(proofs, 0);
});
