import assert from 'node:assert/strict';
import { test } from 'node:test';

import { CryptoSessionTokens } from '../src/modules/accounts/adapters/session-tokens';
import { SignInLinks } from '../src/modules/accounts/application/sign-in-links';
import type { SignInLink } from '../src/modules/accounts/domain/sign-in-link';

const NOW = new Date('2026-11-08T20:00:00Z');
const DAY = 86_400_000;

function fixture() {
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
