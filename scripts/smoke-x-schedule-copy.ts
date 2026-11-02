// Read-only live browser verification; no topic writes or provider calls.
import assert from 'node:assert/strict';

import { chromium } from 'playwright';

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
      await page.goto('http://localhost:8000');
      await page.getByText('Source & run status', { exact: true }).click();
      const usage = page.getByRole('region', {
        name: 'X discovery usage',
        exact: true,
      });
      await usage
        .getByText(
          'Paid X discovery is scheduled 5–30 minutes before the edition',
          { exact: false },
        )
        .waitFor();
      await usage.scrollIntoViewIfNeeded();
      await page.screenshot({
        path: `docs/screenshots/status-x-schedule-${name}.png`,
      });
      await page.getByText('Manage topics', { exact: true }).click();
      await page
        .getByRole('button', { name: 'Edit Tech & AI', exact: true })
        .click();
      const help = page.locator('#x-accounts-help');
      await help
        .getByText('scope the current scheduled X searches', { exact: false })
        .waitFor();
      assert.ok(
        (await help.innerText()).includes('within the shared spending caps'),
      );
      await help.scrollIntoViewIfNeeded();
      await page.screenshot({
        path: `docs/screenshots/topic-x-schedule-${name}.png`,
      });
      assert.equal(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth,
        ),
        true,
      );
      assert.deepEqual(errors, []);
      await page.close();
    }
    console.log(
      'Read-only X schedule guidance passed: desktop/mobile, Status/settings.',
    );
  } finally {
    await browser.close();
  }
}
void main();
