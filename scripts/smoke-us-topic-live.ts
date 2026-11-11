// Read-only live catalog check through the local admin bridge; no browser credentials or writes.
import assert from 'node:assert/strict';

import { chromium } from 'playwright';

import { localAdminFetch } from './lib/local-admin-fetch';
import { replayAdminPage } from './lib/replay-admin-page';
async function main() {
  const browser = await chromium.launch();
  try {
    for (const [device, width, height] of [
      ['desktop', 1440, 1000],
      ['mobile', 390, 844],
    ] as const)
      for (const theme of ['light', 'dark'] as const) {
        const page = await browser.newPage({
          viewport: { width, height },
          colorScheme: theme,
        });
        const errors: string[] = [];
        page.on('pageerror', (e) => errors.push(e.message));
        await page.route('**/*', async (route) => {
          const request = route.request(),
            url = new URL(request.url());
          assert.equal(request.method(), 'GET');
          if (url.origin !== 'http://127.0.0.1:8000') return route.abort();
          if (url.pathname.startsWith('/api/admin/')) {
            const response = await localAdminFetch(url);
            assert.equal(response.status, 200);
            return route.fulfill({
              status: response.status,
              contentType: 'application/json',
              body: await response.text(),
            });
          }
          return route.continue();
        });
        await replayAdminPage(page);
        await page.goto('http://127.0.0.1:8000/admin/topics');
        await page
          .getByRole('heading', { name: 'U.S. news & politics', exact: true })
          .waitFor();
        assert.equal(await page.getByRole('switch').count(), 5);
        assert.equal(
          await page.evaluate(
            () => document.documentElement.scrollWidth > innerWidth,
          ),
          false,
        );
        assert.deepEqual(errors, []);
        await page.screenshot({
          path: `docs/screenshots/ui/us-topic-live-${device}-${theme}.png`,
          fullPage: true,
        });
        console.log(
          `${device}/${theme}: five live topic rows, U.S. visible, no page errors or overflow`,
        );
        await page.close();
      }
  } finally {
    await browser.close();
  }
}
void main();
