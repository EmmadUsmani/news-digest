// Verify the reader/admin boundary using saved live data, with all writes blocked.
import assert from 'node:assert/strict';

import { readerEditionSchema } from '@digest/contracts';
import { chromium } from 'playwright';

import { localAdminFetch, localAdminJson } from './lib/local-admin-fetch';
import { replayAdminPage } from './lib/replay-admin-page';

const origin = 'http://127.0.0.1:8000';
async function smoke() {
  const before = await localAdminJson('/api/admin/digest-previews/latest');
  const edition = readerEditionSchema.parse(
    await (await fetch(`${origin}/api/editions/latest`)).json(),
  );
  const browser = await chromium.launch();
  try {
    for (const [device, width, height] of [
      ['desktop', 1440, 1100],
      ['mobile', 390, 844],
    ] as const) {
      for (const theme of ['light', 'dark'] as const) {
        const context = await browser.newContext({
          viewport: { width, height },
          colorScheme: theme,
          serviceWorkers: 'block',
        });
        const page = await context.newPage();
        const errors: string[] = [],
          protectedReads: string[] = [],
          writes: string[] = [],
          credentials: string[] = [];
        page.on('pageerror', (error) => errors.push(error.message));
        context.on('request', (request) => {
          const headers = request.headers();
          if ('admin_local_token' in headers || 'x-exedev-email' in headers)
            credentials.push(request.url());
        });
        await context.route('**/*', async (route) => {
          const request = route.request();
          if (!['GET', 'HEAD'].includes(request.method())) {
            writes.push(request.url());
            return route.abort();
          }
          const url = new URL(request.url());
          if (url.origin === origin && url.pathname.startsWith('/api/admin/'))
            protectedReads.push(url.pathname);
          return route.continue();
        });
        await page.goto(origin);
        await page.locator('.digest-topic').last().waitFor();
        assert.equal(
          await page.locator('.digest-topic').count(),
          edition.topics.length,
        );
        assert.equal(await page.locator('form').count(), 0);
        assert.equal(await page.locator('a[href^="/admin"]').count(), 0);
        assert.doesNotMatch(
          await page.locator('main').innerText(),
          /Why it matters|Why selected|Source & run status|Incoming from your sources|Create edition|AI edited|Non-AI ranking|candidates examined/,
        );
        assert.deepEqual(protectedReads, []);
        await page.screenshot({
          path: `docs/screenshots/ui/admin-split-reader-${device}-${theme}.png`,
        });
        const denied = await page.goto(`${origin}/admin`);
        assert.equal(denied?.status(), 404);
        // Only Node makes credentialed reads; the browser sees response bodies.
        await page.route('**/api/admin/**', async (route) => {
          assert.equal(route.request().method(), 'GET');
          const response = await localAdminFetch(route.request().url());
          assert.equal(response.status, 200);
          return route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: await response.text(),
          });
        });
        await replayAdminPage(page);
        await page.goto(`${origin}/admin`);
        await page
          .getByText('Edition and management controls', { exact: true })
          .click();
        await page
          .getByRole('button', {
            name: 'Create edition · last 24 hours',
            exact: true,
          })
          .waitFor();
        await page.getByText('Source & run status', { exact: true }).waitFor();
        await page
          .getByRole('heading', { name: 'Incoming from your sources.' })
          .waitFor();
        await page.reload();
        await page
          .getByText('Edition and management controls', { exact: true })
          .click();
        await page
          .getByRole('button', {
            name: 'Create edition · last 24 hours',
            exact: true,
          })
          .waitFor();
        await page.screenshot({
          path: `docs/screenshots/ui/admin-split-controls-${device}-${theme}.png`,
        });
        assert.deepEqual(errors, []);
        assert.deepEqual(writes, []);
        assert.deepEqual(credentials, []);
        await context.close();
      }
    }
  } finally {
    await browser.close();
  }
  assert.deepEqual(
    await localAdminJson('/api/admin/digest-previews/latest'),
    before,
  );
  console.log(
    'Reader/admin split: real saved edition; desktop/mobile light/dark; reader makes no admin reads; anonymous admin denied; controls and reload work; no writes, browser credentials or saved-edition changes.',
  );
}
void smoke();
