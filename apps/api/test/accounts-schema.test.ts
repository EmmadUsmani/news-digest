import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { test } from 'node:test';

import { database } from '../src/libs/db/connections';

void test('accounts enforce normalized identities, hash-only sessions and cascading deletion', async () => {
  assert.equal(process.env.NEWS_DIGEST_ISOLATED_TEST, '1');
  const pool = database();
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const user = (
      await client.query(
        "INSERT INTO users(email) VALUES ('reader@example.test') RETURNING id",
      )
    ).rows[0].id;
    const reject = async (
      query: string,
      values: unknown[],
      pattern: RegExp,
    ) => {
      await client.query('SAVEPOINT invalid');
      await assert.rejects(client.query(query, values), pattern);
      await client.query('ROLLBACK TO SAVEPOINT invalid');
    };
    for (const email of [
      'Reader@example.test',
      ' reader@example.test ',
      '',
      'x'.repeat(255),
    ]) {
      await reject(
        'INSERT INTO users(email) VALUES ($1)',
        [email],
        /check constraint/,
      );
    }
    await reject(
      'INSERT INTO users(email) VALUES ($1)',
      ['reader@example.test'],
      /unique constraint/,
    );
    for (const token of [
      'raw-session-secret',
      'A'.repeat(64),
      'f'.repeat(63),
    ]) {
      await reject(
        'INSERT INTO sessions(user_id,token_hash) VALUES ($1,$2)',
        [user, token],
        /check constraint/,
      );
    }
    await reject(
      'INSERT INTO sessions(user_id,token_hash) VALUES ($1,$2)',
      ['ffffffff-ffff-4fff-8fff-ffffffffffff', 'a'.repeat(64)],
      /foreign key/,
    );
    const session = (
      await client.query(
        'INSERT INTO sessions(user_id,token_hash,created_at,cookie_renewed_at) VALUES ($1,$2,$3,$3) RETURNING *',
        [user, 'a'.repeat(64), '2026-11-01T01:00:00+01:00'],
      )
    ).rows[0];
    assert.equal(session.admin_eligible, false);
    assert.equal(session.created_at.toISOString(), '2026-11-01T00:00:00.000Z');
    await reject(
      'INSERT INTO sessions(user_id,token_hash) VALUES ($1,$2)',
      [user, 'a'.repeat(64)],
      /unique constraint/,
    );
    await reject(
      "UPDATE sessions SET cookie_renewed_at = created_at - interval '1 second' WHERE id=$1",
      [session.id],
      /check constraint/,
    );
    // Cookie renewal preserves the original sign-in time used for admin freshness.
    await client.query(
      "UPDATE sessions SET cookie_renewed_at = created_at + interval '400 days' WHERE id=$1",
      [session.id],
    );
    assert.equal(
      (
        await client.query('SELECT created_at FROM sessions WHERE id=$1', [
          session.id,
        ])
      ).rows[0].created_at.toISOString(),
      '2026-11-01T00:00:00.000Z',
    );
    await client.query('DELETE FROM users WHERE id=$1', [user]);
    assert.equal(
      (await client.query('SELECT id FROM sessions WHERE user_id=$1', [user]))
        .rowCount,
      0,
    );
  } finally {
    await client.query('ROLLBACK');
    client.release();
    await pool.end();
  }
});

void test('account migration denies operational readers even with inherited default table grants', async () => {
  assert.equal(process.env.NEWS_DIGEST_ISOLATED_TEST, '1');
  const pool = database();
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    await client.query('DROP TABLE sessions, users');
    await client.query(
      'CREATE ROLE grafana_product; CREATE ROLE postgres_metrics',
    );
    await client.query(
      'ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT ON TABLES TO grafana_product, postgres_metrics, PUBLIC',
    );
    await client.query(
      await readFile('drizzle/0013_reader_sessions.sql', 'utf8'),
    );
    for (const role of ['grafana_product', 'postgres_metrics']) {
      await client.query(`SET LOCAL ROLE ${role}`);
      for (const table of ['users', 'sessions']) {
        await client.query('SAVEPOINT denied');
        await assert.rejects(
          client.query(`SELECT * FROM ${table}`),
          /permission denied/,
        );
        await client.query('ROLLBACK TO SAVEPOINT denied');
      }
      await client.query('RESET ROLE');
    }
  } finally {
    await client.query('ROLLBACK');
    client.release();
    await pool.end();
  }
});
