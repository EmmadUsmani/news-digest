// Real published edition; read-only loopback admission, no external traffic.
import assert from 'node:assert/strict';

import { chromium, expect } from 'playwright/test';

const origin = 'http://127.0.0.1:8000';
async function main() {
  const browser = await chromium.launch();
  try {
    for (const width of [1440, 390, 320]) {
      for (const theme of ['light', 'dark'] as const) {
        const context = await browser.newContext({
          viewport: { width, height: 900 },
          colorScheme: theme,
        });
        await context.route('**/*', (route) => {
          assert.equal(route.request().method(), 'GET');
          return new URL(route.request().url()).origin === origin
            ? route.continue({
                headers: {
                  ...route.request().headers(),
                  'X-Forwarded-For': '192.0.2.174',
                },
              })
            : route.abort();
        });
        const page = await context.newPage();
        await page.goto(origin);
        await expect(page.locator('.digest-topic').first()).toBeVisible();
        const home = page.locator('header').getByRole('link', {
          name: 'News Digest',
          exact: true,
        });
        for (const scale of [100, 200]) {
          await page.addStyleTag({
            content: `html { font-size: ${scale}% !important; }`,
          });
          await home.scrollIntoViewIfNeeded();
          const bounds = await home.boundingBox();
          assert.ok(
            bounds && bounds.width >= 44 && bounds.height >= 44,
            `${width}/${theme}/${scale}%: home link needs a 44px touch target; got ${JSON.stringify(bounds)}`,
          );
          assert.ok(bounds.x >= 0 && bounds.x + bounds.width <= width);
          await home.focus();
          await page.keyboard.press('Tab');
          await page.keyboard.press('Shift+Tab');
          await expect(home).toBeFocused();
          assert.equal(
            await home.evaluate((node) => getComputedStyle(node).outlineStyle),
            'solid',
          );
          assert.equal(await home.getAttribute('href'), '/');
        }
        await page.locator('header').screenshot({
          path: `docs/screenshots/ui/reader-home-target-${width}-${theme}.png`,
        });
        await context.close();
        console.log(
          `${width}/${theme}: published home link target/focus pass at 100% and 200% text`,
        );
      }
    }
  } finally {
    await browser.close();
  }
}
void main().catch((error: unknown) => {
  console.error(error);
  process.exitCode = 1;
});
