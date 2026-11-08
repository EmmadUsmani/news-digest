// Read-only checks of published topics at narrow CSS viewport widths.
import assert from 'node:assert/strict';

import { chromium } from 'playwright';

async function smoke() {
  const origin = 'http://127.0.0.1:8000';
  const browser = await chromium.launch();
  try {
    for (const width of [240, 320, 1440]) {
      for (const theme of ['light', 'dark'] as const) {
        const page = await browser.newPage({
          viewport: { width, height: 844 },
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
        const trigger = page.getByRole('button', {
          name: 'Topics',
          exact: true,
        });
        await trigger.click();
        const dialog = page.getByRole('dialog', { name: 'Your topics' });
        await dialog.waitFor();
        const box = await dialog.boundingBox();
        assert.ok(box && box.x >= 0 && box.x + box.width <= width);
        const close = dialog.getByRole('button', { name: 'Close menu' });
        const closeBox = await close.boundingBox();
        assert.ok(closeBox && closeBox.x + closeBox.width <= width);
        assert.equal(
          await dialog.evaluate((el) => el.scrollWidth > el.clientWidth),
          false,
        );
        const topics = dialog.getByRole('checkbox');
        assert.equal(await topics.count(), 4);
        await topics.first().uncheck();
        await page.keyboard.press('Escape');
        await trigger.waitFor();
        assert.equal(
          await trigger.evaluate((el) => el === document.activeElement),
          true,
        );
        await page.reload();
        await trigger.click();
        assert.equal(await topics.first().isChecked(), false);
        await topics.first().check();
        await close.focus();
        await page.screenshot({
          path: `docs/screenshots/ui/narrow-topics-${width}-${theme}.png`,
        });
        await page.keyboard.press('Enter');
        assert.equal(await dialog.count(), 0);
        assert.deepEqual(errors, []);
        await page.close();
        console.log(
          `${width}px ${theme}: chooser fits, preferences persist, keyboard closes`,
        );
      }
    }
  } finally {
    await browser.close();
  }
}
void smoke();
