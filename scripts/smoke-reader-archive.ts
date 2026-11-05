// Read-only archive checks; pagination and failures replay saved response bodies.
import assert from 'node:assert/strict';

import { readerEditionHistorySchema } from '@digest/contracts';
import { chromium } from 'playwright';

async function smoke() {
  const origin = 'http://127.0.0.1:8000';
  const saved = readerEditionHistorySchema.parse(
    await (await fetch(`${origin}/api/editions?offset=0`)).json(),
  );
  assert.ok(saved.entries.length);
  assert.ok(saved.entries[0].topics.length);
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
        });
        const page = await context.newPage();
        const errors: string[] = [],
          forbidden: string[] = [];
        page.on('pageerror', (error) => errors.push(error.message));
        await context.route('**/*', (route) => {
          const request = route.request();
          if (
            !['GET', 'HEAD'].includes(request.method()) ||
            new URL(request.url()).pathname.startsWith('/api/admin/')
          ) {
            forbidden.push(request.url());
            return route.abort();
          }
          return route.continue();
        });
        await page.goto(`${origin}/editions`);
        await page
          .getByRole('link', {
            name: new RegExp(saved.entries[0].topics[0].name),
          })
          .first()
          .waitFor();
        assert.equal(await page.locator('li').count(), saved.entries.length);
        assert.ok(
          await page
            .getByRole('heading', { name: 'Past editions' })
            .isVisible(),
        );
        assert.equal(
          await page.evaluate(
            () => document.documentElement.scrollWidth > innerWidth,
          ),
          false,
        );
        assert.doesNotMatch(
          await page.locator('main').innerText(),
          /why selected|auto-ranked|fallback|triage|budget|AI edited/i,
        );
        await page.screenshot({
          path: `docs/screenshots/ui/reader-archive-${device}-${theme}.png`,
        });
        await page
          .locator(`a[href="/editions/${saved.entries[0].id}"]`)
          .click();
        await page.locator('.digest-topic').last().waitFor();
        assert.equal(
          new URL(page.url()).pathname,
          `/editions/${saved.entries[0].id}`,
        );
        // Replay a two-page archive using the same saved edition, then a failed page.
        await page.route('**/api/editions?offset=*', (route) => {
          const offset = new URL(route.request().url()).searchParams.get(
            'offset',
          );
          return route.fulfill({
            json: {
              entries: offset === '0' ? saved.entries : [],
              hasMore: offset === '0',
            },
          });
        });
        await page.goto(`${origin}/editions`);
        await page.getByRole('link', { name: 'Older editions' }).click();
        await page.getByText('No editions on this page.').waitFor();
        assert.equal(new URL(page.url()).searchParams.get('page'), '2');
        await page.reload();
        await page.getByText('No editions on this page.').waitFor();
        await page.getByRole('link', { name: 'Newer editions' }).click();
        await page.locator('li').first().waitFor();
        await page.unroute('**/api/editions?offset=*');
        await page.route('**/api/editions?offset=*', (route) =>
          route.fulfill({ status: 404, json: {} }),
        );
        await page.goto(`${origin}/editions?page=3`);
        await page.getByRole('alert').waitFor();
        await page.unroute('**/api/editions?offset=*');
        await page.getByRole('button', { name: 'Try again' }).click();
        await page.locator('li').first().waitFor();
        assert.equal(await page.getByRole('alert').count(), 0);
        assert.deepEqual(errors, []);
        assert.deepEqual(forbidden, []);
        await context.close();
      }
    }
    console.log(
      'Archive: four viewport/theme screenshots; saved links, paging/reload, empty/error/retry, reader-only requests passed.',
    );
  } finally {
    await browser.close();
  }
}
void smoke().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
