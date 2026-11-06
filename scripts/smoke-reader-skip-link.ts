// Keyboard-only navigation against saved reader data; no writes or external requests.
import assert from 'node:assert/strict';

import { readerEditionSchema } from '@digest/contracts';
import { chromium } from 'playwright';

async function smoke() {
  const origin = 'http://127.0.0.1:8000';
  const saved = readerEditionSchema.parse(
    await (await fetch(`${origin}/api/editions/latest`)).json(),
  );
  const browser = await chromium.launch();
  try {
    for (const [device, width, height] of [
      ['desktop', 1440, 1100],
      ['mobile', 390, 844],
    ] as const) {
      for (const theme of ['light', 'dark'] as const) {
        const page = await browser.newPage({
          viewport: { width, height },
          colorScheme: theme,
          reducedMotion: 'reduce',
        });
        const errors: string[] = [];
        page.on('pageerror', (error) => errors.push(error.message));
        await page.route('**/*', (route) => {
          const request = route.request();
          const url = new URL(request.url());
          if (url.origin !== origin) return route.abort();
          assert.ok(['GET', 'HEAD'].includes(request.method()));
          if (url.pathname === '/api/editions/latest')
            return route.fulfill({ json: saved });
          return route.continue();
        });
        for (const [name, path, target] of [
          ['edition', '/', `topic-${saved.topics[0].id}`],
          ['archive', '/editions', 'archive-content'],
        ]) {
          await page.goto(`${origin}${path}`);
          const skip = page.getByRole('link', { name: 'Skip to content' });
          await skip.waitFor({ state: 'attached' });
          // Hidden until keyboard focus, leaving the normal reader layout intact.
          assert.equal((await skip.boundingBox())?.width, 1);
          await page.keyboard.press('Tab');
          assert.equal(
            await skip.evaluate(
              (element) => element === document.activeElement,
            ),
            true,
          );
          const box = await skip.boundingBox();
          assert.ok(box && box.width > 100 && box.y >= 0 && box.x >= 0);
          assert.equal(
            await skip.evaluate((element) => {
              const box = element.getBoundingClientRect();
              return element.contains(
                document.elementFromPoint(
                  box.x + box.width / 2,
                  box.y + box.height / 2,
                ),
              );
            }),
            true,
          );
          await page.screenshot({
            path: `docs/screenshots/ui/reader-skip-${name}-${device}-${theme}.png`,
          });
          await page.keyboard.press('Enter');
          const heading = page.locator(`[id="${target}"]`);
          assert.equal(
            await heading.evaluate(
              (element) => element === document.activeElement,
            ),
            true,
          );
          const headingBox = await heading.boundingBox();
          assert.ok(
            headingBox &&
              headingBox.y >=
                (name === 'edition' ? (device === 'mobile' ? 120 : 65) : 0) &&
              headingBox.y < height,
          );
          await page.keyboard.press('Tab');
          assert.equal(
            await page.evaluate(() => {
              const element = document.activeElement;
              return (
                !!element &&
                (element.closest('.digest-topic') !== null ||
                  element.closest('main li') !== null ||
                  element.closest('nav[aria-label="Edition pages"]') !== null)
              );
            }),
            true,
          );
          assert.equal(
            await page.evaluate(
              () => document.documentElement.scrollWidth <= innerWidth,
            ),
            true,
          );
        }
        assert.deepEqual(errors, []);
        await page.close();
        console.log(
          `${device} ${theme}: keyboard skip, focus, heading visibility and next content link passed`,
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
