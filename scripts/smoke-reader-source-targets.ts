// Published content only; GET/HEAD requests, with external traffic blocked.
// Explicit loopback test visitor for public-mode admission; no account identity.
import assert from 'node:assert/strict';

import { chromium, expect } from 'playwright/test';

async function smoke() {
  const origin = 'http://127.0.0.1:8000';
  const browser = await chromium.launch();
  try {
    for (const width of [1440, 390, 320]) {
      for (const theme of ['light', 'dark'] as const) {
        const context = await browser.newContext({
          viewport: { width, height: 900 },
          colorScheme: theme,
        });
        await context.route('**/*', (route) => {
          assert.ok(['GET', 'HEAD'].includes(route.request().method()));
          return new URL(route.request().url()).origin === origin
            ? route.continue({
                headers: {
                  ...route.request().headers(),
                  'X-Forwarded-For': '192.0.2.161',
                },
              })
            : route.abort();
        });
        const page = await context.newPage();
        const errors: string[] = [];
        page.on('pageerror', (error) => errors.push(error.message));
        await page.goto(origin);
        await page.addStyleTag({
          content: 'html { font-size: 200% !important; }',
        });
        const card = page.locator('.story-sources').first();
        const source = card.locator(':scope > a').first();
        await expect(source).toBeVisible();
        const destination = await source.getAttribute('href');
        assert.ok(destination && /^https?:/.test(destination));
        const check = async (link: typeof source) => {
          await link.scrollIntoViewIfNeeded();
          const bounds = await link.boundingBox();
          assert.ok(bounds && bounds.width >= 44 && bounds.height >= 44);
          assert.ok(
            bounds.x >= 0 && bounds.x + bounds.width <= width,
            'Attribution stays horizontally reachable',
          );
          await link.focus();
          await page.keyboard.press('Tab');
          await page.keyboard.press('Shift+Tab');
          await expect(link).toBeFocused();
          assert.equal(
            await link.evaluate((node) => getComputedStyle(node).outlineStyle),
            'solid',
          );
        };
        await check(source);
        const summary = card.locator('summary');
        await summary.click();
        const reportSource = card.locator('details li span a').first();
        await expect(reportSource).toBeVisible();
        await check(reportSource);
        // Check the full edition, including long coverage titles and outlets.
        for (const attribution of await page.locator('.story-sources').all()) {
          const disclosure = attribution.locator('summary');
          if (await disclosure.count()) {
            await disclosure.evaluate((node) => {
              (node.parentElement as HTMLDetailsElement).open = true;
            });
          }
          for (const link of await attribution.locator('a').all()) {
            const href = await link.getAttribute('href');
            assert.ok(href && /^https?:/.test(href));
            await check(link);
          }
        }
        assert.ok(
          await page.evaluate(
            () => document.documentElement.scrollWidth <= innerWidth,
          ),
        );
        await card.screenshot({
          style: 'header, .fixed { visibility: hidden !important; }',
          path: `docs/screenshots/ui/reader-source-targets-${width}-${theme}.png`,
        });
        assert.deepEqual(errors, []);
        await context.close();
        console.log(
          `${width}/${theme}: full published edition attribution targets/focus pass at 200% text`,
        );
      }
    }
  } finally {
    await browser.close();
  }
}
void smoke().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
