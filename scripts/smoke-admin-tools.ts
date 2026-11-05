// Saved live access only; browser writes and external requests are blocked.
import assert from 'node:assert/strict';

import { chromium } from 'playwright';

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
        assert.equal((await page.goto(`${origin}/admin/tools`))?.status(), 404);
        await replayAdminPage(page);
        await page.goto(`${origin}/admin/tools`);
        await page
          .getByRole('heading', { name: 'Tools', exact: true })
          .waitFor();
        for (const href of [
          '/grafana/',
          '/logs/',
          '/metrics/',
          '/queues/',
          '/db/',
          '/docs/',
        ]) {
          const link = page.locator(`main a[href="${href}"]`);
          assert.equal(await link.count(), 1);
          assert.equal(await link.getAttribute('target'), '_blank');
        }
        assert.deepEqual(adminReads, []);
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
            .getByRole('link', { name: 'Tools', exact: true })
            .click();
          await page.getByRole('dialog').waitFor({ state: 'hidden' });
        }
        await page.reload();
        await page
          .getByRole('heading', { name: 'Tools', exact: true })
          .waitFor();
        await page.screenshot({
          path: `docs/screenshots/ui/admin-tools-${device}-${theme}.png`,
          fullPage: true,
        });
        assert.deepEqual(errors, []);
        assert.deepEqual(adminReads, []);
        await context.close();
      }
    }
  } finally {
    await browser.close();
  }
  console.log(
    'Admin tools: four viewport/theme combinations; anonymous 404; six links; menu keyboard/dismiss/navigation; deep reload; no overflow, operational reads, writes or browser credentials.',
  );
}
void smoke();
