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
    async function captureJobsTiming() {
      await page.goto(`${base}/d/nd-jobs?orgId=1&kiosk`, {
        waitUntil: 'networkidle',
      });
      await page.setViewportSize({ width: 390, height: 1000 });
      for (let attempt = 0; attempt < 18; attempt++) {
        if (
          await page
            .getByText('Latest completed run duration', { exact: true })
            .count()
        )
          break;
        await page.mouse.wheel(0, 500);
        await page.waitForTimeout(300);
      }
      await page
        .getByText('Latest completed run duration', { exact: true })
        .waitFor();
      await page
        .getByText('Latest completed run duration', { exact: true })
        .evaluate((element) => element.scrollIntoView({ block: 'start' }));
      await page.mouse.wheel(0, 500);
      await page.waitForTimeout(2500);
      assert.equal(
        await page
          .locator('[data-testid="data-testid Panel status error"]')
          .count(),
        0,
      );
      await page.screenshot({
        path: 'docs/screenshots/grafana-jobs-timing-mobile.png',
      });
    }
    for (const file of readdirSync(
      'ops/observability/grafana/dashboards',
    ).filter(
      (file) =>
        file.endsWith('.json') &&
        (!process.argv.includes('--grafana-database-only') ||
          file === 'nd-database.json') &&
        (!process.argv.includes('--grafana-jobs-only') ||
          file === 'nd-jobs.json') &&
        (!process.argv.includes('--grafana-agent-only') ||
          file === 'nd-agent.json'),
    )) {
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
        if (dashboard.uid === 'nd-agent') {
          if (![15, 16].includes(panel.id))
            assert.ok(result.data.result.length > 0, panel.title);
          else {
            assert.ok(result.data.result.length <= 1, panel.title);
            assert.equal(panel.fieldConfig.defaults.noValue, 'Unknown');
            assert.equal(panel.targets[0].instant, true);
          }
          for (const series of result.data.result)
            assert.ok(Number.isFinite(Number(series.value[1])), panel.title);
        }
        if (dashboard.uid === 'nd-database') {
          assert.ok(result.data.result.length > 0, panel.title);
          for (const series of result.data.result) {
            assert.equal(series.metric.datname, 'news_digest');
            assert.ok(Number.isFinite(Number(series.value[1])), panel.title);
            assert.ok(Number(series.value[1]) >= 0, panel.title);
          }
        }
        if (
          dashboard.uid === 'nd-jobs' &&
          panel.title === 'Next registered publication / social run'
        ) {
          const status = await (
            await fetch('http://127.0.0.1:8000/api/status')
          ).json();
          for (const queue of ['digest-generation', 'social-collection']) {
            const sample = result.data.result.find(
              (series: { metric: { queue: string } }) =>
                series.metric.queue === queue,
            );
            assert.ok(sample, `${queue}: missing next schedule`);
            const next = status.queues.find(
              (entry: { name: string }) => entry.name === queue,
            )?.nextRun;
            assert.equal(
              Number(sample.value[1]),
              Date.parse(next),
              `${queue}: dashboard/status schedule mismatch`,
            );
          }
        }
        if (dashboard.uid === 'nd-jobs' && [7, 8].includes(panel.id)) {
          const status = await (
            await fetch('http://127.0.0.1:8000/api/status')
          ).json();
          for (const sample of result.data.result) {
            const runs =
              status.queues.find(
                (q: { name: string }) => q.name === sample.metric.queue,
              )?.runs ?? [];
            const latest = runs
              .filter(
                (r: { state: string; finishedAt: string | null }) =>
                  r.state === 'completed' && r.finishedAt,
              )
              .sort((a: { finishedAt: string }, b: { finishedAt: string }) =>
                b.finishedAt.localeCompare(a.finishedAt),
              )[0];
            assert.ok(
              latest,
              'completed metric needs a retained completed job',
            );
            assert.equal(
              Number(sample.value[1]),
              panel.id === 7
                ? latest.durationMs / 1000
                : Date.parse(latest.finishedAt),
            );
          }
        }
        if (dashboard.uid === 'nd-agent' && panel.id <= 6) {
          assert.equal(result.data.result.length, 1, panel.title);
          const sample = result.data.result[0];
          const value = Number(sample.value[1]);
          assert.ok(Number.isFinite(value) && value >= 0, panel.title);
          if (panel.id === 6) {
            assert.ok(value < 120, 'Unit snapshot must be fresh');
          } else {
            assert.equal(sample.metric.unit, 'news-digest-agent.service');
            assert.equal(sample.metric.scope, 'user');
            if (panel.id === 1) assert.equal(value, 1);
          }
        }
        if (dashboard.uid === 'nd-product' && panel.id === 15) {
          assert.equal(
            result.data.result.length,
            4,
            'All four configured ceilings must be scraped',
          );
          const labels = result.data.result
            .map(
              (series: {
                metric: { provider: string; period: string };
                value: [number, string];
              }) => {
                assert.ok(
                  Number.isFinite(Number(series.value[1])) &&
                    Number(series.value[1]) >= 0,
                );
                return `${series.metric.provider}/${series.metric.period}`;
              },
            )
            .sort();
          assert.deepEqual(labels, [
            'anthropic/daily',
            'anthropic/monthly',
            'xai/daily',
            'xai/monthly',
          ]);
        }
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
        [
          'nd-host',
          'nd-services',
          'nd-jobs',
          'nd-runtime',
          'nd-redis',
        ].includes(dashboard.uid)
      )
        assert.equal(
          populated,
          dashboard.panels.length,
          `${dashboard.title}: missing live samples`,
        );
      await page.setViewportSize({
        width: 1440,
        height:
          dashboard.uid === 'nd-product'
            ? 4700
            : ['nd-runtime', 'nd-redis', 'nd-jobs'].includes(dashboard.uid)
              ? 2100
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
      await page.setViewportSize({
        width: 1440,
        height: ['nd-database', 'nd-agent'].includes(dashboard.uid)
          ? 3100
          : 1100,
      });
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
          'Articles (7d)',
          'AI story topics',
          'Charged ($)',
          'First admission (UTC)',
          'Last recorded outcome (UTC)',
          'Settled ledger span (s)',
          'Candidates',
          'Scored',
          'Unscored',
          'Reason',
          'Updated (UTC)',
          'Open overdue (min)',
          'X picks',
          'Bluesky picks',
          'Total picks',
        ]) {
          const column = page.getByRole('columnheader', { name, exact: true });
          await column.scrollIntoViewIfNeeded();
          await column.waitFor({ state: 'visible' });
        }
      }

      if (dashboard.uid === 'nd-database') {
        await page
          .getByRole('columnheader', { name: 'Connections', exact: true })
          .waitFor();
        await page.locator('canvas').first().waitFor({ state: 'visible' });
      }
      if (!['nd-product', 'nd-database'].includes(dashboard.uid))
        await page.locator('canvas').first().waitFor({ state: 'visible' });
      if (dashboard.uid === 'nd-runtime') {
        // A first canvas can paint while the other queries are still pending.
        await page
          .getByText('worker', { exact: true })
          .nth(10)
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
    if (process.argv.includes('--grafana-agent-only')) {
      await page.setViewportSize({ width: 390, height: 1000 });
      await page.goto(`${base}/d/nd-agent?kiosk`, { waitUntil: 'networkidle' });
      for (const title of [
        'Reported iteration',
        'Weekly quota used (last observation)',
        'Status reads successful',
        'Reported iteration start',
        'Observed completed iteration duration',
        'Reported next retry (UTC)',
      ]) {
        const heading = page.getByRole('heading', { name: title, exact: true });
        for (
          let attempt = 0;
          attempt < 20 && !(await heading.count());
          attempt++
        ) {
          await page.mouse.wheel(0, 400);
          await page.waitForTimeout(300);
        }
        await heading.scrollIntoViewIfNeeded();
        await heading.waitFor({ state: 'visible' });
      }
      assert.equal(
        await page
          .locator('[data-testid="data-testid Panel status error"]')
          .count(),
        0,
      );
      await page
        .getByRole('heading', {
          name: 'Observed completed iteration duration',
          exact: true,
        })
        .scrollIntoViewIfNeeded();
      await page.screenshot({
        path: 'docs/screenshots/grafana-agent-timing-mobile.png',
      });
      await page.evaluate(() => window.scrollTo(0, 0));
      await page.mouse.wheel(0, -10000);
      await page.waitForTimeout(500);
      await page
        .getByRole('heading', { name: 'Reported iteration', exact: true })
        .scrollIntoViewIfNeeded();
      await page.waitForTimeout(1500);
      await page.screenshot({
        path: 'docs/screenshots/grafana-nd-agent-mobile.png',
      });
      return {
        dashboards: checked,
        viewer: true,
        memoryMiB: Math.round(Number(fields.MemoryCurrent) / 1048576),
      };
    }
    if (process.argv.includes('--grafana-database-only')) {
      const stats = execFileSync(
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
          '-Atc',
          'SELECT count(*) > 0 AND bool_and(calls > 0 AND total_ms >= 0 AND mean_ms >= 0) FROM public.observability_query_stats()',
        ],
        { encoding: 'utf8' },
      ).trim();
      assert.equal(stats, 't');
      await page.setViewportSize({ width: 390, height: 1000 });
      await page.goto(`${base}/d/nd-database?kiosk`, {
        waitUntil: 'networkidle',
      });
      for (let attempt = 0; attempt < 20; attempt++) {
        if (
          await page
            .getByRole('heading', { name: 'Transaction rate', exact: true })
            .count()
        )
          break;
        await page.mouse.wheel(0, 450);
        await page.waitForTimeout(300);
      }
      await page
        .getByRole('heading', { name: 'Transaction rate', exact: true })
        .scrollIntoViewIfNeeded();
      await page.locator('canvas').first().waitFor({ state: 'visible' });
      assert.equal(
        await page
          .locator('[data-testid="data-testid Panel status error"]')
          .count(),
        0,
      );
      await page.screenshot({
        path: 'docs/screenshots/grafana-database-history-mobile.png',
      });
      for (let attempt = 0; attempt < 30; attempt++) {
        if (
          await page
            .getByRole('heading', {
              name: 'Top statements by total execution time',
              exact: true,
            })
            .count()
        )
          break;
        await page.mouse.wheel(0, 450);
        await page.waitForTimeout(300);
      }
      await page
        .getByRole('heading', {
          name: 'Top statements by total execution time',
          exact: true,
        })
        .scrollIntoViewIfNeeded();
      await page
        .getByRole('columnheader', { name: 'Statement ID', exact: true })
        .first()
        .waitFor();
      await page
        .getByRole('heading', {
          name: 'Top statements by total execution time',
          exact: true,
        })
        .evaluate((element) => element.scrollIntoView({ block: 'start' }));
      await page.screenshot({
        path: 'docs/screenshots/grafana-database-queries-mobile.png',
      });
      return {
        dashboards: checked,
        viewer: true,
        memoryMiB: Math.round(Number(fields.MemoryCurrent) / 1048576),
      };
    }
    if (process.argv.includes('--grafana-jobs-only')) {
      await captureJobsTiming();
      return {
        dashboards: checked,
        viewer: true,
        memoryMiB: Math.round(Number(fields.MemoryCurrent) / 1048576),
      };
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
    await page.evaluate(() => {
      for (const element of document.querySelectorAll<HTMLElement>('div')) {
        if (
          element.scrollWidth > element.clientWidth &&
          element.clientWidth > 200
        )
          element.scrollLeft = element.scrollWidth;
      }
    });
    for (const name of ['Pending', 'Uncertain', 'Oldest hold (h)'])
      await page
        .getByRole('columnheader', { name, exact: true })
        .waitFor({ state: 'visible' });
    await page.screenshot({
      path: 'docs/screenshots/grafana-product-holds-mobile.png',
    });
    const reserve = page.getByRole('heading', {
      name: 'Scheduled reserve lifecycle (latest seven days)',
      exact: true,
    });
    for (let attempt = 0; attempt < 12 && !(await reserve.count()); attempt++) {
      await page.mouse.wheel(0, 400);
      await page.waitForTimeout(300);
    }
    await reserve.scrollIntoViewIfNeeded();
    await reserve.evaluate((node) => node.scrollIntoView({ block: 'start' }));
    await page.evaluate(() => {
      for (const element of document.querySelectorAll<HTMLElement>('div')) {
        if (
          element.scrollWidth > element.clientWidth &&
          element.clientWidth > 200
        )
          element.scrollLeft = element.scrollWidth;
      }
    });
    // The mobile panel can mount its grid after its heading appears. Scroll
    // again after mounting so a newly created grid is not left at column zero.
    const overdue = page.getByRole('columnheader', {
      name: 'Open overdue (min)',
      exact: true,
    });
    for (let attempt = 0; attempt < 20; attempt++) {
      if (await overdue.isVisible()) break;
      await page.locator('.rdg').evaluateAll((grids) => {
        for (const grid of grids) grid.scrollLeft = grid.scrollWidth;
      });
      await page.waitForTimeout(300);
    }
    await overdue.waitFor({ state: 'visible' });
    await page.waitForTimeout(1500);
    await page.screenshot({
      path: 'docs/screenshots/grafana-product-reserve-mobile.png',
    });
    // Grafana virtualizes panels below the mobile viewport.
    for (let attempt = 0; attempt < 10; attempt++) {
      if (
        await page
          .getByRole('heading', {
            name: 'Source article coverage (24 hours and 7 days)',
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
        name: 'Source article coverage (24 hours and 7 days)',
        exact: true,
      })
      .scrollIntoViewIfNeeded();
    await page
      .getByRole('columnheader', { name: 'Articles (7d)', exact: true })
      .scrollIntoViewIfNeeded();
    await page
      .getByRole('heading', {
        name: 'Source article coverage (24 hours and 7 days)',
        exact: true,
      })
      .evaluate((node) => node.scrollIntoView({ block: 'start' }));
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
    await page.evaluate(() => {
      for (const element of document.querySelectorAll<HTMLElement>('div')) {
        if (
          element.scrollWidth > element.clientWidth &&
          element.clientWidth > 200
        )
          element.scrollLeft = element.scrollWidth;
      }
    });
    await page
      .getByRole('columnheader', {
        name: 'Settled ledger span (s)',
        exact: true,
      })
      .scrollIntoViewIfNeeded();
    await page.waitForTimeout(300);
    await page.screenshot({
      path: 'docs/screenshots/grafana-product-cost-mobile.png',
    });
    for (let attempt = 0; attempt < 12; attempt++) {
      if (
        await page
          .getByRole('heading', {
            name: 'Edition worker mean duration (since worker start)',
            exact: true,
          })
          .count()
      )
        break;
      await page.mouse.wheel(0, 500);
      await page.waitForTimeout(300);
    }
    const timing = page.locator(
      '[data-testid="data-testid Panel header Edition worker mean duration (since worker start)"]',
    );
    await page
      .getByRole('heading', {
        name: 'Edition worker mean duration (since worker start)',
        exact: true,
      })
      .scrollIntoViewIfNeeded();
    await page.waitForTimeout(1500);
    assert.equal(
      await page
        .locator('[data-testid="data-testid Panel status error"]')
        .count(),
      0,
    );
    await timing.waitFor({ state: 'visible' });
    await timing.evaluate((node) => node.scrollIntoView({ block: 'start' }));
    await page.waitForTimeout(1000);
    await page.screenshot({
      path: 'docs/screenshots/grafana-product-timing-mobile.png',
    });
    for (let attempt = 0; attempt < 12; attempt++) {
      if (
        await page
          .getByRole('heading', {
            name: 'Edition selection coverage (latest seven editions)',
            exact: true,
          })
          .count()
      )
        break;
      await page.mouse.wheel(0, 500);
      await page.waitForTimeout(300);
    }
    const selection = page.getByRole('heading', {
      name: 'Edition selection coverage (latest seven editions)',
      exact: true,
    });
    await selection.scrollIntoViewIfNeeded();
    await selection.evaluate((node) => node.scrollIntoView({ block: 'start' }));
    await page.evaluate(() => {
      for (const element of document.querySelectorAll<HTMLElement>('div')) {
        if (
          element.scrollWidth > element.clientWidth &&
          element.clientWidth > 200
        )
          element.scrollLeft = 500;
      }
    });
    await page.waitForTimeout(1500);
    assert.equal(
      await page
        .locator('[data-testid="data-testid Panel status error"]')
        .count(),
      0,
    );
    await page.screenshot({
      path: 'docs/screenshots/grafana-product-selection-mobile.png',
    });
    await page.goto(`${base}/d/nd-product?kiosk&viewPanel=panel-13`, {
      waitUntil: 'networkidle',
    });
    await page
      .getByRole('heading', {
        name: 'Recent X discovery calls (latest 30 in seven days)',
        exact: true,
      })
      .waitFor();
    await page
      .getByRole('columnheader', { name: 'Requested topic', exact: true })
      .waitFor();
    assert.equal(
      await page
        .locator('[data-testid="data-testid Panel status error"]')
        .count(),
      0,
    );
    await page.screenshot({
      path: 'docs/screenshots/grafana-product-x-calls-mobile.png',
    });
    await page.setViewportSize({ width: 1800, height: 1100 });
    await page
      .getByRole('columnheader', { name: 'Profiles fetched', exact: true })
      .waitFor();
    await page.screenshot({
      path: 'docs/screenshots/grafana-product-x-calls-desktop.png',
    });
    await page.goto(`${base}/d/nd-product?kiosk&viewPanel=panel-14`, {
      waitUntil: 'networkidle',
    });
    await page
      .getByRole('heading', {
        name: 'Recent Anthropic calls (latest 30 in seven days)',
        exact: true,
      })
      .scrollIntoViewIfNeeded();
    await page.waitForTimeout(1500);
    await page
      .getByRole('columnheader', { name: 'Ledger elapsed (s)', exact: true })
      .waitFor();
    await page.screenshot({
      path: 'docs/screenshots/grafana-product-anthropic-calls-desktop.png',
    });
    await page.setViewportSize({ width: 390, height: 844 });
    await page
      .getByRole('heading', {
        name: 'Recent Anthropic calls (latest 30 in seven days)',
        exact: true,
      })
      .evaluate((node) => node.scrollIntoView({ block: 'start' }));
    // The grid virtualizes columns: scroll before locating offscreen headers.
    await page.locator('.rdg').evaluate((node) => {
      node.scrollLeft = 800;
    });
    await page
      .getByRole('columnheader', { name: 'Ledger elapsed (s)', exact: true })
      .waitFor();
    await page.waitForTimeout(1000);
    await page.screenshot({
      path: 'docs/screenshots/grafana-product-anthropic-calls-mobile.png',
    });
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(`${base}/d/nd-product?kiosk&viewPanel=panel-15`, {
      waitUntil: 'networkidle',
    });
    await page
      .getByRole('heading', {
        name: 'Configured provider ceilings (USD)',
        exact: true,
      })
      .scrollIntoViewIfNeeded();
    for (const legend of [
      'anthropic daily',
      'anthropic monthly',
      'xai daily',
      'xai monthly',
    ])
      await page.getByText(legend, { exact: true }).first().waitFor();
    await page.waitForTimeout(1500);
    await page.screenshot({
      path: 'docs/screenshots/grafana-product-caps-mobile.png',
    });
    await page.setViewportSize({ width: 1440, height: 1100 });
    await page.waitForTimeout(1000);
    await page.screenshot({
      path: 'docs/screenshots/grafana-product-caps-desktop.png',
    });
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(`${base}/d/nd-product?kiosk&viewPanel=panel-16`, {
      waitUntil: 'networkidle',
    });
    await page
      .getByRole('heading', {
        name: 'Selected social platforms by topic (latest seven editions)',
        exact: true,
      })
      .waitFor();
    const platformTotal = page.getByRole('columnheader', {
      name: 'Total picks',
      exact: true,
    });
    for (let attempt = 0; attempt < 20; attempt++) {
      if (await platformTotal.isVisible()) break;
      await page.locator('.rdg').evaluateAll((grids) => {
        for (const grid of grids) grid.scrollLeft = grid.scrollWidth;
      });
      await page.waitForTimeout(300);
    }
    await platformTotal.waitFor({ state: 'visible' });
    await page.waitForTimeout(1500);
    await page.screenshot({
      path: 'docs/screenshots/grafana-product-platforms-mobile.png',
    });
    await page.setViewportSize({ width: 1440, height: 1100 });
    await page
      .getByRole('columnheader', { name: 'Total picks', exact: true })
      .waitFor();
    assert.equal(
      await page
        .locator('[data-testid="data-testid Panel status error"]')
        .count(),
      0,
    );
    await page.screenshot({
      path: 'docs/screenshots/grafana-product-platforms-desktop.png',
    });
    await page.setViewportSize({ width: 390, height: 844 });
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
    await page.goto(`${base}/d/nd-redis?kiosk`, { waitUntil: 'networkidle' });
    await page
      .getByRole('heading', { name: 'Redis available', exact: true })
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
      path: 'docs/screenshots/grafana-redis-mobile.png',
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
    for (let attempt = 0; attempt < 22; attempt++) {
      if (
        await page
          .getByRole('heading', { name: 'Event-loop delay p99', exact: true })
          .count()
      )
        break;
      await page.mouse.wheel(0, 500);
      await page.waitForTimeout(300);
    }
    const delayPanel = page.getByRole('region', {
      name: 'Event-loop delay p99',
    });
    await page
      .getByRole('heading', { name: 'Event-loop delay p99', exact: true })
      .scrollIntoViewIfNeeded();
    await delayPanel
      .getByText('worker', { exact: true })
      .waitFor({ state: 'visible' });
    await delayPanel.evaluate((panel) =>
      panel.scrollIntoView({ block: 'start' }),
    );
    await page.waitForTimeout(1500);
    assert.equal(
      await page
        .locator('[data-testid="data-testid Panel status error"]')
        .count(),
      0,
    );
    await page.screenshot({
      path: 'docs/screenshots/grafana-runtime-delay-mobile.png',
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
    await page.goto(`${base}/d/nd-agent?kiosk`, { waitUntil: 'networkidle' });
    await page
      .getByRole('heading', { name: 'Supervisor active', exact: true })
      .waitFor();
    await page.locator('canvas').first().waitFor({ state: 'visible' });
    assert.equal(
      await page
        .locator('[data-testid="data-testid Panel status error"]')
        .count(),
      0,
    );
    await page.screenshot({
      path: 'docs/screenshots/grafana-agent-mobile.png',
    });
    await captureJobsTiming();
  } finally {
    await browser.close();
  }
  return {
    dashboards: checked,
    viewer: true,
    memoryMiB: Math.round(Number(fields.MemoryCurrent) / 1048576),
  };
}
