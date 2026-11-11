import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';

import { introspect } from '../../schema-explorer/src/introspect';
import { buildModel } from '../../schema-explorer/src/model';
import { buildPublicModel } from '../../schema-explorer/src/public-model';
import { database } from '../src/libs/db/connections';

void test('prepared explorer role reads schema structure without application-row grants', async () => {
  assert.equal(process.env.NEWS_DIGEST_ISOLATED_TEST, '1');
  const client = await database().connect();
  try {
    await client.query('BEGIN');
    const sql = readFileSync(
      'ops/schema-explorer/prepared/catalog-reader.sql',
      'utf8',
    );
    await client.query(sql);
    await client.query(sql);
    await client.query(
      "COMMENT ON TABLE public.users IS 'private-catalog-marker'",
    );
    await client.query('SET LOCAL SESSION AUTHORIZATION schema_catalog_reader');
    const flags = await client.query(`SELECT rolsuper,rolcreatedb,rolcreaterole,
      rolreplication,rolbypassrls,rolinherit,rolcanlogin FROM pg_roles WHERE rolname=current_user`);
    assert.ok(Object.values(flags.rows[0]).every((value) => value === false));
    const settings = await client.query(
      `SELECT rolconfig FROM pg_roles WHERE rolname=current_user`,
    );
    assert.deepEqual(settings.rows[0].rolconfig, [
      'default_transaction_read_only=on',
      'statement_timeout=10s',
    ]);
    const memberships = await client.query(`SELECT rolname FROM pg_roles
      WHERE oid <> current_user::regrole AND pg_has_role(current_user,oid,'MEMBER')`);
    assert.deepEqual(memberships.rows, []);
    const grants =
      await client.query(`SELECT table_name FROM information_schema.tables
      WHERE table_schema='public' AND has_table_privilege(current_user,
        format('%I.%I',table_schema,table_name),'SELECT,INSERT,UPDATE,DELETE,TRUNCATE,REFERENCES,TRIGGER')`);
    assert.deepEqual(grants.rows, []);
    // PUBLIC function privileges survive a role's explicit revocations. Check
    // every non-system SECURITY DEFINER function, including extension schemas.
    const definers = await client.query(`SELECT n.nspname,p.proname
      FROM pg_proc p JOIN pg_namespace n ON n.oid=p.pronamespace
      WHERE p.prosecdef AND has_function_privilege(current_user,p.oid,'EXECUTE')
        AND n.nspname NOT IN ('pg_catalog','information_schema')`);
    assert.deepEqual(definers.rows, []);
    const writableSchemas = await client.query(`SELECT nspname FROM pg_namespace
      WHERE nspname NOT LIKE 'pg_temp_%' AND nspname NOT LIKE 'pg_toast%'
        AND has_schema_privilege(current_user,oid,'CREATE')`);
    assert.deepEqual(writableSchemas.rows, []);
    const catalog = await introspect(client);
    assert.ok(catalog.tables.some((table) => table.name === 'users'));
    const model = buildPublicModel(buildModel(catalog));
    assert.ok(model.tables.length >= 39);
    assert.ok(model.relations.length > 0);
    assert.doesNotMatch(
      JSON.stringify(model),
      /private-catalog-marker|rowEstimate|sizeBytes|definition/,
    );
    // Catalog comments are visible despite denied row access; project before serving.
    assert.match(JSON.stringify(catalog), /private-catalog-marker/);
    for (const query of [
      'SELECT * FROM public.users',
      'SELECT * FROM public.digest_previews',
      'DELETE FROM public.users',
      'SELECT * FROM pg_authid',
      'SET ROLE postgres',
      "SELECT pg_read_file('/etc/passwd')",
      "SELECT pg_read_binary_file('/etc/passwd')",
      "SELECT pg_ls_dir('.')",
      "COPY (SELECT 1) TO PROGRAM 'true'",
      'CREATE TABLE public.explorer_injection(id int)',
      `CREATE FUNCTION public.explorer_injection() RETURNS int
        LANGUAGE sql SECURITY DEFINER AS 'SELECT 1'`,
    ]) {
      await client.query('SAVEPOINT denied');
      await assert.rejects(
        client.query(query),
        /permission denied|must be superuser/,
      );
      await client.query('ROLLBACK TO SAVEPOINT denied');
    }
  } finally {
    await client.query('ROLLBACK');
    client.release();
  }
});
