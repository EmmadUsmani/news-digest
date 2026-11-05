import assert from 'node:assert/strict';

import { readerEditionSchema } from '@digest/contracts';
import { chromium } from 'playwright';

const base = 'http://127.0.0.1:8000';
async function savedEdition() {
  const response = await fetch(`${base}/api/editions/latest`, {
    signal: AbortSignal.timeout(15000),
  });
  assert.equal(response.status, 200);
  return readerEditionSchema.parse(await response.json());
}
async function smoke() {
  const saved = await savedEdition();
  const browser = await chromium.launch();
  try {
    for (const [device, width, height] of [
      ['desktop', 1440, 1100],
      ['mobile', 390, 844],
    ] as const) {
      for (const theme of ['light', 'dark'] as const) {
        const page = await browser.newPage({
          viewport: { width, height },
          colorScheme: theme,
        });
        page.setDefaultTimeout(20000);
        const writes: string[] = [];
        const errors: string[] = [];
        page.on('pageerror', (error) => errors.push(error.message));
        let failure = 0;
        let attempts = 0;
        await page.route('**/api/**', (route) => {
          const request = route.request();
          if (!['GET', 'HEAD'].includes(request.method())) {
            writes.push(request.method());
            return route.abort();
          }
          if (new URL(request.url()).pathname === `/api/editions/${saved.id}`) {
            attempts++;
            if (failure) return route.fulfill({ status: failure, json: {} });
          }
          return route.continue();
        });
        await page.goto(`${base}/editions/${saved.id}`);
        await page.locator('.digest-topic').first().waitFor();
        const content = await page.locator('.digest-topic').allTextContents();
        // Keep the actual saved query cached but stale, then trigger a window-focus refresh.
        await page.clock.install();
        await page.clock.fastForward(61000);
        for (const status of [503, 404]) {
          failure = status;
          const before = attempts;
          await page.evaluate(() =>
            window.dispatchEvent(new Event('visibilitychange')),
          );
          await page.waitForFunction(
            () => document.visibilityState === 'visible',
          );
          await page.clock.runFor(8000);
          const retry = page.getByRole('button', {
            name: 'Try loading edition again',
            exact: true,
          });
          await retry.waitFor();
          assert.ok(attempts > before);
          assert.equal(
            await page
              .getByText(
                'The edition could not be refreshed. Showing the saved edition already loaded.',
                { exact: true },
              )
              .count(),
            1,
          );
          assert.equal(
            await page
              .getByRole('heading', { name: 'Edition not found', exact: true })
              .count(),
            0,
          );
          assert.deepEqual(
            await page.locator('.digest-topic').allTextContents(),
            content,
          );
          if (status === 404)
            await page.screenshot({
              path: `docs/screenshots/ui/edition-refresh-${device}-${theme}.png`,
            });
          failure = 0;
          await retry.click();
          await retry.waitFor({ state: 'detached' });
          assert.deepEqual(
            await page.locator('.digest-topic').allTextContents(),
            content,
          );
          await page.clock.fastForward(61000);
        }
        assert.deepEqual(writes, []);
        assert.deepEqual(errors, []);
        await page.close();
      }
    }
    assert.deepEqual(await savedEdition(), saved);
    console.log(
      'Cached edition refresh: replayed 503/404 preserve content and retry recovery on desktop/mobile light/dark; no writes or browser errors; saved edition unchanged.',
    );
  } finally {
    await browser.close();
  }
}
void smoke();
