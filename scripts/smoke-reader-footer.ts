// Read-only reader navigation check; block external requests and server writes.
import assert from 'node:assert/strict';

import { chromium, expect } from 'playwright/test';

async function smoke() {
  const origin = 'http://127.0.0.1:8000';
  const history = await (
    await fetch(`${origin}/api/editions?limit=20&offset=0`)
  ).json();
  const older = history.entries[1];
  assert.ok(older?.id, 'An older published edition is required');
  const browser = await chromium.launch();
  try {
    for (const [device, width, height] of [
      ['desktop', 1440, 1100],
      ['mobile', 390, 844],
      ['narrow', 320, 844],
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
          ['latest', '/'],
          ['historical', `/editions/${older.id}`],
        ]) {
          await page.goto(`${origin}${path}`);
          await expect(page.locator('.digest-topic').first()).toBeVisible();
          const footer = page
            .getByRole('link', { name: 'Past editions →', exact: true })
            .last();
          await footer.scrollIntoViewIfNeeded();
          await expect(footer).toBeVisible();
          const bounds = await footer.boundingBox();
          assert.ok(bounds && bounds.width >= 44 && bounds.height >= 44);
          await footer.focus();
          await page.keyboard.press('Tab');
          await page.keyboard.press('Shift+Tab');
          await expect(footer).toBeFocused();
          assert.equal(
            await footer.evaluate(
              (node) => getComputedStyle(node).outlineStyle,
            ),
            'solid',
          );
          assert.ok(
            await page.evaluate(
              () => document.documentElement.scrollWidth <= innerWidth,
            ),
          );
          await footer.screenshot({
            path: `docs/screenshots/ui/reader-footer-${name}-${device}-${theme}.png`,
          });
          await page.keyboard.press('Enter');
          await expect(page).toHaveURL(`${origin}/editions?page=1`);
          await expect(
            page.getByRole('heading', { name: 'Past editions', exact: true }),
          ).toBeVisible();
          await expect(page.locator('main')).toBeVisible();
        }
        assert.deepEqual(errors, []);
        await context.close();
        console.log(
          `${device}/${theme}: latest and historical footer targets, focus and archive navigation pass`,
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
