import assert from 'node:assert/strict';

import { readerEditionSchema } from '@digest/contracts';
import { chromium } from 'playwright';

const base = 'http://127.0.0.1:8000';
const missingId = '00000000-0000-4000-8000-000000000770';
async function savedEdition() {
  const response = await fetch(`${base}/api/editions/latest`);
  assert.equal(response.status, 200);
  return readerEditionSchema.parse(await response.json());
}
async function smoke() {
  const edition = await savedEdition();
  assert.equal((await fetch(`${base}/api/editions/${missingId}`)).status, 404);
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
        let missingRequests = 0;
        page.on('pageerror', (error) => errors.push(error.message));
        await page.route('**/api/**', (route) => {
          const request = route.request();
          if (!['GET', 'HEAD'].includes(request.method())) {
            writes.push(request.method());
            return route.abort();
          }
          if (new URL(request.url()).pathname === `/api/editions/${missingId}`)
            missingRequests++;
          return route.continue();
        });
        await page.goto(`${base}/editions/${missingId}`);
        await page
          .getByRole('heading', { name: 'Edition not found', exact: true })
          .waitFor();
        assert.equal(
          missingRequests,
          1,
          'Missing saved editions must not retry',
        );
        assert.equal(await page.locator('.digest-topic').count(), 0);
        assert.equal(
          await page.getByText('No edition yet.', { exact: false }).count(),
          0,
        );
        await page
          .getByRole('heading', { name: 'Edition not found' })
          .scrollIntoViewIfNeeded();
        await page.screenshot({
          path: `docs/screenshots/ui/missing-edition-${device}-${theme}.png`,
        });
        await page
          .getByRole('link', { name: 'Back to latest edition' })
          .click();
        await page.waitForURL(base + '/');
        await page.locator('.digest-topic').first().waitFor();
        assert.equal(
          await page.locator('.digest-topic').count(),
          edition.topics.length,
        );

        // Replay an outage only in this browser, then recover the real saved edition.
        let unavailable = true;
        await page.route(`**/api/editions/${edition.id}`, (route) =>
          unavailable
            ? route.fulfill({ status: 503, json: {} })
            : route.continue(),
        );
        await page.goto(`${base}/editions/${edition.id}`);
        const retry = page.getByRole('button', {
          name: 'Try loading edition again',
          exact: true,
        });
        await retry.waitFor();
        assert.equal(
          await page
            .getByRole('heading', { name: 'Edition not found', exact: true })
            .count(),
          0,
        );
        unavailable = false;
        await retry.click();
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
      'Missing saved edition: single 404, home recovery and replayed outage retry pass desktop/mobile light/dark; no writes; saved edition unchanged.',
    );
  } finally {
    await browser.close();
  }
}
void smoke();
