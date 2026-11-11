import assert from 'node:assert/strict';
import { test } from 'node:test';

import { database } from '../src/libs/db/connections';
import { PostgresLoginCodeRepository } from '../src/modules/accounts/database/login-code.repository';

void test('login challenges serialize redemption, cap guesses, expire and replace atomically', async () => {
  assert.equal(process.env.NEWS_DIGEST_ISOLATED_TEST, '1');
  const a = new PostgresLoginCodeRepository();
  const b = new PostgresLoginCodeRepository();
  const pool = database();
  const email = 'challenge@example.test';
  const now = new Date('2026-11-08T18:00:00Z');
  const challenge = {
    email,
    codeHash: 'a'.repeat(64),
    createdAt: now,
    expiresAt: new Date(now.getTime() + 600_000),
  };
  const correct = (hash: string) => hash === challenge.codeHash;
  try {
    assert.equal(await a.consume(email, now, correct), false);
    await a.replace(challenge);
    assert.equal(
      await a.consume(email, new Date(now.getTime() - 1), correct),
      false,
    );
    assert.equal(await a.consume(email, challenge.expiresAt, correct), false);
    const winners = await Promise.all(
      Array.from({ length: 12 }, (_, i) =>
        (i % 2 ? a : b).consume(email, now, correct),
      ),
    );
    assert.equal(winners.filter(Boolean).length, 1);
    await b.replace(challenge);
    const guesses = await Promise.all(
      Array.from({ length: 12 }, (_, i) =>
        (i % 2 ? a : b).consume(email, now, () => false),
      ),
    );
    assert.equal(guesses.some(Boolean), false);
    assert.equal(await a.consume(email, now, correct), false);
    const row = (
      await pool.query('SELECT * FROM login_codes WHERE email=$1', [email])
    ).rows[0];
    assert.equal(row.attempts, 5);
    assert.equal(row.code_hash, challenge.codeHash);
    await a.replace({ ...challenge, codeHash: 'b'.repeat(64) });
    assert.equal(await b.consume(email, now, correct), false);
    await assert.rejects(
      a.consume(email, now, () => {
        throw new Error('comparison failed');
      }),
      /comparison failed/,
    );
    assert.equal(
      (
        await pool.query('SELECT attempts FROM login_codes WHERE email=$1', [
          email,
        ])
      ).rows[0].attempts,
      1,
    );
    assert.equal(
      await b.consume(email, now, (hash) => hash === 'b'.repeat(64)),
      true,
    );
    // Separate clients cannot replace or exhaust a reader's challenge.
    await a.replace({ ...challenge, clientKey: 'reader' });
    await b.replace({
      ...challenge,
      clientKey: 'other',
      codeHash: 'b'.repeat(64),
    });
    await Promise.all(
      Array.from({ length: 12 }, () =>
        b.consume(email, now, () => false, 'other'),
      ),
    );
    assert.equal(await b.consume(email, now, correct, 'other'), false);
    assert.equal(await a.consume(email, now, correct, 'reader'), true);
    assert.equal(await b.consume(email, now, correct, 'reader'), false);
    for (const role of ['public', 'grafana_product', 'postgres_metrics']) {
      const grants = await pool.query(
        'SELECT 1 FROM information_schema.role_table_grants WHERE table_name=$1 AND lower(grantee)=$2',
        ['login_codes', role],
      );
      assert.equal(grants.rowCount, 0);
    }
  } finally {
    await pool.query('DELETE FROM login_codes WHERE email=$1', [email]);
    await Promise.all([a.onModuleDestroy(), b.onModuleDestroy(), pool.end()]);
  }
});
