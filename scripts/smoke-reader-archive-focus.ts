// Read-only saved-data replay; two archive pages are simulated, never written.
import assert from 'node:assert/strict';

import { readerEditionHistorySchema } from '@digest/contracts';
import { chromium } from 'playwright';

async function smoke() {
  const origin = 'http://127.0.0.1:8000';
  const saved = readerEditionHistorySchema.parse(
    await (await fetch(`${origin}/api/editions?offset=0`)).json(),
  );
  assert.ok(saved.entries.length);
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
        });
        const errors: string[] = [];
        page.on('pageerror', (error) => errors.push(error.message));
        await page.route('**/*', async (route) => {
          const request = route.request();
          const url = new URL(request.url());
          assert.ok(['GET', 'HEAD'].includes(request.method()));
          if (url.origin !== origin) return route.abort();
          if (url.pathname === '/api/editions') {
            const second = url.searchParams.get('offset') === '20';
            if (second)
              await new Promise((resolve) => setTimeout(resolve, 600));
            return route.fulfill({
              json: {
                entries: saved.entries,
                hasMore: !second,
              },
            });
          }
          return route.continue();
        });
        await page.goto(`${origin}/editions`);
        const heading = page.getByRole('heading', { name: 'Past editions' });
        await page.locator('main li').first().waitFor();
        assert.equal(
          await heading.evaluate((el) => el === document.activeElement),
          false,
          'Initial arrival keeps normal browser focus',
        );
        for (const [name, number] of [
          ['Older editions', 2],
          ['Newer editions', 1],
        ] as const) {
          const link = page.getByRole('link', { name });
          await link.focus();
          await page.keyboard.press('Tab');
          await page.keyboard.press('Shift+Tab');
          const target = await link.boundingBox();
          assert.ok(target && target.width >= 44 && target.height >= 44);
          assert.equal(
            await link.evaluate(
              (element) => getComputedStyle(element).outlineStyle,
            ),
            'solid',
            'Keyboard navigation has a visible focus outline',
          );
          await page.screenshot({
            path: `docs/screenshots/ui/archive-pagination-${number}-${device}-${theme}.png`,
          });
          await page.keyboard.press('Enter');
          await page.waitForFunction((number) => {
            const heading = document.getElementById('archive-content');
            return (
              heading === document.activeElement &&
              heading?.getAttribute('aria-description') === `Page ${number}`
            );
          }, number);
          const box = await heading.boundingBox();
          assert.ok(box && box.y >= 0 && box.y < height / 2);
          await page.screenshot({
            path: `docs/screenshots/ui/reader-archive-page-${number}-${device}-${theme}.png`,
          });
          await page.keyboard.press('Tab');
          assert.equal(
            await page.evaluate(
              () => document.activeElement?.closest('main li') !== null,
            ),
            true,
            'Tab resumes at the first date on the new page',
          );
        }
        assert.deepEqual(errors, []);
        assert.equal(
          await page.evaluate(
            () => document.documentElement.scrollWidth <= innerWidth,
          ),
          true,
        );
        await page.close();
        console.log(
          `${device} ${theme}: delayed pagination, heading focus, page description and next date passed`,
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
