import assert from 'node:assert/strict';

import { readerEditionHistorySchema } from '@digest/contracts';
import { chromium } from 'playwright';

// Simulate a completed background job and delayed history GETs in the browser.
// All edition content is read from storage; no jobs, writes or provider calls.
async function smoke() {
  const browser = await chromium.launch();
  try {
    for (const [device, width, height] of [
      ['desktop', 1440, 1100],
      ['mobile', 390, 844],
    ] as const) {
      for (const fail of [false, true]) {
        const page = await browser.newPage({ viewport: { width, height } });
        const history = readerEditionHistorySchema.parse(
          await (
            await page.request.get(
              'http://localhost:8000/api/editions?offset=0',
            )
          ).json(),
        );
        assert.ok(history.entries.length >= 2, 'Need two real saved editions');
        let handled!: () => void;
        const delayedHandled = new Promise<void>((resolve) => {
          handled = resolve;
        });
        let releaseHistory!: () => void;
        let historyStarted!: () => void;
        const blocked = new Promise<void>((resolve) => {
          releaseHistory = resolve;
        });
        const started = new Promise<void>((resolve) => {
          historyStarted = resolve;
        });
        let requests = 0;
        await page.addInitScript(() =>
          sessionStorage.setItem('edition-job', '697'),
        );
        await page.route('**/api/digest-previews/jobs/697', async (route) => {
          await started;
          await route.fulfill({
            json: { state: 'completed', editionId: history.entries[0].id },
          });
        });
        await page.route('**/api/editions?offset=0', async (route) => {
          requests++;
          if (requests === 1) {
            historyStarted();
            await blocked;
            await route.fulfill(
              fail
                ? { status: 503, json: {} }
                : { json: { ...history, entries: history.entries.slice(1) } },
            );
            handled();
          } else await route.fulfill({ json: history });
        });
        await page.goto('http://localhost:8000', {
          waitUntil: 'domcontentloaded',
        });
        await page.getByText('Browse saved editions', { exact: true }).click();
        await page.getByText('Edition ready.', { exact: true }).waitFor();
        const newest = page.locator(
          `.edition-history a[href="/editions/${history.entries[0].id}"]`,
        );
        await newest.waitFor();
        releaseHistory();
        await delayedHandled;
        await page.waitForTimeout(250);
        assert.equal(
          await newest.count(),
          1,
          'Superseded history must not replace refreshed history',
        );
        assert.equal(
          await page
            .getByText('Edition history could not be loaded.', { exact: false })
            .count(),
          0,
        );
        assert.ok(
          await page.evaluate(
            () => document.documentElement.scrollWidth <= innerWidth,
          ),
        );
        if (!fail)
          await page.locator('.edition-history').screenshot({
            path: `docs/screenshots/edition-history-${device}.png`,
          });
        await page.close();
      }
    }
    console.log(
      'Desktop/mobile superseded history success/error checks passed; simulated job completion, real stored content, no writes.',
    );
  } finally {
    await browser.close();
  }
}
void smoke();
