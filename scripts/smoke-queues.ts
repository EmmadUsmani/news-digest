// Read-only inspection of real queues. Never enqueue or retry work.
import assert from 'node:assert/strict';

import { chromium } from 'playwright';

import { checkJobsBrowser } from './lib/check-jobs-browser';
import { localAdminFetch, localAdminJson } from './lib/local-admin-fetch';

async function main() {
  const savedEdition = await localAdminJson(
    '/api/admin/digest-previews/latest',
  );
  const counts = await checkJobsBrowser();
  const browser = await chromium.launch({ headless: true });
  try {
    for (const [name, width, height] of [
      ['desktop', 1440, 1000],
      ['mobile', 390, 844],
    ] as const) {
      const context = await browser.newContext({
        viewport: { width, height },
        serviceWorkers: 'block',
      });
      const page = await context.newPage();
      page.setDefaultTimeout(15_000);
      const writes: string[] = [];
      const credentials: string[] = [];
      context.on('request', (request) => {
        const headers = request.headers();
        if ('admin_local_token' in headers || 'x-exedev-email' in headers)
          credentials.push(new URL(request.url()).pathname);
      });
      // Only response bodies enter Playwright; local credentials stay in Node.
      await context.route('**/*', async (route) => {
        const request = route.request();
        const url = new URL(request.url());
        const headers = request.headers();
        if ('admin_local_token' in headers || 'x-exedev-email' in headers)
          return route.abort();
        if (!['GET', 'HEAD'].includes(request.method())) {
          writes.push(`${request.method()} ${url.pathname}`);
          return route.abort();
        }
        if (
          url.origin !== 'http://127.0.0.1:8000' ||
          !url.pathname.startsWith('/queues/')
        )
          return route.abort();
        const response = await localAdminFetch(url, {
          method: request.method(),
          signal: AbortSignal.timeout(15_000),
        });
        assert.equal(response.status, 200, `Queue tool read: ${url.pathname}`);
        await route.fulfill({
          status: response.status,
          contentType:
            response.headers.get('content-type') ?? 'application/octet-stream',
          body: Buffer.from(await response.arrayBuffer()),
        });
      });
      const errors: string[] = [];
      page.on('pageerror', (error) => errors.push(error.message));
      await page.goto('http://127.0.0.1:8000/queues/');
      await page
        .getByText('News Digest jobs (read-only)', { exact: true })
        .waitFor();
      for (const queue of [
        'operations',
        'ingestion',
        'digest-generation',
        'social-collection',
      ]) {
        await page.getByText(queue, { exact: true }).first().waitFor();
      }
      await page.screenshot({ path: `docs/screenshots/queues-${name}.png` });
      if (name === 'mobile')
        await page
          .getByRole('button', { name: 'Overview', exact: true })
          .click();
      await page.getByText('Schedulers', { exact: true }).click();
      await page.getByText('heartbeat', { exact: true }).first().waitFor();
      await page
        .getByText('source-gamesradar', { exact: true })
        .first()
        .waitFor();
      await page.screenshot({
        path: `docs/screenshots/queue-schedules-${name}.png`,
      });
      assert.deepEqual(errors, []);
      assert.deepEqual(writes, []);
      assert.deepEqual(credentials, []);
      await context.close();
    }
    assert.deepEqual(
      await localAdminJson('/api/admin/digest-previews/latest'),
      savedEdition,
    );
    console.log(
      `Jobs browser: ${counts.queues} real queues/${counts.schedules} schedules; desktop/mobile passed; browser writes blocked, credentials absent, saved edition unchanged.`,
    );
  } finally {
    await browser.close();
  }
}
void main();
