// Published content only; GET/HEAD requests, with external traffic blocked.
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
            ? route.continue()
            : route.abort();
        });
        const page = await context.newPage();
        const errors: string[] = [];
        page.on('pageerror', (error) => errors.push(error.message));
        await page.goto(origin);
        const card = page.locator('.story-sources').first();
        const source = card.locator(':scope > a').first();
        await expect(source).toBeVisible();
        const destination = await source.getAttribute('href');
        assert.ok(destination && /^https?:/.test(destination));
        const check = async (link: typeof source) => {
          await link.scrollIntoViewIfNeeded();
          const bounds = await link.boundingBox();
          assert.ok(bounds && bounds.width >= 44 && bounds.height >= 44);
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
        assert.ok(
          await page.evaluate(
            () => document.documentElement.scrollWidth <= innerWidth,
          ),
        );
        await card.screenshot({
          path: `docs/screenshots/ui/reader-source-targets-${width}-${theme}.png`,
        });
        assert.deepEqual(errors, []);
        await context.close();
        console.log(
          `${width}/${theme}: published source and coverage attribution targets/focus pass`,
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
