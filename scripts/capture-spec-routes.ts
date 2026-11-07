// Read-only screenshots of saved data for item 33's route acceptance.
import assert from 'node:assert/strict';

import { readerEditionHistorySchema } from '@digest/contracts';
import { chromium } from 'playwright';

import { localAdminFetch } from './lib/local-admin-fetch';
import { replayAdminPage } from './lib/replay-admin-page';

const origin = 'http://127.0.0.1:8000';
async function capture() {
  const history = readerEditionHistorySchema.parse(
    await (await fetch(`${origin}/api/editions?offset=0`)).json(),
  );
  const past = history.entries[1];
  assert.ok(past, 'Need a distinct past edition');
  const topics = await (
    await localAdminFetch(`${origin}/api/admin/topics`)
  ).json();
  assert.ok(topics[0]?.id);
  const routes = [
    ['reader', '/'],
    ['archive', '/editions'],
    ['past-edition', `/editions/${past.id}`],
    ['not-found', '/missing-spec-route'],
    ['admin-overview', '/admin'],
    ['admin-editions', '/admin/editions'],
    ['admin-inspector', `/admin/editions/${history.entries[0].id}`],
    ['admin-new-edition', '/admin/editions/new'],
    ['admin-sources', '/admin/sources'],
    ['admin-topics', '/admin/topics'],
    ['admin-topic-editor', `/admin/topics/${topics[0].id}`],
    ['admin-schedule', '/admin/schedule'],
    ['admin-spend', '/admin/spend'],
    ['admin-tools', '/admin/tools'],
  ];
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
          reducedMotion: 'reduce',
          serviceWorkers: 'block',
        });
        const writes: string[] = [];
        await context.route('**/*', async (route) => {
          const request = route.request();
          if (!['GET', 'HEAD'].includes(request.method())) {
            writes.push(request.method());
            return route.abort();
          }
          if (new URL(request.url()).origin !== origin) return route.abort();
          assert.equal('admin_local_token' in request.headers(), false);
          return route.continue();
        });
        const page = await context.newPage();
        page.setDefaultTimeout(15000);
        const errors: string[] = [];
        page.on('pageerror', (error) => errors.push(error.message));
        await page.route('**/api/admin/**', async (route) => {
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
        for (const [name, path] of routes) {
          await page.goto(`${origin}${path}`);
          await page.waitForLoadState('networkidle');
          await page.locator('h1').first().waitFor();
          await page.evaluate(() => document.fonts.ready);
          assert.equal(
            await page.locator('[aria-busy="true"]').count(),
            0,
            `${name} still loading`,
          );
          assert.equal(
            await page.evaluate(
              () => document.documentElement.scrollWidth > innerWidth,
            ),
            false,
            `${name} overflows`,
          );
          await page.screenshot({
            path: `docs/screenshots/ui/spec-${name}-${device}-${theme}.png`,
            fullPage: true,
          });
        }
        assert.deepEqual(writes, []);
        assert.deepEqual(errors, []);
        await context.close();
        console.log(
          `${device}/${theme}: ${routes.length} routes captured; no writes, browser errors or overflow`,
        );
      }
    }
  } finally {
    await browser.close();
  }
}
capture().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
