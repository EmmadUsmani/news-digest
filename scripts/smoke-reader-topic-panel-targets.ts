// Published content only; browser-local preferences, no server writes.
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
        const trigger = page.getByRole('button', {
          name: 'Topics',
          exact: true,
        });
        const triggerBounds = await trigger.boundingBox();
        assert.ok(
          triggerBounds &&
            triggerBounds.height >= 44 &&
            triggerBounds.width >= 44,
        );
        await trigger.focus();
        await page.keyboard.press('Enter');
        const dialog = page.getByRole('dialog', { name: 'Your topics' });
        await expect(dialog).toBeVisible();
        const close = dialog.getByRole('button', { name: 'Close menu' });
        const bounds = await close.boundingBox();
        assert.ok(bounds && bounds.height >= 44 && bounds.width >= 44);
        await close.focus();
        await page.keyboard.press('Tab');
        await page.keyboard.press('Shift+Tab');
        await expect(close).toBeFocused();
        assert.equal(
          await close.evaluate((node) => getComputedStyle(node).outlineStyle),
          'solid',
        );
        const titleRight = await dialog
          .getByRole('heading')
          .evaluate((node) => {
            const range = document.createRange();
            range.selectNodeContents(node);
            return range.getBoundingClientRect().right;
          });
        assert.ok(bounds.x >= titleRight);
        await page.screenshot({
          path: `docs/screenshots/ui/reader-topic-panel-${width}-${theme}.png`,
        });
        const choices = dialog.getByRole('checkbox');
        await expect(choices).toHaveCount(4);
        await choices.first().uncheck();
        await close.click();
        await expect(trigger).toBeFocused();
        await expect(page.locator('.digest-topic')).toHaveCount(3);
        await page.reload();
        await expect(page.locator('.digest-topic')).toHaveCount(3);
        await trigger.click();
        await expect(choices.first()).not.toBeChecked();
        await choices.first().check();
        await page.keyboard.press('Escape');
        await expect(trigger).toBeFocused();
        await expect(page.locator('.digest-topic')).toHaveCount(4);
        assert.ok(
          await page.evaluate(
            () => document.documentElement.scrollWidth <= innerWidth,
          ),
        );
        assert.deepEqual(errors, []);
        await context.close();
        console.log(
          `${width}/${theme}: topic panel targets, keyboard focus and persisted choices pass`,
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
