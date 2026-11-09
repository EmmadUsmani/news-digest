import assert from 'node:assert/strict';
import { test } from 'node:test';

import { database } from '../src/libs/db/connections';
import { PostgresAdminWriteAdmissionRepository } from '../src/modules/accounts/database/admin-write-admission.repository';

void test('admin write admissions persist minimal actors, reject unsafe entries and fail closed', async () => {
  assert.equal(process.env.NEWS_DIGEST_ISOLATED_TEST, '1');
  const pool = database();
  const recorder = new PostgresAdminWriteAdmissionRepository();
  const now = new Date('2026-11-09T11:00:00Z');
  const userId = (
    await pool.query(
      "INSERT INTO users(email) VALUES ('admission@example.test') RETURNING id",
    )
  ).rows[0].id as string;
  const entry = {
    actor: { userId },
    action: 'POST',
    target: '/api/admin/topics',
    at: now,
  };
  try {
    await recorder.record(entry);
    await recorder.record({ ...entry, actor: { localScript: true } });
    const rows = (
      await pool.query(
        'SELECT user_id, local_script, method, target, created_at FROM admin_write_admissions ORDER BY local_script',
      )
    ).rows;
    assert.deepEqual(rows, [
      {
        user_id: userId,
        local_script: false,
        method: 'POST',
        target: entry.target,
        created_at: now,
      },
      {
        user_id: null,
        local_script: true,
        method: 'POST',
        target: entry.target,
        created_at: now,
      },
    ]);
    for (const target of [
      '/api/admin/topics?token=private',
      '/api/account/session',
      '/api/admin/%74opics',
      '/api/admin/../topics',
    ])
      await assert.rejects(recorder.record({ ...entry, target }));
    await assert.rejects(recorder.record({ ...entry, action: 'GET' }));
    await assert.rejects(
      recorder.record({ ...entry, at: new Date('invalid') }),
    );
    await assert.rejects(
      recorder.record({
        ...entry,
        actor: { userId: 'ffffffff-ffff-4fff-8fff-ffffffffffff' },
      }),
    );
    await pool.query(
      `CREATE FUNCTION reject_admission() RETURNS trigger LANGUAGE plpgsql AS $$ BEGIN RAISE EXCEPTION 'admission refused'; END $$`,
    );
    await pool.query(
      'CREATE TRIGGER reject_admission BEFORE INSERT ON admin_write_admissions FOR EACH ROW EXECUTE FUNCTION reject_admission()',
    );
    await assert.rejects(recorder.record(entry), (error: unknown) => {
      assert.ok(error instanceof Error && error.cause instanceof Error);
      assert.match(error.cause.message, /admission refused/);
      return true;
    });
    assert.equal(
      (
        await pool.query(
          'SELECT count(*)::int AS n FROM admin_write_admissions',
        )
      ).rows[0].n,
      2,
    );
    await pool.query('DELETE FROM users WHERE id=$1', [userId]);
    assert.equal(
      (
        await pool.query(
          'SELECT count(*)::int AS n FROM admin_write_admissions WHERE user_id=$1',
          [userId],
        )
      ).rows[0].n,
      0,
    );
  } finally {
    await pool.query(
      'DROP TRIGGER IF EXISTS reject_admission ON admin_write_admissions',
    );
    await pool.query('DROP FUNCTION IF EXISTS reject_admission()');
    await pool.query('DELETE FROM admin_write_admissions');
    await pool.query('DELETE FROM users WHERE id=$1', [userId]);
    await recorder.onModuleDestroy();
    await pool.end();
  }
});
