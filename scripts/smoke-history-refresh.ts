import assert from 'node:assert/strict';

import { readerEditionSchema } from '@digest/contracts';
import { chromium } from 'playwright';

import { localAdminJson } from './lib/local-admin-fetch';

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
  const original = await localAdminJson(
    `/api/admin/digest-previews/${saved.id}`,
  );
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
          serviceWorkers: 'block',
        });
        page.setDefaultTimeout(20000);
        const writes: string[] = [];
        const errors: string[] = [];
        page.on('pageerror', (error) => errors.push(error.message));
        let failure = 0;
        let attempts = 0;
        await page.route('**/*', (route) => {
          const request = route.request();
          assert.equal('admin_local_token' in request.headers(), false);
          assert.equal('x-exedev-email' in request.headers(), false);
          if (!['GET', 'HEAD'].includes(request.method())) {
            writes.push(request.method());
            return route.abort();
          }
          if (new URL(request.url()).pathname === '/api/editions') {
            attempts++;
            if (failure) return route.fulfill({ status: failure, json: {} });
          }
          return route.continue();
        });
        await page.goto(`${base}/editions/${saved.id}`);
        await page.locator('.digest-topic').first().waitFor();
        await page.locator('.edition-history summary').click();
        await page.locator('.edition-history li').first().waitFor();
        const content = await page
          .locator('.edition-history li')
          .allTextContents();
        const links = await page
          .locator('.edition-history li a')
          .evaluateAll((items) =>
            items.map((item) => item.getAttribute('href')),
          );
        // Keep the actual saved query cached but stale, then trigger a window-focus refresh.
        await page.clock.install();
        await page.clock.fastForward(61000);
        for (const status of [503]) {
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
            name: 'Retry history',
            exact: true,
          });
          await retry.waitFor();
          assert.ok(attempts > before);
          assert.equal(
            await page
              .getByText(
                'Edition history could not be refreshed. Showing saved links already loaded.',
                { exact: false },
              )
              .count(),
            1,
          );
          assert.deepEqual(
            await page
              .locator('.edition-history li a')
              .evaluateAll((items) =>
                items.map((item) => item.getAttribute('href')),
              ),
            links,
          );
          assert.deepEqual(
            await page.locator('.edition-history li').allTextContents(),
            content,
          );
          await page.locator('.edition-history').scrollIntoViewIfNeeded();
          await page.screenshot({
            path: `docs/screenshots/ui/history-refresh-${device}-${theme}.png`,
          });
          const failedAttempts = attempts;
          await retry.focus();
          await retry.press('Enter');
          await page.clock.runFor(8000);
          assert.ok(attempts > failedAttempts);
          assert.equal(
            await retry.evaluate(
              (element) => document.activeElement === element,
            ),
            true,
          );
          failure = 0;
          await retry.focus();
          await retry.click();
          await retry.waitFor({ state: 'detached' });
          await page.waitForFunction(
            () =>
              document.activeElement ===
              document.querySelector('.edition-history summary'),
          );
          await page.screenshot({
            path: `docs/screenshots/ui/history-retry-focus-${device}-${theme}.png`,
          });
          assert.deepEqual(
            await page.locator('.edition-history li').allTextContents(),
            content,
          );
          await page.clock.fastForward(61000);
        }
        await page.locator('.edition-history li a').first().click();
        await page.waitForURL(`**/editions/${saved.id}`);
        await page.locator('.digest-topic').first().waitFor();
        assert.deepEqual(writes, []);
        assert.deepEqual(errors, []);
        await page.close();
      }
    }
    assert.deepEqual(await savedEdition(), saved);
    assert.deepEqual(
      await localAdminJson(`/api/admin/digest-previews/${saved.id}`),
      original,
    );
    console.log(
      'Cached archive refresh: replayed 503 preserves links, retry and edition navigation on desktop/mobile light/dark; no writes or browser errors; saved edition unchanged.',
    );
  } finally {
    await browser.close();
  }
}
void smoke();
