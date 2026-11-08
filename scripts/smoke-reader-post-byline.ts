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
        const cards = page.locator('.post-card').filter({
          has: page.locator('.byline a:has(time)'),
        });
        await expect(cards.first()).toBeVisible();
        assert.ok((await cards.count()) > 0);
        for (const card of await cards.all()) {
          const links = card.locator('.byline').first().locator('a');
          await expect(links).toHaveCount(2);
          for (const link of await links.all()) {
            await link.scrollIntoViewIfNeeded();
            const bounds = await link.boundingBox();
            assert.ok(bounds && bounds.width >= 44 && bounds.height >= 44);
            assert.match((await link.getAttribute('href'))!, /^https:\/\//);
            await expect(link).toHaveAttribute('target', '_blank');
            await link.focus();
            await page.keyboard.press('Tab');
            await page.keyboard.press('Shift+Tab');
            await expect(link).toBeFocused();
            assert.equal(
              await link.evaluate(
                (node) => getComputedStyle(node).outlineStyle,
              ),
              'solid',
            );
          }
        }
        const card = cards.first();
        assert.ok(
          await page.evaluate(
            () => document.documentElement.scrollWidth <= innerWidth,
          ),
        );
        await card.screenshot({
          path: `docs/screenshots/ui/reader-post-byline-${width}-${theme}.png`,
        });
        assert.deepEqual(errors, []);
        await context.close();
        console.log(
          `${width}/${theme}: published post author and timestamp targets/focus pass`,
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
