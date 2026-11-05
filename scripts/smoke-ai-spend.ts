// Protected live coverage snapshot replayed in browser; no inference or writes.
import assert from 'node:assert/strict';

import { operationsStatusSchema } from '@digest/contracts';
import { chromium } from 'playwright';

import { localAdminJson } from './lib/local-admin-fetch';
import { replayAdminPage } from './lib/replay-admin-page';

async function main() {
  const browser = await chromium.launch();
  try {
    for (const [name, width, height] of [
      ['desktop', 1440, 1100],
      ['mobile', 390, 844],
    ] as const) {
      const page = await browser.newPage({ viewport: { width, height } });
      const errors: string[] = [];
      page.on('pageerror', (error) => errors.push(error.message));
      const status = operationsStatusSchema.parse(
        await localAdminJson('/api/admin/status'),
      );
      assert.ok(status.llm.purposes);
      assert.equal(
        status.llm.purposes.reduce((sum, row) => sum + row.todayMicros, 0),
        status.llm.todayMicros,
      );
      await page.route('**/api/admin/status', (route) =>
        route.fulfill({ json: status }),
      );
      await replayAdminPage(page);
      await page.goto('http://127.0.0.1:8000/admin');
      await page.getByText('Source & run status', { exact: true }).click();
      const coverage = page.getByRole('region', {
        name: 'AI spend by purpose',
        exact: true,
      });
      await coverage.waitFor();
      const text = await coverage.innerText();
      assert.match(text, /Older development calls/);
      assert.match(text, /Development verification/);
      for (const row of status.llm.purposes) {
        assert.ok(
          text.includes(
            row.purpose === 'verification'
              ? 'Development verification'
              : row.purpose,
          ),
        );
      }
      await coverage.scrollIntoViewIfNeeded();
      assert.equal(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth,
        ),
        true,
      );
      assert.deepEqual(errors, []);
      await coverage.screenshot({
        path: `docs/screenshots/ai-spend-${name}.png`,
      });
      await page.close();
    }
    console.log(
      'Protected AI spend snapshot desktop/mobile checks passed; no writes or inference.',
    );
  } finally {
    await browser.close();
  }
}
void main().catch((error: unknown) => {
  console.error(error);
  process.exitCode = 1;
});
