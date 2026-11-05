import assert from 'node:assert/strict';

import { previewHistorySchema } from '@digest/contracts';
import { chromium } from 'playwright';

// Read-only browser checks against actual stored editions. No generation.
async function smoke() {
  const browser = await chromium.launch();
  try {
    const context = await browser.newContext();
    const history = previewHistorySchema.parse(
      await (
        await context.request.get(
          'http://localhost:8000/api/digest-previews?offset=0',
        )
      ).json(),
    );
    const edition = history.entries[1];
    assert.ok(edition, 'Need a historical edition distinct from latest');
    for (const [device, width, height] of [
      ['desktop', 1440, 1100],
      ['mobile', 390, 844],
    ] as const) {
      const page = await context.newPage();
      await page.setViewportSize({ width, height });
      const errors: string[] = [];
      page.on('pageerror', (error) => errors.push(error.message));
      await page.goto(`http://localhost:8000/?edition=${edition.id}`);
      await page.waitForURL(`**/editions/${edition.id}`);
      const selected = page.locator(
        `.edition-history a[href="/editions/${edition.id}"]`,
      );
      await selected.waitFor({ state: 'attached' });
      await page.waitForFunction(() =>
        document.querySelector('.edition-history a[aria-current="page"]'),
      );
      assert.equal(await selected.getAttribute('aria-current'), 'page');
      await page.reload();
      await page.waitForFunction(() =>
        document.querySelector('.edition-history a[aria-current="page"]'),
      );
      assert.equal(await selected.getAttribute('aria-current'), 'page');
      await page.locator('.edition-history summary').click();
      let historicalReads = 0;
      page.on('request', (request) => {
        if (request.url().endsWith(`/api/digest-previews/${edition.id}`))
          historicalReads++;
      });
      await page.getByRole('button', { name: 'Open latest edition' }).click();
      await page.waitForURL('http://localhost:8000/');
      await page.waitForFunction(
        (id) =>
          document
            .querySelector('.edition-history a[aria-current="page"]')
            ?.getAttribute('href') !== `/editions/${id}`,
        edition.id,
      );
      await selected.click();
      await page.waitForURL(`**/editions/${edition.id}`);
      await page.waitForFunction(
        (id) =>
          document
            .querySelector('.edition-history a[aria-current="page"]')
            ?.getAttribute('href') === `/editions/${id}`,
        edition.id,
      );
      assert.equal(
        historicalReads,
        0,
        'Fresh historical edition uses shared cache',
      );
      await page.locator('.edition-history summary').click();
      assert.ok(await page.locator('.digest-preview').isVisible());
      assert.ok(
        await page
          .getByRole('heading', { name: 'Incoming from your sources.' })
          .isVisible(),
      );
      assert.ok(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth,
        ),
      );
      await page.evaluate(() => document.fonts.ready);
      assert.ok(
        await page.evaluate(() =>
          document.fonts.check('16px "Inter Variable"'),
        ),
        'Self-hosted Inter must load',
      );
      const button = page.locator('[data-slot="button"]').first();
      assert.equal(
        await button.evaluate((node) => getComputedStyle(node).display),
        'inline-flex',
      );
      assert.equal(
        await button.evaluate((node) => getComputedStyle(node).fontSize),
        '14px',
      );
      await page.evaluate(() => scrollTo(0, 0));
      await page.screenshot({
        path: `docs/screenshots/ui/foundations-routing-${device}.png`,
      });
      // A malformed response must not leave the previous edition on screen.
      const invalidId = '00000000-0000-4000-8000-000000000099';
      await page.route(`**/api/digest-previews/${invalidId}`, (route) =>
        route.fulfill({ json: { id: invalidId, topics: [] } }),
      );
      await page.goto(`http://localhost:8000/editions/${invalidId}`);
      await page
        .getByRole('alert')
        .filter({
          hasText: 'The edition could not be loaded or created.',
        })
        .waitFor();
      assert.equal(await page.locator('.digest-topic').count(), 0);
      assert.equal(
        await page.getByText('No edition yet.', { exact: false }).count(),
        0,
      );
      await page.goto('http://localhost:8000/unknown-reader-route');
      await page.getByRole('heading', { name: 'Page not found' }).waitFor();
      await page.getByRole('link', { name: 'Back to News Digest' }).click();
      await page.waitForURL('http://localhost:8000/');
      await page.locator('.digest-preview').waitFor();
      assert.deepEqual(errors, []);
      await page.close();
    }
    for (const path of [
      '/api',
      '/api/no-such-route',
      '/healthz/no-such-route',
      '/__exe.dev/no-such-route',
    ]) {
      const response = await context.request.get(
        `http://localhost:8000${path}`,
      );
      assert.equal(response.status(), 404, path);
      assert.ok(!(await response.text()).includes('<div id="root">'), path);
    }
    const health = await context.request.get('http://localhost:8000/healthz');
    assert.equal(health.status(), 200);
    console.log(
      'Desktop/mobile canonical links, reload, cached edition switching, legacy redirect, not-found and reserved-path checks passed; real saved editions, no writes.',
    );
    await context.close();
  } finally {
    await browser.close();
  }
}
void smoke();
