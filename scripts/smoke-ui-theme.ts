import assert from 'node:assert/strict';

import { chromium } from 'playwright';

async function smoke() {
  const browser = await chromium.launch();
  try {
    for (const [device, width, height] of [
      ['desktop', 1440, 1100],
      ['mobile', 390, 844],
    ] as const) {
      const context = await browser.newContext({
        viewport: { width, height },
        colorScheme: 'dark',
      });
      const page = await context.newPage();
      const errors: string[] = [];
      page.on('pageerror', (error) => errors.push(error.message));
      await page.goto('http://localhost:8000/');
      await page.locator('.digest-preview h2').first().waitFor();
      const isDark = () =>
        page.evaluate(() =>
          document.documentElement.classList.contains('dark'),
        );
      assert.equal(await isDark(), true, 'Defaults to system dark');
      await page.emulateMedia({ colorScheme: 'light' });
      await page
        .getByRole('button', { name: 'Switch to dark theme' })
        .waitFor();
      assert.equal(await isDark(), false, 'Follows system changes');
      for (const theme of ['light', 'dark'] as const) {
        if (theme === 'dark')
          await page
            .getByRole('button', { name: 'Switch to dark theme' })
            .click();
        await page.evaluate(() => document.fonts.ready);
        assert.ok(
          await page.evaluate(
            () => document.documentElement.scrollWidth <= innerWidth,
          ),
        );
        await page.screenshot({
          animations: 'disabled',
          path: `docs/screenshots/ui/foundations-theme-${device}-${theme}.png`,
        });
      }
      await page.reload();
      await page
        .getByRole('button', { name: 'Switch to light theme' })
        .waitFor();
      assert.equal(
        await isDark(),
        true,
        'Saved dark overrides system light after reload',
      );
      const sibling = await context.newPage();
      await sibling.goto('http://localhost:8000/');
      await sibling
        .getByRole('button', { name: 'Switch to light theme' })
        .click();
      await page
        .getByRole('button', { name: 'Switch to dark theme' })
        .waitFor();
      assert.equal(await isDark(), false, 'Other tabs follow saved preference');
      assert.deepEqual(errors, []);
      await context.close();
    }
    const context = await browser.newContext({ colorScheme: 'dark' });
    await context.addInitScript(() => {
      Object.defineProperty(window, 'localStorage', {
        get() {
          throw new Error('Storage disabled');
        },
      });
    });
    const page = await context.newPage();
    await page.goto('http://localhost:8000/');
    await page.getByRole('button', { name: 'Switch to light theme' }).click();
    await page.getByRole('button', { name: 'Switch to dark theme' }).waitFor();
    await context.close();
    console.log(
      'Theme desktop/mobile, system changes, persistence, cross-tab and blocked storage passed.',
    );
  } finally {
    await browser.close();
  }
}
void smoke().catch((error: unknown) => {
  console.error(error);
  process.exitCode = 1;
});
