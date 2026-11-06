// Read-only saved-edition check for opening contents at the current entry.
import assert from 'node:assert/strict';

import { chromium } from 'playwright';

async function smoke() {
  const browser = await chromium.launch();
  try {
    for (const theme of ['light', 'dark'] as const) {
      const page = await browser.newPage({
        viewport: { width: 390, height: 400 },
        colorScheme: theme,
        reducedMotion: 'reduce',
      });
      await page.route('**/*', (route) => {
        const request = route.request();
        return new URL(request.url()).origin === 'http://127.0.0.1:8000' &&
          request.method() === 'GET'
          ? route.continue()
          : route.abort();
      });
      await page.goto('http://127.0.0.1:8000');
      const target = page
        .locator('.digest-topic')
        .last()
        .locator('[id^="posts-"]');
      await target.waitFor();
      await target.evaluate((element) => element.scrollIntoView());
      const id = await target.getAttribute('id');
      await page
        .locator(
          `nav[aria-label="Edition contents"] a[href="#${id}"][aria-current]`,
        )
        .waitFor({ state: 'attached' });
      const position = await page.evaluate(() => window.scrollY);
      const trigger = page.getByRole('button', {
        name: 'Contents',
        exact: true,
      });
      await trigger.click();
      const dialog = page.getByRole('dialog', { name: 'Edition contents' });
      const current = dialog.locator('[aria-current="location"]');
      await current.waitFor();
      const bounds = await current.boundingBox();
      assert.ok(
        bounds && bounds.y >= 0 && bounds.y + bounds.height <= 400,
        'Current entry should be visible when contents opens',
      );
      assert.equal(
        await current.evaluate((element) => element === document.activeElement),
        true,
        'Keyboard navigation should start at the current entry',
      );
      await page.screenshot({
        path: `docs/screenshots/ui/reader-sheet-current-${theme}.png`,
      });
      await page.keyboard.press('Escape');
      await dialog.waitFor({ state: 'hidden' });
      assert.equal(
        await trigger.evaluate((element) => element === document.activeElement),
        true,
      );
      assert.equal(
        await page.evaluate(() => window.scrollY),
        position,
        'Opening and dismissing contents must preserve reading position',
      );
      await page.close();
    }
    console.log(
      'Mobile contents opens with current entry visible and focused; Escape restores trigger and reading position; light/dark passed.',
    );
  } finally {
    await browser.close();
  }
}
void smoke().catch((error: unknown) => {
  console.error(error);
  process.exitCode = 1;
});
