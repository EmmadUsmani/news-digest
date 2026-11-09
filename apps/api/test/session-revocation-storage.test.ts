import assert from 'node:assert/strict';
import { test } from 'node:test';

import { database } from '../src/libs/db/connections';
import { PostgresSessionRepository } from '../src/modules/accounts/database/session.repository';
import { PostgresSessionRevocationRepository } from '../src/modules/accounts/database/session-revocation.repository';

void test('admin session revocation rechecks fresh authority, isolates targets and rolls back on audit failure', async () => {
  assert.equal(process.env.NEWS_DIGEST_ISOLATED_TEST, '1');
  const pool = database();
  const sessions = new PostgresSessionRepository();
  const revocations = new PostgresSessionRevocationRepository();
  const now = new Date('2026-11-09T02:00:00Z');
  const day = 86_400_000;
  const ids: string[] = [];
  try {
    for (const email of [
      'revoke-admin@example.test',
      'revoke-reader@example.test',
      'revoke-other@example.test',
    ])
      ids.push(
        (
          await pool.query(
            'INSERT INTO users(email) VALUES ($1) RETURNING id',
            [email],
          )
        ).rows[0].id,
      );
    const [admin, reader, other] = ids;
    const make = (
      userId: string,
      hash: string,
      adminEligible = false,
      created = now,
    ) =>
      sessions.create({
        userId,
        tokenHash: hash.repeat(64),
        adminEligible,
        now: created,
      });
    await make(admin, 'a', true);
    await make(reader, 'b');
    await make(reader, 'c');
    await make(other, 'd');
    await make(admin, 'e', false);
    const input = {
      issuerTokenHash: 'a'.repeat(64),
      targetUserId: reader,
      adminEmails: ['revoke-admin@example.test'],
      now,
    };
    for (const change of [
      { issuerTokenHash: '0'.repeat(64) },
      { issuerTokenHash: 'e'.repeat(64) },
      {
        issuerTokenHash: 'b'.repeat(64),
        adminEmails: ['revoke-reader@example.test'],
      },
      { adminEmails: [] },
      { now: new Date(now.getTime() - 1) },
      { now: new Date(now.getTime() + 7 * day) },
      { targetUserId: 'ffffffff-ffff-4fff-8fff-ffffffffffff' },
    ])
      assert.equal(
        await revocations.revokeWithAudit({ ...input, ...change }),
        null,
      );
    assert.equal(
      (
        await pool.query(
          'SELECT id FROM admin_audit_log WHERE issuer_user_id=$1',
          [admin],
        )
      ).rowCount,
      0,
    );
    assert.ok(await sessions.findByTokenHash('b'.repeat(64)));

    // A real database failure after DELETE must restore both device sessions.
    await pool.query(
      `CREATE FUNCTION reject_revocation_audit() RETURNS trigger LANGUAGE plpgsql AS $$ BEGIN IF NEW.action='reader_sessions_revoked' THEN RAISE EXCEPTION 'audit refused'; END IF; RETURN NEW; END $$`,
    );
    await pool.query(
      'CREATE TRIGGER reject_revocation_audit BEFORE INSERT ON admin_audit_log FOR EACH ROW EXECUTE FUNCTION reject_revocation_audit()',
    );
    await assert.rejects(revocations.revokeWithAudit(input));
    assert.ok(await sessions.findByTokenHash('b'.repeat(64)));
    assert.ok(await sessions.findByTokenHash('c'.repeat(64)));
    await pool.query('DROP TRIGGER reject_revocation_audit ON admin_audit_log');
    await pool.query('DROP FUNCTION reject_revocation_audit()');

    assert.deepEqual(await revocations.revokeWithAudit(input), { revoked: 2 });
    assert.equal(await sessions.findByTokenHash('b'.repeat(64)), null);
    assert.equal(await sessions.findByTokenHash('c'.repeat(64)), null);
    assert.ok(await sessions.findByTokenHash('a'.repeat(64)));
    assert.ok(await sessions.findByTokenHash('d'.repeat(64)));
    const audit = (
      await pool.query(
        'SELECT action,recipient_email FROM admin_audit_log WHERE issuer_user_id=$1',
        [admin],
      )
    ).rows;
    assert.deepEqual(audit, [
      {
        action: 'reader_sessions_revoked',
        recipient_email: 'revoke-reader@example.test',
      },
    ]);
    assert.deepEqual(await revocations.revokeWithAudit(input), { revoked: 0 });

    // Recheck the issuer after a concurrent logout holding the same row lock.
    const blocker = await pool.connect();
    try {
      await blocker.query('BEGIN');
      await blocker.query('DELETE FROM sessions WHERE token_hash=$1', [
        'a'.repeat(64),
      ]);
      const pending = revocations.revokeWithAudit({
        ...input,
        targetUserId: other,
      });
      let waiting = false;
      for (let attempt = 0; attempt < 100; attempt++) {
        waiting =
          (
            await pool.query(
              "SELECT 1 FROM pg_stat_activity WHERE datname=current_database() AND wait_event_type='Lock' AND query LIKE '%sessions%'",
            )
          ).rowCount! > 0;
        if (waiting) break;
        await new Promise((resolve) => setTimeout(resolve, 10));
      }
      await blocker.query('COMMIT');
      assert.equal(await pending, null);
      assert.equal(waiting, true, 'revocation waits on the concurrent logout');
      assert.ok(await sessions.findByTokenHash('d'.repeat(64)));
    } finally {
      blocker.release();
    }
    await make(admin, 'f', true);
    assert.deepEqual(
      await revocations.revokeWithAudit({
        ...input,
        issuerTokenHash: 'f'.repeat(64),
        targetUserId: admin,
        now: new Date(now.getTime() + 7 * day - 1),
      }),
      { revoked: 2 },
    );
    assert.equal(await sessions.findByTokenHash('f'.repeat(64)), null);
    assert.ok(await sessions.findByTokenHash('d'.repeat(64)));
  } finally {
    await pool.query(
      'DROP TRIGGER IF EXISTS reject_revocation_audit ON admin_audit_log',
    );
    await pool.query('DROP FUNCTION IF EXISTS reject_revocation_audit()');
    for (const id of ids)
      await pool.query('DELETE FROM users WHERE id=$1', [id]);
    await Promise.all([
      sessions.onModuleDestroy(),
      revocations.onModuleDestroy(),
      pool.end(),
    ]);
  }
});
