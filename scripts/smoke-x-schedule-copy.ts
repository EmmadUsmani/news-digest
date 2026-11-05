// Read-only live browser verification; no topic writes or provider calls.
import assert from 'node:assert/strict';

import { operationsStatusSchema, topicSchema } from '@digest/contracts';
import { chromium } from 'playwright';

import { localAdminJson } from './lib/local-admin-fetch';

async function main() {
  const topics = topicSchema
    .array()
    .parse(await localAdminJson('/api/admin/topics'));
  const status = operationsStatusSchema.parse(
    await localAdminJson('/api/admin/status'),
  );
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
      await context.route('**/api/**', async (route) => {
        if (!['GET', 'HEAD'].includes(route.request().method()))
          return route.fallback();
        const path = new URL(route.request().url()).pathname;
        if (path === '/api/topics') return route.fulfill({ json: topics });
        if (path === '/api/status') return route.fulfill({ json: status });
        return route.fallback();
      });
      await page.goto('http://localhost:8000');
      await page.getByText('Source & run status', { exact: true }).click();
      const usage = page.getByRole('region', {
        name: 'X discovery usage',
        exact: true,
      });
      await usage
        .getByText(
          'Paid X discovery is scheduled 5–30 minutes before the edition',
          { exact: false },
        )
        .waitFor();
      assert.ok(
        (await usage.innerText()).includes('without account restrictions'),
      );
      await usage.scrollIntoViewIfNeeded();
      await page.screenshot({
        path: `docs/screenshots/status-x-schedule-${name}.png`,
      });
      await page.getByText('Manage topics', { exact: true }).click();
      await page
        .getByRole('button', { name: 'Edit Tech & AI', exact: true })
        .click();
      const help = page.locator('#x-accounts-help');
      await help
        .getByText('support secondary searches', { exact: false })
        .waitFor();
      assert.ok(
        (await help.innerText()).includes('within the shared spending caps'),
      );
      await help.scrollIntoViewIfNeeded();
      await page.screenshot({
        path: `docs/screenshots/topic-x-schedule-${name}.png`,
      });
      assert.equal(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth,
        ),
        true,
      );
      assert.deepEqual(errors, []);
      // Prove the write barrier remains installed beneath snapshot routes.
      await page.evaluate(async () => {
        try {
          await fetch('/api/topics', { method: 'POST', body: '{}' });
          throw new Error('Write barrier failed');
        } catch (error) {
          if (!(error instanceof TypeError)) throw error;
        }
      });
      assert.deepEqual(writes.splice(0), ['POST /api/topics']);
      await context.close();
    }
    assert.deepEqual(
      topicSchema.array().parse(await localAdminJson('/api/admin/topics')),
      topics,
    );
    assert.deepEqual(credentials, []);
    assert.deepEqual(writes, []);
    assert.deepEqual(
      await localAdminJson('/api/admin/digest-previews/latest'),
      savedEdition,
    );
    console.log(
      'X schedule guidance passed: protected snapshots, desktop/mobile Status/settings; live topics and saved edition unchanged, browser writes blocked and credentials absent.',
    );
  } finally {
    await browser.close();
  }
}
void main();
