import assert from 'node:assert/strict';
import { test } from 'node:test';

import { CryptoLoginCodeSecrets } from '../src/modules/accounts/adapters/login-code-secrets';
import { LoginCodes } from '../src/modules/accounts/application/login-codes';
import { LoginExchange } from '../src/modules/accounts/application/login-exchange';

function fixture() {
  const calls: string[] = [];
  let allowed = true;
  let locked = false;
  let failLock = false;
  const codes = new LoginCodes(
    {
      async replace() {},
      async consume() {
        assert.ok(locked);
        calls.push('proof');
        return true;
      },
    },
    new CryptoLoginCodeSecrets(Buffer.alloc(32, 7)),
    { async deliver() {} },
    {
      async allow() {
        assert.equal(locked, false);
        calls.push('admission');
        return allowed;
      },
      async eligible() {
        assert.ok(locked);
        calls.push('eligibility');
        return true;
      },
    },
    {
      async run(email, work) {
        assert.equal(email, 'reader@example.test');
        calls.push('lock');
        if (failLock) throw new Error('lock unavailable');
        locked = true;
        try {
          return await work();
        } finally {
          locked = false;
        }
      },
    },
  );
  const exchange = new LoginExchange(
    codes,
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
  );
  return {
    calls,
    exchange,
    refuse: () => {
      allowed = false;
    },
    failLock: () => {
      failLock = true;
    },
    locked: () => locked,
  };
}

void test('exchange admits once before locking and holds recipient through proof and session', async () => {
  const f = fixture();
  assert.ok(
    await f.exchange.redeem(
      ' READER@Example.test ',
      '123456',
      'client',
      new Date(),
    ),
  );
  assert.deepEqual(f.calls, [
    'admission',
    'lock',
    'eligibility',
    'proof',
    'identity',
    'session',
  ]);
  assert.equal(f.locked(), false);
});

void test('throttled exchange never acquires recipient lock or consumes proof', async () => {
  const f = fixture();
  f.refuse();
  assert.equal(
    await f.exchange.redeem(
      'reader@example.test',
      '123456',
      'client',
      new Date(),
    ),
    null,
  );
  assert.deepEqual(f.calls, ['admission']);
});

void test('invalid recipients and lock failures never consume proof', async () => {
  const f = fixture();
  assert.equal(
    await f.exchange.redeem('invalid', '123456', 'client', new Date()),
    null,
  );
  assert.deepEqual(f.calls, []);
  f.failLock();
  await assert.rejects(
    f.exchange.redeem('reader@example.test', '123456', 'client', new Date()),
    /lock unavailable/,
  );
  assert.deepEqual(f.calls, ['admission', 'lock']);
});
