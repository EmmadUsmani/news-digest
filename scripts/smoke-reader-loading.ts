// Delayed reader requests replay the real saved edition without writes or external traffic.
import assert from 'node:assert/strict';

import { readerEditionSchema } from '@digest/contracts';
import { chromium, type Route } from 'playwright';

async function smoke() {
  const origin = 'http://127.0.0.1:8000';
  // Documentation-range visitor for fixed loopback public reads; no identity.
  const visitor = '192.0.2.167';
  const response = await fetch(`${origin}/api/editions/latest`, {
    headers: { 'X-Forwarded-For': visitor },
    redirect: 'error',
    signal: AbortSignal.timeout(15000),
  });
  assert.equal(response.status, 200);
  const saved = readerEditionSchema.parse(await response.json());
  assert.ok(saved.topics.length, 'Use a real published edition');
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
          reducedMotion: 'reduce',
          serviceWorkers: 'block',
        });
        let pending: Route | undefined;
        const errors: string[] = [];
        page.on('pageerror', (error) => errors.push(error.message));
        await page.route('**/*', (route) => {
          const request = route.request();
          assert.equal('admin_local_token' in request.headers(), false);
          assert.equal('x-exedev-email' in request.headers(), false);
          const url = new URL(request.url());
          if (url.origin !== origin) return route.abort();
          assert.ok(['GET', 'HEAD'].includes(request.method()));
          assert.equal(url.pathname.startsWith('/api/admin'), false);
          if (url.pathname === '/api/editions/latest') {
            pending = route;
            return;
          }
          return route.continue({
            headers: { ...request.headers(), 'X-Forwarded-For': visitor },
          });
        });
        await page.goto(origin);
        const loading = page.getByRole('status');
        await loading.waitFor();
        assert.equal(await loading.innerText(), 'Loading edition…');
        assert.equal(await loading.locator('[data-slot="card"]').count(), 3);
        assert.equal(await loading.getByRole('link').count(), 0);
        assert.equal(await page.locator('.digest-topic').count(), 0);
        assert.equal(
          await page
            .getByRole('link', { name: 'News Digest', exact: true })
            .isVisible(),
          true,
        );
        assert.equal(
          await page.evaluate(
            () => document.documentElement.scrollWidth <= innerWidth,
          ),
          true,
        );
        await page.screenshot({
          path: `docs/screenshots/ui/reader-loading-${device}-${theme}.png`,
        });
        assert.ok(pending);
        await pending.fulfill({ json: saved });
        await page.locator('.digest-topic').last().waitFor();
        assert.equal(await page.locator('.reader-skeleton').count(), 0);
        assert.equal(
          await page.locator('.digest-topic').count(),
          saved.topics.length,
        );
        // A failed request must replace skeletons with actionable recovery.
        await page.goto(origin);
        await loading.waitFor();
        assert.ok(pending);
        await pending.fulfill({ status: 404, json: { message: 'Not found' } });
        await page
          .getByRole('heading', { name: 'Edition not found' })
          .waitFor();
        assert.equal(await page.locator('.reader-skeleton').count(), 0);
        assert.equal(
          await page
            .getByRole('link', { name: 'Back to latest edition' })
            .isVisible(),
          true,
        );
        assert.deepEqual(errors, []);
        await page.close();
        console.log(
          `${device} ${theme}: loading, saved edition and error recovery passed`,
        );
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
