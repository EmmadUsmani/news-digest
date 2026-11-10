// Offline public-shape replay; does not enable anonymous route authorization.
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
  const entry = {
    id,
    createdAt: '2026-11-10T15:00:00Z',
    windowStart: '2026-11-09T15:00:00Z',
    windowEnd: '2026-11-10T15:00:00Z',
    topics: [{ id, name: 'Technology' }],
  };
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
        let fail = false;
        let latestStatus = 200;
        let latestEmpty = false;
        const reads: string[] = [];
        const errors: string[] = [];
        page.on('pageerror', (error) => errors.push(error.message));
        await page.route('**/*', (route) => {
          const url = new URL(route.request().url());
          assert.equal(url.origin, origin);
          assert.equal(route.request().method(), 'GET');
          if (url.pathname === '/api/me')
            return route.fulfill({ json: { isAdmin: true } });
          if (url.pathname === '/api/admin/digest-previews/latest') {
            reads.push('latest');
            return route.fulfill({
              status: latestStatus,
              json:
                latestStatus !== 200
                  ? {}
                  : latestEmpty
                    ? null
                    : {
                        ...entry,
                        topics: [
                          {
                            id,
                            name: 'Latest topic',
                            brief: [],
                            stories: [],
                            posts: [],
                          },
                        ],
                      },
            });
          }
          if (url.pathname === '/api/admin/digest-previews') {
            reads.push(url.search);
            return route.fulfill(
              fail
                ? { status: 503, json: {} }
                : {
                    json: {
                      entries:
                        url.searchParams.get('offset') === '20' ? [] : [entry],
                      hasMore: url.searchParams.get('offset') !== '20',
                    },
                  },
            );
          }
          assert.ok(
            !url.pathname.startsWith('/api/'),
            `Unexpected API read: ${url.pathname}`,
          );
          return route.continue();
        });
        await page.goto(origin + '/admin/editions');
        const section = page.getByRole('region', {
          name: 'Published editions',
        });
        await section.getByText('Technology', { exact: true }).waitFor();
        assert.equal(
          await section.getByRole('link').last().getAttribute('href'),
          `/editions/${id}`,
        );
        assert.equal(
          await section
            .getByRole('button', { name: 'New edition', exact: true })
            .count(),
          0,
        );
        await page.screenshot({
          path: `docs/screenshots/ui/public-preview-history-${device}-${theme}.png`,
        });
        await section.getByRole('button', { name: 'Older editions' }).click();
        await section
          .getByText('No published editions on this page.')
          .waitFor();
        await section.getByRole('button', { name: 'Newer editions' }).click();
        await section.getByText('Technology', { exact: true }).waitFor();
        fail = true;
        await section.getByRole('button', { name: 'Refresh editions' }).click();
        await section.getByRole('alert').waitFor();
        fail = false;
        await section.getByRole('button', { name: 'Refresh editions' }).click();
        await section.getByRole('alert').waitFor({ state: 'hidden' });
        const latest = page.getByRole('region', {
          name: 'Latest published edition',
          exact: true,
        });
        await latest.getByText('Latest topic', { exact: true }).waitFor();
        assert.equal(
          await latest.getByRole('link').getAttribute('href'),
          `/editions/${id}`,
        );
        await page.screenshot({
          path: `docs/screenshots/ui/public-preview-history-${device}-${theme}.png`,
        });
        for (latestStatus of [401, 403, 404, 503]) {
          await section
            .getByRole('button', { name: 'Refresh editions' })
            .click();
          await latest.getByRole('alert').waitFor();
          assert.equal(await latest.getByRole('link').count(), 0);
          latestStatus = 200;
          await section
            .getByRole('button', { name: 'Refresh editions' })
            .click();
          await latest.getByText('Latest topic', { exact: true }).waitFor();
        }
        latestEmpty = true;
        await section.getByRole('button', { name: 'Refresh editions' }).click();
        await latest.getByText('No published edition yet.').waitFor();
        assert.ok(reads.includes('latest'));
        assert.ok(reads.includes('?offset=20'));
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
      'Public preview history: four offline browser views, pagination, failure/retry and restricted reads pass.',
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
