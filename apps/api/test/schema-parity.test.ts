import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
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
    if (created) await pool.query(`DROP DATABASE "${mirrorName}" WITH (FORCE)`);
    await pool.end();
  }
});
