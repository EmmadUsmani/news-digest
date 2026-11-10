// Saved live status replay; verifies the UI does not consume the newly
// sanitized content endpoints. No writes or public-activation claim.
import assert from 'node:assert/strict';

import { operationsStatusSchema } from '@digest/contracts';
import { chromium } from 'playwright';

import { localAdminFetch, localAdminJson } from './lib/local-admin-fetch';
import { replayAdminPage } from './lib/replay-admin-page';

async function smoke() {
  const origin = 'http://127.0.0.1:8000';
  const status = operationsStatusSchema.parse(
    await localAdminJson('/api/admin/status'),
  );
  assert.ok(status.sources.length);
  const browser = await chromium.launch();
  try {
    for (const width of [1440, 390]) {
      const page = await browser.newPage({ viewport: { width, height: 1000 } });
      const errors: string[] = [];
      const contentReads: string[] = [];
      page.on('pageerror', (error) => errors.push(error.message));
      await page.route('**/*', async (route) => {
        const request = route.request();
        const url = new URL(request.url());
        assert.equal(request.method(), 'GET');
        assert.equal(url.origin, origin);
        if (url.pathname.startsWith('/api/admin/content')) {
          contentReads.push(url.pathname);
          return route.fulfill({
            status: 503,
            json: { message: 'Unavailable' },
          });
        }
        if (url.pathname === '/api/admin/status') {
          return route.fulfill({ json: status });
        }
        if (url.pathname.startsWith('/api/admin/')) {
          const response = await localAdminFetch(url);
          assert.equal(response.status, 200);
          return route.fulfill({ json: await response.json() });
        }
        return route.continue();
      });
      await replayAdminPage(page);
      await page.goto(`${origin}/admin/sources`);
      const table = page.getByRole('table');
      await table.getByRole('switch').first().waitFor();
      assert.equal(
        await table.getByRole('switch').count(),
        status.sources.length,
      );
      for (const source of status.sources) {
        const control = table.getByRole('switch', {
          name: `Enable collection for ${source.name}`,
          exact: true,
        });
        assert.equal(
          await control.getAttribute('aria-checked'),
          String(source.enabled),
        );
      }
      assert.deepEqual(contentReads, []);
      assert.deepEqual(errors, []);
      await page.screenshot({
        path: `docs/screenshots/ui/content-read-consumers-${width}.png`,
      });
      await page.close();
    }
    console.log(
      `Source UI passed: ${status.sources.length} saved sources, desktop/mobile; zero content reads or writes. Status projection remains separate work.`,
    );
  } finally {
    await browser.close();
  }
}

void smoke().catch((error: unknown) => {
  console.error(error);
  process.exitCode = 1;
});
