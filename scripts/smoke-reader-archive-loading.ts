// Delayed archive requests replay the real saved history without writes or external traffic.
import assert from 'node:assert/strict';

import { readerEditionHistorySchema } from '@digest/contracts';
import { chromium, type Route } from 'playwright';

async function smoke() {
  const origin = 'http://127.0.0.1:8000';
  const saved = readerEditionHistorySchema.parse(
    await (await fetch(`${origin}/api/editions?offset=0`)).json(),
  );
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
        });
        let pending: Route | undefined;
        const errors: string[] = [];
        page.on('pageerror', (error) => errors.push(error.message));
        await page.route('**/*', (route) => {
          const request = route.request();
          const url = new URL(request.url());
          if (url.origin !== origin) return route.abort();
          assert.ok(['GET', 'HEAD'].includes(request.method()));
          if (url.pathname === '/api/editions') {
            pending = route;
            return;
          }
          return route.continue();
        });
        await page.goto(`${origin}/editions`);
        const loading = page.getByRole('status');
        await loading.waitFor();
        assert.equal(await loading.innerText(), 'Loading editions…');
        assert.equal(
          await loading.locator('[data-slot="skeleton"]').count(),
          12,
        );
        assert.equal(await loading.getByRole('link').count(), 0);
        assert.equal(await page.locator('main li').count(), 0);
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
          path: `docs/screenshots/ui/reader-archive-loading-${device}-${theme}.png`,
        });
        assert.ok(pending);
        await pending.fulfill({ json: saved });
        await page.locator('main li').last().waitFor();
        assert.equal(await loading.count(), 0);
        assert.equal(
          await page.locator('main li').count(),
          saved.entries.length,
        );
        // Failure replaces placeholders with recovery, which can load saved links.
        await page.goto(`${origin}/editions`);
        await loading.waitFor();
        assert.ok(pending);
        await pending.fulfill({ status: 404, json: { message: 'Not found' } });
        await page.getByRole('alert').waitFor();
        assert.equal(await loading.count(), 0);
        await page.getByRole('button', { name: 'Try again' }).click();
        await loading.waitFor();
        assert.ok(pending);
        await pending.fulfill({ json: saved });
        await page.locator('main li').last().waitFor();
        assert.equal(await loading.count(), 0);
        assert.deepEqual(errors, []);
        await page.close();
        console.log(
          `${device} ${theme}: archive loading, saved links and retry passed`,
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
