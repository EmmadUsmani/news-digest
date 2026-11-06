// Read-only saved-edition regression for independently scrolling contents.
import assert from 'node:assert/strict';

import { chromium } from 'playwright';

async function smoke() {
  const browser = await chromium.launch();
  try {
    for (const theme of ['light', 'dark'] as const) {
      const page = await browser.newPage({
        viewport: { width: 1280, height: 900 },
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
      await page.locator('.digest-topic').last().waitFor();
      const target = page
        .locator('.digest-topic')
        .last()
        .locator('[id^="posts-"]');
      await target.evaluate((element) => element.scrollIntoView());
      const topicId = (await target.getAttribute('id'))!.replace('posts-', '');
      const chip = page
        .locator(`a[href="#topic-${topicId}"][aria-current]`)
        .last();
      await chip.waitFor({ state: 'attached' });
      for (const width of [390, 320, 844, 320]) {
        await page.setViewportSize({ width, height: 844 });
        // Let responsive layout and browser scroll anchoring settle first.
        await page.evaluate(
          () =>
            new Promise<void>((resolve) => {
              requestAnimationFrame(() =>
                requestAnimationFrame(() => resolve()),
              );
            }),
        );
        const readingPosition = await page.evaluate(() => window.scrollY);
        await page.waitForFunction(
          () => {
            const current = document.querySelector(
              'div.overflow-x-auto > a[aria-current="location"]',
            )!;
            const entry = current.getBoundingClientRect();
            const row = current.parentElement!.getBoundingClientRect();
            return entry.left >= row.left - 1 && entry.right <= row.right + 1;
          },
          undefined,
          { timeout: 3000 },
        );
        assert.equal(
          await page.evaluate(() => window.scrollY),
          readingPosition,
          'Revealing the current chip must not move the edition',
        );
        if (width === 390)
          await page.screenshot({
            path: `docs/screenshots/ui/reader-chip-resize-${theme}.png`,
          });
      }
      await page.close();
    }
    console.log(
      'Current mobile topic stays visible through desktop transition, narrowing and rotation; light/dark passed.',
    );
  } finally {
    await browser.close();
  }
}
void smoke().catch((error: unknown) => {
  console.error(error);
  process.exitCode = 1;
});
