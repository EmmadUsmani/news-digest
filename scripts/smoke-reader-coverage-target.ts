// Read-only browser check against the current published edition.
import assert from 'node:assert/strict';

import { chromium } from 'playwright';

async function smoke() {
  const origin = 'http://127.0.0.1:8000';
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
        const errors: string[] = [];
        page.on('pageerror', (error) => errors.push(error.message));
        await page.route('**/*', (route) => {
          assert.ok(['GET', 'HEAD'].includes(route.request().method()));
          return new URL(route.request().url()).origin === origin
            ? route.continue()
            : route.abort();
        });
        await page.goto(origin);
        const disclosure = page.locator('.coverage summary').first();
        await disclosure.waitFor();
        await disclosure.scrollIntoViewIfNeeded();
        const box = await disclosure.boundingBox();
        assert.ok(box && box.width >= 44 && box.height >= 44);
        await disclosure.focus();
        await page.keyboard.press('Tab');
        await page.keyboard.press('Shift+Tab');
        assert.equal(
          await disclosure.evaluate((el) => getComputedStyle(el).outlineStyle),
          'solid',
        );
        await page.keyboard.press('Enter');
        assert.equal(
          await disclosure.evaluate((el) =>
            el.parentElement?.hasAttribute('open'),
          ),
          true,
        );
        assert.ok(
          await page.locator('.coverage[open] li a').first().isVisible(),
        );
        await page.screenshot({
          path: `docs/screenshots/ui/coverage-target-${device}-${theme}.png`,
        });
        await page.keyboard.press('Space');
        assert.equal(await page.locator('.coverage[open]').count(), 0);
        assert.equal(
          await page.evaluate(
            () => document.documentElement.scrollWidth > innerWidth,
          ),
          false,
        );
        assert.deepEqual(errors, []);
        await page.close();
        console.log(`${device} ${theme}: coverage target and keyboard pass`);
      }
    }
  } finally {
    await browser.close();
  }
}
void smoke();
