// Real saved history replayed with both pagination directions; no server writes.
import assert from 'node:assert/strict';

import { readerEditionHistorySchema } from '@digest/contracts';
import { chromium } from 'playwright';

async function smoke() {
  const origin = 'http://127.0.0.1:8000';
  // Documentation-range visitor for loopback public admission; no identity.
  const visitor = '192.0.2.164';
  const response = await fetch(`${origin}/api/editions?offset=0`, {
    headers: { 'X-Forwarded-For': visitor },
    redirect: 'error',
    signal: AbortSignal.timeout(15_000),
  });
  assert.equal(response.status, 200, 'Saved history is available');
  const saved = readerEditionHistorySchema.parse(await response.json());
  assert.ok(saved.entries.length, 'Use real published history');
  const browser = await chromium.launch();
  try {
    for (const [device, width, height] of [
      ['desktop', 1440, 1100],
      ['mobile', 390, 844],
      ['narrow', 320, 844],
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
                hasMore: true,
              },
            });
          }
          assert.ok(!url.pathname.startsWith('/api/admin/'));
          return route.continue({
            headers: { ...request.headers(), 'X-Forwarded-For': visitor },
          });
        });
        await page.goto(`${origin}/editions`);
        const heading = page.getByRole('heading', { name: 'Past editions' });
        await page.locator('main li').first().waitFor();
        assert.equal(
          await heading.evaluate((el) => el === document.activeElement),
          false,
          'Initial arrival keeps normal browser focus',
        );
        await page.goto(`${origin}/editions?page=2`);
        await page.locator('main li').first().waitFor();
        const navigation = page.getByRole('navigation', {
          name: 'Edition pages',
        });
        await navigation.scrollIntoViewIfNeeded();
        assert.equal(await navigation.getByRole('link').count(), 2);
        for (const link of await navigation.getByRole('link').all()) {
          assert.equal(
            await link.evaluate((element) => {
              const range = document.createRange();
              range.selectNodeContents(element);
              return range.getClientRects().length;
            }),
            1,
            'Pagination labels remain on one line',
          );
          const box = await link.boundingBox();
          assert.ok(
            box && box.height >= 44 && box.x >= 0 && box.x + box.width <= width,
          );
        }
        await page.screenshot({
          path: `docs/screenshots/ui/archive-pagination-layout-${device}-${theme}.png`,
        });
        assert.deepEqual(errors, []);
        assert.equal(
          await page.evaluate(
            () => document.documentElement.scrollWidth <= innerWidth,
          ),
          true,
        );
        await page.close();
        console.log(
          `${device} ${theme}: pagination labels, touch targets and overflow passed`,
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
