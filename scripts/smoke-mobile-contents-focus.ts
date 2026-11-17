// Published content only; block external requests and server mutations.
import assert from 'node:assert/strict';

import { chromium, expect } from 'playwright/test';

async function smoke() {
  const origin = 'http://127.0.0.1:8000';
  const browser = await chromium.launch();
  try {
    for (const width of [320, 390]) {
      for (const theme of ['light', 'dark'] as const) {
        for (const scale of [100, 200, 300]) {
          const page = await browser.newPage({
            viewport: { width, height: 900 },
            colorScheme: theme,
            extraHTTPHeaders: { 'X-Forwarded-For': '192.0.2.168' },
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
          await page
            .getByRole('button', { name: 'Contents', exact: true })
            .click();
          const nav = page.getByRole('navigation', {
            name: 'Mobile contents',
            exact: true,
          });
          await expect(nav.locator('a[href^="#story-"]').first()).toBeVisible();
          await page.evaluate((value) => {
            document.documentElement.style.fontSize = `${value}%`;
          }, scale);
          await page.evaluate(() => document.fonts.ready);
          await page.keyboard.press('Tab');
          // Traverse forward and backward, including links at both scroll edges.
          const links = nav.locator('a');
          const count = await links.count();
          for (const index of [
            ...Array.from({ length: count }, (_, i) => i),
            ...Array.from({ length: count }, (_, i) => count - i - 1),
          ]) {
            const link = links.nth(index);
            await link.focus();
            await expect(link).toBeFocused();
            await expect
              .poll(() =>
                link.evaluate((element) => {
                  const box = element.getBoundingClientRect();
                  const panel = element
                    .closest('nav')!
                    .parentElement!.getBoundingClientRect();
                  const style = getComputedStyle(element);
                  const outward = Math.max(
                    0,
                    parseFloat(style.outlineWidth) +
                      parseFloat(style.outlineOffset),
                  );
                  return (
                    style.outlineStyle === 'solid' &&
                    parseFloat(style.outlineWidth) >= 2 &&
                    box.left - outward >= panel.left &&
                    box.right + outward <= panel.right &&
                    // A long enlarged headline can exceed the panel height.
                    ((box.height > panel.height &&
                      box.bottom > panel.top &&
                      box.top < panel.bottom) ||
                      (box.top - outward >= panel.top - 1 &&
                        box.bottom + outward <= panel.bottom + 1))
                  );
                }),
              )
              .toBe(true);
          }
          if (width === 320 && scale === 300)
            await page.screenshot({
              path: `docs/screenshots/ui/mobile-contents-focus-${theme}.png`,
            });
          const story = nav.locator('a[href^="#story-"]').first();
          await story.focus();
          const target = await story.getAttribute('href');
          await page.keyboard.press('Enter');
          await expect(page).toHaveURL(new RegExp(`${target}$`));
          assert.deepEqual(errors, []);
          await page.close();
          console.log(
            `${width}/${theme}/${scale}%: mobile contents focus rings and story navigation pass`,
          );
        }
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
