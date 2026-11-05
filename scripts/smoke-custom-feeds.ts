import assert from 'node:assert/strict';

import {
  contentGroupSchema,
  sourceCatalogSchema,
  topicSchema,
} from '@digest/contracts';
import { chromium } from 'playwright';

import { localAdminJson } from './lib/local-admin-fetch';

// Protected real snapshots; custom-feed saves and failures are browser-only.
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
  const source = catalog.find(
    (item) =>
      !item.url.includes('news.google.com') &&
      content.some(
        (group) =>
          original.some(
            (topic) => topic.id === group.topicId && topic.enabled,
          ) && group.items.some((article) => article.source === item.name),
      ),
  );
  assert.ok(source, 'Need a stored publisher article with a catalog feed');
  const group = content.find(
    (item) =>
      original.some((topic) => topic.id === item.topicId && topic.enabled) &&
      item.items.some((article) => article.source === source.name),
  )!;
  const target = original.find((topic) => topic.id === group.topicId)!;
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
      let disconnect = true;
      let failRefresh = false;
      let writes = 0;
      let pendingSave: Promise<void> | undefined;
      let releaseSave: (() => void) | undefined;
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
          path === `/api/topics/${target.id}/feeds` &&
          request.method() === 'POST'
        ) {
          const input = request.postDataJSON();
          assert.equal(input.name, source.name);
          writes++;
          if (writes === 1) {
            assert.equal(input.url, 'https://127.0.0.1/feed');
            return route.fulfill({ status: 400, json: {} });
          }
          assert.equal(input.url, source.url);
          if (disconnect) return route.abort();
          await pendingSave;
          if (fail) return route.fulfill({ status: 503, json: {} });
          topics = topics.map((topic) =>
            topic.id === target.id ? { ...topic, sources: [source.id] } : topic,
          );
          failRefresh = true;
          return route.fulfill({
            status: 201,
            json: topics.find((topic) => topic.id === target.id),
          });
        }
        if (
          path === `/api/topics/${target.id}/sources` &&
          request.method() === 'PUT'
        ) {
          assert.deepEqual(request.postDataJSON().ids, []);
          writes++;
          topics = topics.map((topic) =>
            topic.id === target.id ? { ...topic, sources: [] } : topic,
          );
          return route.fulfill({
            json: topics.find((topic) => topic.id === target.id),
          });
        }
        if (!['GET', 'HEAD'].includes(request.method())) {
          unexpectedWrites.push(`${request.method()} ${path}`);
          return route.abort();
        }
        if (path === '/api/topics') return route.fulfill({ json: topics });
        if (path === '/api/topics/sources') {
          if (failRefresh) {
            failRefresh = false;
            return route.fulfill({ status: 503, json: {} });
          }
          return route.fulfill({ json: catalog });
        }
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
        await page.evaluate(() =>
          fetch('/api/browser-write-guard-probe', { method: 'POST' }).then(
            () => false,
            () => true,
          ),
        ),
        true,
      );
      assert.deepEqual(unexpectedWrites.splice(0), [
        'POST /api/browser-write-guard-probe',
      ]);
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
      const feed = page.getByRole('form', {
        name: `Add feed for ${target.name}`,
        exact: true,
      });
      const name = feed.getByLabel('Feed name', { exact: true });
      const url = feed.getByLabel('Feed URL', { exact: true });
      const connect = feed.getByRole('button', {
        name: 'Connect feed',
        exact: true,
      });
      await name.fill(source.name);
      await url.fill('https://127.0.0.1/feed');
      await connect.click();
      await page
        .getByRole('status')
        .filter({ hasText: 'Use a public HTTPS' })
        .waitFor();
      assert.deepEqual(
        topics.find((topic) => topic.id === target.id)!.sources,
        [],
      );
      assert.equal(await name.inputValue(), source.name);
      assert.equal(await url.inputValue(), 'https://127.0.0.1/feed');
      await url.fill(source.url);
      await connect.click();
      await page
        .getByRole('status')
        .filter({ hasText: 'Could not confirm the feed connection.' })
        .waitFor();
      assert.equal(await name.inputValue(), source.name);
      assert.equal(await url.inputValue(), source.url);
      assert.deepEqual(
        topics.find((topic) => topic.id === target.id)!.sources,
        [],
      );
      await page.locator('.topic-settings').screenshot({
        path: `docs/screenshots/custom-feeds-network-${device}.png`,
      });
      disconnect = false;
      pendingSave = new Promise<void>((resolve) => {
        releaseSave = resolve;
      });
      await connect.click();
      const connecting = feed.getByRole('button', {
        name: 'Connecting…',
        exact: true,
      });
      await connecting.waitFor();
      assert.ok(await connecting.isDisabled());
      assert.ok(await name.isDisabled());
      assert.ok(await url.isDisabled());
      assert.ok(
        await form
          .getByRole('button', { name: 'Saving…', exact: true })
          .isDisabled(),
      );
      assert.ok(
        await form
          .getByRole('button', { name: 'Close sources', exact: true })
          .isDisabled(),
      );
      for (const checkbox of await form.getByRole('checkbox').all())
        assert.ok(await checkbox.isDisabled());
      const newsQuery = page.getByRole('form', {
        name: `Add news query for ${target.name}`,
        exact: true,
      });
      assert.ok(
        await newsQuery.getByLabel('News query', { exact: true }).isDisabled(),
      );
      assert.ok(
        await newsQuery
          .getByRole('button', { name: 'Connecting…', exact: true })
          .isDisabled(),
      );
      assert.equal(writes, 3);
      assert.deepEqual(
        topics.find((topic) => topic.id === target.id)!.sources,
        [],
      );
      await feed.scrollIntoViewIfNeeded();
      await feed.screenshot({
        path: `docs/screenshots/custom-feeds-saving-${device}.png`,
      });
      releaseSave!();
      pendingSave = undefined;
      await page
        .getByRole('status')
        .filter({ hasText: 'Could not connect feed.' })
        .waitFor();
      assert.equal(await name.inputValue(), source.name);
      assert.equal(await url.inputValue(), source.url);
      assert.ok(await name.isEnabled());
      assert.ok(await url.isEnabled());
      assert.ok(await connect.isEnabled());
      await page.locator('.topic-settings').screenshot({
        path: `docs/screenshots/custom-feeds-failure-${device}.png`,
      });
      fail = false;
      await connect.click();
      await page
        .getByRole('status')
        .filter({
          hasText: 'Feed connected, but the source list could not refresh.',
        })
        .waitFor();
      assert.equal(await name.inputValue(), '');
      assert.equal(await url.inputValue(), '');
      const checkbox = form.getByRole('checkbox', {
        name: `${source.name} Feed`,
        exact: true,
      });
      const save = form.getByRole('button', {
        name: 'Save sources',
        exact: true,
      });
      const card = page.locator('.topic-grid article').filter({
        has: page.getByRole('heading', { name: target.name, exact: true }),
      });
      await card.locator('.headlines a').first().waitFor();
      await page.locator('.topic-settings').screenshot({
        path: `docs/screenshots/custom-feeds-${device}.png`,
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
      assert.equal(writes, 5);
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
      'Custom feeds desktop/mobile: validation response, pending control locks and single request, uncertain network outcome, save failure, confirmed save with refresh failure, cleared fields, stored content, replay reload and disconnect passed; full live topics/profile/edition unchanged, browser writes guarded and credentials absent, no inference.',
    );
  } finally {
    await browser.close();
  }
}
void smoke().catch((error: unknown) => {
  console.error(error);
  process.exitCode = 1;
});
