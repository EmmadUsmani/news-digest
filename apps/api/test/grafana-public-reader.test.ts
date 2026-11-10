import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';

import { Pool } from 'pg';
import { GenericContainer, Wait } from 'testcontainers';

import { produceExport } from '../../../ops/observability/grafana/prepared/produce-export';
import { refreshExport } from '../../../ops/observability/grafana/prepared/refresh-export';
import { exportConnections, exportOnce } from '../scripts/export-grafana';
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
    assert.equal(dashboard.panels.length, 4);
    for (const panel of dashboard.panels.slice(0, 2)) {
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
  const sourceContainer = await new GenericContainer('postgres:17-alpine')
    .withEnvironment({
      POSTGRES_PASSWORD: 'synthetic-source-owner-password',
      POSTGRES_HOST_AUTH_METHOD: 'scram-sha-256',
    })
    .withTmpFs({ '/var/lib/postgresql/data': 'rw' })
    .withExposedPorts(5432)
    .withWaitStrategy(
      Wait.forLogMessage('database system is ready to accept connections', 2),
    )
    .start();
  const sourceOwner = new Pool({
    host: sourceContainer.getHost(),
    port: sourceContainer.getMappedPort(5432),
    database: 'postgres',
    user: 'postgres',
    password: 'synthetic-source-owner-password',
  });
  const connection = {
    host: container.getHost(),
    port: container.getMappedPort(5432),
    database: 'postgres',
  };
  const owner = new Pool({
    ...connection,
    user: 'postgres',
    password: 'synthetic-owner-password',
  });
  const reader = new Pool({
    ...connection,
    user: 'grafana_export_reader',
    password: 'synthetic-reader-password',
  });
  const writer = new Pool({
    ...connection,
    user: 'grafana_export_writer',
    password: 'synthetic-target-password',
  });
  try {
    const sql = readFileSync(
      'ops/observability/grafana/prepared/export-storage.sql',
      'utf8',
    );
    await owner.query(sql);
    await owner.query(sql);
    // Synthetic credentials on the disposable target must authenticate with SCRAM.
    await owner.query(
      "ALTER ROLE grafana_export_reader PASSWORD 'synthetic-reader-password'",
    );
    await owner.query(
      "ALTER ROLE grafana_export_writer PASSWORD 'synthetic-target-password'",
    );
    const verifiers = await owner.query(`SELECT rolpassword FROM pg_authid
      WHERE rolname IN ('grafana_export_reader','grafana_export_writer')`);
    assert.equal(verifiers.rowCount, 2);
    assert.ok(
      verifiers.rows.every((row) =>
        row.rolpassword.startsWith('SCRAM-SHA-256$'),
      ),
    );
    for (const user of ['grafana_export_reader', 'grafana_export_writer']) {
      const denied = new Pool({
        ...connection,
        user,
        password: 'wrong-synthetic-password',
      });
      try {
        await assert.rejects(
          denied.query('SELECT 1'),
          (error: unknown) =>
            error instanceof Error && 'code' in error && error.code === '28P01',
        );
      } finally {
        await denied.end();
      }
    }
    // Minimal disposable producer schema; no application database or live grants.
    await sourceOwner.query(`
      CREATE TABLE digest_previews (published_at timestamptz, snapshot jsonb);
      CREATE TABLE content_sources (enabled boolean, last_error text);
      INSERT INTO digest_previews VALUES
        (now(), '{"topics":[{"stories":[1,2],"posts":[1]}]}'),
        (NULL, '{"private":"unpublished-marker"}');
      INSERT INTO content_sources VALUES (true,NULL),(true,'private-error-marker');
      CREATE ROLE aggregate_producer LOGIN PASSWORD 'synthetic-source-password';
      GRANT SELECT ON digest_previews, content_sources TO aggregate_producer;
    `);
    assert.ok(
      (
        await sourceOwner.query(
          "SELECT rolpassword FROM pg_authid WHERE rolname = 'aggregate_producer'",
        )
      ).rows[0].rolpassword.startsWith('SCRAM-SHA-256$'),
    );
    const transportCapturedAt = new Date();
    const transport = {
      GRAFANA_EXPORT_SOURCE_HOST: '127.0.0.1',
      GRAFANA_EXPORT_SOURCE_PORT: String(sourceContainer.getMappedPort(5432)),
      GRAFANA_EXPORT_SOURCE_DATABASE: 'postgres',
      GRAFANA_EXPORT_SOURCE_USER: 'aggregate_producer',
      GRAFANA_EXPORT_SOURCE_PASSWORD: 'synthetic-source-password',
      GRAFANA_EXPORT_TARGET_HOST: '127.0.0.1',
      GRAFANA_EXPORT_TARGET_PORT: String(connection.port),
      GRAFANA_EXPORT_TARGET_DATABASE: connection.database,
      GRAFANA_EXPORT_TARGET_USER: 'grafana_export_writer',
      GRAFANA_EXPORT_TARGET_PASSWORD: 'synthetic-target-password',
    };
    const sourcePool = new Pool(exportConnections(transport).source);
    let expected;
    try {
      assert.equal(
        (await sourcePool.query('SHOW default_transaction_read_only')).rows[0]
          .default_transaction_read_only,
        'on',
      );
      await assert.rejects(
        sourcePool.query(
          'UPDATE public.content_sources SET enabled = enabled WHERE false',
        ),
      );
      // Read-only defaults are not the security boundary: grants deny writes too.
      await sourcePool.query('SET default_transaction_read_only = off');
      await assert.rejects(
        sourcePool.query('DELETE FROM public.content_sources'),
        (error: unknown) =>
          error instanceof Error && 'code' in error && error.code === '42501',
      );
      expected = await produceExport(sourcePool, transportCapturedAt);
      assert.equal(expected.sources, 2);
      assert.equal(expected.days[0].stories, 2);
    } finally {
      await sourcePool.end();
    }
    await exportOnce(transport, transportCapturedAt);
    assert.deepEqual(
      (
        await reader.query(
          'SELECT sources,enabled,errors FROM grafana_public.source_summary',
        )
      ).rows,
      [
        {
          sources: expected.sources,
          enabled: expected.enabled,
          errors: expected.errors,
        },
      ],
    );
    assert.equal(
      (
        await reader.query(
          'SELECT captured_at FROM grafana_public.export_status',
        )
      ).rows[0].captured_at.toISOString(),
      transportCapturedAt.toISOString(),
    );
    // A rejected writer password must not change the last committed capture.
    await assert.rejects(
      exportOnce({
        ...transport,
        GRAFANA_EXPORT_TARGET_PASSWORD: 'wrong-synthetic-password',
      }),
      (error: unknown) =>
        error instanceof Error && 'code' in error && error.code === '28P01',
    );
    // Source authentication failure must also preserve the committed capture.
    await assert.rejects(
      exportOnce({
        ...transport,
        GRAFANA_EXPORT_SOURCE_PASSWORD: 'wrong-synthetic-password',
      }),
      (error: unknown) =>
        error instanceof Error && 'code' in error && error.code === '28P01',
    );
    // Producer failure must leave the committed export untouched.
    await assert.rejects(
      exportOnce({
        ...transport,
        GRAFANA_EXPORT_SOURCE_DATABASE: 'missing_export_source',
      }),
    );
    assert.equal(
      (
        await reader.query(
          'SELECT captured_at FROM grafana_public.export_status',
        )
      ).rows[0].captured_at.toISOString(),
      transportCapturedAt.toISOString(),
    );
    await owner.query(
      'TRUNCATE grafana_public.published_editions, grafana_public.published_content, grafana_public.source_summary, grafana_public.export_status',
    );
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
    // Missing status means no successful export, even if counts exist.
    assert.equal(
      (await reader.query('SELECT * FROM grafana_public.export_status'))
        .rowCount,
      0,
    );
    const capturedAt = async () =>
      (
        await reader.query(
          'SELECT captured_at FROM grafana_public.export_status',
        )
      ).rows[0].captured_at.toISOString();
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
    assert.equal(await capturedAt(), now.toISOString());
    // A delayed older capture and a changed same-capture retry are no-ops.
    for (const capture of [new Date('2099-11-10T18:00:00Z'), now]) {
      await refreshExport(
        writer,
        { ...snapshot, days: [], errors: 1 },
        capture,
      );
      assert.equal(await capturedAt(), now.toISOString());
      assert.equal(
        (
          await reader.query(
            'SELECT stories FROM grafana_public.published_content',
          )
        ).rows[0].stories,
        '19',
      );
      assert.equal(
        (await reader.query('SELECT errors FROM grafana_public.source_summary'))
          .rows[0].errors,
        0,
      );
    }
    // A database failure after deletes must retain the entire prior snapshot.
    await owner.query(
      'ALTER TABLE grafana_public.source_summary ADD CONSTRAINT test_failure CHECK (errors = 0)',
    );
    await assert.rejects(
      refreshExport(
        writer,
        { ...snapshot, days: [], errors: 1 },
        new Date('2099-11-10T20:00:00Z'),
      ),
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
    assert.equal(await capturedAt(), now.toISOString());
    await owner.query(
      'ALTER TABLE grafana_public.source_summary DROP CONSTRAINT test_failure',
    );
    const dashboard = JSON.parse(
      readFileSync(
        'ops/observability/grafana/prepared/public-overview.json',
        'utf8',
      ),
    );
    for (const panel of dashboard.panels) {
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
    const alert = JSON.parse(
      readFileSync(
        'ops/observability/grafana/prepared/export-freshness-alert.json',
        'utf8',
      ),
    ).groups[0].rules[0];
    assert.equal(alert.noDataState, 'Alerting');
    assert.equal(alert.execErrState, 'Alerting');
    assert.equal(alert.for, '5m');
    assert.equal(
      alert.data[0].datasourceUid,
      dashboard.panels[3].datasource.uid,
    );
    assert.equal(alert.condition, alert.data[1].refId);
    assert.equal(alert.data[1].model.expression, alert.data[0].refId);
    const unhealthy = async () =>
      (await reader.query(alert.data[0].model.rawSql)).rows[0].unhealthy;
    // The same restricted login must see a numeric alert even with no row.
    assert.equal(await unhealthy(), 1);
    const freshnessSql = dashboard.panels[3].targets[0].rawSql;
    const age = async () =>
      (await reader.query(freshnessSql)).rows[0].age_seconds;
    // Future captures fail closed; missing captures still return a visible null.
    assert.equal(await age(), null);
    await owner.query('DELETE FROM grafana_public.export_status');
    assert.equal(await age(), null);
    assert.equal(await unhealthy(), 1);
    for (const seconds of [-60, 0, 60, 899, 901]) {
      await owner.query(
        `INSERT INTO grafana_public.export_status VALUES
        (true, now() - interval '1 second' * $1)`,
        [seconds],
      );
      const measured = await age();
      if (seconds < 0) assert.equal(measured, null);
      else {
        assert.ok(measured >= seconds && measured < seconds + 10);
        assert.equal(measured >= 900, seconds === 901);
      }
      assert.equal(await unhealthy(), seconds < 0 || seconds > 900 ? 1 : 0);
      await owner.query('DELETE FROM grafana_public.export_status');
    }
    await owner.query(
      'INSERT INTO grafana_public.export_status VALUES (true,$1)',
      [now],
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
    assert.equal(await capturedAt(), now.toISOString());
    const recoveredAt = new Date('2099-11-10T21:00:00Z');
    await refreshExport(writer, snapshot, recoveredAt);
    assert.equal(await capturedAt(), recoveredAt.toISOString());
    const tables = await reader.query(`SELECT tablename FROM pg_tables
      WHERE schemaname NOT IN ('pg_catalog','information_schema') ORDER BY tablename`);
    assert.deepEqual(
      tables.rows.map((row) => row.tablename),
      [
        'export_status',
        'published_content',
        'published_editions',
        'source_summary',
      ],
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
    await Promise.all([
      owner.end(),
      reader.end(),
      writer.end(),
      sourceOwner.end(),
    ]);
    await Promise.all([container.stop(), sourceContainer.stop()]);
  }
});
