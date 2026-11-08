// Read-only reader navigation check; block external requests and server writes.
import assert from 'node:assert/strict';

import { chromium, expect } from 'playwright/test';

async function smoke() {
  const origin = 'http://127.0.0.1:8000';
  const browser = await chromium.launch();
  try {
    for (const [device, width, height] of [
      ['desktop', 1440, 1100],
      ['mobile', 390, 844],
    ] as const) {
      for (const theme of ['light', 'dark'] as const) {
        const context = await browser.newContext({
          viewport: { width, height },
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
        for (const [name, path] of [
          ['saved', '/saved'],
          ['archive', '/editions?page=1'],
        ]) {
          await page.goto(`${origin}${path}`);
          const home = page.getByRole('link', {
            name: 'News Digest',
            exact: true,
          });
          await expect(home).toBeVisible();
          const bounds = await home.boundingBox();
          assert.ok(bounds && bounds.width >= 44 && bounds.height >= 44);
          await home.focus();
          await page.keyboard.press('Tab');
          await page.keyboard.press('Shift+Tab');
          await expect(home).toBeFocused();
          assert.equal(
            await home.evaluate((node) => getComputedStyle(node).outlineStyle),
            'solid',
          );
          assert.ok(
            await page.evaluate(
              () => document.documentElement.scrollWidth <= innerWidth,
            ),
          );
          await page.screenshot({
            path: `docs/screenshots/ui/reader-home-${name}-${device}-${theme}.png`,
          });
          await page.keyboard.press('Enter');
          await expect(page).toHaveURL(`${origin}/`);
          await expect(page.locator('main')).toBeVisible();
        }
        assert.deepEqual(errors, []);
        await context.close();
        console.log(`${device}/${theme}: saved and archive home links pass`);
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
