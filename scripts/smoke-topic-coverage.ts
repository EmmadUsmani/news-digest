// Protected live coverage snapshot replayed in browser; no inference or writes.
import assert from 'node:assert/strict';

import { operationsStatusSchema } from '@digest/contracts';
import { chromium } from 'playwright';

import { localAdminJson } from './lib/local-admin-fetch';
import { replayAdminPage } from './lib/replay-admin-page';

async function main() {
  const savedEdition = await localAdminJson(
    '/api/admin/digest-previews/latest',
  );
  const writes: string[] = [];
  const credentials: string[] = [];
  const browser = await chromium.launch();
  try {
    for (const [name, width, height] of [
      ['desktop', 1440, 1100],
      ['mobile', 390, 844],
    ] as const) {
      const context = await browser.newContext({
        viewport: { width, height },
        serviceWorkers: 'block',
      });
      context.on('request', (request) => {
        const headers = request.headers();
        if ('admin_local_token' in headers || 'x-exedev-email' in headers)
          credentials.push(new URL(request.url()).pathname);
      });
      await context.route('**/*', (route) => {
        const request = route.request();
        if (!['GET', 'HEAD'].includes(request.method())) {
          writes.push(`${request.method()} ${new URL(request.url()).pathname}`);
          return route.abort('blockedbyclient');
        }
        return route.continue();
      });
      const page = await context.newPage();
      const errors: string[] = [];
      page.on('pageerror', (error) => errors.push(error.message));
      const status = operationsStatusSchema.parse(
        await localAdminJson('/api/admin/status'),
      );
      assert.ok(status.coverage);
      // Replay this read to keep browser assertions stable across collection updates.
      await context.route('**/api/admin/status', (route) =>
        ['GET', 'HEAD'].includes(route.request().method())
          ? route.fulfill({ json: status })
          : route.fallback(),
      );
      await replayAdminPage(page);
      await page.goto('http://127.0.0.1:8000/admin');
      await page.getByText('Source & run status', { exact: true }).click();
      const coverage = page.getByRole('region', {
        name: 'Topic coverage',
        exact: true,
      });
      await coverage.waitFor();
      const reddit = page.getByRole('region', {
        name: 'Reddit collection',
        exact: true,
      });
      await reddit.waitFor();
      assert.match(await reddit.innerText(), /parked by owner/);
      assert.match(await reddit.innerText(), /disabled and unscheduled/);
      await reddit.screenshot({
        path: `docs/screenshots/reddit-parked-${name}.png`,
      });
      assert.equal(
        await coverage.locator('article').count(),
        status.coverage.topics.length,
      );
      for (const topic of status.coverage.topics) {
        const card = coverage.locator('article').filter({
          has: page.getByRole('heading', { name: topic.name, exact: true }),
        });
        assert.match(
          await card.innerText(),
          new RegExp(
            `${topic.articles} articles · ${topic.xPosts} X posts · ${topic.redditPosts} Reddit posts`,
          ),
        );
      }
      await coverage.scrollIntoViewIfNeeded();
      assert.equal(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth,
        ),
        true,
      );
      assert.deepEqual(errors, []);
      await coverage.screenshot({
        path: `docs/screenshots/topic-coverage-${name}.png`,
      });
      // Prove the write barrier remains installed beneath snapshot routes.
      await page.evaluate(async () => {
        try {
          await fetch('/api/admin/topics', { method: 'POST', body: '{}' });
          throw new Error('Write barrier failed');
        } catch (error) {
          if (!(error instanceof TypeError)) throw error;
        }
      });
      assert.deepEqual(writes.splice(0), ['POST /api/admin/topics']);
      await context.close();
    }
    assert.deepEqual(credentials, []);
    assert.deepEqual(writes, []);
    assert.deepEqual(
      await localAdminJson('/api/admin/digest-previews/latest'),
      savedEdition,
    );
    console.log(
      'Protected topic coverage desktop/mobile checks passed; browser writes blocked, credentials absent, saved edition unchanged; no inference.',
    );
  } finally {
    await browser.close();
  }
}
void main().catch((error: unknown) => {
  console.error(error);
  process.exitCode = 1;
});
