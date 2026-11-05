import assert from 'node:assert/strict';

import { readerEditionSchema } from '@digest/contracts';
import { chromium } from 'playwright';

const base = 'http://127.0.0.1:8000';
async function savedEdition() {
  const response = await fetch(`${base}/api/editions/latest`);
  assert.equal(response.status, 200);
  return readerEditionSchema.parse(await response.json());
}

async function smoke() {
  const edition = await savedEdition();
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
        page.setDefaultTimeout(15_000);
        const requests: string[] = [];
        const writes: string[] = [];
        const errors: string[] = [];
        page.on('pageerror', (error) => errors.push(error.message));
        await page.route('**/api/**', (route) => {
          const request = route.request();
          requests.push(new URL(request.url()).pathname);
          if (!['GET', 'HEAD'].includes(request.method())) {
            writes.push(request.method());
            return route.abort();
          }
          return route.continue();
        });
        for (const id of [
          'not-an-edition',
          '123',
          '00000000-0000-4000-8000-invalid',
        ]) {
          await page.goto(`${base}/editions/${id}`, {
            waitUntil: 'networkidle',
          });
          await page
            .getByRole('heading', { name: 'Page not found', exact: true })
            .waitFor();
          assert.deepEqual(
            requests,
            [],
            'Invalid edition must not load app data',
          );
          assert.equal(await page.locator('.digest-topic').count(), 0);
        }
        await page.screenshot({
          path: `docs/screenshots/ui/invalid-edition-${device}-${theme}.png`,
        });
        await page.getByRole('link', { name: 'Back to News Digest' }).click();
        await page.waitForURL(base + '/');
        await page.locator('.digest-topic').first().waitFor();
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
      'Invalid edition links: no API reads, not-found and home recovery pass desktop/mobile light/dark; no writes; saved edition unchanged.',
    );
  } finally {
    await browser.close();
  }
}
void smoke();
