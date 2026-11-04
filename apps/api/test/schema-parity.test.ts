import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { randomUUID } from 'node:crypto';
import {
  cp,
  mkdtemp,
  readdir,
  readFile,
  rm,
  writeFile,
} from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join, relative, resolve } from 'node:path';
import { test } from 'node:test';

import { generateDrizzleJson, generateMigration } from 'drizzle-kit/api';
import { Pool } from 'pg';

import { database } from '../src/libs/db/connections';
import * as schema from '../src/libs/db/schema';

// Compare PostgreSQL's own normalized definitions, including checks and index
// operator classes that drizzle-kit's push planner does not fully compare.
const catalog = `
SELECT 'column' AS kind, c.table_name AS name, c.column_name AS member,
 jsonb_build_array(c.data_type,c.udt_name,c.is_nullable,c.column_default,c.ordinal_position) AS definition
FROM information_schema.columns c WHERE c.table_schema='public'
UNION ALL
SELECT 'constraint', t.relname, c.conname, to_jsonb(pg_get_constraintdef(c.oid))
FROM pg_constraint c JOIN pg_class t ON t.oid=c.conrelid
JOIN pg_namespace n ON n.oid=t.relnamespace WHERE n.nspname='public'
UNION ALL
SELECT 'index', tablename, indexname, to_jsonb(indexdef)
FROM pg_indexes WHERE schemaname='public'
ORDER BY kind,name,member`;

void test('complete Drizzle schema matches every migrated PostgreSQL column, constraint and index', async () => {
  assert.equal(process.env.NEWS_DIGEST_ISOLATED_TEST, '1');
  const pool = database();
  const mirrorName = `schema_parity_${randomUUID().replaceAll('-', '')}`;
  const mirrorUrl = new URL(process.env.DATABASE_URL!);
  mirrorUrl.pathname = `/${mirrorName}`;
  const mirror = new Pool({ connectionString: mirrorUrl.toString() });
  let created = false;
  try {
    // This connection is always the Testcontainers DB, never production.
    await pool.query(`CREATE DATABASE "${mirrorName}"`);
    created = true;
    const ddl = await generateMigration(
      generateDrizzleJson({}),
      generateDrizzleJson(schema),
    );
    for (const statement of ddl) await mirror.query(statement);
    const actual = (await mirror.query(catalog)).rows;
    const expected = (await pool.query(catalog)).rows;
    assert.equal(actual.length, expected.length);
    for (let index = 0; index < expected.length; index++) {
      assert.deepEqual(actual[index], expected[index]);
    }
  } finally {
    await mirror.end();
    if (created) await pool.query(`DROP DATABASE "${mirrorName}"`);
    await pool.end();
  }
});

void test('drizzle-kit CLI proposes zero changes to the migrated isolated database', async () => {
  assert.equal(process.env.NEWS_DIGEST_ISOLATED_TEST, '1');
  const directory = await mkdtemp(join(tmpdir(), 'digest-drizzle-'));
  try {
    const config = join(directory, 'drizzle.config.js');
    const readOnlyUrl = new URL(process.env.DATABASE_URL!);
    readOnlyUrl.searchParams.set(
      'options',
      '-c default_transaction_read_only=on',
    );
    await writeFile(
      config,
      `module.exports = ${JSON.stringify({
        dialect: 'postgresql',
        schema: resolve('apps/api/src/libs/db/schema.ts'),
        dbCredentials: { url: readOnlyUrl.toString() },
        strict: true,
        verbose: true,
      })};`,
    );
    const result = spawnSync(
      'pnpm',
      [
        '--filter',
        '@digest/api',
        'exec',
        'drizzle-kit',
        'push',
        '--config',
        config,
      ],
      {
        encoding: 'utf8',
        timeout: 60000,
        env: {
          ...process.env,
          PGOPTIONS: '-c default_transaction_read_only=on',
        },
        input: '',
      },
    );
    assert.ifError(result.error);
    const output = result.stdout + result.stderr;
    assert.equal(result.status, 0, output);
    assert.match(output, /No changes detected/, output);
    assert.doesNotMatch(output, /ALTER TABLE|DROP TABLE|CREATE TABLE/);
  } finally {
    await rm(directory, { recursive: true, force: true });
  }
});

void test('historical Drizzle baseline matches the schema and offline CLI generates no migration', async () => {
  const baseline = JSON.parse(
    await readFile(resolve('drizzle/meta/0000_snapshot.json'), 'utf8'),
  ) as ReturnType<typeof generateDrizzleJson>;
  assert.deepEqual(
    await generateMigration(baseline, generateDrizzleJson(schema)),
    [],
  );
  const directory = await mkdtemp(join(tmpdir(), 'digest-drizzle-baseline-'));
  try {
    const out = join(directory, 'drizzle');
    await cp(resolve('drizzle'), out, { recursive: true });
    const config = join(directory, 'drizzle.config.js');
    await writeFile(
      config,
      `module.exports = ${JSON.stringify({
        dialect: 'postgresql',
        schema: resolve('apps/api/src/libs/db/schema.ts'),
        out: relative(resolve('apps/api'), out),
      })};`,
    );
    const before = await readdir(out, { recursive: true });
    const result = spawnSync(
      'pnpm',
      [
        '--filter',
        '@digest/api',
        'exec',
        'drizzle-kit',
        'generate',
        '--config',
        config,
      ],
      { encoding: 'utf8', timeout: 60000 },
    );
    assert.ifError(result.error);
    const output = result.stdout + result.stderr;
    assert.equal(result.status, 0, output);
    assert.match(output, /No schema changes/, output);
    assert.deepEqual(await readdir(out, { recursive: true }), before);
    assert.equal(
      await readFile(join(out, 'meta/0000_snapshot.json'), 'utf8'),
      await readFile(resolve('drizzle/meta/0000_snapshot.json'), 'utf8'),
    );
  } finally {
    await rm(directory, { recursive: true, force: true });
  }
});
