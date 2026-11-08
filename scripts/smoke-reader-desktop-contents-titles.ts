// GET-only checks using the actual published edition, with external requests blocked.
import assert from 'node:assert/strict';

import { chromium } from 'playwright';

async function smoke() {
  const origin = 'http://127.0.0.1:8000';
  const browser = await chromium.launch();
  try {
    for (const width of [1024, 1440]) {
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
        const nav = page.getByRole('navigation', { name: 'Edition contents' });
        const story = nav.locator('a[href^="#story-"]').first();
        await story.waitFor();
        const span = story.locator('span').last();
        assert.equal(
          await span.evaluate((el) => getComputedStyle(el).whiteSpace),
          'normal',
        );
        assert.equal(
          await span.evaluate((el) => el.scrollWidth <= el.clientWidth),
          true,
        );
        const bounds = await story.boundingBox();
        assert.ok(bounds && bounds.height >= 20);
        assert.ok(
          await span.evaluate((el) => el.getBoundingClientRect().height > 24),
        );
        await story.focus();
        await page.keyboard.press('Tab');
        await page.keyboard.press('Shift+Tab');
        assert.equal(
          await story.evaluate((el) => getComputedStyle(el).outlineStyle),
          'solid',
        );
        await page.screenshot({
          path: `docs/screenshots/ui/desktop-contents-titles-${width}-${theme}.png`,
        });
        const target = await story.getAttribute('href');
        await page.keyboard.press('Enter');
        assert.equal(
          await page.evaluate(() => '#' + document.activeElement?.id),
          target,
        );
        await page.waitForFunction(
          () => document.documentElement.scrollWidth <= innerWidth,
        );
        assert.deepEqual(errors, []);
        await page.close();
        console.log(
          `${width}px ${theme}: full story title and keyboard navigation pass`,
        );
      }
    }
  } finally {
    await browser.close();
  }
}
void smoke();
