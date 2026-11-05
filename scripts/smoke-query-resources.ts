import assert from 'node:assert/strict';

import {
  contentGroupSchema,
  operationsStatusSchema,
  profileSettingsSchema,
  topicSchema,
} from '@digest/contracts';
import { chromium } from 'playwright';

import { localAdminJson } from './lib/local-admin-fetch';

// Protected snapshots replayed without browser credentials; failures stay local.
async function smoke() {
  const [content, topics, profile, status, savedEdition] = await Promise.all([
    localAdminJson('/api/admin/content').then((data) =>
      contentGroupSchema.array().parse(data),
    ),
    localAdminJson('/api/admin/topics').then((data) =>
      topicSchema.array().parse(data),
    ),
    localAdminJson('/api/admin/profile').then((data) =>
      profileSettingsSchema.parse(data),
    ),
    localAdminJson('/api/admin/status').then((data) =>
      operationsStatusSchema.parse(data),
    ),
    localAdminJson('/api/admin/digest-previews/latest'),
  ]);
  const snapshots: Record<string, unknown> = {
    '/api/content': content,
    '/api/topics': topics,
    '/api/profile': profile,
    '/api/status': status,
  };
  const browser = await chromium.launch();
  try {
    const context = await browser.newContext({ serviceWorkers: 'block' });
    const writes: string[] = [];
    const credentials: string[] = [];
    // Registered first so later snapshot/failure routes can fall back to this guard.
    await context.route('**/*', (route) => {
      const request = route.request();
      const headers = request.headers();
      if (headers.admin_local_token || headers['x-exedev-email']) {
        credentials.push(new URL(request.url()).pathname);
        return route.abort();
      }
      if (!['GET', 'HEAD'].includes(request.method())) {
        writes.push(`${request.method()} ${new URL(request.url()).pathname}`);
        return route.abort();
      }
      return route.continue();
    });
    context.on('request', (request) => {
      const headers = request.headers();
      assert.equal('admin_local_token' in headers, false);
      assert.equal('x-exedev-email' in headers, false);
    });
    const page = await context.newPage();
    // Context routes remain installed when a page-level failure override is removed.
    for (const [path, snapshot] of Object.entries(snapshots))
      await page
        .context()
        .route(`**${path}`, (route) =>
          ['GET', 'HEAD'].includes(route.request().method())
            ? route.fulfill({ json: snapshot })
            : route.fallback(),
        );
    const counts = new Map<string, number>();
    const resources = [
      '/api/content',
      '/api/topics',
      '/api/profile',
      '/healthz',
      '/api/status',
    ];
    const errors: string[] = [];
    page.on('pageerror', (error) => errors.push(error.message));
    page.on('request', (request) => {
      const path = new URL(request.url()).pathname;
      if (request.method() === 'GET' && resources.includes(path))
        counts.set(path, (counts.get(path) ?? 0) + 1);
    });
    await page.goto('http://localhost:8000/');
    await page
      .getByText('System online · Database and queue connected')
      .waitFor();
    await page.locator('.topic-grid article').first().waitFor();
    await page.locator('.status-panel summary').click();
    await page
      .getByRole('heading', { name: 'Recent edition runs', exact: true })
      .waitFor();
    for (const resource of resources)
      assert.equal(counts.get(resource), 1, resource);
    // Exercise the write guard against a snapshotted endpoint before UI checks.
    assert.equal(
      await page.evaluate(async () => {
        try {
          await fetch('/api/topics', { method: 'POST', body: '{}' });
          return false;
        } catch {
          return true;
        }
      }),
      true,
    );
    assert.deepEqual(writes.splice(0), ['POST /api/topics']);
    // Leaving and re-entering the page must reuse fresh shared resources.
    await page.evaluate(() => {
      history.pushState({}, '', '/unknown-query-check');
      dispatchEvent(new PopStateEvent('popstate'));
    });
    await page.getByRole('heading', { name: 'Page not found' }).waitFor();
    await page.getByRole('link', { name: 'Back to News Digest' }).click();
    await page.locator('.topic-grid article').first().waitFor();
    for (const resource of resources)
      assert.equal(counts.get(resource), 1, resource);
    await page.locator('.status-panel summary').click();
    const checked = await page
      .locator('.status-panel small')
      .first()
      .textContent();
    await page.route('**/api/status', (route) =>
      route.fulfill({ json: { invalid: true } }),
    );
    await page
      .getByRole('button', { name: 'Refresh status', exact: true })
      .click();
    await page.locator('.status-panel [role="alert"]').waitFor();
    assert.equal(
      await page.locator('.status-panel small').first().textContent(),
      checked,
    );
    await page
      .getByRole('heading', { name: 'Recent edition runs', exact: true })
      .waitFor();
    await page.unroute('**/api/status');
    await page
      .getByRole('button', { name: 'Refresh status', exact: true })
      .click();
    await page
      .locator('.status-panel [role="alert"]')
      .waitFor({ state: 'hidden' });
    await page.locator('.status-panel').scrollIntoViewIfNeeded();
    await page.screenshot({
      path: 'docs/screenshots/ui/foundations-status-desktop.png',
    });
    await page.setViewportSize({ width: 390, height: 844 });
    await page
      .locator('.status-panel summary')
      .evaluate((element) => element.scrollIntoView({ block: 'start' }));
    await page.screenshot({
      path: 'docs/screenshots/ui/foundations-status-mobile.png',
    });
    await page.setViewportSize({ width: 1280, height: 720 });
    await page.locator('.status-panel summary').click();
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.screenshot({
      path: 'docs/screenshots/ui/foundations-query-desktop.png',
    });
    await page.setViewportSize({ width: 390, height: 844 });
    await page.screenshot({
      path: 'docs/screenshots/ui/foundations-query-mobile.png',
    });
    await page.route('**/api/content', (route) =>
      route.fulfill({ json: { invalid: true } }),
    );
    await page.route('**/healthz', (route) =>
      route.fulfill({ json: { status: 'ok' } }),
    );
    await page.reload();
    await page.getByText('System needs attention', { exact: true }).waitFor();
    await page
      .getByText('Recent articles could not be loaded.')
      .first()
      .waitFor();
    await page.locator('.digest-preview').waitFor();
    await page.locator('.topic-grid article').first().waitFor();
    assert.deepEqual(errors, []);
    assert.deepEqual(writes, [], 'Browser must never attempt writes');
    assert.deepEqual(
      credentials,
      [],
      'Browser must never receive admin credentials',
    );
    assert.deepEqual(
      await localAdminJson('/api/admin/digest-previews/latest'),
      savedEdition,
      'Saved edition must remain unchanged',
    );
    console.log(
      'Protected resource snapshots replayed without browser credentials; shared requests deduplicated and cached across navigation; status refresh retains cached data on malformed response and recovers; malformed content/health rejected without hiding edition or topics. Browser writes blocked; no browser credentials; saved edition unchanged.',
    );
  } finally {
    await browser.close();
  }
}
void smoke();
