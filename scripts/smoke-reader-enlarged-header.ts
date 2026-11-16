// Saved live edition replay; external requests and server writes are blocked.
import assert from 'node:assert/strict';

import { readerEditionSchema } from '@digest/contracts';
import { chromium, expect } from 'playwright/test';

async function main() {
  const origin = 'http://127.0.0.1:8000';
  const headers = { 'X-Forwarded-For': '192.0.2.158' };
  const response = await fetch(`${origin}/api/editions/latest`, { headers });
  assert.equal(response.status, 200);
  const edition = readerEditionSchema.parse(await response.json());
  const browser = await chromium.launch();
  try {
    for (const width of [320, 390, 1440]) {
      for (const theme of ['light', 'dark'] as const) {
        const page = await browser.newPage({
          viewport: { width, height: 1000 },
          colorScheme: theme,
          reducedMotion: 'reduce',
          extraHTTPHeaders: headers,
        });
        const errors: string[] = [];
        page.on('pageerror', (error) => errors.push(error.message));
        await page.route('**/*', (route) => {
          assert.equal(route.request().method(), 'GET');
          const url = new URL(route.request().url());
          if (url.origin !== origin) return route.abort();
          if (url.pathname === '/api/editions/latest')
            return route.fulfill({ json: edition });
          return route.continue();
        });
        await page.goto(origin);
        await page.locator('.digest-topic').first().waitFor();
        for (const size of [200, 100]) {
          await page.addStyleTag({
            content: `html {font-size: ${size}% !important}`,
          });
          await expect
            .poll(() =>
              page.evaluate(() => document.documentElement.scrollWidth),
            )
            .toBeLessThanOrEqual(width);
          for (const control of await page
            .locator('header a, header button')
            .all()) {
            assert.ok(
              await control.evaluate((element) => {
                const box = element.getBoundingClientRect();
                return (
                  box.width > 0 && box.left >= 0 && box.right <= innerWidth
                );
              }),
              'Every header control must fit onscreen',
            );
          }
          if (width < 1024) {
            const topics = page
              .locator('a', { hasText: edition.topics[1].name })
              .filter({ visible: true })
              .first();
            await expect
              .poll(async () => {
                const header = await page.locator('header').boundingBox();
                const chip = await topics.boundingBox();
                return !!header && !!chip && chip.y >= header.y + header.height;
              })
              .toBe(true);
            await topics.click();
            await expect(topics).toHaveAttribute('aria-current', 'location');
            const destination = page.locator(
              `[id="topic-${edition.topics[1].id}"]`,
            );
            await expect
              .poll(async () => {
                const heading = await destination.boundingBox();
                const chip = await topics.boundingBox();
                return !!heading && !!chip && heading.y >= chip.y + chip.height;
              })
              .toBe(true);
          }
          if (size === 200) {
            await page.evaluate(() => window.scrollTo(0, 0));
            if (width < 1024)
              await expect(
                page.locator(`.fixed a[href="#topic-${edition.topics[0].id}"]`),
              ).toHaveAttribute('aria-current', 'location');
            await page.screenshot({
              path: `docs/screenshots/ui/reader-enlarged-header-${width}-${theme}.png`,
            });
          }
        }
        assert.deepEqual(errors, []);
        await page.close();
        console.log(
          `${width}/${theme}: header fits at 200% and 100%; topic navigation clears header`,
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
