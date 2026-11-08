import assert from 'node:assert/strict';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import test from 'node:test';

import { database } from '../src/libs/db/connections';
import { FileLoginCodeDelivery } from '../src/modules/accounts/adapters/file-login-code-delivery';
import { CryptoSessionTokens } from '../src/modules/accounts/adapters/session-tokens';
import { DeleteAccount } from '../src/modules/accounts/application/delete-account';
import { PostgresAccountDeletionRepository } from '../src/modules/accounts/database/account-deletion.repository';
import { PostgresRecipientCoordination } from '../src/modules/accounts/database/recipient-coordination';

void test('account deletion is session-owned, atomic, concurrent and isolated', async () => {
  assert.equal(process.env.NEWS_DIGEST_ISOLATED_TEST, '1');
  const pool = database();
  const directory = await mkdtemp(join(tmpdir(), 'account-deletion-mail-'));
  const mailbox = new FileLoginCodeDelivery(directory);
  let failCleanup = false;
  const cleanupCalls: string[] = [];
  const cleanup = {
    remove: async (recipient: string) => {
      cleanupCalls.push(recipient);
      if (failCleanup) throw new Error('injected cleanup failure');
      await mailbox.remove(recipient);
    },
  };
  const repository = new PostgresAccountDeletionRepository(cleanup);
  const other = new PostgresAccountDeletionRepository(cleanup);
  const tokens = new CryptoSessionTokens();
  const deletion = new DeleteAccount(repository, tokens);
  const email = 'deletion@example.test';
  const survivor = 'deletion-survivor@example.test';
  const token = tokens.generate();
  const second = tokens.generate();
  const survivorToken = tokens.generate();
  try {
    const ids = (
      await pool.query(
        'INSERT INTO users(email) VALUES ($1),($2) RETURNING id',
        [email, survivor],
      )
    ).rows;
    for (const [id, value] of [
      [ids[0].id, token],
      [ids[0].id, second],
      [ids[1].id, survivorToken],
    ]) {
      await pool.query(
        'INSERT INTO sessions(user_id,token_hash) VALUES ($1,$2)',
        [id, tokens.hash(value)],
      );
    }
    for (const [index, recipient] of [email, survivor].entries()) {
      await pool.query(
        "INSERT INTO login_codes(email,code_hash,created_at,expires_at) VALUES ($1,$2,now(),now()+interval '10 minutes')",
        [recipient, String(index + 1).repeat(64)],
      );
      await pool.query(
        "INSERT INTO sign_in_links(email,token_hash,created_at,expires_at) VALUES ($1,$2,now(),now()+interval '1 hour')",
        [recipient, String(index + 3).repeat(64)],
      );
      await pool.query(
        "INSERT INTO admin_audit_log(issuer_user_id,action,recipient_email,created_at) VALUES ($1,'sign_in_link_issued',$2,now())",
        [ids[1].id, recipient],
      );
    }
    const now = new Date();
    const expiry = new Date(now.getTime() + 600_000);
    await mailbox.deliver(email, '123456', expiry);
    await mailbox.deliver(survivor, '654321', expiry);
    assert.equal(await deletion.execute('malformed'), false);
    assert.equal(await deletion.execute(tokens.generate()), false);
    assert.deepEqual(cleanupCalls, []);
    failCleanup = true;
    await assert.rejects(deletion.execute(token), /injected cleanup failure/);
    assert.equal(await mailbox.latest(email, now), '123456');
    assert.equal(
      (
        await pool.query(
          'SELECT count(*)::int AS n FROM users WHERE email=$1',
          [email],
        )
      ).rows[0].n,
      1,
    );
    failCleanup = false;
    // A failed final delete must roll back removal of pending credentials/audit.
    await pool.query(
      "CREATE FUNCTION reject_account_delete() RETURNS trigger LANGUAGE plpgsql AS $$ BEGIN RAISE EXCEPTION 'injected deletion failure'; END $$",
    );
    await pool.query(
      'CREATE TRIGGER reject_account_delete BEFORE DELETE ON users FOR EACH ROW EXECUTE FUNCTION reject_account_delete()',
    );
    await assert.rejects(
      deletion.execute(token),
      (error: unknown) =>
        error instanceof Error &&
        error.cause instanceof Error &&
        /injected deletion failure/.test(error.cause.message),
    );
    assert.equal(await mailbox.latest(email, now), null);
    await pool.query('DROP TRIGGER reject_account_delete ON users');
    await pool.query('DROP FUNCTION reject_account_delete()');
    for (const table of ['users', 'login_codes', 'sign_in_links']) {
      assert.equal(
        (
          await pool.query(
            `SELECT count(*)::int AS n FROM ${table} WHERE email=$1`,
            [email],
          )
        ).rows[0].n,
        1,
      );
    }
    assert.equal(
      (
        await pool.query(
          'SELECT count(*)::int AS n FROM admin_audit_log WHERE recipient_email=$1',
          [email],
        )
      ).rows[0].n,
      1,
    );
    const results = await Promise.all([
      deletion.execute(token),
      new DeleteAccount(other, tokens).execute(second),
    ]);
    assert.deepEqual(results.sort(), [false, true]);
    assert.deepEqual(cleanupCalls, [email, email, email]);
    assert.equal(await mailbox.latest(email, now), null);
    assert.equal(await mailbox.latest(survivor, now), '654321');
    assert.equal(await deletion.execute(token), false);
    assert.equal(await deletion.execute(second), false);
    for (const table of ['users', 'login_codes', 'sign_in_links']) {
      assert.equal(
        (
          await pool.query(
            `SELECT count(*)::int AS n FROM ${table} WHERE email=$1`,
            [email],
          )
        ).rows[0].n,
        0,
      );
      assert.equal(
        (
          await pool.query(
            `SELECT count(*)::int AS n FROM ${table} WHERE email=$1`,
            [survivor],
          )
        ).rows[0].n,
        1,
      );
    }
    assert.equal(
      (
        await pool.query(
          'SELECT count(*)::int AS n FROM sessions WHERE user_id=$1',
          [ids[0].id],
        )
      ).rows[0].n,
      0,
    );
    assert.equal(
      (
        await pool.query(
          'SELECT count(*)::int AS n FROM admin_audit_log WHERE recipient_email=$1',
          [email],
        )
      ).rows[0].n,
      0,
    );
    assert.equal(
      (
        await pool.query(
          'SELECT count(*)::int AS n FROM sessions WHERE token_hash=$1',
          [tokens.hash(survivorToken)],
        )
      ).rows[0].n,
      1,
    );
  } finally {
    await pool.query('DROP TRIGGER IF EXISTS reject_account_delete ON users');
    await pool.query('DROP FUNCTION IF EXISTS reject_account_delete()');
    await pool.query('DELETE FROM users WHERE email=ANY($1::text[])', [
      [email, survivor],
    ]);
    await pool.query('DELETE FROM login_codes WHERE email=ANY($1::text[])', [
      [email, survivor],
    ]);
    await pool.query('DELETE FROM sign_in_links WHERE email=ANY($1::text[])', [
      [email, survivor],
    ]);
    await rm(directory, { recursive: true, force: true });
    await Promise.all([
      repository.onModuleDestroy(),
      other.onModuleDestroy(),
      pool.end(),
    ]);
  }
});

void test('recipient coordination serializes independent clients and releases on failure', async () => {
  assert.equal(process.env.NEWS_DIGEST_ISOLATED_TEST, '1');
  const first = new PostgresRecipientCoordination();
  const second = new PostgresRecipientCoordination();
  const email = 'coordination@example.test';
  let enter!: () => void;
  const entered = new Promise<void>((resolve) => {
    enter = resolve;
  });
  let unlock!: () => void;
  const release = new Promise<void>((resolve) => {
    unlock = resolve;
  });
  let queued: Promise<void> | undefined;
  let held: Promise<void> | undefined;
  try {
    let active = false;
    held = first.run(email, async () => {
      active = true;
      enter();
      await release;
      active = false;
    });
    await entered;
    let timedOutWork = false;
    await assert.rejects(
      second.run(email, async () => {
        timedOutWork = true;
      }),
      (error: unknown) =>
        error instanceof Error &&
        (error.cause as { code?: string } | undefined)?.code === '55P03',
    );
    assert.equal(timedOutWork, false);
    let completed = false;
    queued = second.run(email, async () => {
      assert.equal(active, false);
      completed = true;
    });
    // Another recipient can progress while this recipient remains locked.
    await second.run('other-coordination@example.test', async () => {
      assert.equal(active, true);
      assert.equal(completed, false);
    });
    unlock();
    await Promise.all([held, queued]);
    assert.equal(completed, true);
    await assert.rejects(
      first.run(email, async () => {
        throw new Error('injected work failure');
      }),
      /injected work failure/,
    );
    assert.equal(await second.run(email, async () => 'released'), 'released');
    let invoked = false;
    await assert.rejects(
      first.run(' Unnormalized@example.test', async () => {
        invoked = true;
      }),
      /normalized email/,
    );
    assert.equal(invoked, false);
  } finally {
    unlock();
    await Promise.allSettled([held, queued]);
    await Promise.all([first.onModuleDestroy(), second.onModuleDestroy()]);
  }
});
