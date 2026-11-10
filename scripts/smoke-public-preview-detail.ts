// Offline sanitized responses; no live anonymous access or provider calls.
import assert from 'node:assert/strict';

import { chromium } from 'playwright';

import { createServer } from '../apps/web/node_modules/vite/dist/node/index.js';

async function smoke() {
  const server = await createServer({
    root: 'apps/web',
    server: { host: '127.0.0.1', port: 0 },
    define: { 'import.meta.env.VITE_PUBLIC_MODE': JSON.stringify('1') },
    logLevel: 'error',
  });
  await server.listen();
  const address = server.httpServer!.address();
  assert.ok(address && typeof address === 'object');
  const origin = `http://127.0.0.1:${address.port}`;
  const id = '11111111-1111-4111-8111-111111111111';
  const browser = await chromium.launch();
  try {
    for (const [device, width, height] of [
      ['desktop', 1440, 1000],
      ['mobile', 390, 844],
    ] as const) {
      for (const theme of ['light', 'dark'] as const) {
        const page = await browser.newPage({
          viewport: { width, height },
          colorScheme: theme,
        });
        let status = 200;
        let empty = false;
        const reads: string[] = [];
        const errors: string[] = [];
        page.on('pageerror', (error) => errors.push(error.message));
        await page.route('**/api/**', (route) => {
          const path = new URL(route.request().url()).pathname;
          assert.equal(route.request().method(), 'GET');
          if (path === '/api/me')
            return route.fulfill({ json: { isAdmin: false } });
          assert.equal(path, `/api/admin/digest-previews/${id}`);
          reads.push(path);
          return route.fulfill({
            status,
            json:
              status !== 200
                ? {}
                : {
                    id,
                    createdAt: '2026-11-10T15:00:00Z',
                    windowStart: '2026-11-09T15:00:00Z',
                    windowEnd: '2026-11-10T15:00:00Z',
                    topics: empty
                      ? []
                      : [
                          {
                            id,
                            name: 'Technology',
                            brief: ['Offline published brief.'],
                            stories: [],
                            posts: [],
                          },
                        ],
                  },
          });
        });
        await page.goto(`${origin}/admin/editions/${id}`);
        const section = page.getByRole('region', {
          name: 'Published edition',
          exact: true,
        });
        await section.getByText('Offline published brief.').waitFor();
        assert.equal(
          await section
            .getByRole('link', { name: 'Read published edition' })
            .getAttribute('href'),
          `/editions/${id}`,
        );
        await page.screenshot({
          path: `docs/screenshots/ui/public-preview-detail-${device}-${theme}.png`,
        });
        for (status of [401, 403, 404, 503]) {
          await section
            .getByRole('button', { name: 'Refresh edition' })
            .click();
          await section.getByRole('alert').waitFor();
          assert.equal(
            await section.getByText('Offline published brief.').count(),
            0,
          );
          status = 200;
          await section
            .getByRole('button', { name: 'Refresh edition' })
            .click();
          await section.getByText('Offline published brief.').waitFor();
        }
        empty = true;
        await section.getByRole('button', { name: 'Refresh edition' }).click();
        await section.getByText('No topics in this edition.').waitFor();
        assert.ok(reads.length >= 10);
        assert.deepEqual(errors, []);
        assert.ok(
          await page.evaluate(
            () => document.documentElement.scrollWidth <= innerWidth,
          ),
        );
        await page.close();
      }
    }
    console.log(
      'Public preview detail: four offline views, restricted reads, empty topics, 401/403/404/503 and recovery pass.',
    );
  } finally {
    await browser.close();
    await server.close();
  }
}
void smoke().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
