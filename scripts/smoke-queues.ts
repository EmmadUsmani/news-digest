// Read-only inspection of real queues. Never enqueue or retry work.
import assert from 'node:assert/strict';

import { chromium } from 'playwright';

import { checkJobsBrowser } from './lib/check-jobs-browser';

async function main() {
  const counts = await checkJobsBrowser();
  const browser = await chromium.launch({ headless: true });
  try {
    for (const [name, width, height] of [
      ['desktop', 1440, 1000],
      ['mobile', 390, 844],
    ] as const) {
      const page = await browser.newPage({ viewport: { width, height } });
      const errors: string[] = [];
      page.on('pageerror', (error) => errors.push(error.message));
      await page.goto('http://127.0.0.1:8000/queues/');
      await page
        .getByText('News Digest jobs (read-only)', { exact: true })
        .waitFor();
      for (const queue of [
        'operations',
        'ingestion',
        'digest-generation',
        'social-collection',
      ]) {
        await page.getByText(queue, { exact: true }).first().waitFor();
      }
      await page.screenshot({ path: `docs/screenshots/queues-${name}.png` });
      if (name === 'mobile')
        await page
          .getByRole('button', { name: 'Overview', exact: true })
          .click();
      await page.getByText('Schedulers', { exact: true }).click();
      await page.getByText('heartbeat', { exact: true }).first().waitFor();
      await page
        .getByText('source-gamesradar', { exact: true })
        .first()
        .waitFor();
      await page.screenshot({
        path: `docs/screenshots/queue-schedules-${name}.png`,
      });
      assert.deepEqual(errors, []);
      await page.close();
    }
    console.log(
      `Jobs browser: ${counts.queues} real queues/${counts.schedules} schedules; desktop/mobile passed; writes blocked.`,
    );
  } finally {
    await browser.close();
  }
}
void main();
