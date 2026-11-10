import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';

import { Pool } from 'pg';
import { GenericContainer, Wait } from 'testcontainers';

import { produceExport } from '../../../ops/observability/grafana/prepared/produce-export';
import { refreshExport } from '../../../ops/observability/grafana/prepared/refresh-export';
import { database } from '../src/libs/db/connections';

void test('prepared Grafana reader exposes only published counts and bounded source health', async () => {
  assert.equal(process.env.NEWS_DIGEST_ISOLATED_TEST, '1');
  const pool = database();
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    await client.query(`INSERT INTO digest_previews
      (profile_id,window_start,window_end,snapshot,kind,published_at)
      VALUES (NULL,now() - interval '1 day',now(),'{"secret":"private-snapshot-marker"}','manual',NULL),
      (NULL,now() - interval '1 day',now(),'{"secret":"published-snapshot-marker"}','scheduled','2099-11-10T15:00:00Z')`);
    await client.query(`INSERT INTO content_sources(id,name,kind,url,last_error)
      VALUES ('ffffffff-ffff-4fff-8fff-ffffffffffff','private-source-marker','feed',
      'https://example.test/private-url-marker','raw-error-marker')`);
    await client.query(`INSERT INTO digest_previews
      (profile_id,window_start,window_end,snapshot,kind,published_at)
      VALUES (NULL,now()-interval '1 day',now(),
      '{"topics":[{"name":"private-topic-marker","stories":[1,2,3],"posts":[1,2]}]}','manual',NULL),
      (NULL,now()-interval '1 day',now(),
      '{"topics":[{"name":"public-topic-marker","stories":[{"text":"story-marker"}],"posts":[1,2]},{"stories":null,"posts":"bad-shape-marker"}]}',
      'scheduled','2099-11-11T15:00:00Z'),
      (NULL,now()-interval '1 day',now(),'{"topics":null}',
      'scheduled','2099-11-12T15:00:00Z')`);
    const produced = await produceExport(
      client,
      new Date('2099-11-11T23:59:59Z'),
    );
    assert.deepEqual(produced.days, [
      { day: '2099-11-10', editions: 1, topics: 0, stories: 0, posts: 0 },
      { day: '2099-11-11', editions: 1, topics: 2, stories: 1, posts: 2 },
    ]);
    assert.ok(produced.sources >= 1);
    assert.ok(produced.enabled <= produced.sources);
    assert.ok(produced.errors <= produced.enabled);
    assert.doesNotMatch(
      JSON.stringify(produced),
      /marker|secret|https|2099-11-12/,
    );
    assert.deepEqual(
      (await produceExport(client, new Date('2099-12-11T00:00:00Z'))).days,
      [{ day: '2099-11-12', editions: 1, topics: 0, stories: 0, posts: 0 }],
    );
    assert.deepEqual(
      (await produceExport(client, new Date('2100-01-01T00:00:00Z'))).days,
      [],
    );
    await client.query('SAVEPOINT producer_sources');
    await client.query(`INSERT INTO content_sources(id,name,kind,url,enabled,last_error)
      VALUES ('ffffffff-ffff-4fff-8fff-fffffffffffe','disabled-marker','feed',
      'https://example.test/disabled-marker',false,'disabled-error-marker')`);
    await client.query("SET LOCAL TIME ZONE 'Pacific/Honolulu'");
    const withDisabled = await produceExport(
      client,
      new Date('2099-11-11T23:59:59Z'),
    );
    assert.deepEqual(withDisabled, {
      ...produced,
      sources: produced.sources + 1,
    });
    await client.query('ROLLBACK TO SAVEPOINT producer_sources');
    const sql = readFileSync(
      'ops/observability/grafana/sql/public-product-reader.sql',
      'utf8',
    );
    await client.query(sql);
    await client.query(sql); // Rehearse an idempotent deployment.
    // Catalog comments bypass table SELECT grants. Keep a private marker to
    // demonstrate why this same-database role cannot back arbitrary public SQL.
    await client.query(
      "COMMENT ON TABLE public.users IS 'private-catalog-comment-marker'",
    );
    await client.query('SET LOCAL ROLE grafana_public_product');
    const privileges = await client.query(`SELECT rolsuper, rolcreatedb,
      rolcreaterole, rolreplication, rolbypassrls FROM pg_roles
      WHERE rolname = current_user`);
    assert.deepEqual(privileges.rows, [
      {
        rolsuper: false,
        rolcreatedb: false,
        rolcreaterole: false,
        rolreplication: false,
        rolbypassrls: false,
      },
    ]);
    const memberships = await client.query(`SELECT rolname FROM pg_roles
      WHERE oid <> current_user::regrole
        AND pg_has_role(current_user, oid, 'MEMBER')`);
    assert.deepEqual(memberships.rows, []);
    const executableDefiners = await client.query(`SELECT n.nspname, p.proname
      FROM pg_proc p JOIN pg_namespace n ON n.oid = p.pronamespace
      WHERE p.prosecdef AND has_function_privilege(current_user,p.oid,'EXECUTE')
        AND n.nspname NOT IN ('pg_catalog','information_schema')`);
    assert.deepEqual(executableDefiners.rows, []);
    const catalog = await client.query(`SELECT
      obj_description('public.users'::regclass, 'pg_class') AS comment,
      pg_get_viewdef('grafana_public.published_content'::regclass) AS definition`);
    assert.equal(catalog.rows[0].comment, 'private-catalog-comment-marker');
    assert.match(catalog.rows[0].definition, /digest_previews/);

    const editions = await client.query(
      "SELECT * FROM grafana_public.published_editions WHERE day_utc = '2099-11-10'",
    );
    assert.deepEqual(editions.rows, [
      { day_utc: new Date('2099-11-10T00:00:00Z'), editions: '1' },
    ]);
    const content = await client.query(
      "SELECT * FROM grafana_public.published_content WHERE day_utc >= '2099-11-11' ORDER BY day_utc",
    );
    assert.deepEqual(content.rows, [
      {
        day_utc: new Date('2099-11-11T00:00:00Z'),
        topics: '2',
        stories: '1',
        posts: '2',
      },
      {
        day_utc: new Date('2099-11-12T00:00:00Z'),
        topics: '0',
        stories: '0',
        posts: '0',
      },
    ]);
    assert.doesNotMatch(JSON.stringify(content.rows), /marker/);
    assert.equal(
      (
        await client.query(
          'SELECT * FROM grafana_public.published_content WHERE day_utc IS NULL',
        )
      ).rowCount,
      0,
    );
    const health = await client.query(
      'SELECT * FROM grafana_public.source_health',
    );
    assert.deepEqual(
      health.fields.map((field) => field.name),
      [
        'id',
        'enabled',
        'last_success',
        'last_attempt',
        'last_item_count',
        'has_error',
      ],
    );
    assert.equal(
      health.rows.find(
        (row) => row.id === 'ffffffff-ffff-4fff-8fff-ffffffffffff',
      ).has_error,
      true,
    );
    assert.doesNotMatch(JSON.stringify([editions.rows, health.rows]), /marker/);
    // Execute the candidate dashboard's exact SQL through its intended role.
    // The file lives outside the provisioned dashboard directory.
    const dashboard = JSON.parse(
      readFileSync(
        'ops/observability/grafana/prepared/public-overview.json',
        'utf8',
      ),
    );
    assert.equal(dashboard.editable, false);
    assert.equal(dashboard.panels.length, 3);
    for (const panel of dashboard.panels) {
      assert.equal(panel.datasource.uid, 'public-product-postgres');
      assert.equal(panel.targets.length, 1);
      const result = await client.query(panel.targets[0].rawSql);
      assert.ok(result.rowCount! > 0);
      assert.ok(result.rowCount! <= 30);
      assert.doesNotMatch(JSON.stringify(result.rows), /marker/);
      if (panel.id === 1) {
        assert.deepEqual(
          result.fields.map((field) => field.name),
          ['day_utc', 'editions'],
        );
      } else if (panel.id === 2) {
        assert.deepEqual(
          result.rows.find((row) =>
            row.day_utc.toISOString().startsWith('2099-11-11'),
          ),
          {
            day_utc: new Date('2099-11-11T00:00:00Z'),
            topics: '2',
            stories: '1',
            posts: '2',
          },
        );
      } else {
        assert.deepEqual(
          result.fields.map((field) => field.name),
          ['sources', 'enabled', 'errors'],
        );
        assert.ok(Number(result.rows[0].errors) >= 1);
      }
    }
    for (const query of [
      'SELECT snapshot FROM public.digest_previews',
      'SELECT last_error FROM public.content_sources',
      'SELECT email FROM public.users',
      'SELECT token_hash FROM public.sessions',
      'SET ROLE grafana_product',
      "SELECT pg_read_file('/etc/passwd')",
      'SELECT * FROM pg_authid',
      "COPY (SELECT 1) TO PROGRAM 'true'",
      'DELETE FROM grafana_public.source_health',
      'CREATE TABLE grafana_public.injection(id int)',
    ]) {
      await client.query('SAVEPOINT denied');
      await assert.rejects(
        client.query(query),
        /permission denied|does not exist/,
      );
      await client.query('ROLLBACK TO SAVEPOINT denied');
    }
    const grants =
      await client.query(`SELECT table_schema,table_name FROM information_schema.role_table_grants
      WHERE grantee = current_user AND table_schema NOT IN ('pg_catalog','information_schema')
      ORDER BY table_name`);
    assert.deepEqual(grants.rows, [
      { table_schema: 'grafana_public', table_name: 'published_content' },
      { table_schema: 'grafana_public', table_name: 'published_editions' },
      { table_schema: 'grafana_public', table_name: 'source_health' },
    ]);
  } finally {
    await client.query('ROLLBACK');
    client.release();
    await pool.end();
  }
});

void test('separate Grafana export instance contains only aggregates under a real reader login', async () => {
  assert.equal(process.env.NEWS_DIGEST_ISOLATED_TEST, '1');
  const container = await new GenericContainer('postgres:17-alpine')
    .withEnvironment({ POSTGRES_HOST_AUTH_METHOD: 'trust' })
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
  };
  const owner = new Pool({ ...connection, user: 'postgres' });
  const reader = new Pool({ ...connection, user: 'grafana_export_reader' });
  const writer = new Pool({ ...connection, user: 'grafana_export_writer' });
  try {
    const sql = readFileSync(
      'ops/observability/grafana/prepared/export-storage.sql',
      'utf8',
    );
    await owner.query(sql);
    await owner.query(sql);
    await owner.query(`INSERT INTO grafana_public.published_editions VALUES ('2099-11-10',1);
      INSERT INTO grafana_public.published_content VALUES ('2099-11-10',4,19,15);
      INSERT INTO grafana_public.source_summary VALUES (true,36,36,0)`);
    const snapshot = {
      days: [
        { day: '2099-11-10', editions: 1, topics: 4, stories: 19, posts: 15 },
      ],
      sources: 36,
      enabled: 36,
      errors: 0,
    };
    const now = new Date('2099-11-10T19:00:00Z');
    await owner.query(
      "INSERT INTO grafana_public.published_editions VALUES ('2090-01-01',99)",
    );
    await refreshExport(writer, snapshot, now);
    await refreshExport(writer, snapshot, now);
    assert.equal(
      (await reader.query('SELECT * FROM grafana_public.published_editions'))
        .rowCount,
      1,
    );
    for (const days of [
      [...snapshot.days, ...snapshot.days],
      [{ ...snapshot.days[0], day: '2099-10-11' }],
      [{ ...snapshot.days[0], day: '2099-11-11' }],
      [{ ...snapshot.days[0], day: '2099-02-30' }],
      [{ ...snapshot.days[0], stories: -1 }],
    ])
      await assert.rejects(refreshExport(writer, { ...snapshot, days }, now));
    // A database failure after deletes must retain the entire prior snapshot.
    await owner.query(
      'ALTER TABLE grafana_public.source_summary ADD CONSTRAINT test_failure CHECK (errors = 0)',
    );
    await assert.rejects(
      refreshExport(writer, { ...snapshot, days: [], errors: 1 }, now),
    );
    assert.equal(
      (await reader.query('SELECT * FROM grafana_public.published_content'))
        .rowCount,
      1,
    );
    assert.equal(
      (await reader.query('SELECT errors FROM grafana_public.source_summary'))
        .rows[0].errors,
      0,
    );
    await owner.query(
      'ALTER TABLE grafana_public.source_summary DROP CONSTRAINT test_failure',
    );
    const dashboard = JSON.parse(
      readFileSync(
        'ops/observability/grafana/prepared/public-overview.json',
        'utf8',
      ),
    );
    for (const panel of dashboard.panels.slice(0, 2)) {
      const result = await reader.query(panel.targets[0].rawSql);
      assert.equal(result.rowCount, 1);
    }
    assert.deepEqual(
      (
        await reader.query(
          'SELECT sources, enabled, errors FROM grafana_public.source_summary',
        )
      ).rows,
      [{ sources: 36, enabled: 36, errors: 0 }],
    );
    // Exercise the actual writer login, including attempts to escape its grants.
    for (const query of [
      'SET ROLE postgres',
      'SET ROLE grafana_export_reader',
      'SELECT * FROM grafana_public.published_content',
      'SELECT * FROM pg_authid',
      "COPY (SELECT 1) TO PROGRAM 'true'",
      'TRUNCATE grafana_public.published_content',
      'UPDATE grafana_public.source_summary SET errors = 0',
      'ALTER TABLE grafana_public.published_content ADD COLUMN raw text',
      'CREATE TABLE grafana_public.unapproved (id int)',
      'CREATE TABLE public.unapproved (id int)',
      'SELECT * FROM public.digest_previews',
    ])
      await assert.rejects(writer.query(query));
    assert.equal(
      (await writer.query('SHOW statement_timeout')).rows[0].statement_timeout,
      '5s',
    );
    assert.equal(
      (await writer.query('SHOW lock_timeout')).rows[0].lock_timeout,
      '500ms',
    );
    const blocker = await owner.connect();
    try {
      await blocker.query('BEGIN');
      await blocker.query(
        'LOCK TABLE grafana_public.published_content IN ACCESS EXCLUSIVE MODE',
      );
      await assert.rejects(
        refreshExport(writer, { ...snapshot, days: [] }, now),
        (error: unknown) =>
          error instanceof Error && 'code' in error && error.code === '55P03',
      );
    } finally {
      await blocker.query('ROLLBACK');
      blocker.release();
    }
    // A timed-out refresh leaves the previous snapshot intact and pool reusable.
    assert.equal(
      (await reader.query('SELECT * FROM grafana_public.published_content'))
        .rowCount,
      1,
    );
    await refreshExport(writer, snapshot, now);
    const tables = await reader.query(`SELECT tablename FROM pg_tables
      WHERE schemaname NOT IN ('pg_catalog','information_schema') ORDER BY tablename`);
    assert.deepEqual(
      tables.rows.map((row) => row.tablename),
      ['published_content', 'published_editions', 'source_summary'],
    );
    assert.equal(
      (await reader.query("SELECT to_regclass('public.users') AS users"))
        .rows[0].users,
      null,
    );
    for (const query of [
      'SET ROLE postgres',
      'SELECT * FROM pg_authid',
      "COPY (SELECT 1) TO PROGRAM 'true'",
      "INSERT INTO grafana_public.published_editions VALUES ('2099-11-11',1)",
      'CREATE TABLE public.unapproved (id int)',
      'SELECT * FROM public.digest_previews',
    ])
      await assert.rejects(reader.query(query));
    assert.equal(
      (await reader.query('SHOW statement_timeout')).rows[0].statement_timeout,
      '5s',
    );
    assert.equal(
      (await reader.query('SHOW default_transaction_read_only')).rows[0]
        .default_transaction_read_only,
      'on',
    );
    // Read-only defaults can be reset: grants must still deny writes.
    await reader.query('SET default_transaction_read_only = off');
    await assert.rejects(
      reader.query('DELETE FROM grafana_public.published_content'),
    );
  } finally {
    await Promise.all([owner.end(), reader.end(), writer.end()]);
    await container.stop();
  }
});
