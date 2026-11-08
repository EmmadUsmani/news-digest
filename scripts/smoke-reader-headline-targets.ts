// Published content only; external requests blocked and no server writes.
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
        const response = await context.request.get(
          `${origin}/api/editions/latest`,
        );
        assert.equal(response.status(), 200);
        const edition = await response.json();
        await page.goto(origin);
        await page.evaluate(() => document.fonts.ready);
        const headlines = page.locator('.digest-topic h3 a');
        const stories = edition.topics.flatMap(
          (topic: { stories: { title: string; url: string }[] }) =>
            topic.stories,
        );
        assert.ok(stories.length > 0);
        await expect(headlines).toHaveCount(stories.length);
        for (let index = 0; index < stories.length; index++) {
          const link = headlines.nth(index);
          await expect(link).toHaveText(stories[index].title);
          await expect(link).toHaveAttribute('href', stories[index].url);
          await expect(link).toHaveAttribute('target', '_blank');
          const bounds = await link.boundingBox();
          assert.ok(bounds && bounds.height >= 44 && bounds.width >= 44);
        }
        const first = headlines.first();
        await first.scrollIntoViewIfNeeded();
        await first.focus();
        await page.keyboard.press('Tab');
        await page.keyboard.press('Shift+Tab');
        await expect(first).toBeFocused();
        assert.equal(
          await first.evaluate((node) => getComputedStyle(node).outlineStyle),
          'solid',
        );
        assert.ok(
          await page.evaluate(
            () => document.documentElement.scrollWidth <= innerWidth,
          ),
        );
        await page
          .locator('[id^="story-"]')
          .first()
          .screenshot({
            path: `docs/screenshots/ui/reader-headline-targets-${width}-${theme}.png`,
          });
        assert.deepEqual(errors, []);
        await context.close();
        console.log(
          `${width}/${theme}: ${stories.length} published headlines retain titles/links and have 44px targets; keyboard focus and overflow pass`,
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
