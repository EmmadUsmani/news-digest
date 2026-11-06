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
      const navigation = page.getByRole('navigation', {
        name: 'Edition contents',
        exact: true,
      });
      const targets = [
        page.locator('.digest-topic').nth(-2).locator('[id^="posts-"]'),
        page.locator('.digest-topic').last().locator('[id^="posts-"]'),
        page.locator('.digest-topic').first().locator('h2'),
      ];
      for (const target of targets) {
        const id = await target.getAttribute('id');
        await target.evaluate((element) => element.scrollIntoView());
        await navigation.locator(`a[href="#${id}"][aria-current]`).waitFor();
        const readingPosition = await page.evaluate(() => window.scrollY);
        if (target === targets[0]) {
          await page.setViewportSize({ width: 1280, height: 400 });
        }
        await page.waitForFunction(() => {
          const nav = document.querySelector(
            'nav[aria-label="Edition contents"]',
          )!;
          const current = nav.querySelector('[aria-current]')!;
          const entry = current.getBoundingClientRect();
          const panel = nav.parentElement!.getBoundingClientRect();
          return entry.top >= panel.top - 1 && entry.bottom <= panel.bottom + 1;
        });
        assert.equal(
          await page.evaluate(() => window.scrollY),
          readingPosition,
        );
        const top = await target.evaluate(
          (element) => element.getBoundingClientRect().top,
        );
        assert.ok(
          top >= 60 && top <= 150,
          'Revealing contents must preserve the edition reading position',
        );
        if (target === targets[0]) {
          await page.screenshot({
            path: `docs/screenshots/ui/reader-short-contents-${theme}.png`,
          });
        }
      }
      await page.close();
    }
    console.log(
      'Short desktop contents: active entries visible after resizing and in both directions; light/dark passed.',
    );
  } finally {
    await browser.close();
  }
}
void smoke().catch((error: unknown) => {
  console.error(error);
  process.exitCode = 1;
});
