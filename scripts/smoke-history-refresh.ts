// Read-only saved archive; only background failures are simulated.
import assert from 'node:assert/strict';

import { readerEditionHistorySchema } from '@digest/contracts';
import { chromium } from 'playwright';

const base = 'http://127.0.0.1:8000';
async function savedArchive() {
  const response = await fetch(`${base}/api/editions?offset=0`, {
    signal: AbortSignal.timeout(15000),
  });
  assert.equal(response.status, 200);
  return readerEditionHistorySchema.parse(await response.json());
}
async function smoke() {
  const saved = await savedArchive();
  assert.ok(saved.entries.length);
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
        const writes: string[] = [],
          errors: string[] = [];
        page.on('pageerror', (error) => errors.push(error.message));
        let failure = false,
          attempts = 0;
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
            if (failure) return route.fulfill({ status: 503, json: {} });
          }
          return route.continue();
        });
        await page.goto(`${base}/editions`);
        await page.locator('main li').first().waitFor();
        const content = await page.locator('main li').allTextContents();
        const links = await page
          .locator('main li a')
          .evaluateAll((items) =>
            items.map((item) => item.getAttribute('href')),
          );
        await page.clock.install();
        await page.clock.fastForward(61000);
        failure = true;
        const before = attempts;
        await page.evaluate(() =>
          window.dispatchEvent(new Event('visibilitychange')),
        );
        await page.clock.runFor(8000);
        const retry = page.getByRole('button', {
          name: 'Try again',
          exact: true,
        });
        await retry.waitFor();
        assert.ok(attempts > before);
        await page
          .getByText(
            'Past editions could not be refreshed. Showing saved links already loaded.',
            { exact: true },
          )
          .waitFor();
        assert.deepEqual(
          await page.locator('main li').allTextContents(),
          content,
        );
        assert.deepEqual(
          await page
            .locator('main li a')
            .evaluateAll((items) =>
              items.map((item) => item.getAttribute('href')),
            ),
          links,
        );
        if (saved.hasMore)
          assert.ok(
            await page
              .getByRole('link', { name: 'Older editions' })
              .isVisible(),
          );
        await page.screenshot({
          path: `docs/screenshots/ui/history-refresh-${device}-${theme}.png`,
        });
        failure = false;
        await retry.click();
        await retry.waitFor({ state: 'detached' });
        assert.deepEqual(
          await page.locator('main li').allTextContents(),
          content,
        );
        await page.locator('main li a').first().click();
        await page.waitForURL(`**/editions/${saved.entries[0].id}`);
        await page.locator('.digest-topic').first().waitFor();
        assert.deepEqual(writes, []);
        assert.deepEqual(errors, []);
        await page.close();
      }
    }
    assert.deepEqual(await savedArchive(), saved);
    console.log(
      'Archive refresh: simulated 503 preserves saved links, pagination and retry; saved-edition navigation passed desktop/mobile light/dark; no writes or browser errors.',
    );
  } finally {
    await browser.close();
  }
}
void smoke();
