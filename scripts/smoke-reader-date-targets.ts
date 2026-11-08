// Read-only checks against published editions; external traffic is blocked.
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
        const navigation = page.getByRole('navigation', {
          name: 'Edition dates',
        });
        const older = navigation.getByRole('link', {
          name: 'Older edition',
          exact: true,
        });
        await expect(older).toBeVisible();
        const olderHref = await older.getAttribute('href');
        await older.click();
        await expect(page).toHaveURL(`${origin}${olderHref}`);
        const newer = navigation.getByRole('link', {
          name: 'Newer edition',
          exact: true,
        });
        await expect(newer).toBeVisible();
        for (const name of [
          'Older edition',
          'Browse past editions',
          'Newer edition',
        ]) {
          const link = navigation.getByRole('link', { name, exact: true });
          const bounds = await link.boundingBox();
          assert.ok(
            bounds && bounds.width >= 44 && bounds.height >= 44,
            `${name}: target size`,
          );
          await link.focus();
          await page.keyboard.press('Tab');
          await page.keyboard.press('Shift+Tab');
          await expect(link).toBeFocused();
          assert.equal(
            await link.evaluate((node) => getComputedStyle(node).outlineStyle),
            'solid',
          );
        }
        assert.ok(
          await page.evaluate(
            () => document.documentElement.scrollWidth <= innerWidth,
          ),
        );
        await page.screenshot({
          path: `docs/screenshots/ui/reader-date-targets-${width}-${theme}.png`,
        });
        const newerHref = await newer.getAttribute('href');
        await page.keyboard.press('Enter');
        await expect(page).toHaveURL(`${origin}${newerHref}`);
        await navigation
          .getByRole('link', { name: 'Browse past editions' })
          .click();
        await expect(
          page.getByRole('heading', { name: 'Past editions' }),
        ).toBeVisible();
        assert.deepEqual(errors, []);
        await context.close();
        console.log(
          `${width}/${theme}: date targets, focus, navigation and layout pass`,
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
