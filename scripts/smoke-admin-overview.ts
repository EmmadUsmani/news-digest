// Saved live access only; browser writes and external requests are blocked.
import assert from 'node:assert/strict';

import { chromium } from 'playwright';

import { localAdminFetch } from './lib/local-admin-fetch';
import { replayAdminPage } from './lib/replay-admin-page';

const origin = 'http://127.0.0.1:8000';
async function smoke() {
  const browser = await chromium.launch();
  try {
    for (const [device, width, height] of [
      ['desktop', 1440, 1000],
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
          adminReads: string[] = [];
        page.on('pageerror', (error) => errors.push(error.message));
        page.on('request', (request) => {
          assert.equal(request.method(), 'GET');
          assert.equal('admin_local_token' in request.headers(), false);
          assert.equal('x-exedev-email' in request.headers(), false);
        });
        await context.route('**/*', async (route) => {
          const request = route.request(),
            url = new URL(request.url());
          assert.equal(request.method(), 'GET');
          assert.equal(url.origin, origin);
          assert.equal('admin_local_token' in request.headers(), false);
          if (url.pathname.startsWith('/api/admin/'))
            adminReads.push(url.pathname);
          return route.continue();
        });
        assert.equal((await page.goto(`${origin}/admin`))?.status(), 404);
        await page.route('**/api/admin/**', async (route) => {
          adminReads.push(new URL(route.request().url()).pathname);
          assert.equal(route.request().method(), 'GET');
          const response = await localAdminFetch(route.request().url());
          assert.equal(response.status, 200);
          await route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: await response.text(),
          });
        });
        await replayAdminPage(page);
        await page.goto(`${origin}/admin`);
        await page
          .getByRole('heading', { name: 'Overview', exact: true })
          .waitFor();
        await page
          .getByRole('region', { name: 'Operations overview' })
          .waitFor();
        await page
          .getByText('All active sources are collecting.', { exact: true })
          .waitFor();
        await page
          .getByRole('link', { name: 'View as reader', exact: true })
          .waitFor();
        assert.equal(
          await page
            .getByRole('heading', { name: 'Latest edition', exact: true })
            .count(),
          1,
        );
        assert.equal(
          await page.locator('details').first().getAttribute('open'),
          null,
        );
        assert.equal(
          await page.evaluate(
            () => document.documentElement.scrollWidth > innerWidth,
          ),
          false,
        );
        if (device === 'mobile') {
          await page.getByRole('button', { name: 'Open admin menu' }).click();
          await page.getByRole('dialog').waitFor();
          await page.keyboard.press('Escape');
          await page.getByRole('dialog').waitFor({ state: 'hidden' });
          await page.getByRole('button', { name: 'Open admin menu' }).click();
          await page
            .getByRole('dialog')
            .getByRole('link', { name: 'Overview', exact: true })
            .click();
          await page.getByRole('dialog').waitFor({ state: 'hidden' });
        }
        await page.reload();
        await page
          .getByRole('heading', { name: 'Overview', exact: true })
          .waitFor();
        await page
          .getByText('All active sources are collecting.', { exact: true })
          .waitFor();
        await page
          .getByRole('link', { name: 'View as reader', exact: true })
          .waitFor();
        await page.screenshot({
          path: `docs/screenshots/ui/admin-overview-${device}-${theme}.png`,
          fullPage: true,
        });
        assert.deepEqual(errors, []);
        assert.ok(adminReads.includes('/api/admin/status'));
        if (device === 'desktop' && theme === 'light') {
          await page.route('**/api/admin/status', (route) =>
            route.fulfill({
              status: 400,
              json: { message: 'Simulated failure' },
            }),
          );
          await page.getByRole('button', { name: 'Refresh overview' }).click();
          await page
            .getByRole('alert')
            .filter({ hasText: 'Some overview data could not be refreshed' })
            .waitFor();
          await page
            .getByText('All active sources are collecting.', { exact: true })
            .waitFor();
          await page.unroute('**/api/admin/status');
          await page.getByRole('button', { name: 'Refresh overview' }).click();
          await page
            .getByRole('alert')
            .filter({ hasText: 'Some overview data could not be refreshed' })
            .waitFor({ state: 'hidden' });
        }
        await context.close();
      }
    }
  } finally {
    await browser.close();
  }
  console.log(
    'Admin overview: four viewport/theme combinations, saved real edition, healthy sources, anonymous denial, reload, mobile navigation, no overflow/writes/browser credentials.',
  );
}
void smoke();
