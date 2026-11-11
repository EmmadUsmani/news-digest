// Explicit installed-asset review. Operational requests are intercepted fixtures;
// only native UI documents/assets reach loopback. Never print queries or bodies.
import assert from 'node:assert/strict';

import { chromium } from 'playwright';

async function main() {
  assert.deepEqual(process.argv.slice(2), ['--live-assets']);
  const browser = await chromium.launch({ headless: true });
  try {
    for (const [name, origin, root] of [
      ['metrics', 'http://127.0.0.1:8428', '/metrics/vmui/'],
      ['logs', 'http://127.0.0.1:9428', '/logs/select/vmui/'],
    ]) {
      const context = await browser.newContext({ serviceWorkers: 'block' });
      const assets = new Set<string>();
      const failedAssets = new Set<string>();
      const intercepted = new Set<string>();
      const page = await context.newPage();
      page.on('response', (response) => {
        const path = new URL(response.url()).pathname;
        if (assets.has(path) && !response.ok()) failedAssets.add(path);
      });
      await context.route('**/*', async (route) => {
        const request = route.request();
        const url = new URL(request.url());
        const asset =
          url.pathname === root ||
          (url.pathname.startsWith(`${root}assets/`) &&
            /^[-a-zA-Z0-9_.]+$/.test(
              url.pathname.slice(`${root}assets/`.length),
            )) ||
          url.pathname === `${root}dashboards/index.js`;
        if (url.origin === origin && request.method() === 'GET' && asset) {
          assets.add(url.pathname);
          await route.continue();
          return;
        }
        // Exclude queries, bodies, headers and external hostnames from the report.
        intercepted.add(
          `${request.method()} ${url.origin === origin ? url.pathname : '[external]'}`,
        );
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            status: 'success',
            data: { resultType: 'matrix', result: [] },
            values: [],
            fields: [],
          }),
        });
      });
      await page.goto(
        origin + root + (name === 'metrics' ? '#/?g0.expr=up' : ''),
        { waitUntil: 'networkidle' },
      );
      assert.ok(await page.locator('button').count(), `${name}: UI mounted`);
      // Execute only the query control; every non-asset request remains intercepted.
      const execute = page.getByRole('button', { name: /execute( query)?/i });
      if (await execute.count()) {
        await execute.first().click();
        await page.waitForLoadState('networkidle');
      }
      const links = await page.locator('a[href]').evaluateAll((elements) =>
        elements.map((element) => {
          const url = new URL((element as HTMLAnchorElement).href);
          return url.origin === location.origin ? url.pathname : '[external]';
        }),
      );
      console.log(
        JSON.stringify({
          name,
          assets: [...assets].sort(),
          intercepted: [...intercepted].sort(),
          links: [...new Set(links)].sort(),
          fixtureData: true,
        }),
      );
      assert.ok(assets.size >= 5, `${name}: installed asset graph loaded`);
      assert.equal(
        failedAssets.size,
        0,
        `${name}: assets returned successfully`,
      );
      const expected =
        name === 'metrics'
          ? ['POST /metrics/prometheus/api/v1/query_range']
          : [
              'POST /logs/select/logsql/query',
              'POST /logs/select/logsql/hits',
              'POST /logs/select/logsql/stream_field_names',
            ];
      for (const request of expected)
        assert.ok(
          intercepted.has(request),
          `${name}: native query transport observed`,
        );
      await context.close();
    }
  } finally {
    await browser.close();
  }
}
main().catch(() => {
  console.error(
    'Native telemetry UI review failed; operational bodies withheld.',
  );
  process.exitCode = 1;
});
