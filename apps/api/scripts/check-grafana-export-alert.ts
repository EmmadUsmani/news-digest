// Explicit disposable runtime rehearsal; never uses live data or live Grafana.
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { once } from 'node:events';
import {
  access,
  mkdir,
  mkdtemp,
  readFile,
  rm,
  writeFile,
} from 'node:fs/promises';
import { createServer } from 'node:net';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { setTimeout } from 'node:timers/promises';

import { Pool } from 'pg';
import { GenericContainer, Wait } from 'testcontainers';

import { markIntegrationTemp } from '../../../scripts/lib/integration-temp';

async function main() {
  const scheduled = process.argv.includes('--scheduled');
  assert.ok(process.argv.slice(2).every((arg) => arg === '--scheduled'));
  const home = '/opt/news-digest-observability/grafana';
  await access(join(home, 'bin/grafana'));
  const root = await mkdtemp(join(tmpdir(), 'news-digest-integration-'));
  markIntegrationTemp(root);
  const container = await new GenericContainer('postgres:17-alpine')
    .withEnvironment({ POSTGRES_PASSWORD: 'synthetic-owner-password' })
    .withTmpFs({ '/var/lib/postgresql/data': 'rw' })
    .withExposedPorts(5432)
    .withWaitStrategy(
      Wait.forLogMessage('database system is ready to accept connections', 2),
    )
    .start()
    .catch(async (error: unknown) => {
      await rm(root, { recursive: true, force: true });
      throw error;
    });
  const pool = new Pool({
    host: container.getHost(),
    port: container.getMappedPort(5432),
    user: 'postgres',
    password: 'synthetic-owner-password',
    database: 'postgres',
  });
  let grafana: ReturnType<typeof spawn> | undefined;
  try {
    await pool.query(
      await readFile(
        'ops/observability/grafana/prepared/export-storage.sql',
        'utf8',
      ),
    );
    await pool.query(
      "ALTER ROLE grafana_export_reader PASSWORD 'synthetic-reader-password'",
    );
    const listener = createServer();
    listener.listen(0, '127.0.0.1');
    await once(listener, 'listening');
    const address = listener.address();
    assert.ok(address && typeof address !== 'string');
    const port = address.port;
    await new Promise<void>((resolve, reject) =>
      listener.close((error) => (error ? reject(error) : resolve())),
    );
    const provisioning = join(root, 'provisioning');
    await mkdir(join(provisioning, 'datasources'), { recursive: true });
    await mkdir(join(provisioning, 'alerting'), { recursive: true });
    const alert = JSON.parse(
      await readFile(
        'ops/observability/grafana/prepared/export-freshness-alert.json',
        'utf8',
      ),
    );
    await writeFile(
      join(provisioning, 'alerting', 'freshness.json'),
      JSON.stringify(alert),
    );
    await writeFile(
      join(provisioning, 'datasources', 'export.yaml'),
      JSON.stringify({
        apiVersion: 1,
        datasources: [
          {
            name: 'Disposable export',
            uid: 'public-product-postgres',
            type: 'grafana-postgresql-datasource',
            access: 'proxy',
            url: `${container.getHost()}:${container.getMappedPort(5432)}`,
            user: 'grafana_export_reader',
            jsonData: {
              database: 'postgres',
              sslmode: 'disable',
              postgresVersion: 1700,
              maxOpenConns: 2,
            },
            secureJsonData: { password: 'synthetic-reader-password' },
          },
        ],
      }),
    );
    grafana = spawn(join(home, 'bin/grafana'), ['server', '--homepath', home], {
      stdio: 'ignore',
      env: {
        PATH: process.env.PATH,
        HOME: root,
        GF_PATHS_DATA: join(root, 'data'),
        GF_PATHS_LOGS: join(root, 'logs'),
        GF_PATHS_PLUGINS: join(root, 'plugins'),
        GF_PATHS_PROVISIONING: provisioning,
        GF_SERVER_HTTP_ADDR: '127.0.0.1',
        GF_SERVER_HTTP_PORT: String(port),
        GF_SECURITY_ADMIN_USER: 'rehearsal',
        GF_SECURITY_ADMIN_PASSWORD: 'synthetic-admin-password',
        GF_ANALYTICS_REPORTING_ENABLED: 'false',
        GF_ANALYTICS_CHECK_FOR_UPDATES: 'false',
        GF_PLUGINS_CHECK_FOR_UPDATES: 'false',
        GF_UNIFIED_ALERTING_EXECUTE_ALERTS: String(scheduled),
        GF_SMTP_ENABLED: 'false',
      },
    });
    const request = async (path: string, body?: unknown) => {
      const response = await fetch(`http://127.0.0.1:${port}${path}`, {
        method: body ? 'POST' : 'GET',
        headers: {
          Authorization: `Basic ${Buffer.from('rehearsal:synthetic-admin-password').toString('base64')}`,
          'Content-Type': 'application/json',
        },
        ...(body ? { body: JSON.stringify(body) } : {}),
        signal: AbortSignal.timeout(10000),
      });
      assert.equal(
        response.status,
        200,
        `${path}: ${(await response.clone().text()).slice(0, 1500)}`,
      );
      return response.json();
    };
    let ready = false;
    for (let attempt = 0; attempt < 90; attempt++) {
      assert.equal(grafana.exitCode, null, 'Disposable Grafana exited');
      try {
        await request('/api/health');
        ready = true;
        break;
      } catch {
        await setTimeout(1000);
      }
    }
    assert.ok(ready, 'Disposable Grafana readiness deadline');
    const rule = await request(
      '/api/v1/provisioning/alert-rules/nd-public-export-freshness',
    );
    assert.equal(rule.condition, 'B');
    assert.equal(rule.for, '5m');
    assert.equal(rule.noDataState, 'Alerting');
    assert.equal(rule.execErrState, 'Alerting');
    for (const [index, query] of rule.data.entries()) {
      const { queryType: _queryType, model, ...rest } = query;
      const {
        intervalMs: _intervalMs,
        maxDataPoints: _maxDataPoints,
        ...originalModel
      } = model;
      assert.deepEqual(
        { ...rest, model: originalModel },
        alert.groups[0].rules[0].data[index],
      );
    }
    const evaluate = async () => {
      const result = await request('/api/ds/query', {
        from: String(Date.now() - 600000),
        to: String(Date.now()),
        queries: rule.data.map(
          (query: { model: object; datasourceUid: string; refId: string }) => ({
            ...query.model,
            refId: query.refId,
            datasource: {
              uid: query.datasourceUid,
              type:
                query.datasourceUid === '__expr__'
                  ? '__expr__'
                  : 'grafana-postgresql-datasource',
            },
          }),
        ),
      });
      assert.equal(result.results.A.error, undefined);
      assert.equal(result.results.B.error, undefined);
      return result.results.B.frames[0].data.values.flat().at(-1);
    };
    for (const [label, offset, expected] of [
      ['missing', null, 1],
      ['future', 60, 1],
      ['fresh', -30, 0],
      ['stale', -960, 1],
      ['recovery', -1, 0],
    ] as const) {
      await pool.query('DELETE FROM grafana_public.export_status');
      if (offset !== null)
        await pool.query(
          "INSERT INTO grafana_public.export_status VALUES (true,now()+$1 * interval '1 second')",
          [offset],
        );
      assert.equal(await evaluate(), expected, label);
      console.log(`${label}: provisioned Grafana SQL/expression pass`);
    }
    if (scheduled) {
      const waitForState = async (expected: string, timeoutMs = 150000) => {
        const deadline = Date.now() + timeoutMs;
        while (Date.now() < deadline) {
          const result = await request('/api/prometheus/grafana/api/v1/rules');
          const current = result.data.groups
            .flatMap(
              (group: {
                rules: { name: string; state: string; health: string }[];
              }) => group.rules,
            )
            .find(
              (candidate: { name: string }) => candidate.name === rule.title,
            );
          if (current?.state === expected) {
            console.log(
              `scheduled ${expected}: pass (health=${current.health})`,
            );
            return current;
          }
          await setTimeout(5000);
        }
        assert.fail(
          `Scheduled alert did not reach ${expected} within ${timeoutMs}ms`,
        );
      };
      // Use the exact production interval and pending duration, without shortening either.
      await waitForState('inactive');
      await pool.query('DELETE FROM grafana_public.export_status');
      await waitForState('pending');
      const pendingAt = Date.now();
      await waitForState('firing', 390000);
      assert.ok(
        Date.now() - pendingAt >= 280000,
        'Five-minute pending period preserved',
      );
      await pool.query(
        'INSERT INTO grafana_public.export_status VALUES (true, now())',
      );
      await waitForState('inactive');
      await pool.query(
        'REVOKE SELECT ON grafana_public.export_status FROM grafana_export_reader',
      );
      const queryPending = await waitForState('pending');
      assert.equal(queryPending.health, 'error', 'Query error enters pending');
      const failed = await waitForState('firing', 390000);
      assert.equal(failed.health, 'error', 'Query error enters Alerting');
      await pool.query(
        'GRANT SELECT ON grafana_public.export_status TO grafana_export_reader',
      );
      await waitForState('inactive');
      console.log(
        'Exact scheduled pending/firing, query-error and recovery transitions pass.',
      );
    } else {
      console.log(
        'Disposable provisioning and query evaluation pass; use --scheduled for state transitions.',
      );
    }
  } finally {
    if (grafana && grafana.exitCode === null) {
      grafana.kill('SIGTERM');
      await once(grafana, 'exit');
    }
    await pool.end();
    await container.stop();
    await rm(root, { recursive: true, force: true });
  }
}
void main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
