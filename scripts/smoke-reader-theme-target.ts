// Published reader routes only. Block external traffic and all server mutations.
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
        for (const path of [
          '/',
          `/editions/${older.id}`,
          '/editions?page=1',
          '/saved',
        ]) {
          await page.goto(`${origin}${path}`);
          await expect(page.getByRole('heading').first()).toBeAttached();
          if (path === '/' || path.startsWith('/editions/'))
            await expect(page.locator('.digest-topic').first()).toBeVisible();
          const next = theme === 'light' ? 'dark' : 'light';
          const toggle = page.getByRole('button', {
            name: `Switch to ${next} theme`,
          });
          const bounds = await toggle.boundingBox();
          assert.ok(
            bounds && bounds.height >= 44 && bounds.width >= 44,
            `${path}: theme target`,
          );
          await toggle.focus();
          await page.keyboard.press('Tab');
          await page.keyboard.press('Shift+Tab');
          await expect(toggle).toBeFocused();
          assert.equal(
            await toggle.evaluate(
              (node) => getComputedStyle(node).outlineStyle,
            ),
            'solid',
          );
          await page.keyboard.press('Enter');
          await expect(page.locator('html')).toHaveClass(
            next === 'dark' ? /dark/ : /^(?!.*dark)/,
          );
          await page.keyboard.press('Space');
          await expect(toggle).toBeFocused();
          await expect(page.locator('html')).toHaveClass(
            theme === 'dark' ? /dark/ : /^(?!.*dark)/,
          );
          assert.ok(
            await page.evaluate(
              () => document.documentElement.scrollWidth <= innerWidth,
            ),
            `${path}: no overflow`,
          );
          if (path === '/')
            await page.locator('main > header').screenshot({
              path: `docs/screenshots/ui/reader-theme-target-${width}-${theme}.png`,
            });
          await page.reload();
          await expect(toggle).toBeVisible();
        }
        assert.deepEqual(errors, []);
        await context.close();
        console.log(
          `${width}/${theme}: four published reader routes, 44px target, keyboard toggle, focus, reload and layout pass`,
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
