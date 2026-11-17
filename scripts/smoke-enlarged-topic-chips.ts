// Published edition only; no server writes or third-party requests.
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
            viewport: { width, height: 844 },
            colorScheme: theme,
            reducedMotion: 'reduce',
          });
          const errors: string[] = [];
          page.on('pageerror', (error) => errors.push(error.message));
          await page.route('**/*', (route) => {
            const request = route.request();
            assert.ok(['GET', 'HEAD'].includes(request.method()));
            return new URL(request.url()).origin === origin
              ? route.continue({
                  headers: {
                    ...request.headers(),
                    'X-Forwarded-For': '192.0.2.166',
                  },
                })
              : route.abort();
          });
          await page.goto(origin);
          await expect(
            page.getByRole('button', { name: /^Save story:/ }).first(),
          ).toBeVisible();
          await page.evaluate((value) => {
            document.documentElement.style.fontSize = `${value}%`;
          }, scale);
          await page.evaluate(() => document.fonts.ready);
          const chips = page.locator('.reader-topic-navigation a');
          assert.equal(await chips.count(), 5);
          for (let index = 0; index < (await chips.count()); index++) {
            const chip = chips.nth(index);
            const readingPosition = await page.evaluate(() => window.scrollY);
            await chip.focus();
            assert.equal(
              await page.evaluate(() => window.scrollY),
              readingPosition,
              'Revealing keyboard focus must preserve the edition position',
            );
            await expect
              .poll(() =>
                chip.evaluate((element) => {
                  const box = element.getBoundingClientRect();
                  const parent = element.parentElement!.getBoundingClientRect();
                  return (
                    box.width <= parent.width + 1 &&
                    box.left >= parent.left - 1 &&
                    box.right <= parent.right + 1 &&
                    element.scrollWidth <= element.clientWidth + 1 &&
                    element.scrollHeight <= element.clientHeight + 1 &&
                    box.height >= 44
                  );
                }),
              )
              .toBe(true);
            await page.keyboard.press('Enter');
            const target = await chip.getAttribute('href');
            assert.ok(target);
            await expect(chip).toHaveAttribute('aria-current', 'location');
            await expect
              .poll(() =>
                page
                  .locator(`[id="${target.slice(1)}"]`)
                  .evaluate((element) => {
                    const top = element.getBoundingClientRect().top;
                    const bar = document
                      .querySelector('.reader-topic-navigation')!
                      .getBoundingClientRect();
                    return top >= bar.bottom - 1 && top < innerHeight;
                  }),
              )
              .toBe(true);
          }
          assert.equal(
            await page.evaluate(
              () => document.documentElement.scrollWidth <= innerWidth,
            ),
            true,
          );
          if (width === 320 && scale === 300)
            await page.screenshot({
              path: `docs/screenshots/ui/enlarged-topic-chips-${theme}.png`,
            });
          assert.deepEqual(errors, []);
          await page.close();
          console.log(
            `${width}/${theme}/${scale}%: all five labels fit; keyboard topic anchors remain visible`,
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
