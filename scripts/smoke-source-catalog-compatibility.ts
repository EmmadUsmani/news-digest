// Read-only saved catalog replay; public shape is simulated, never a live claim.
import assert from 'node:assert/strict';

import { sourceCatalogSchema, topicSchema } from '@digest/contracts';
import { chromium } from 'playwright';

import { localAdminFetch, localAdminJson } from './lib/local-admin-fetch';
import { replayAdminPage } from './lib/replay-admin-page';

async function smoke() {
  const origin = 'http://127.0.0.1:8000';
  const topics = topicSchema
    .array()
    .parse(await localAdminJson('/api/admin/topics'));
  const catalog = sourceCatalogSchema.parse(
    await localAdminJson('/api/admin/topics/sources'),
  );
  assert.ok(topics.length && catalog.length);
  const browser = await chromium.launch();
  try {
    for (const width of [1440, 390]) {
      for (const shape of ['legacy', 'public', 'invalid'] as const) {
        const page = await browser.newPage({
          viewport: { width, height: 1000 },
        });
        const errors: string[] = [];
        page.on('pageerror', (error) => errors.push(error.message));
        await page.route('**/*', async (route) => {
          const request = route.request();
          const url = new URL(request.url());
          assert.equal(request.method(), 'GET');
          assert.equal(url.origin, origin);
          if (url.pathname === '/api/admin/topics/sources') {
            return route.fulfill({
              json:
                shape === 'legacy'
                  ? catalog
                  : shape === 'public'
                    ? catalog.map(({ id, name, url }) => ({
                        id,
                        name,
                        origin: new URL(url).origin,
                      }))
                    : [{ id: catalog[0].id }],
            });
          }
          if (url.pathname.startsWith('/api/admin/')) {
            const response = await localAdminFetch(url);
            assert.equal(response.status, 200);
            return route.fulfill({ json: await response.json() });
          }
          return route.continue();
        });
        await replayAdminPage(page);
        await page.goto(`${origin}/admin/topics/${topics[0].id}`);
        const sources = page.getByRole('group', { name: 'Connected sources' });
        if (shape === 'invalid') {
          await page.getByRole('button', { name: 'Retry sources' }).waitFor();
          assert.equal(
            await page
              .getByRole('button', { name: 'Save sources', exact: true })
              .isDisabled(),
            true,
          );
          assert.equal(await sources.getByRole('checkbox').count(), 0);
        } else {
          await sources.getByRole('checkbox').first().waitFor();
          assert.equal(
            await sources.getByRole('checkbox').count(),
            catalog.length,
          );
          for (const source of catalog) {
            assert.equal(
              await sources
                .getByRole('checkbox', { name: source.name, exact: true })
                .isChecked(),
              topics[0].sources.includes(source.id),
            );
          }
          assert.equal(
            await page
              .getByRole('button', { name: 'Save sources', exact: true })
              .isEnabled(),
            true,
          );
          if (shape === 'public') {
            await sources.scrollIntoViewIfNeeded();
            await page.screenshot({
              path: `docs/screenshots/ui/source-catalog-public-${width}.png`,
            });
          }
        }
        assert.deepEqual(errors, []);
        await page.close();
      }
    }
    console.log(
      `Catalog compatibility passed: ${catalog.length} saved sources; legacy/public/invalid, desktop/mobile; zero writes.`,
    );
  } finally {
    await browser.close();
  }
}
void smoke();
