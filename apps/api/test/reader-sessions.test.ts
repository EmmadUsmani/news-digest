import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { test } from 'node:test';

import { CryptoSessionTokens } from '../src/modules/accounts/adapters/session-tokens';
import { ReaderSessions } from '../src/modules/accounts/application/sessions';
import { SignInLinks } from '../src/modules/accounts/application/sign-in-links';
import {
  type ReaderSession,
  SessionRepository,
} from '../src/modules/accounts/domain/session';
import type { SignInLink } from '../src/modules/accounts/domain/sign-in-link';

const START = new Date('2026-11-08T10:00:00Z');
const DAY = 86_400_000;
const at = (days: number) => new Date(START.getTime() + days * DAY);

class MemorySessions extends SessionRepository {
  rows = new Map<string, ReaderSession>();
  lookups = 0;
  async create(input: {
    userId: string;
    tokenHash: string;
    adminEligible: boolean;
    now: Date;
  }) {
    const row = {
      id: String(this.rows.size + 1),
      userId: input.userId,
      email: 'owner@example.test',
      tokenHash: input.tokenHash,
      adminEligible: input.adminEligible,
      createdAt: input.now,
      cookieRenewedAt: input.now,
    };
    this.rows.set(row.id, row);
    return row;
  }
  async findByTokenHash(hash: string) {
    this.lookups++;
    return (
      [...this.rows.values()].find((row) => row.tokenHash === hash) ?? null
    );
  }
  async claimCookieRenewal(id: string, cutoff: Date, now: Date) {
    const row = this.rows.get(id);
    if (!row || row.cookieRenewedAt > cutoff) return false;
    row.cookieRenewedAt = now;
    return true;
  }
  async deleteByTokenHash(hash: string) {
    for (const [id, row] of this.rows)
      if (row.tokenHash === hash) this.rows.delete(id);
  }
  async deleteByUserId(userId: string) {
    for (const [id, row] of this.rows)
      if (row.userId === userId) this.rows.delete(id);
  }
}

async function fixture(admin = true) {
  const repository = new MemorySessions();
  const allowlist = new Set(admin ? ['owner@example.test'] : []);
  const service = new ReaderSessions(
    repository,
    new CryptoSessionTokens(),
    allowlist,
  );
  const issued = await service.issueVerifiedIdentity(
    'user-1',
    'owner@example.test',
    START,
    'mailbox-code',
  );
  const token = issued.cookie.split(';')[0].split('=')[1];
  return { repository, allowlist, service, issued, token };
}

void test('session issuance uses 32 random bytes, stores only a SHA-256 hash and sets a host-only secure cookie', async () => {
  const { repository, issued, token } = await fixture();
  assert.equal(Buffer.from(token, 'base64url').length, 32);
  assert.match(token, /^[A-Za-z0-9_-]{43}$/);
  const row = [...repository.rows.values()][0];
  assert.equal(row.tokenHash, createHash('sha256').update(token).digest('hex'));
  assert.ok(!JSON.stringify([...repository.rows.values()]).includes(token));
  assert.match(issued.cookie, /^__Host-reader_session=/);
  assert.match(
    issued.cookie,
    /; Path=\/; HttpOnly; Secure; SameSite=Lax; Max-Age=34560000$/,
  );
  assert.ok(!issued.cookie.includes('Domain='));
  const tokens = new CryptoSessionTokens();
  assert.equal(
    new Set(Array.from({ length: 100 }, () => tokens.generate())).size,
    100,
  );
});

void test('malformed and unknown cookies fail closed without accepting a session ID or hash', async () => {
  const { service, repository, token } = await fixture();
  for (const input of [
    '',
    '1',
    token + '\n',
    token + ';',
    'a'.repeat(64),
    'é'.repeat(43),
  ])
    assert.equal(await service.authenticate(input, START), null);
  assert.equal(repository.lookups, 0);
  assert.equal(await service.authenticate('b'.repeat(43), START), null);
});

void test('daily cookie renewal is claimed once across simultaneous visits and preserves sign-in age', async () => {
  const { service, repository, token } = await fixture();
  assert.equal((await service.authenticate(token, at(0.999)))?.cookie, null);
  const visits = await Promise.all(
    Array.from({ length: 8 }, () => service.authenticate(token, at(1))),
  );
  assert.equal(visits.filter((visit) => visit?.cookie).length, 1);
  assert.equal((await service.authenticate(token, at(1.999)))?.cookie, null);
  assert.ok((await service.authenticate(token, at(2)))?.cookie);
  assert.equal([...repository.rows.values()][0].createdAt, START);
});

void test('reader sessions survive years while admin rights end exactly at seven days', async () => {
  const { service, token } = await fixture();
  assert.equal(
    (await service.authenticate(token, at(7 - 1 / DAY)))?.isAdmin,
    true,
  );
  assert.equal((await service.authenticate(token, at(7)))?.isAdmin, false);
  const old = await service.authenticate(token, at(1000));
  assert.equal(old?.userId, 'user-1');
  assert.equal(old.isAdmin, false);
  assert.ok(old.cookie);
  assert.equal(await service.authenticate(token, at(-1)), null);
});

void test('admin additions never promote existing sessions and removals apply immediately', async () => {
  const { service, allowlist, token } = await fixture(false);
  allowlist.add('owner@example.test');
  assert.equal((await service.authenticate(token, START))?.isAdmin, false);
  const fresh = await fixture();
  assert.equal(
    (await fresh.service.authenticate(fresh.token, START))?.isAdmin,
    true,
  );
  fresh.allowlist.clear();
  assert.equal(
    (await fresh.service.authenticate(fresh.token, START))?.isAdmin,
    false,
  );
});

void test('sign out revokes only that device; all-device sign out leaves other readers intact', async () => {
  const { service, repository, token } = await fixture();
  const second = await service.issueVerifiedIdentity(
    'user-1',
    'owner@example.test',
    START,
    'mailbox-code',
  );
  const secondToken = second.cookie.split(';')[0].split('=')[1];
  await service.issueVerifiedIdentity(
    'user-2',
    'owner@example.test',
    START,
    'mailbox-code',
  );
  const clear = await service.signOut(token);
  assert.match(clear, /HttpOnly; Secure; SameSite=Lax; Max-Age=0$/);
  assert.equal(await service.authenticate(token, START), null);
  assert.ok(await service.authenticate(secondToken, START));
  await service.signOutAllDevices('user-1');
  assert.equal(await service.authenticate(secondToken, START), null);
  assert.equal(repository.rows.size, 1);
  assert.equal([...repository.rows.values()][0].userId, 'user-2');
});

void test('admin-recipient links create reader sessions and cannot renew admin authority', async () => {
  const { service, token } = await fixture();
  let stored: SignInLink | null = null;
  const links = new SignInLinks(
    {
      async issueWithAudit(link) {
        stored = link;
      },
      async findRecipient() {
        return stored?.email ?? null;
      },
      async consume() {
        const email = stored?.email ?? null;
        stored = null;
        return email;
      },
    },
    new CryptoSessionTokens(),
    {
      async findOrCreateVerified() {
        return 'user-1';
      },
    },
    service,
    {
      async run(_email, work) {
        return work();
      },
    },
  );
  const link = await links.issue(token, 'owner@example.test', at(6));
  assert.ok(link);
  const redeemed = await links.redeem('POST', link.token, at(6));
  assert.ok(redeemed);
  const readerToken = redeemed.cookie.split(';')[0].split('=')[1];
  assert.equal(
    (await service.authenticate(readerToken, at(6)))?.isAdmin,
    false,
  );
  assert.equal(
    await links.issue(readerToken, 'owner@example.test', at(6)),
    null,
  );
  assert.equal((await service.authenticate(token, at(7)))?.isAdmin, false);
  assert.equal(
    (await service.authenticate(readerToken, at(7)))?.isAdmin,
    false,
  );
  const verified = await service.issueVerifiedIdentity(
    'user-1',
    'owner@example.test',
    at(7),
    'mailbox-code',
  );
  const verifiedToken = verified.cookie.split(';')[0].split('=')[1];
  assert.equal(
    (await service.authenticate(verifiedToken, at(7)))?.isAdmin,
    true,
  );
});
