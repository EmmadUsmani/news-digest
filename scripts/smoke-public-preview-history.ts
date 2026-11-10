// Offline public-shape replay; does not enable anonymous route authorization.
import assert from 'node:assert/strict';

import { chromium } from 'playwright';

async function smoke() {
  const origin = 'http://127.0.0.1:4179';
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
        const reads: string[] = [];
        const errors: string[] = [];
        page.on('pageerror', (error) => errors.push(error.message));
        await page.route('**/*', (route) => {
          const url = new URL(route.request().url());
          assert.equal(url.origin, origin);
          assert.equal(route.request().method(), 'GET');
          if (url.pathname === '/api/me')
            return route.fulfill({ json: { isAdmin: true } });
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
          await section.getByRole('link').getAttribute('href'),
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
  }
}
void smoke().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
