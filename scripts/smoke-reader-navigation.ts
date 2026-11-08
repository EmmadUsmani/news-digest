// Read-only navigation against the deployed reader; external requests blocked.
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
        await page.goto(`${origin}/editions`);
        for (const [label, path, heading, name] of [
          ['Saved items', '/saved', 'Saved items', 'saved'],
          ['Past editions', '/editions', 'Past editions', 'archive'],
        ]) {
          const link = page
            .getByRole('navigation', { name: 'Reader navigation' })
            .getByRole('link', { name: label, exact: true });
          await expect(link).toBeVisible();
          const bounds = await link.boundingBox();
          assert.ok(
            bounds &&
              bounds.height >= 44 &&
              bounds.x >= 0 &&
              bounds.x + bounds.width <= width,
          );
          await link.focus();
          await page.keyboard.press('Enter');
          await expect(page).toHaveURL(
            (url) => url.origin === origin && url.pathname === path,
          );
          await expect(
            page.getByRole('heading', { name: heading, exact: true }),
          ).toBeVisible();
          assert.ok(
            await page.evaluate(
              () => document.documentElement.scrollWidth <= innerWidth,
            ),
          );
          await page.screenshot({
            path: `docs/screenshots/ui/reader-navigation-${name}-${device}-${theme}.png`,
          });
        }
        assert.deepEqual(errors, []);
        await page.close();
      }
    }
    console.log(
      'Reader archive/saved keyboard navigation passes desktop/mobile light/dark; no overflow, browser errors or writes.',
    );
  } finally {
    await browser.close();
  }
}
void smoke();
