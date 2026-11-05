import assert from 'node:assert/strict';

import {
  contentGroupSchema,
  sourceCatalogSchema,
  topicSchema,
} from '@digest/contracts';
import { chromium } from 'playwright';

import { localAdminJson } from './lib/local-admin-fetch';

// Protected real snapshots; connection changes and failures are browser-only.
async function smoke() {
  const [original, content, catalog, latest, profile, status] =
    await Promise.all([
      localAdminJson('/api/admin/topics').then((data) =>
        topicSchema.array().parse(data),
      ),
      localAdminJson('/api/admin/content').then((data) =>
        contentGroupSchema.array().parse(data),
      ),
      localAdminJson('/api/admin/topics/sources').then((data) =>
        sourceCatalogSchema.parse(data),
      ),
      localAdminJson('/api/admin/digest-previews/latest'),
      localAdminJson('/api/admin/profile'),
      localAdminJson('/api/admin/status'),
    ]);
  const savedEdition = latest
    ? await localAdminJson(
        '/api/admin/digest-previews/' + (latest as { id: string }).id,
      )
    : null;
  const snapshots: Record<string, unknown> = {
    '/api/profile': profile,
    '/api/status': status,
  };
  const target = original.find(
    (topic) =>
      topic.enabled &&
      content.some((group) => group.topicId === topic.id && group.items.length),
  );
  assert.ok(target, 'Need an enabled topic with stored incoming articles');
  const group = content.find((item) => item.topicId === target.id)!;
  const source = catalog.find((item) => item.name === group.items[0].source);
  assert.ok(source, 'Stored article source must be in the catalog');
  const browser = await chromium.launch();
  try {
    for (const [device, width, height] of [
      ['desktop', 1440, 1100],
      ['mobile', 390, 844],
    ] as const) {
      const page = await browser.newPage({
        viewport: { width, height },
        serviceWorkers: 'block',
      });
      const credentials: string[] = [];
      page.on('request', (request) => {
        const headers = request.headers();
        if ('admin_local_token' in headers || 'x-exedev-email' in headers)
          credentials.push(new URL(request.url()).pathname);
      });
      const errors: string[] = [];
      page.on('pageerror', (error) => errors.push(error.message));
      let topics = structuredClone(original).map((topic) =>
        topic.id === target.id ? { ...topic, sources: [] } : topic,
      );
      let fail = true;
      let writes = 0;
      let saveBeforeAbort = false;
      let stallSave = false;
      const unexpectedWrites: string[] = [];
      await page.route('**/*', async (route) => {
        const request = route.request();
        const path = new URL(request.url()).pathname;
        const headers = request.headers();
        if ('admin_local_token' in headers || 'x-exedev-email' in headers)
          return route.abort();
        if (request.method() === 'GET' && Object.hasOwn(snapshots, path))
          return route.fulfill({ json: snapshots[path] });
        if (
          path === `/api/topics/${target.id}/sources` &&
          request.method() === 'PUT'
        ) {
          const ids = request.postDataJSON().ids;
          assert.deepEqual(ids, writes < 2 || writes === 3 ? [source.id] : []);
          writes++;
          if (fail) return route.fulfill({ status: 503, body: 'Unavailable' });
          topics = topics.map((topic) =>
            topic.id === target.id ? { ...topic, sources: ids } : topic,
          );
          if (stallSave) return;
          if (saveBeforeAbort) return route.abort('failed');
          return route.fulfill({
            json: topics.find((topic) => topic.id === target.id),
          });
        }
        if (!['GET', 'HEAD'].includes(request.method())) {
          unexpectedWrites.push(`${request.method()} ${path}`);
          return route.abort();
        }
        if (path === '/api/topics') return route.fulfill({ json: topics });
        if (path === '/api/topics/sources')
          return route.fulfill({ json: catalog });
        if (path === '/api/content')
          return route.fulfill({
            json: content.map((item) =>
              item.topicId === target.id
                ? {
                    ...item,
                    items: item.items.filter((article) =>
                      topics
                        .find((topic) => topic.id === target.id)!
                        .sources.some(
                          (id) =>
                            catalog.find((entry) => entry.id === id)?.name ===
                            article.source,
                        ),
                    ),
                  }
                : item,
            ),
          });
        return route.continue();
      });
      await page.goto('http://localhost:8000');
      assert.equal(
        await page.evaluate(async () => {
          try {
            await fetch('/api/topics/unexpected-write-probe', {
              method: 'POST',
            });
            return false;
          } catch {
            return true;
          }
        }),
        true,
      );
      assert.equal(
        unexpectedWrites.pop(),
        'POST /api/topics/unexpected-write-probe',
      );
      await page.getByText('Manage topics', { exact: true }).click();
      const open = page.getByRole('button', {
        name: `Sources for ${target.name}`,
        exact: true,
      });
      await open.click();
      const form = page.getByRole('form', {
        name: `Sources for ${target.name}`,
        exact: true,
      });
      const checkbox = form.getByRole('checkbox', {
        name: `${source.name} Feed`,
        exact: true,
      });
      const save = form.getByRole('button', {
        name: 'Save sources',
        exact: true,
      });
      await checkbox.check();
      await save.click();
      await form
        .getByRole('status')
        .filter({ hasText: 'Source request failed.' })
        .waitFor();
      assert.ok(await checkbox.isChecked(), 'Failed save retains selection');
      assert.deepEqual(
        topics.find((topic) => topic.id === target.id)!.sources,
        [],
      );
      await form.screenshot({
        path: `docs/screenshots/topic-sources-failure-${device}.png`,
      });
      fail = false;
      await save.click();
      await form
        .getByRole('status')
        .filter({ hasText: 'Source connections saved.' })
        .waitFor();
      const card = page.locator('.topic-grid article').filter({
        has: page.getByRole('heading', { name: target.name, exact: true }),
      });
      await card.locator('.headlines a').first().waitFor();
      await form.screenshot({
        path: `docs/screenshots/topic-sources-${device}.png`,
      });
      await page.reload();
      await page.getByText('Manage topics', { exact: true }).click();
      await open.click();
      await checkbox.waitFor();
      assert.ok(
        await checkbox.isChecked(),
        'Replayed connections survive reload',
      );
      await checkbox.uncheck();
      await save.click();
      await form
        .getByRole('status')
        .filter({ hasText: 'Source connections saved.' })
        .waitFor();
      await card
        .getByText('No sources connected yet.', { exact: false })
        .waitFor();
      // The connection can drop after the server has saved the selection.
      saveBeforeAbort = true;
      await checkbox.check();
      await save.click();
      await form
        .getByRole('status')
        .filter({ hasText: 'Could not confirm whether sources were saved.' })
        .waitFor();
      assert.deepEqual(
        topics.find((topic) => topic.id === target.id)!.sources,
        [source.id],
      );
      await form.getByRole('status').scrollIntoViewIfNeeded();
      await page.screenshot({
        path: `docs/screenshots/topic-sources-interrupted-${device}.png`,
      });
      await page.reload();
      await page.getByText('Manage topics', { exact: true }).click();
      await open.click();
      await checkbox.waitFor();
      assert.equal(await checkbox.isChecked(), true);
      assert.equal(
        writes,
        4,
        'Reload checks saved sources without another PUT',
      );
      // Hold a completed save through the real browser request deadline.
      saveBeforeAbort = false;
      stallSave = true;
      await checkbox.uncheck();
      await save.click();
      await form
        .getByRole('status')
        .filter({ hasText: 'Could not confirm whether sources were saved.' })
        .waitFor({ timeout: 20_000 });
      assert.equal(await save.isEnabled(), true);
      assert.equal(await checkbox.isChecked(), false);
      assert.equal(writes, 5);
      assert.deepEqual(
        topics.find((topic) => topic.id === target.id)!.sources,
        [],
      );
      await form.getByRole('status').scrollIntoViewIfNeeded();
      await page.screenshot({
        path: `docs/screenshots/ui/source-selection-timeout-${device}.png`,
      });
      await page.reload();
      await page.getByText('Manage topics', { exact: true }).click();
      await open.click();
      await checkbox.waitFor();
      assert.equal(await checkbox.isChecked(), false);
      assert.equal(writes, 5, 'Timeout reload does not repeat the PUT');
      assert.deepEqual(unexpectedWrites, []);
      assert.deepEqual(errors, []);
      assert.deepEqual(credentials, []);
      assert.ok(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth,
        ),
      );
      await page.close();
    }
    assert.deepEqual(await localAdminJson('/api/admin/topics'), original);
    assert.deepEqual(await localAdminJson('/api/admin/profile'), profile);
    if (latest)
      assert.deepEqual(
        await localAdminJson(
          '/api/admin/digest-previews/' + (latest as { id: string }).id,
        ),
        savedEdition,
      );
    console.log(
      'Source connections desktop/mobile: non-JSON failure, retry, incoming stored content, disconnect, interrupted-save reload and real stalled-save deadline/reload passed; live topics and saved edition unchanged, no inference.',
    );
  } finally {
    await browser.close();
  }
}
void smoke().catch((error: unknown) => {
  console.error(error);
  process.exitCode = 1;
});
