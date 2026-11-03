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
  assert.equal(sources.length, 1);
  assert.equal(sources[0].uid, 'local-metrics');
  assert.equal(sources[0].readOnly, true);
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
        const expression = panel.targets[0].expr;
        const response = await fetch(
          `${base}/api/datasources/proxy/uid/local-metrics/api/v1/query?${new URLSearchParams({ query: expression })}`,
        );
        assert.equal(response.status, 200, panel.title);
        const result = await response.json();
        assert.equal(result.status, 'success', panel.title);
        if (result.data.result.length > 0) populated++;
      }
      assert.ok(populated > 0, `${dashboard.title}: all panels empty`);
      if (['nd-host', 'nd-services', 'nd-jobs'].includes(dashboard.uid))
        assert.equal(
          populated,
          dashboard.panels.length,
          `${dashboard.title}: missing live samples`,
        );
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
      await page.locator('canvas').first().waitFor({ state: 'visible' });
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
  } finally {
    await browser.close();
  }
  return {
    dashboards: checked,
    viewer: true,
    memoryMiB: Math.round(Number(fields.MemoryCurrent) / 1048576),
  };
}
