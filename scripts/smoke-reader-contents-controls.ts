// Published content only; external traffic and mutations are blocked.
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
        await expect(page.locator('.digest-topic').first()).toBeVisible();
        const mobile = width < 1024;
        const trigger = page.getByRole('button', {
          name: 'Contents',
          exact: true,
        });
        const navigation = page.getByRole('navigation', {
          name: mobile ? 'Mobile contents' : 'Edition contents',
          exact: true,
        });
        if (mobile) {
          const bounds = await trigger.boundingBox();
          assert.ok(bounds && bounds.height >= 44 && bounds.width >= 44);
          await trigger.click();
        }
        await expect(navigation).toBeVisible();
        const archive = navigation.getByRole('link', { name: 'Past editions' });
        const bounds = await archive.boundingBox();
        assert.ok(bounds && bounds.height >= 44 && bounds.width >= 44);
        await archive.focus();
        await page.keyboard.press('Tab');
        await page.keyboard.press('Shift+Tab');
        await expect(archive).toBeFocused();
        assert.equal(
          await archive.evaluate((node) => getComputedStyle(node).outlineStyle),
          'solid',
        );
        await expect(archive).toHaveAttribute('href', /\/editions/);
        assert.ok(
          await page.evaluate(
            () => document.documentElement.scrollWidth <= innerWidth,
          ),
        );
        await (mobile ? page.getByRole('dialog') : navigation).screenshot({
          path: `docs/screenshots/ui/reader-contents-controls-${width}-${theme}.png`,
        });
        if (mobile) {
          await page.keyboard.press('Escape');
          await expect(trigger).toBeFocused();
          await trigger.click();
        }
        await archive.click();
        await expect(
          page.getByRole('heading', { name: 'Past editions', exact: true }),
        ).toBeVisible();
        assert.deepEqual(errors, []);
        await context.close();
        console.log(
          `${width}/${theme}: contents targets, keyboard focus, archive navigation pass`,
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
