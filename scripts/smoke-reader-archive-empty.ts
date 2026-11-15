// Real saved history plus an empty out-of-range page replay; no server writes.
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
            if (url.searchParams.get('offset') === '19960')
              return route.fulfill({ json: { entries: [], hasMore: false } });
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
        await page.goto(`${origin}/editions?page=999`);
        await page.getByText('No editions on this page.').waitFor();
        const recovery = page.getByRole('link', {
          name: 'Back to newest editions',
        });
        await recovery.waitFor({ timeout: 3000 });
        await recovery.focus();
        const box = await recovery.boundingBox();
        assert.ok(
          box && box.height >= 44 && box.x >= 0 && box.x + box.width <= width,
        );
        await page.screenshot({
          path: `docs/screenshots/ui/archive-empty-recovery-${device}-${theme}.png`,
        });
        await page.keyboard.press('Enter');
        await page.locator('main li').first().waitFor();
        await page.waitForFunction(
          () =>
            document.getElementById('archive-content') ===
            document.activeElement,
        );
        assert.ok(
          !new URL(page.url()).searchParams.has('page') ||
            new URL(page.url()).searchParams.get('page') === '1',
        );
        assert.equal(
          await page.locator('main li').count(),
          saved.entries.length,
        );
        assert.deepEqual(errors, []);
        assert.equal(
          await page.evaluate(
            () => document.documentElement.scrollWidth <= innerWidth,
          ),
          true,
        );
        await page.close();
        console.log(
          `${device} ${theme}: empty-page keyboard recovery, touch targets and overflow passed`,
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
