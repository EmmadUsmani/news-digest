import assert from 'node:assert/strict';
import { test } from 'node:test';

import { CryptoSessionTokens } from '../src/modules/accounts/adapters/session-tokens';
import { AdminSessionRevocation } from '../src/modules/accounts/application/admin-session-revocation';

void test('admin revocation validates inputs and sends only a token hash and current policy to storage', async () => {
  const tokens = new CryptoSessionTokens();
  const token = tokens.generate();
  const target = '11111111-1111-4111-8111-111111111111';
  const now = new Date('2026-11-09T02:00:00Z');
  const admins = new Set(['admin@example.test']);
  const calls: unknown[] = [];
  let fail = false;
  const service = new AdminSessionRevocation(
    {
      async revokeWithAudit(input) {
        calls.push(input);
        if (fail) throw new Error('Audit unavailable');
        return { revoked: 2 };
      },
    },
    tokens,
    admins,
  );
  for (const invalid of ['', token + '\n', 'a'.repeat(64)])
    assert.equal(await service.revoke(invalid, target, now), null);
  assert.equal(await service.revoke(token, 'arbitrary-user', now), null);
  assert.equal(await service.revoke(token, target, new Date(NaN)), null);
  assert.equal(calls.length, 0);
  assert.deepEqual(await service.revoke(token, target, now), { revoked: 2 });
  assert.deepEqual(calls[0], {
    issuerTokenHash: tokens.hash(token),
    targetUserId: target,
    adminEmails: [...admins],
    now,
  });
  assert.equal(JSON.stringify(calls).includes(token), false);
  admins.clear();
  await service.revoke(token, target, now);
  assert.deepEqual((calls[1] as { adminEmails: string[] }).adminEmails, []);
  fail = true;
  await assert.rejects(service.revoke(token, target, now), /Audit unavailable/);
});
