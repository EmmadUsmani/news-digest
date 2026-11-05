import assert from 'node:assert/strict';

import {
  readerEditionHistorySchema,
  readerEditionSchema,
} from '@digest/contracts';
import { chromium } from 'playwright';

const base = 'http://127.0.0.1:8000';
async function savedEdition() {
  const response = await fetch(`${base}/api/editions/latest`);
  assert.equal(response.status, 200);
  return readerEditionSchema.parse(await response.json());
}
async function smoke() {
  const edition = await savedEdition();
  const response = await fetch(`${base}/api/editions?offset=0`);
  assert.equal(response.status, 200);
  const history = readerEditionHistorySchema.parse(await response.json());
  assert.ok(history.entries.length);
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
        let fail = true;
        let attempts = 0;
        await page.route('**/api/**', (route) => {
          const request = route.request();
          if (!['GET', 'HEAD'].includes(request.method())) {
            writes.push(request.method());
            return route.abort();
          }
          const url = new URL(request.url());
          if (url.pathname === '/api/editions') {
            if (url.searchParams.get('offset') === '20') {
              attempts++;
              return fail
                ? route.fulfill({ status: 503, json: {} })
                : route.fulfill({
                    json: { ...history, entries: [], hasMore: false },
                  });
            }
            // Browser-only pagination metadata exposes an older page without adding editions.
            return route.fulfill({ json: { ...history, hasMore: true } });
          }
          return route.continue();
        });
        await page.goto(base);
        await page.locator('.digest-topic').first().waitFor();
        await page.locator('.edition-history summary').click();
        const newer = page.getByRole('button', {
          name: 'Newer editions',
          exact: true,
        });
        const older = page.getByRole('button', {
          name: 'Older editions',
          exact: true,
        });
        await older.click();
        await page
          .getByRole('button', { name: 'Retry history', exact: true })
          .waitFor();
        assert.ok(attempts >= 1);
        assert.equal(await newer.isEnabled(), true);
        assert.equal(await older.isDisabled(), true);
        await page.locator('.history-pages').scrollIntoViewIfNeeded();
        await page.screenshot({
          path: `docs/screenshots/ui/history-recovery-${device}-${theme}.png`,
        });
        await newer.click();
        await page.locator('.edition-history li').first().waitFor();
        assert.equal(await newer.isDisabled(), true);
        // A failed page can also recover through Retry, including an empty last page.
        await older.click();
        const retry = page.getByRole('button', {
          name: 'Retry history',
          exact: true,
        });
        await retry.waitFor();
        fail = false;
        await retry.click();
        await page
          .getByText('No saved editions on this page.', { exact: true })
          .waitFor();
        assert.equal(await older.isDisabled(), true);
        await newer.click();
        await page.locator('.edition-history li').first().waitFor();
        assert.equal(
          await page.locator('.digest-topic').count(),
          edition.topics.length,
        );
        assert.deepEqual(writes, []);
        assert.deepEqual(errors, []);
        await page.close();
      }
    }
    assert.deepEqual(await savedEdition(), edition);
    console.log(
      'Archive recovery passed desktop/mobile light/dark: failed-page escape, retry, empty-page return; no writes; saved edition unchanged.',
    );
  } finally {
    await browser.close();
  }
}
void smoke();
