// Saved-history replay: keyboard navigation must reach usable reader pages.
import assert from 'node:assert/strict';

import { readerEditionHistorySchema } from '@digest/contracts';
import { chromium, expect } from 'playwright/test';

async function smoke() {
  const origin = 'http://127.0.0.1:8000';
  const headers = { 'X-Forwarded-For': '192.0.2.172' };
  const response = await fetch(`${origin}/api/editions?offset=0`, {
    headers,
    redirect: 'error',
    signal: AbortSignal.timeout(15_000),
  });
  assert.equal(response.status, 200, 'Capture published history');
  const history = readerEditionHistorySchema.parse(await response.json());
  assert.ok(history.entries.length, 'Published history contains editions');
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
          extraHTTPHeaders: headers,
        });
        const errors: string[] = [];
        page.on('pageerror', (error) => errors.push(error.message));
        await page.route('**/*', (route) => {
          assert.ok(['GET', 'HEAD'].includes(route.request().method()));
          const url = new URL(route.request().url());
          if (url.origin !== origin) return route.abort();
          assert.ok(!url.pathname.startsWith('/api/admin/'));
          if (url.pathname === '/api/editions')
            return route.fulfill({ json: history });
          return route.continue();
        });
        await page.goto(`${origin}/editions`);
        await expect(page.locator('main li').first()).toBeVisible();
        for (const [label, path, heading, name] of [
          ['Saved items', '/saved', 'Saved items', 'saved'],
          ['Past editions', '/editions', 'Past editions', 'archive'],
        ]) {
          const link = page
            .getByRole('navigation', { name: 'Reader navigation' })
            .getByRole('link', { name: label, exact: true });
          await expect(link).toBeVisible();
          const bounds = await link.boundingBox();
          assert.ok(
            bounds &&
              bounds.height >= 44 &&
              bounds.x >= 0 &&
              bounds.x + bounds.width <= width,
          );
          await link.focus();
          await page.keyboard.press('Enter');
          await expect(page).toHaveURL(
            (url) => url.origin === origin && url.pathname === path,
          );
          await expect(
            page.getByRole('heading', { name: heading, exact: true }),
          ).toBeVisible();
          if (name === 'archive') {
            const date = page.locator('main li').first().getByRole('link');
            await expect(date).toBeVisible();
            await expect(date).toHaveAttribute(
              'href',
              `/editions/${history.entries[0].id}`,
            );
          } else {
            await expect(page.getByText('No saved items yet.')).toBeVisible();
          }
          await expect(page.getByRole('alert')).toHaveCount(0);
          assert.ok(
            await page.evaluate(
              () => document.documentElement.scrollWidth <= innerWidth,
            ),
          );
          await page.screenshot({
            path: `docs/screenshots/ui/reader-navigation-${name}-${device}-${theme}.png`,
          });
        }
        assert.deepEqual(errors, []);
        await page.close();
      }
    }
    console.log(
      'Reader archive/saved keyboard navigation passes desktop/mobile light/dark; no overflow, browser errors or writes.',
    );
  } finally {
    await browser.close();
  }
}
void smoke();
