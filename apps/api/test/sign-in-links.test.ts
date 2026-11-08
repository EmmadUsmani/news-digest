import assert from 'node:assert/strict';
import { test } from 'node:test';

import { CryptoSessionTokens } from '../src/modules/accounts/adapters/session-tokens';
import { SignInLinks } from '../src/modules/accounts/application/sign-in-links';
import type { RecipientCoordination } from '../src/modules/accounts/domain/recipient-coordination';
import type { SignInLink } from '../src/modules/accounts/domain/sign-in-link';

const NOW = new Date('2026-11-08T20:00:00Z');
const DAY = 86_400_000;

function fixture(
  recipients: RecipientCoordination = { run: async (_email, work) => work() },
  onWrite: () => Promise<void> = async () => {},
) {
  const tokens = new CryptoSessionTokens();
  const rows = new Map<string, SignInLink>();
  const audit: string[] = [];
  const identities: string[] = [];
  const sessions: { userId: string; email: string }[] = [];
  let admin = true;
  let failAudit = false;
  let failSession = false;
  let consumes = 0;
  const service = new SignInLinks(
    {
      async issueWithAudit(link, issuer) {
        await onWrite();
        if (failAudit) throw new Error('Audit unavailable');
        rows.set(link.tokenHash, link);
        audit.push(issuer);
      },
      async consume(hash, now) {
        consumes++;
        const row = rows.get(hash);
        if (!row || now < row.createdAt || now >= row.expiresAt) return null;
        rows.delete(hash);
        return row.email;
      },
    },
    tokens,
    {
      async findOrCreateVerified(email) {
        identities.push(email);
        return 'verified-user';
      },
    },
    {
      async authenticate(token) {
        return token === 'A'.repeat(43)
          ? { userId: 'issuer', sessionId: 's', isAdmin: admin, cookie: null }
          : null;
      },
      async issueVerifiedIdentity(userId, email) {
        if (failSession) throw new Error('Session unavailable');
        sessions.push({ userId, email });
        return { sessionId: 'new-session', cookie: 'secure-cookie' };
      },
    },
    recipients,
  );
  return {
    service,
    rows,
    audit,
    identities,
    sessions,
    setAdmin(value: boolean) {
      admin = value;
    },
    breakAudit() {
      failAudit = true;
    },
    breakSession() {
      failSession = true;
    },
    consumes: () => consumes,
  };
}

void test('only an authenticated fresh admin issues a normalized, hashed 24-hour link with audit', async () => {
  const f = fixture();
  assert.equal(await f.service.issue('bad', 'friend@example.test', NOW), null);
  assert.equal(
    await f.service.issue('B'.repeat(43), 'friend@example.test', NOW),
    null,
  );
  f.setAdmin(false);
  assert.equal(
    await f.service.issue('A'.repeat(43), 'friend@example.test', NOW),
    null,
  );
  f.setAdmin(true);
  assert.equal(await f.service.issue('A'.repeat(43), 'invalid', NOW), null);
  assert.equal(f.rows.size, 0);
  const link = await f.service.issue(
    'A'.repeat(43),
    ' Friend@Example.Test ',
    NOW,
  );
  assert.ok(link);
  assert.equal(Buffer.from(link.token, 'base64url').length, 32);
  assert.equal(link.expiresAt.getTime(), NOW.getTime() + DAY);
  assert.deepEqual(f.audit, ['issuer']);
  const row = [...f.rows.values()][0];
  assert.equal(row.email, 'friend@example.test');
  assert.ok(!JSON.stringify(row).includes(link.token));
  assert.equal(f.sessions.length, 0);
  f.breakAudit();
  await assert.rejects(
    f.service.issue('A'.repeat(43), 'other@example.test', NOW),
  );
  assert.equal(f.rows.size, 1);
});

void test('GET previews, malformed tokens, future and expired links cannot create sessions; concurrent redemption succeeds once', async () => {
  const f = fixture();
  const link = await f.service.issue(
    'A'.repeat(43),
    'friend@example.test',
    NOW,
  );
  assert.ok(link);
  for (const method of ['GET', 'HEAD', 'OPTIONS'])
    assert.equal(await f.service.redeem(method, link.token, NOW), null);
  assert.equal(await f.service.redeem('POST', 'bad', NOW), null);
  assert.equal(f.consumes(), 0);
  assert.equal(
    await f.service.redeem('POST', link.token, new Date(NOW.getTime() - 1)),
    null,
  );
  assert.equal(
    await f.service.redeem('POST', link.token, link.expiresAt),
    null,
  );
  assert.equal(f.identities.length, 0);
  const results = await Promise.all([
    f.service.redeem(
      'POST',
      link.token,
      new Date(link.expiresAt.getTime() - 1),
    ),
    f.service.redeem(
      'POST',
      link.token,
      new Date(link.expiresAt.getTime() - 1),
    ),
  ]);
  assert.equal(results.filter(Boolean).length, 1);
  assert.deepEqual(f.identities, ['friend@example.test']);
  assert.deepEqual(f.sessions, [
    { userId: 'verified-user', email: 'friend@example.test' },
  ]);
  assert.equal(await f.service.redeem('POST', link.token, NOW), null);
});

void test('a failed session exchange leaves the invitation consumed', async () => {
  const f = fixture();
  const link = await f.service.issue(
    'A'.repeat(43),
    'friend@example.test',
    NOW,
  );
  assert.ok(link);
  f.breakSession();
  await assert.rejects(f.service.redeem('POST', link.token, NOW));
  assert.equal(await f.service.redeem('POST', link.token, NOW), null);
  assert.equal(f.identities.length, 1);
});

void test('link issuance waits for the normalized recipient lock and rechecks admin authorization', async () => {
  let enter!: () => void;
  const gate = new Promise<void>((resolve) => {
    enter = resolve;
  });
  const locked: string[] = [];
  const f = fixture({
    run: async (email, work) => {
      locked.push(email);
      await gate;
      return work();
    },
  });
  const pending = f.service.issue('A'.repeat(43), ' Friend@Example.Test ', NOW);
  assert.deepEqual(locked, ['friend@example.test']);
  assert.equal(f.rows.size, 0);
  f.setAdmin(false);
  enter();
  assert.equal(await pending, null);
  assert.equal(f.rows.size, 0);
  assert.deepEqual(f.audit, []);
});

void test('link issuance holds coordination through the audit write and fails closed on lock errors', async () => {
  let held = false;
  let finish!: () => void;
  let started!: () => void;
  const writing = new Promise<void>((resolve) => {
    started = resolve;
  });
  const gate = new Promise<void>((resolve) => {
    finish = resolve;
  });
  const f = fixture(
    {
      run: async (_email, work) => {
        held = true;
        try {
          return await work();
        } finally {
          held = false;
        }
      },
    },
    async () => {
      assert.equal(held, true);
      started();
      await gate;
      assert.equal(held, true);
    },
  );
  const pending = f.service.issue('A'.repeat(43), 'friend@example.test', NOW);
  await writing;
  assert.equal(held, true);
  assert.equal(f.rows.size, 0);
  finish();
  assert.ok(await pending);
  assert.equal(held, false);
  assert.equal(f.audit.length, 1);
  const unavailable = fixture({
    run: async () => {
      throw new Error('Lock unavailable');
    },
  });
  await assert.rejects(
    unavailable.service.issue('A'.repeat(43), 'friend@example.test', NOW),
    /Lock unavailable/,
  );
  assert.equal(unavailable.rows.size, 0);
  assert.deepEqual(unavailable.audit, []);
  assert.equal(
    await unavailable.service.issue('A'.repeat(43), 'invalid', NOW),
    null,
  );
});
