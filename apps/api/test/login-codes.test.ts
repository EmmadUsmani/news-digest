import assert from 'node:assert/strict';
import { test } from 'node:test';

import { CryptoLoginCodeSecrets } from '../src/modules/accounts/adapters/login-code-secrets';
import { LoginCodes } from '../src/modules/accounts/application/login-codes';
import type { LoginCodeChallenge } from '../src/modules/accounts/domain/login-code';

const now = new Date('2026-11-08T18:00:00Z');
function fixture(
  recipients = {
    run: async <T>(_email: string, work: () => Promise<T>) => work(),
  },
) {
  const secrets = new CryptoLoginCodeSecrets(Buffer.alloc(32, 7));
  let row:
    (LoginCodeChallenge & { attempts: number; consumed: boolean }) | null =
    null;
  const sent: { email: string; code: string; expiresAt: Date }[] = [];
  let onDelivery = async () => {};
  const admission = {
    allowed: true,
    permitted: true,
    clients: [] as string[],
    allow(_email: string, client: string) {
      this.clients.push(client);
      return Promise.resolve(this.allowed);
    },
    eligible() {
      return Promise.resolve(this.permitted);
    },
  };
  const service = new LoginCodes(
    {
      replace(challenge) {
        row = { ...challenge, attempts: 0, consumed: false };
        return Promise.resolve();
      },
      consume(email, at, matches) {
        if (
          !row ||
          row.email !== email ||
          row.consumed ||
          row.attempts >= 5 ||
          at < row.createdAt ||
          at >= row.expiresAt
        )
          return Promise.resolve(false);
        row.attempts++;
        row.consumed = matches(row.codeHash);
        return Promise.resolve(row.consumed);
      },
    },
    secrets,
    {
      async deliver(email, code, expiresAt) {
        sent.push({ email, code, expiresAt });
        await onDelivery();
      },
    },
    admission,
    recipients,
  );
  return {
    service,
    sent,
    admission,
    row: () => row,
    delivery: (work: () => Promise<void>) => {
      onDelivery = work;
    },
  };
}

void test('codes normalize identity, store only keyed hash, and redeem once', async () => {
  const f = fixture();
  assert.deepEqual(
    await f.service.request(' Reader@Example.com ', 'client', now),
    { accepted: true },
  );
  const message = f.sent[0];
  assert.equal(message.email, 'reader@example.com');
  assert.match(message.code, /^\d{6}$/);
  assert.equal(message.expiresAt.getTime() - now.getTime(), 600_000);
  assert.match(f.row()!.codeHash, /^[a-f0-9]{64}$/);
  assert.equal(Object.hasOwn(f.row()!, 'code'), false);
  assert.equal(
    await f.service.redeem('READER@example.com', message.code, 'client', now),
    message.email,
  );
  assert.equal(
    await f.service.redeem(message.email, message.code, 'client', now),
    null,
  );
});

void test('unknown and throttled requests share response and send nothing', async () => {
  const f = fixture();
  f.admission.permitted = false;
  const unknown = await f.service.request('unknown@example.com', 'a', now);
  f.admission.allowed = false;
  const throttled = await f.service.request('reader@example.com', 'b', now);
  assert.deepEqual(unknown, throttled);
  assert.equal(f.sent.length, 0);
  assert.equal(f.row(), null);
  assert.deepEqual(f.admission.clients, ['a', 'b']);
});

void test('malformed guesses count toward five attempts; fifth correct code succeeds', async () => {
  const f = fixture();
  await f.service.request('reader@example.com', 'client', now);
  for (let i = 0; i < 4; i++)
    assert.equal(
      await f.service.redeem('reader@example.com', 'invalid', 'client', now),
      null,
    );
  assert.equal(
    await f.service.redeem('reader@example.com', f.sent[0].code, 'client', now),
    'reader@example.com',
  );
  await f.service.request('reader@example.com', 'client', now);
  for (let i = 0; i < 5; i++)
    await f.service.redeem('reader@example.com', '', 'client', now);
  assert.equal(
    await f.service.redeem('reader@example.com', f.sent[1].code, 'client', now),
    null,
  );
});

void test('exact expiry, future challenge and wrong email fail; replacement invalidates old hash', async () => {
  const f = fixture();
  await f.service.request('reader@example.com', 'client', now);
  const code = f.sent[0].code;
  assert.equal(
    await f.service.redeem('other@example.com', code, 'client', now),
    null,
  );
  assert.equal(
    await f.service.redeem(
      'reader@example.com',
      code,
      'client',
      new Date(now.getTime() - 1),
    ),
    null,
  );
  assert.equal(
    await f.service.redeem(
      'reader@example.com',
      code,
      'client',
      new Date(now.getTime() + 600_000),
    ),
    null,
  );
  const old = f.row();
  await f.service.request(
    'reader@example.com',
    'client',
    new Date(now.getTime() + 600_000),
  );
  assert.notEqual(f.row(), old);
  assert.equal(f.row()!.attempts, 0);
});

void test('redemption applies client admission before accessing a challenge', async () => {
  const f = fixture();
  await f.service.request('reader@example.com', 'client', now);
  f.admission.allowed = false;
  assert.equal(
    await f.service.redeem(
      'reader@example.com',
      f.sent[0].code,
      'blocked',
      now,
    ),
    null,
  );
  assert.equal(f.row()!.attempts, 0);
});

void test('keyed digests bind email and key; comparison rejects malformed hashes', () => {
  assert.throws(() => new CryptoLoginCodeSecrets(Buffer.alloc(31)));
  const key = Buffer.alloc(32, 1);
  const crypto = new CryptoLoginCodeSecrets(key);
  const hash = crypto.hash('one@example.com', '000001');
  key.fill(0);
  assert.equal(crypto.hash('one@example.com', '000001'), hash);
  assert.notEqual(hash, crypto.hash('two@example.com', '000001'));
  assert.notEqual(
    hash,
    new CryptoLoginCodeSecrets(Buffer.alloc(32, 2)).hash(
      'one@example.com',
      '000001',
    ),
  );
  assert.equal(crypto.matches(hash, hash), true);
  assert.equal(
    crypto.matches(hash, crypto.hash('one@example.com', '000002')),
    false,
  );
  assert.equal(crypto.matches('z'.repeat(64), hash), false);
});

void test('issuance rechecks eligibility after waiting and keeps delivery inside coordination', async () => {
  let enter!: () => void;
  let release!: () => void;
  const entered = new Promise<void>((resolve) => {
    enter = resolve;
  });
  const gate = new Promise<void>((resolve) => {
    release = resolve;
  });
  let locked = false;
  const f = fixture({
    async run<T>(email: string, work: () => Promise<T>) {
      assert.equal(email, 'reader@example.com');
      enter();
      await gate;
      locked = true;
      try {
        return await work();
      } finally {
        locked = false;
      }
    },
  });
  const pending = f.service.request(' READER@example.com ', 'client', now);
  await entered;
  assert.equal(f.row(), null);
  assert.equal(f.sent.length, 0);
  f.admission.permitted = false;
  release();
  assert.deepEqual(await pending, { accepted: true });
  assert.equal(f.row(), null);
  assert.equal(f.sent.length, 0);
  f.admission.permitted = true;
  f.admission.eligible = () => {
    assert.equal(locked, true);
    return Promise.resolve(true);
  };
  let delivered!: () => void;
  let finish!: () => void;
  const deliveryStarted = new Promise<void>((resolve) => {
    delivered = resolve;
  });
  const deliveryDone = new Promise<void>((resolve) => {
    finish = resolve;
  });
  f.delivery(async () => {
    assert.equal(locked, true);
    delivered();
    await deliveryDone;
    assert.equal(locked, true);
  });
  const issuing = f.service.request('reader@example.com', 'client', now);
  await deliveryStarted;
  assert.equal(locked, true);
  finish();
  await issuing;
  assert.equal(f.sent.length, 1);
  assert.equal(locked, false);
});

void test('coordination failure prevents challenge replacement and delivery', async () => {
  const f = fixture({
    run: async () => {
      throw new Error('lock unavailable');
    },
  });
  await assert.rejects(
    f.service.request('reader@example.com', 'client', now),
    /lock unavailable/,
  );
  assert.equal(f.row(), null);
  assert.equal(f.sent.length, 0);
});
