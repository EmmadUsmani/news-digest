import assert from 'node:assert/strict';
import { once } from 'node:events';
import { readFileSync } from 'node:fs';
import type { AddressInfo } from 'node:net';
import { resolve } from 'node:path';
import { test } from 'node:test';

import { Pool } from 'pg';
import { GenericContainer, Wait } from 'testcontainers';

import { verifyCatalogCredentials } from '../../schema-explorer/src/credential-preflight';
import { createExplorerServer } from '../../schema-explorer/src/http-server';
import { introspect } from '../../schema-explorer/src/introspect';
import { buildModel } from '../../schema-explorer/src/model';
import { buildPublicModel } from '../../schema-explorer/src/public-model';
import { database } from '../src/libs/db/connections';
import { applyMigrations } from '../src/libs/db/migration-runner';

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
    // Compose the actual HTTP boundary with real catalog queries under the
    // restricted session, then rehearse private rollback without changing grants.
    const responses: unknown[] = [];
    for (const structuralOnly of [false, true, false]) {
      const server = createExplorerServer({
        publicDir: resolve('apps/schema-explorer/public'),
        structuralOnly,
        health: () => client.query('SELECT 1'),
        loadModel: async () => buildModel(await introspect(client)),
      });
      try {
        server.listen(0, '127.0.0.1');
        await once(server, 'listening');
        const base = `http://127.0.0.1:${(server.address() as AddressInfo).port}`;
        assert.equal((await fetch(`${base}/healthz`)).status, 200);
        const response = await fetch(`${base}/api/schema?structuralOnly=false`);
        assert.equal(response.status, 200);
        assert.equal(response.headers.get('cache-control'), 'no-store');
        const body = (await response.json()) as typeof model;
        assert.deepEqual(
          body.tables.map((table) => table.name),
          model.tables.map((table) => table.name),
        );
        assert.deepEqual(
          body.relations,
          structuralOnly ? model.relations : buildModel(catalog).relations,
        );
        if (structuralOnly) {
          assert.doesNotMatch(
            JSON.stringify(body),
            /private-catalog-marker|rowEstimate|sizeBytes|definition/,
          );
        } else {
          assert.match(JSON.stringify(body), /private-catalog-marker/);
          const privateBody = body as ReturnType<typeof buildModel>;
          for (const table of privateBody.tables) {
            assert.ok(
              Number.isSafeInteger(table.sizeBytes) && table.sizeBytes >= 0,
            );
            assert.ok(
              Number.isSafeInteger(table.rowEstimate) && table.rowEstimate >= 0,
            );
          }
        }
        assert.equal(
          (await fetch(`${base}/api/schema`, { method: 'POST' })).status,
          405,
        );
        assert.equal((await fetch(`${base}/users`)).status, 404);
        responses.push(body);
      } finally {
        server.closeAllConnections();
        await new Promise<void>((resolve, reject) =>
          server.close((error) => (error ? reject(error) : resolve())),
        );
      }
    }
    // Physical pages and row estimates can change during autovacuum even in
    // this read-only transaction. Rollback must preserve structure and comments,
    // while private statistics above remain valid and public statistics absent.
    const stableCatalog = (response: unknown) =>
      JSON.parse(
        JSON.stringify(response, (key, value: unknown) =>
          ['generatedAt', 'sizeBytes', 'rowEstimate'].includes(key)
            ? undefined
            : value,
        ),
      ) as unknown;
    assert.deepEqual(stableCatalog(responses[2]), stableCatalog(responses[0]));
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

void test('catalog credentials enforce SCRAM login and retain structural HTTP access without row grants', async () => {
  assert.equal(process.env.NEWS_DIGEST_ISOLATED_TEST, '1');
  const container = await new GenericContainer('postgres:17-alpine')
    .withEnvironment({
      POSTGRES_PASSWORD: 'synthetic-owner-password',
      POSTGRES_HOST_AUTH_METHOD: 'scram-sha-256',
    })
    .withTmpFs({ '/var/lib/postgresql/data': 'rw' })
    .withExposedPorts(5432)
    .withWaitStrategy(
      Wait.forLogMessage('database system is ready to accept connections', 2),
    )
    .start();
  const connection = {
    host: container.getHost(),
    port: container.getMappedPort(5432),
    database: 'postgres',
    connectionTimeoutMillis: 3000,
  };
  const owner = new Pool({
    ...connection,
    user: 'postgres',
    password: 'synthetic-owner-password',
  });
  const reader = new Pool({
    ...connection,
    user: 'schema_catalog_reader',
    password: 'synthetic-reader-password',
  });
  const wrong = new Pool({
    ...connection,
    user: 'schema_catalog_reader',
    password: 'wrong-synthetic-password',
  });
  const server = createExplorerServer({
    publicDir: resolve('apps/schema-explorer/public'),
    structuralOnly: true,
    health: () => reader.query('SELECT 1'),
    loadModel: async () => buildModel(await introspect(reader)),
  });
  try {
    await applyMigrations(owner);
    await owner.query(
      readFileSync('ops/schema-explorer/prepared/catalog-reader.sql', 'utf8'),
    );
    // Synthetic activation is deliberately separate from the prepared NOLOGIN SQL.
    await owner.query(
      "ALTER ROLE schema_catalog_reader LOGIN PASSWORD 'synthetic-reader-password'",
    );
    const candidate = `postgres://schema_catalog_reader:synthetic-reader-password@127.0.0.1:${connection.port}/postgres`;
    await verifyCatalogCredentials(candidate);
    // Match live extension defaults: PUBLIC SELECT is inherited by new roles.
    await owner.query(`CREATE ROLE existing_stats_reader NOLOGIN;
      CREATE EXTENSION pg_stat_statements WITH SCHEMA public`);
    await assert.rejects(
      verifyCatalogCredentials(candidate),
      /Unsafe catalog-reader privileges/,
    );
    const restrictStats = readFileSync(
      'ops/schema-explorer/prepared/query-stats-access.sql',
      'utf8',
    );
    const originalStatsAcl =
      await owner.query(`SELECT c.relname, c.relacl::text AS acl
      FROM pg_class c JOIN pg_namespace n ON n.oid=c.relnamespace
      WHERE n.nspname='public' AND c.relname IN
        ('pg_stat_statements','pg_stat_statements_info') ORDER BY c.relname`);
    await owner.query(restrictStats);
    await owner.query(restrictStats); // Safe to reapply without broadening access.
    const statsAccess = await owner.query(`SELECT
      has_table_privilege('schema_catalog_reader', 'public.pg_stat_statements', 'SELECT') AS catalog,
      has_table_privilege('existing_stats_reader', 'public.pg_stat_statements', 'SELECT') AS existing,
      has_table_privilege('schema_catalog_reader', 'public.pg_stat_statements_info', 'SELECT') AS catalog_info,
      has_table_privilege('existing_stats_reader', 'public.pg_stat_statements_info', 'SELECT') AS existing_info`);
    assert.deepEqual(statsAccess.rows, [
      {
        catalog: false,
        existing: true,
        catalog_info: false,
        existing_info: true,
      },
    ]);
    await verifyCatalogCredentials(candidate);
    await owner.query('GRANT SELECT ON public.users TO schema_catalog_reader');
    await assert.rejects(
      verifyCatalogCredentials(candidate),
      /Unsafe catalog-reader privileges/,
    );
    await owner.query(
      'REVOKE SELECT ON public.users FROM schema_catalog_reader',
    );
    // A stored SCRAM verifier alone does not prove host authentication enforcement.
    const verifier = await owner.query(
      "SELECT rolpassword FROM pg_authid WHERE rolname='schema_catalog_reader'",
    );
    assert.ok(verifier.rows[0].rolpassword.startsWith('SCRAM-SHA-256$'));
    await assert.rejects(wrong.query('SELECT 1'), { code: '28P01' });
    const identity = await reader.query(`SELECT current_user, session_user,
      current_setting('default_transaction_read_only') AS read_only,
      current_setting('statement_timeout') AS timeout`);
    assert.deepEqual(identity.rows, [
      {
        current_user: 'schema_catalog_reader',
        session_user: 'schema_catalog_reader',
        read_only: 'on',
        timeout: '10s',
      },
    ]);
    for (const query of [
      'SELECT * FROM public.users',
      'SELECT * FROM public.digest_previews',
      'SELECT * FROM pg_authid',
      'SET ROLE postgres',
      'SET SESSION AUTHORIZATION postgres',
      "SELECT pg_read_file('/etc/passwd')",
    ]) {
      await assert.rejects(reader.query(query), { code: '42501' });
    }
    // Disabling read-only cannot bypass the actual privilege boundary.
    await reader.query('SET default_transaction_read_only=off');
    await assert.rejects(reader.query('DELETE FROM public.users'), {
      code: '42501',
    });
    await reader.query('RESET default_transaction_read_only');
    server.listen(0, '127.0.0.1');
    await once(server, 'listening');
    const base = `http://127.0.0.1:${(server.address() as AddressInfo).port}`;
    assert.equal((await fetch(`${base}/healthz`)).status, 200);
    const response = await fetch(`${base}/api/schema`);
    assert.equal(response.status, 200);
    const model = (await response.json()) as ReturnType<
      typeof buildPublicModel
    >;
    assert.ok(model.tables.some((table) => table.name === 'users'));
    assert.ok(model.tables.length >= 39);
    assert.ok(model.relations.length > 0);
    assert.doesNotMatch(
      JSON.stringify(model),
      /rowEstimate|sizeBytes|definition|synthetic-reader-password/,
    );
    // NOLOGIN blocks fresh connections; pooled sessions require a service restart.
    const pooledPid = (await reader.query('SELECT pg_backend_pid() AS pid'))
      .rows[0].pid;
    await owner.query('ALTER ROLE schema_catalog_reader NOLOGIN');
    assert.equal(
      (await reader.query('SELECT pg_backend_pid() AS pid')).rows[0].pid,
      pooledPid,
      'NOLOGIN leaves an existing pool usable until the service closes it',
    );
    const revoked = new Pool({
      ...connection,
      user: 'schema_catalog_reader',
      password: 'synthetic-reader-password',
    });
    try {
      await assert.rejects(revoked.query('SELECT 1'), { code: '28000' });
    } finally {
      await revoked.end();
    }
    await reader.end();
    // Pool shutdown sends termination; PostgreSQL removes the backend asynchronously.
    for (let attempt = 0; ; attempt++) {
      const remaining = await owner.query(
        'SELECT pid FROM pg_stat_activity WHERE pid=$1',
        [pooledPid],
      );
      if (remaining.rowCount === 0) break;
      assert.ok(
        attempt < 39,
        'closing the service pool removes the catalog session within two seconds',
      );
      await new Promise((resolve) => setTimeout(resolve, 50));
    }
    await owner.query('ALTER ROLE schema_catalog_reader LOGIN');
    // Reload signals are asynchronous; observe fresh authentication, not elapsed time.
    const waitForAuthentication = async (scram: boolean) => {
      for (let attempt = 0; ; attempt++) {
        try {
          if (scram) await verifyCatalogCredentials(candidate);
          else
            await assert.rejects(
              verifyCatalogCredentials(candidate),
              /Wrong-password connection/,
            );
          return;
        } catch (error) {
          if (attempt >= 39) throw error;
          await new Promise((resolve) => setTimeout(resolve, 50));
        }
      }
    };
    const changed = await container.exec([
      'sh',
      '-c',
      "sed -i 's/scram-sha-256/trust/g' /var/lib/postgresql/data/pg_hba.conf",
    ]);
    assert.equal(changed.exitCode, 0);
    await owner.query('SELECT pg_reload_conf()');
    await waitForAuthentication(false);
    // Rehearse the live trust-based setup: prepend only the catalog role rule.
    const rules = readFileSync(
      'ops/schema-explorer/prepared/catalog-reader.pg_hba.conf',
      'utf8',
    );
    const scoped = await container.exec([
      'sh',
      '-c',
      'cp -p /var/lib/postgresql/data/pg_hba.conf /tmp/original-hba && { printf "%s\\n" "$1"; cat /tmp/original-hba; } > /var/lib/postgresql/data/pg_hba.conf',
      'catalog-hba',
      rules,
    ]);
    assert.equal(scoped.exitCode, 0);
    await owner.query('SELECT pg_reload_conf()');
    await waitForAuthentication(true);
    const hbaErrors = await owner.query(
      'SELECT error FROM pg_hba_file_rules WHERE error IS NOT NULL',
    );
    assert.equal(hbaErrors.rowCount, 0);
    const unchangedOwner = new Pool({
      ...connection,
      user: 'postgres',
      password: 'deliberately-wrong',
    });
    try {
      assert.equal(
        (await unchangedOwner.query('SELECT current_user')).rows[0]
          .current_user,
        'postgres',
      );
    } finally {
      await unchangedOwner.end();
    }
    const restored = await container.exec([
      'sh',
      '-c',
      'cp -p /tmp/original-hba /var/lib/postgresql/data/pg_hba.conf',
    ]);
    assert.equal(restored.exitCode, 0);
    await owner.query('SELECT pg_reload_conf()');
    assert.equal(
      (
        await owner.query(
          'SELECT error FROM pg_hba_file_rules WHERE error IS NOT NULL',
        )
      ).rowCount,
      0,
    );
    await waitForAuthentication(false);
    await owner.query('ALTER ROLE schema_catalog_reader NOLOGIN');
    // Full rollback: keep the role disabled before restoring inherited grants.
    const rollbackLogin = new Pool({
      ...connection,
      user: 'schema_catalog_reader',
      password: 'synthetic-reader-password',
    });
    try {
      await assert.rejects(rollbackLogin.query('SELECT 1'), { code: '28000' });
    } finally {
      await rollbackLogin.end();
    }
    await owner.query(`REVOKE SELECT ON public.pg_stat_statements,
      public.pg_stat_statements_info FROM existing_stats_reader;
      GRANT SELECT ON public.pg_stat_statements,
      public.pg_stat_statements_info TO PUBLIC`);
    const restoredStatsAcl =
      await owner.query(`SELECT c.relname, c.relacl::text AS acl
      FROM pg_class c JOIN pg_namespace n ON n.oid=c.relnamespace
      WHERE n.nspname='public' AND c.relname IN
        ('pg_stat_statements','pg_stat_statements_info') ORDER BY c.relname`);
    assert.deepEqual(restoredStatsAcl.rows, originalStatsAcl.rows);
    assert.equal(
      (await owner.query('SELECT count(*) FROM public.users')).rowCount,
      1,
    );
    // Reapply in the safe order, then prove a new pool serves the same structure.
    await owner.query(restrictStats);
    const reapplied = await container.exec([
      'sh',
      '-c',
      'cp -p /tmp/original-hba /var/lib/postgresql/data/pg_hba.conf && { printf "%s\\n" "$1"; cat /tmp/original-hba; } > /var/lib/postgresql/data/pg_hba.conf',
      'catalog-hba',
      rules,
    ]);
    assert.equal(reapplied.exitCode, 0);
    await owner.query('SELECT pg_reload_conf()');
    await owner.query('ALTER ROLE schema_catalog_reader LOGIN');
    await waitForAuthentication(true);
    const reactivated = new Pool({
      ...connection,
      user: 'schema_catalog_reader',
      password: 'synthetic-reader-password',
    });
    try {
      assert.deepEqual(
        buildPublicModel(buildModel(await introspect(reactivated))).tables,
        model.tables,
      );
      await assert.rejects(reactivated.query('SELECT * FROM public.users'), {
        code: '42501',
      });
    } finally {
      await reactivated.end();
    }
  } finally {
    server.closeAllConnections();
    if (server.listening)
      await new Promise<void>((resolve, reject) =>
        server.close((error) => (error ? reject(error) : resolve())),
      );
    await Promise.all([
      owner.end(),
      ...(reader.ended ? [] : [reader.end()]),
      wrong.end(),
    ]);
    await container.stop();
  }
});
