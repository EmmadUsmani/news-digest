import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { test } from 'node:test';

import { database } from '../src/libs/db/connections';
import { prepareStoredPublicAccess } from '../src/modules/accounts/adapters/public-access-storage';
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

void test('stored public policy admits HTTP writes only after persistence and owns recorder shutdown', async () => {
  assert.equal(process.env.NEWS_DIGEST_ISOLATED_TEST, '1');
  const disabled = prepareStoredPublicAccess(false, () => {
    throw new Error('disabled must not open accounts');
  });
  await disabled.close();
  await disabled.close();
  assert.throws(() => prepareStoredPublicAccess(true, () => null));
  const pool = database();
  const userId = (
    await pool.query(
      "INSERT INTO users(email) VALUES ('policy-admission@example.test') RETURNING id",
    )
  ).rows[0].id as string;
  const at = new Date('2026-11-09T11:20:00Z');
  let authorized = true;
  let pause: Promise<void> | undefined;
  let entered: (() => void) | undefined;
  let reached = 0;
  const policy = prepareStoredPublicAccess(
    true,
    () => ({
      authorization: async () => {
        entered?.();
        await pause;
        return authorized ? { freshAdmin: true, auditActor: { userId } } : null;
      },
    }),
    () => at,
  );
  const server = createServer((req, res) => {
    void policy.middleware(req, res, () => {
      reached++;
      res.writeHead(204).end();
    });
  });
  await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', resolve));
  const address = server.address();
  assert.ok(address && typeof address !== 'string');
  const base = `http://127.0.0.1:${address.port}`;
  const write = () =>
    fetch(`${base}/api/admin/topics?private=excluded`, {
      method: 'POST',
      body: 'private request body',
    });
  try {
    assert.equal((await write()).status, 204);
    assert.equal(reached, 1);
    assert.deepEqual(
      (
        await pool.query(
          'SELECT method, target, created_at FROM admin_write_admissions WHERE user_id=$1',
          [userId],
        )
      ).rows,
      [{ method: 'POST', target: '/api/admin/topics', created_at: at }],
    );
    authorized = false;
    assert.equal((await write()).status, 404);
    authorized = true;
    // A removed identity makes the durable insert fail its foreign key.
    await pool.query('DELETE FROM users WHERE id=$1', [userId]);
    const refused = await write();
    assert.equal(refused.status, 503);
    assert.equal(await refused.text(), '');
    assert.equal(refused.headers.get('cache-control'), 'no-store');
    assert.equal(reached, 1);
    let resume!: () => void;
    pause = new Promise<void>((resolve) => {
      resume = resolve;
    });
    const waiting = new Promise<void>((resolve) => {
      entered = resolve;
    });
    const pending = write();
    await waiting;
    await policy.close();
    await policy.close();
    resume();
    assert.equal((await pending).status, 503);
    assert.equal((await write()).status, 503);
    assert.equal(reached, 1);
  } finally {
    server.closeAllConnections();
    await new Promise<void>((resolve) => server.close(() => resolve()));
    await policy.close();
    await pool.query('DELETE FROM users WHERE id=$1', [userId]);
    await pool.end();
  }
});
