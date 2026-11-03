import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { readdirSync, readFileSync } from 'node:fs';

import { chromium } from 'playwright';

// Read-only: only query provisioned dashboards and metrics. No content jobs.
export async function checkGrafana() {
  const base = 'http://127.0.0.1:8000/grafana';
  // First-start SQLite migrations are slow under the deliberately small CPU quota.
  let ready = false;
  for (let attempt = 0; attempt < 150; attempt++) {
    const health = await fetch(`${base}/api/health`, {
      signal: AbortSignal.timeout(5000),
    }).catch(() => undefined);
    if (health?.status === 200) {
      assert.equal((await health.json()).database, 'ok');
      ready = true;
      break;
    }
    if (health) await health.text();
    await new Promise((resolve) => setTimeout(resolve, 2000));
  }
  assert.ok(ready, 'Grafana must become healthy within five minutes');
  const permissionsResponse = await fetch(
    `${base}/api/access-control/user/permissions`,
  );
  assert.equal(permissionsResponse.status, 200);
  const permissions = await permissionsResponse.json();
  assert.ok(permissions['dashboards:read']);
  assert.ok(permissions['datasources:query']);
  assert.equal(permissions['dashboards:write'], undefined);
  assert.equal(permissions['datasources:write'], undefined);
  assert.equal(permissions['org.users:write'], undefined);
  const sources = await (await fetch(`${base}/api/datasources`)).json();
  assert.equal(sources.length, 2);
  for (const uid of ['local-metrics', 'product-postgres'])
    assert.equal(
      sources.find((source: { uid: string }) => source.uid === uid)?.readOnly,
      true,
    );
  // Verify the actual login has no write grants or role memberships. These
  // statements inspect privileges and provoke denied reads, never mutate data.
  const grants = execFileSync(
    'docker',
    [
      'compose',
      'exec',
      '-T',
      'postgres',
      'psql',
      '-U',
      'grafana_product',
      '-d',
      'news_digest',
      '-At',
      '-v',
      'ON_ERROR_STOP=1',
      '-c',
      `SELECT current_setting('default_transaction_read_only') = 'on'
      AND current_setting('statement_timeout') = '5s'
      AND (SELECT rolconnlimit = 3 FROM pg_roles WHERE rolname=current_user)
      AND NOT EXISTS (SELECT FROM pg_roles WHERE rolname=current_user AND
        (rolsuper OR rolcreatedb OR rolcreaterole OR rolreplication OR rolbypassrls))
      AND NOT EXISTS (SELECT FROM pg_auth_members WHERE member=(SELECT oid FROM pg_roles WHERE rolname=current_user))
      AND NOT EXISTS (SELECT FROM pg_tables WHERE schemaname='public' AND
        (has_table_privilege(current_user, schemaname||'.'||tablename, 'INSERT,UPDATE,DELETE,TRUNCATE,TRIGGER')
         OR has_any_column_privilege(current_user, schemaname||'.'||tablename, 'INSERT,UPDATE')))
      AND NOT has_schema_privilege(current_user, 'public', 'CREATE');`,
    ],
    { encoding: 'utf8' },
  ).trim();
  assert.equal(
    grants,
    't',
    'Product role must have no write/elevated privileges',
  );
  for (const query of [
    'SELECT * FROM llm_cache LIMIT 0',
    'SELECT excerpt FROM content_items LIMIT 0',
  ]) {
    assert.throws(
      () =>
        execFileSync(
          'docker',
          [
            'compose',
            'exec',
            '-T',
            'postgres',
            'psql',
            '-U',
            'grafana_product',
            '-d',
            'news_digest',
            '-v',
            'ON_ERROR_STOP=1',
            '-c',
            query,
          ],
          { stdio: 'pipe' },
        ),
      /Command failed/,
    );
  }
  async function productQuery(rawSql: string) {
    const response = await fetch(`${base}/api/ds/query`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        from: String(Date.now() - 86400000),
        to: String(Date.now()),
        queries: [
          {
            refId: 'A',
            datasource: {
              uid: 'product-postgres',
              type: 'grafana-postgresql-datasource',
            },
            rawSql,
            format: 'table',
            rawQuery: true,
            intervalMs: 300000,
            maxDataPoints: 100,
          },
        ],
      }),
    });
    assert.equal(response.status, 200, rawSql);
    const result = (await response.json()).results.A;
    assert.equal(result.error, undefined, rawSql);
    assert.ok(result.frames?.length, rawSql);
    return result.frames.some((frame: { data: { values: unknown[][] } }) =>
      frame.data.values.some((values) => values.length > 0),
    );
  }
  const unit = execFileSync(
    'systemctl',
    [
      'show',
      'obs-grafana',
      '-p',
      'ActiveState',
      '-p',
      'MemoryCurrent',
      '-p',
      'MemoryMax',
    ],
    { encoding: 'utf8' },
  );
  const fields = Object.fromEntries(
    unit
      .trim()
      .split('\n')
      .map((line) => line.split('=')),
  );
  assert.equal(fields.ActiveState, 'active');
  assert.equal(Number(fields.MemoryMax), 256 * 1024 * 1024);
  assert.ok(Number(fields.MemoryCurrent) < Number(fields.MemoryMax));
  const browser = await chromium.launch({ headless: true });
  const checked: { uid: string; panels: number; populated: number }[] = [];
  try {
    const page = await browser.newPage({
      viewport: { width: 1440, height: 1100 },
    });
    for (const file of readdirSync(
      'ops/observability/grafana/dashboards',
    ).filter((file) => file.endsWith('.json'))) {
      const dashboard = JSON.parse(
        readFileSync(`ops/observability/grafana/dashboards/${file}`, 'utf8'),
      );
      const provisioned = await (
        await fetch(`${base}/api/dashboards/uid/${dashboard.uid}`)
      ).json();
      assert.equal(provisioned.meta.provisioned, true);
      assert.deepEqual(provisioned.dashboard.panels, dashboard.panels);
      let populated = 0;
      for (const panel of dashboard.panels) {
        if (panel.datasource.uid === 'product-postgres') {
          const hasRows = await productQuery(panel.targets[0].rawSql);
          if (hasRows) populated++;
          if (!panel.title.startsWith('X citation'))
            assert.ok(
              hasRows,
              `${panel.title}: missing retained product evidence`,
            );
          continue;
        }
        const expression = panel.targets[0].expr;
        const response = await fetch(
          `${base}/api/datasources/proxy/uid/local-metrics/api/v1/query?${new URLSearchParams({ query: expression })}`,
        );
        assert.equal(response.status, 200, panel.title);
        const result = await response.json();
        assert.equal(result.status, 'success', panel.title);
        if (result.data.result.length > 0) populated++;
        if (dashboard.uid === 'nd-runtime') {
          const services = new Set(
            result.data.result.map(
              (series: { metric: { service?: string } }) =>
                series.metric.service,
            ),
          );
          for (const service of ['api', 'worker'])
            assert.ok(
              services.has(service),
              `${panel.title}: missing ${service} samples`,
            );
        }
      }
      assert.ok(populated > 0, `${dashboard.title}: all panels empty`);
      if (dashboard.uid === 'nd-errors') {
        // Retained queue/unit gauges exist even when no failures were observed.
        for (const title of [
          'Retained failed jobs',
          'Unit restarts since activation',
          'Inactive units',
        ]) {
          const panel = dashboard.panels.find(
            (candidate: { title: string }) => candidate.title === title,
          );
          assert.ok(panel, title);
          const result = await (
            await fetch(
              `${base}/api/datasources/proxy/uid/local-metrics/api/v1/query?${new URLSearchParams({ query: panel.targets[0].expr })}`,
            )
          ).json();
          assert.ok(
            result.data.result.length > 0,
            `${title}: missing live gauges`,
          );
        }
      }
      if (
        ['nd-host', 'nd-services', 'nd-jobs', 'nd-runtime'].includes(
          dashboard.uid,
        )
      )
        assert.equal(
          populated,
          dashboard.panels.length,
          `${dashboard.title}: missing live samples`,
        );
      await page.setViewportSize({
        width: 1440,
        height: ['nd-product', 'nd-runtime'].includes(dashboard.uid)
          ? 1800
          : 1100,
      });
      const errors: string[] = [];
      page.on('response', (response) => {
        if (
          response.url().includes('/api/ds/query') &&
          response.status() >= 400
        )
          errors.push(`Panel query HTTP ${response.status()}`);
      });
      const listener = (error: Error) => errors.push(error.message);
      page.on('pageerror', listener);
      await page.goto(`${base}/d/${dashboard.uid}?kiosk`, {
        waitUntil: 'networkidle',
        timeout: 60_000,
      });
      for (const panel of dashboard.panels)
        await page
          .getByRole('heading', { name: panel.title, exact: true })
          .waitFor();
      assert.equal(await page.getByText('Panel plugin not found').count(), 0);
      assert.equal(
        await page
          .locator('[data-testid="data-testid Panel status error"]')
          .count(),
        0,
      );
      assert.deepEqual(errors, []);
      if (dashboard.uid === 'nd-product') {
        for (const name of [
          'Articles (24h)',
          'AI story topics',
          'Charged ($)',
        ]) {
          const column = page.getByRole('columnheader', { name, exact: true });
          await column.scrollIntoViewIfNeeded();
          await column.waitFor({ state: 'visible' });
        }
      }

      if (!['nd-product', 'nd-database'].includes(dashboard.uid))
        await page.locator('canvas').first().waitFor({ state: 'visible' });
      if (dashboard.uid === 'nd-runtime') {
        // A first canvas can paint while the other queries are still pending.
        await page
          .getByText('worker', { exact: true })
          .nth(8)
          .waitFor({ state: 'visible' });
        await page
          .getByText('worker minor', { exact: true })
          .waitFor({ state: 'visible' });
      }
      await page.screenshot({
        path: `docs/screenshots/grafana-${dashboard.uid}-desktop.png`,
        fullPage: true,
      });
      page.off('pageerror', listener);
      checked.push({
        uid: dashboard.uid,
        panels: dashboard.panels.length,
        populated,
      });
    }
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(`${base}/d/nd-product?kiosk`, { waitUntil: 'networkidle' });
    await page
      .getByRole('heading', {
        name: 'Provider spend and outstanding holds (UTC)',
        exact: true,
      })
      .waitFor();
    await page.waitForTimeout(1500);
    assert.equal(
      await page
        .locator('[data-testid="data-testid Panel status error"]')
        .count(),
      0,
    );
    await page.screenshot({
      path: 'docs/screenshots/grafana-product-mobile.png',
    });
    // Grafana virtualizes panels below the mobile viewport.
    for (let attempt = 0; attempt < 10; attempt++) {
      if (
        await page
          .getByRole('heading', {
            name: 'Source article coverage (rolling 24 hours)',
            exact: true,
          })
          .count()
      )
        break;
      await page.mouse.wheel(0, 500);
      await page.waitForTimeout(300);
    }
    await page
      .getByRole('heading', {
        name: 'Source article coverage (rolling 24 hours)',
        exact: true,
      })
      .scrollIntoViewIfNeeded();
    await page.waitForTimeout(1500);
    await page.screenshot({
      path: 'docs/screenshots/grafana-product-coverage-mobile.png',
    });
    for (let attempt = 0; attempt < 12; attempt++) {
      if (
        await page
          .getByRole('heading', {
            name: 'AI ledger by edition (latest seven)',
            exact: true,
          })
          .count()
      )
        break;
      await page.mouse.wheel(0, 500);
      await page.waitForTimeout(300);
    }
    await page
      .getByRole('heading', {
        name: 'AI ledger by edition (latest seven)',
        exact: true,
      })
      .scrollIntoViewIfNeeded();
    // Mobile table columns are horizontally virtualized by Grafana.
    await page.waitForTimeout(1500);
    await page.screenshot({
      path: 'docs/screenshots/grafana-product-cost-mobile.png',
    });
    await page.goto(`${base}/d/nd-database?kiosk`, {
      waitUntil: 'networkidle',
    });
    await page
      .getByRole('heading', {
        name: 'Database activity since statistics reset',
        exact: true,
      })
      .waitFor();
    await page.waitForTimeout(1500);
    assert.equal(
      await page
        .locator('[data-testid="data-testid Panel status error"]')
        .count(),
      0,
    );
    await page.screenshot({
      path: 'docs/screenshots/grafana-database-mobile.png',
    });
    await page.goto(`${base}/d/nd-host?kiosk`, { waitUntil: 'networkidle' });
    await page
      .getByRole('heading', { name: 'CPU used', exact: true })
      .waitFor();
    await page
      .getByRole('heading', { name: 'CPU used', exact: true })
      .scrollIntoViewIfNeeded();
    await page.locator('canvas').first().waitFor({ state: 'visible' });
    // Allow canvas painting after responsive layout; avoid full-page capture
    // which can unmount virtualized panels when Grafana recalculates its viewport.
    await page.waitForTimeout(1500);
    await page.screenshot({
      path: 'docs/screenshots/grafana-host-mobile.png',
    });
    await page.goto(`${base}/d/nd-runtime?kiosk`, { waitUntil: 'networkidle' });
    await page
      .getByRole('heading', { name: 'Resident memory', exact: true })
      .waitFor();
    await page.locator('canvas').first().waitFor({ state: 'visible' });
    await page.waitForTimeout(1500);
    assert.equal(
      await page
        .locator('[data-testid="data-testid Panel status error"]')
        .count(),
      0,
    );
    await page.screenshot({
      path: 'docs/screenshots/grafana-runtime-mobile.png',
    });
    // Runtime panels below the mobile viewport are virtualized.
    for (let attempt = 0; attempt < 22; attempt++) {
      if (
        await page
          .getByRole('heading', { name: 'Process CPU (one core)', exact: true })
          .count()
      )
        break;
      await page.mouse.wheel(0, 500);
      await page.waitForTimeout(300);
    }
    await page
      .getByRole('heading', { name: 'Process CPU (one core)', exact: true })
      .scrollIntoViewIfNeeded();
    await page.waitForTimeout(1500);
    assert.equal(
      await page
        .locator('[data-testid="data-testid Panel status error"]')
        .count(),
      0,
    );
    await page.screenshot({
      path: 'docs/screenshots/grafana-runtime-work-mobile.png',
    });
    await page.goto(`${base}/d/nd-errors?kiosk`, { waitUntil: 'networkidle' });
    await page
      .getByRole('heading', { name: 'API 5xx per second', exact: true })
      .waitFor();
    await page.waitForTimeout(1500);
    assert.equal(
      await page
        .locator('[data-testid="data-testid Panel status error"]')
        .count(),
      0,
    );
    await page.screenshot({
      path: 'docs/screenshots/grafana-errors-mobile.png',
    });
  } finally {
    await browser.close();
  }
  return {
    dashboards: checked,
    viewer: true,
    memoryMiB: Math.round(Number(fields.MemoryCurrent) / 1048576),
  };
}
