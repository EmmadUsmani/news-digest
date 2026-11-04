// Read-only: inspect provisioned dashboard and retained logs; never issue slow SQL.
import assert from 'node:assert/strict';

import { chromium } from 'playwright';

async function main() {
  const base = 'http://127.0.0.1:8000';
  const browser = await chromium.launch();
  try {
    for (const [name, width, height] of [
      ['desktop', 1440, 1000],
      ['mobile', 390, 844],
    ] as const) {
      const page = await browser.newPage({ viewport: { width, height } });
      const errors: string[] = [];
      page.on('pageerror', (error) => errors.push(error.message));
      await page.goto(`${base}/grafana/d/nd-database?kiosk&viewPanel=22`);
      const link = page.getByRole('link', {
        name: 'Open duration-only slow calls from the last 24 hours',
      });
      await link.scrollIntoViewIfNeeded();
      await link.waitFor({ state: 'visible' });
      await page.screenshot({
        path: `docs/screenshots/grafana-database-slow-${name}.png`,
      });
      const target = await link.getAttribute('href');
      assert.ok(target?.startsWith('/logs/select/vmui/'));
      await page.goto(`${base}${target}`);
      await page
        .getByRole('button', { name: 'Execute', exact: true })
        .waitFor();
      assert.equal(
        await page.locator('textarea').inputValue(),
        'event:database.slow_query',
      );
      assert.equal(
        new URLSearchParams(new URL(page.url()).hash.split('?')[1]).get(
          'g0.range_input',
        ),
        '24h',
      );
      if (name === 'desktop')
        await page.getByText('Last 24 hours', { exact: true }).waitFor();
      const response = page.waitForResponse(
        (result) =>
          result.url().includes('/select/logsql/query') && result.ok(),
      );
      await page.getByRole('button', { name: 'Execute', exact: true }).click();
      await response;
      await page.screenshot({
        path: `docs/screenshots/logs-slow-${name}.png`,
      });
      assert.deepEqual(errors, []);
      await page.close();
    }
    console.log(
      'Slow-call dashboard link and 24-hour log query passed on desktop/mobile; no page errors. Empty retained results are valid.',
    );
  } finally {
    await browser.close();
  }
}
void main();
