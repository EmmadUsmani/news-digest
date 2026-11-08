// Published content only; GET/HEAD requests, with external traffic blocked.
import assert from 'node:assert/strict';

import { chromium, expect } from 'playwright/test';

async function smoke() {
  const origin = 'http://127.0.0.1:8000';
  const browser = await chromium.launch();
  try {
    for (const width of [390, 320]) {
      for (const theme of ['light', 'dark'] as const) {
        const context = await browser.newContext({
          viewport: { width, height: 900 },
          colorScheme: theme,
          reducedMotion: 'reduce',
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
        await page.evaluate(() => document.fonts.ready);
        const chips = page.locator('a.rounded-full[href^="#topic-"]');
        await expect(chips).toHaveCount(4);
        for (const chip of await chips.all()) {
          const bounds = await chip.boundingBox();
          assert.ok(bounds && bounds.width >= 44 && bounds.height >= 44);
          await chip.focus();
          await page.keyboard.press('Tab');
          await page.keyboard.press('Shift+Tab');
          await expect(chip).toBeFocused();
          assert.equal(
            await chip.evaluate((node) => getComputedStyle(node).outlineStyle),
            'solid',
          );
          assert.ok(
            await chip.evaluate(
              (node) => parseFloat(getComputedStyle(node).outlineOffset) < 0,
            ),
          );
          const href = await chip.getAttribute('href');
          await page.keyboard.press('Enter');
          await expect(page).toHaveURL(`${origin}/${href}`);
          await expect(chip).toHaveAttribute('aria-current', 'location');
          const position = await chip.evaluate((node) => {
            const bounds = node.getBoundingClientRect();
            const parent = node.parentElement!.getBoundingClientRect();
            return (
              bounds.left >= parent.left - 1 && bounds.right <= parent.right + 1
            );
          });
          assert.ok(position, 'active topic is visible inside the chip row');
        }
        assert.ok(
          await page.evaluate(
            () => document.documentElement.scrollWidth <= innerWidth,
          ),
        );
        await page.screenshot({
          path: `docs/screenshots/ui/reader-topic-targets-${width}-${theme}.png`,
        });
        assert.deepEqual(errors, []);
        await context.close();
        console.log(
          `${width}/${theme}: published topic keyboard navigation, targets and focus pass`,
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
