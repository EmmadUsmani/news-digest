import assert from 'node:assert/strict';
import { test } from 'node:test';

import { database } from '../src/libs/db/connections';
import { PostgresSignInLinkRepository } from '../src/modules/accounts/database/sign-in-link.repository';

void test('friend links atomically audit issuance and consume once across connections', async () => {
  assert.equal(process.env.NEWS_DIGEST_ISOLATED_TEST, '1');
  const pool = database();
  const a = new PostgresSignInLinkRepository();
  const b = new PostgresSignInLinkRepository();
  const email = 'link-recipient@example.test';
  const now = new Date('2026-11-08T19:00:00Z');
  const link = {
    email,
    tokenHash: '1'.repeat(64),
    createdAt: now,
    expiresAt: new Date(now.getTime() + 86_400_000),
  };
  const databaseError = (code: string) => (error: unknown) =>
    (error as { cause?: { code?: string } }).cause?.code === code;
  let issuer: string | undefined;
  try {
    issuer = (
      await pool.query(
        "INSERT INTO users(email) VALUES ('link-admin@example.test') RETURNING id",
      )
    ).rows[0].id;
    await assert.rejects(
      a.issueWithAudit(link, 'ffffffff-ffff-4fff-8fff-ffffffffffff'),
      databaseError('23503'),
    );
    assert.equal(await a.consume(link.tokenHash, now), null);
    await a.issueWithAudit(link, issuer!);
    const audits = await pool.query(
      'SELECT * FROM admin_audit_log WHERE issuer_user_id=$1',
      [issuer],
    );
    assert.equal(audits.rowCount, 1);
    assert.equal(audits.rows[0].recipient_email, email);
    assert.equal(audits.rows[0].action, 'sign_in_link_issued');
    assert.equal(JSON.stringify(audits.rows).includes(link.tokenHash), false);
    await assert.rejects(
      a.issueWithAudit(link, issuer!),
      databaseError('23505'),
    );
    assert.equal(
      (
        await pool.query(
          'SELECT id FROM admin_audit_log WHERE issuer_user_id=$1',
          [issuer],
        )
      ).rowCount,
      1,
    );
    assert.equal(await a.consume('0'.repeat(64), now), null);
    assert.equal(
      await a.consume(link.tokenHash, new Date(now.getTime() - 1)),
      null,
    );
    assert.equal(await a.consume(link.tokenHash, link.expiresAt), null);
    const winners = await Promise.all(
      Array.from({ length: 16 }, (_, i) =>
        (i % 2 ? a : b).consume(link.tokenHash, now),
      ),
    );
    assert.deepEqual(winners.filter(Boolean), [email]);
    assert.equal(await b.consume(link.tokenHash, now), null);
    for (const invalid of [
      { tokenHash: 'raw-secret' },
      { tokenHash: '2'.repeat(64), email: 'Upper@example.test' },
      { tokenHash: '3'.repeat(64), expiresAt: now },
      {
        tokenHash: '4'.repeat(64),
        expiresAt: new Date(link.expiresAt.getTime() + 1),
      },
    ])
      await assert.rejects(
        a.issueWithAudit({ ...link, ...invalid }, issuer!),
        databaseError('23514'),
      );
    for (const table of ['sign_in_links', 'admin_audit_log']) {
      for (const role of ['public', 'grafana_product', 'postgres_metrics']) {
        const grants = await pool.query(
          'SELECT 1 FROM information_schema.role_table_grants WHERE table_name=$1 AND lower(grantee)=$2',
          [table, role],
        );
        assert.equal(grants.rowCount, 0);
      }
    }
  } finally {
    await pool.query('DELETE FROM sign_in_links WHERE email=$1', [email]);
    if (issuer) await pool.query('DELETE FROM users WHERE id=$1', [issuer]);
    await Promise.all([a.onModuleDestroy(), b.onModuleDestroy(), pool.end()]);
  }
});
