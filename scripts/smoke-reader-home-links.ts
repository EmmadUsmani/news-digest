// Read-only reader navigation check; block external requests and server writes.
import assert from 'node:assert/strict';

import {
  readerEditionHistorySchema,
  readerEditionSchema,
} from '@digest/contracts';
import { chromium, expect } from 'playwright/test';

async function smoke() {
  const origin = 'http://127.0.0.1:8000';
  const headers = { 'X-Forwarded-For': '192.0.2.173' };
  async function readPublished(path: string) {
    const response = await fetch(`${origin}${path}`, {
      headers,
      redirect: 'error',
      signal: AbortSignal.timeout(15_000),
    });
    assert.equal(response.status, 200, `Capture ${path}`);
    return response.json();
  }
  const edition = readerEditionSchema.parse(
    await readPublished('/api/editions/latest'),
  );
  const history = readerEditionHistorySchema.parse(
    await readPublished('/api/editions?offset=0'),
  );
  assert.ok(edition.topics.length, 'Published edition contains topics');
  assert.equal(history.entries[0]?.id, edition.id);
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
          extraHTTPHeaders: headers,
        });
        await context.route('**/*', (route) => {
          assert.ok(['GET', 'HEAD'].includes(route.request().method()));
          const url = new URL(route.request().url());
          if (url.origin !== origin) return route.abort();
          assert.ok(!url.pathname.startsWith('/api/admin/'));
          if (url.pathname === '/api/editions/latest')
            return route.fulfill({ json: edition });
          if (url.pathname === '/api/editions')
            return route.fulfill({ json: history });
          return route.continue();
        });
        const page = await context.newPage();
        const errors: string[] = [];
        page.on('pageerror', (error) => errors.push(error.message));
        for (const [name, path] of [
          ['saved', '/saved'],
          ['archive', '/editions?page=1'],
        ]) {
          await page.goto(`${origin}${path}`);
          if (name === 'archive') {
            await expect(
              page.locator('main li').first().getByRole('link'),
            ).toHaveAttribute('href', `/editions/${edition.id}`);
          } else {
            await expect(page.getByText('No saved items yet.')).toBeVisible();
          }
          await expect(page.getByRole('alert')).toHaveCount(0);
          const home = page.getByRole('link', {
            name: 'News Digest',
            exact: true,
          });
          await expect(home).toBeVisible();
          const bounds = await home.boundingBox();
          assert.ok(bounds && bounds.width >= 44 && bounds.height >= 44);
          await home.focus();
          await page.keyboard.press('Tab');
          await page.keyboard.press('Shift+Tab');
          await expect(home).toBeFocused();
          assert.equal(
            await home.evaluate((node) => getComputedStyle(node).outlineStyle),
            'solid',
          );
          assert.ok(
            await page.evaluate(
              () => document.documentElement.scrollWidth <= innerWidth,
            ),
          );
          await page.screenshot({
            path: `docs/screenshots/ui/reader-home-${name}-${device}-${theme}.png`,
          });
          await page.keyboard.press('Enter');
          await expect(page).toHaveURL(`${origin}/`);
          await expect(page.locator('.digest-topic')).toHaveCount(
            edition.topics.length,
          );
          for (const topic of edition.topics) {
            await expect(
              page.locator(`[id="topic-${topic.id}"]`),
            ).toBeAttached();
          }
          await expect(page.getByRole('alert')).toHaveCount(0);
        }
        assert.deepEqual(errors, []);
        await context.close();
        console.log(`${device}/${theme}: saved and archive home links pass`);
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
