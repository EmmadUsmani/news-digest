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
        let invalid = true;
        let editionAttempts = 0;
        let historyAttempts = 0;
        await page.route('**/*', (route) => {
          const request = route.request();
          assert.equal('admin_local_token' in request.headers(), false);
          assert.equal('x-exedev-email' in request.headers(), false);
          if (!['GET', 'HEAD'].includes(request.method())) {
            writes.push(request.method());
            return route.abort();
          }
          const path = new URL(request.url()).pathname;
          if (path === `/api/editions/${saved.id}`) {
            editionAttempts++;
            if (invalid) return route.fulfill({ status: 200, json: {} });
          }
          if (path === '/api/editions') {
            historyAttempts++;
            if (invalid) return route.fulfill({ status: 200, json: {} });
          }
          return route.continue();
        });
        await page.goto(`${base}/editions/${saved.id}`);
        await page.locator('.edition-history summary').click();
        const retryEdition = page.getByRole('button', {
          name: 'Try loading edition again',
          exact: true,
        });
        const retryHistory = page.getByRole('button', {
          name: 'Retry history',
          exact: true,
        });
        await retryEdition.waitFor();
        await retryHistory.waitFor();
        await page.waitForTimeout(1500);
        assert.equal(
          editionAttempts,
          1,
          'Invalid data must not trigger automatic retries',
        );
        assert.equal(historyAttempts, 1);
        assert.equal(await page.locator('.digest-topic').count(), 0);
        await retryEdition.scrollIntoViewIfNeeded();
        await page.screenshot({
          path: `docs/screenshots/ui/reader-invalid-data-${device}-${theme}.png`,
        });
        invalid = false;
        await retryEdition.click();
        await retryHistory.click();
        await page.locator('.digest-topic').first().waitFor();
        await page.locator('.edition-history li').first().waitFor();
        assert.equal(
          await page.locator('.digest-topic').count(),
          saved.topics.length,
        );
        assert.equal(editionAttempts, 2);
        assert.equal(historyAttempts, 2);
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
      'Invalid reader data: immediate error and manual recovery for edition/history on desktop/mobile light/dark; no automatic invalid-data retries, writes or browser errors; saved edition unchanged.',
    );
  } finally {
    await browser.close();
  }
}
void smoke();
