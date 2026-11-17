// Read-only published content; external requests and server mutations blocked.
import assert from 'node:assert/strict';

import { chromium, expect } from 'playwright/test';

async function smoke() {
  const origin = 'http://127.0.0.1:8000';
  const browser = await chromium.launch();
  try {
    for (const width of [390, 1440]) {
      for (const theme of ['light', 'dark'] as const) {
        for (const scale of [100, 200, 300]) {
          const page = await browser.newPage({
            viewport: { width, height: 1000 },
            colorScheme: theme,
            extraHTTPHeaders: { 'X-Forwarded-For': '192.0.2.169' },
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
          const summaries = page.locator('.digest-topic .excerpt');
          await expect(summaries).toHaveCount(25);
          await page.evaluate((value) => {
            document.documentElement.style.fontSize = `${value}%`;
          }, scale);
          await page.evaluate(() => document.fonts.ready);
          const measurements = await summaries.evaluateAll((elements) =>
            elements.map((element) => {
              const style = getComputedStyle(element);
              const card = element.closest('[id^="story-"]')!;
              const link = card.querySelector('h3 a') as HTMLAnchorElement;
              return {
                top: style.marginTop,
                bottom: style.marginBottom,
                font: parseFloat(style.fontSize),
                text: element.textContent?.trim(),
                url: link.href,
              };
            }),
          );
          for (const item of measurements) {
            assert.equal(item.top, '12px');
            assert.equal(item.bottom, '12px');
            assert.equal(item.font, (16 * scale) / 100);
            assert.ok(item.text && item.text.length > 40);
            assert.match(item.url, /^https?:\/\//);
          }
          const first = page.locator('.digest-topic [id^="story-"]').first();
          const link = first.locator('h3 a');
          await link.focus();
          await expect(link).toBeFocused();
          await first.scrollIntoViewIfNeeded();
          if (scale === 300) {
            await summaries.first().evaluate((element) => {
              const headerHeight =
                parseFloat(
                  getComputedStyle(document.documentElement).getPropertyValue(
                    '--reader-header-height',
                  ),
                ) || 0;
              const topicHeight =
                parseFloat(
                  getComputedStyle(document.documentElement).getPropertyValue(
                    '--reader-topic-bar-height',
                  ),
                ) || 0;
              window.scrollTo({
                top:
                  window.scrollY +
                  element.getBoundingClientRect().top -
                  headerHeight -
                  topicHeight -
                  90,
                behavior: 'instant',
              });
            });
            await page.screenshot({
              path: `docs/screenshots/ui/story-summary-spacing-${width}-${theme}.png`,
            });
          }
          assert.deepEqual(errors, []);
          await page.close();
          console.log(
            `${width}/${theme}/${scale}%: 25 real summaries retain 12px margins and enlarged text`,
          );
        }
      }
    }
  } finally {
    await browser.close();
  }
}

void smoke();
