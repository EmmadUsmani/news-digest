// Read-only published history; enlarge text without scaling the viewport.
import assert from 'node:assert/strict';

import { chromium, expect } from 'playwright/test';

async function smoke() {
  const origin = 'http://127.0.0.1:8000';
  const browser = await chromium.launch();
  try {
    for (const width of [1440, 390, 320]) {
      for (const theme of ['light', 'dark'] as const) {
        const page = await browser.newPage({
          viewport: { width, height: 844 },
          colorScheme: theme,
        });
        const errors: string[] = [];
        page.on('pageerror', (error) => errors.push(error.message));
        await page.route('**/*', (route) => {
          const request = route.request();
          assert.ok(['GET', 'HEAD'].includes(request.method()));
          if (new URL(request.url()).origin !== origin) return route.abort();
          return route.continue({
            headers: {
              ...request.headers(),
              'X-Forwarded-For': '192.0.2.165',
            },
          });
        });
        for (const path of ['/editions', '/saved']) {
          await page.goto(`${origin}${path}`);
          if (path === '/editions')
            await expect(page.locator('main li').first()).toBeVisible();
          await page.addStyleTag({
            content: 'html { font-size: 200% !important; }',
          });
          const header = page.locator('main > header');
          for (const control of await header.locator('a, button').all()) {
            const box = await control.boundingBox();
            assert.ok(
              box &&
                box.x >= 0 &&
                box.x + box.width <= width &&
                box.height >= 44,
              `${path}: enlarged navigation fits and retains touch targets`,
            );
            await control.focus();
            await expect(control).toBeFocused();
          }
          assert.ok(
            await page.evaluate(
              () => document.documentElement.scrollWidth <= innerWidth,
            ),
            `${path}: no horizontal scrolling with 200% text at ${width}px`,
          );
          await header.screenshot({
            path: `docs/screenshots/ui/${path.slice(1)}-enlarged-navigation-${width}-${theme}.png`,
          });
          const destination =
            path === '/saved' ? 'Past editions' : 'Saved items';
          await header.getByRole('link', { name: destination }).focus();
          await page.keyboard.press('Enter');
          await expect(
            page.getByRole('heading', { name: destination, exact: true }),
          ).toBeVisible();
        }
        assert.deepEqual(errors, []);
        await page.close();
        console.log(
          `${width}/${theme}: archive and saved headers fit at 200% text; keyboard navigation passes`,
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
