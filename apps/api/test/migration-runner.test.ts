import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { test } from 'node:test';

import { Pool } from 'pg';

import { database } from '../src/libs/db/connections';
import { applyMigrations } from '../src/libs/db/migration-runner';

void test('migration runner preserves history, orders generated SQL, serializes reruns and rolls back failures', async () => {
  assert.equal(process.env.NEWS_DIGEST_ISOLATED_TEST, '1');
  const admin = database();
  const name = `migration_${randomUUID().replaceAll('-', '')}`;
  const url = new URL(process.env.DATABASE_URL!);
  url.pathname = `/${name}`;
  const pool = new Pool({ connectionString: url.toString() });
  const directory = await mkdtemp(join(tmpdir(), 'digest-migrations-'));
  const historical = join(directory, 'history');
  const generated = join(directory, 'generated');
  try {
    await admin.query(`CREATE DATABASE "${name}"`);
    await mkdir(historical);
    await mkdir(join(generated, 'meta'), { recursive: true });
    await writeFile(
      join(historical, '001.sql'),
      "CREATE TABLE evidence (id integer PRIMARY KEY, value text); INSERT INTO evidence VALUES (1, 'seed');",
    );
    const journal = async (tags: string[]) =>
      writeFile(
        join(generated, 'meta/_journal.json'),
        JSON.stringify({ entries: tags.map((tag) => ({ tag })) }),
      );
    await journal(['0000_baseline', '0001_change']);
    await writeFile(join(generated, '0000_baseline.sql'), 'SELECT 1;');
    await writeFile(
      join(generated, '0001_change.sql'),
      'ALTER TABLE evidence ADD COLUMN added integer;\n--> statement-breakpoint\nUPDATE evidence SET added=7;',
    );
    // Bound a staged rollout even when later phase SQL is already present.
    await applyMigrations(pool, historical, generated, '0000_baseline');
    assert.deepEqual((await pool.query('SELECT * FROM evidence')).rows, [
      { id: 1, value: 'seed' },
    ]);
    assert.equal(
      (await pool.query('SELECT count(*)::int AS count FROM schema_migrations'))
        .rows[0].count,
      2,
    );
    await assert.rejects(
      applyMigrations(pool, historical, generated, ''),
      /Unknown migration stopping point/,
    );
    await assert.rejects(
      applyMigrations(pool, historical, generated, '9999_typo'),
      /Unknown migration stopping point/,
    );
    await Promise.all([
      applyMigrations(pool, historical, generated),
      applyMigrations(pool, historical, generated),
    ]);
    assert.deepEqual((await pool.query('SELECT * FROM evidence')).rows, [
      { id: 1, value: 'seed', added: 7 },
    ]);
    const ledger = (
      await pool.query(
        'SELECT name, applied_at FROM schema_migrations ORDER BY name',
      )
    ).rows;
    assert.equal(ledger.length, 3);
    assert.deepEqual(
      ledger.map((row) => row.name),
      ['001.sql', 'drizzle/0000_baseline.sql', 'drizzle/0001_change.sql'],
    );
    await applyMigrations(pool, historical, generated);
    assert.deepEqual(
      (
        await pool.query(
          'SELECT name, applied_at FROM schema_migrations ORDER BY name',
        )
      ).rows,
      ledger,
    );

    // A later failure must undo earlier DDL, data and ledger writes in this run.
    await writeFile(
      join(historical, '002.sql'),
      "UPDATE evidence SET value='changed';",
    );
    await journal([
      '0000_baseline',
      '0001_change',
      '0002_valid',
      '0003_invalid',
    ]);
    await writeFile(
      join(generated, '0002_valid.sql'),
      'ALTER TABLE evidence ADD COLUMN rolled_back integer;',
    );
    await writeFile(
      join(generated, '0003_invalid.sql'),
      'SELECT * FROM missing_migration_table;',
    );
    await assert.rejects(
      applyMigrations(pool, historical, generated),
      /missing_migration_table/,
    );
    assert.deepEqual((await pool.query('SELECT * FROM evidence')).rows, [
      { id: 1, value: 'seed', added: 7 },
    ]);
    assert.deepEqual(
      (
        await pool.query(
          'SELECT name, applied_at FROM schema_migrations ORDER BY name',
        )
      ).rows,
      ledger,
    );
    // Recover on the same pool after rollback; the failed migrations remain pending.
    await writeFile(
      join(generated, '0003_invalid.sql'),
      'UPDATE evidence SET added=8;',
    );
    await applyMigrations(pool, historical, generated);
    assert.equal(
      (await pool.query('SELECT added FROM evidence')).rows[0].added,
      8,
    );
  } finally {
    await pool.end();
    await admin.query(`DROP DATABASE IF EXISTS "${name}"`);
    await admin.end();
    await rm(directory, { recursive: true, force: true });
  }
});
