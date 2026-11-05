import assert from 'node:assert/strict';

import { readerEditionHistorySchema } from '@digest/contracts';
import { chromium } from 'playwright';

// Delay browser GET responses only. No writes or provider calls.
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
        const entry = history.entries[1];
        assert.ok(entry, 'Need two real saved editions');
        let handled!: () => void;
        const delayedHandled = new Promise<void>((resolve) => {
          handled = resolve;
        });
        let release!: () => void;
        const blocked = new Promise<void>((resolve) => {
          release = resolve;
        });
        await page.route('**/api/digest-previews/latest', async (route) => {
          const response = await route.fetch();
          await blocked;
          await route.fulfill(
            fail ? { status: 503, body: '{}' } : { response },
          );
          handled();
        });
        await page.goto('http://localhost:8000', {
          waitUntil: 'domcontentloaded',
        });
        await page.getByText('Browse saved editions', { exact: true }).click();
        const selected = page.locator(
          `.edition-history a[href="/editions/${entry.id}"]`,
        );
        await selected.click();
        await page.waitForURL(`**/editions/${entry.id}`);
        assert.equal(await selected.getAttribute('aria-current'), 'page');
        release();
        await delayedHandled;
        // Let the fetch continuation and React render settle after the delayed response.
        await page.waitForTimeout(250);
        assert.equal(await selected.getAttribute('aria-current'), 'page');
        assert.equal(
          await page
            .getByRole('alert')
            .filter({ hasText: 'The edition could not' })
            .count(),
          0,
        );
        if (!fail)
          await page.locator('.edition-history').screenshot({
            path: `docs/screenshots/edition-selection-${device}.png`,
          });
        assert.ok(
          await page.evaluate(
            () => document.documentElement.scrollWidth <= innerWidth,
          ),
        );
        await page.close();
      }
    }
    console.log(
      'Desktop/mobile delayed edition success/error checks passed; real saved editions, no writes.',
    );
  } finally {
    await browser.close();
  }
}
void smoke();
