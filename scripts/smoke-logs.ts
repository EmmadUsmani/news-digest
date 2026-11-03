// Read-only checks against collected real logs. Never enqueue jobs or call providers.
import assert from 'node:assert/strict';

import { chromium } from 'playwright';

async function main() {
  const browser = await chromium.launch({ headless: true });
  try {
    for (const [name, width, height] of [
      ['desktop', 1440, 1000],
      ['mobile', 390, 844],
    ] as const) {
      const page = await browser.newPage({ viewport: { width, height } });
      const errors: string[] = [];
      page.on('pageerror', (error) => errors.push(error.message));
      await page.goto('http://127.0.0.1:8000/logs/select/vmui/');
      await page
        .getByRole('button', { name: 'Execute', exact: true })
        .waitFor();
      await page
        .locator('textarea')
        .fill('service:api event:http.request level:info');
      const result = page.waitForResponse(
        (response) =>
          response.url().includes('/select/logsql/query') && response.ok(),
      );
      await page.getByRole('button', { name: 'Execute', exact: true }).click();
      await result;
      await page.getByText('HTTP request', { exact: true }).first().waitFor();
      await page
        .getByText(/^info$/i)
        .first()
        .waitFor();
      await page.screenshot({
        path: `docs/screenshots/logs-${name}.png`,
        fullPage: false,
      });
      assert.deepEqual(errors, []);
      await page.close();
    }
    console.log(
      'Log browser: real collected API requests visible on desktop/mobile; no page errors.',
    );
  } finally {
    await browser.close();
  }
}
void main();
