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
      let failRefresh = true;
      let saveBeforeAbort = false;
      let queryTimeout = true;
      let queryFailure = false;
      let queryRefreshFailure = false;
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
          if (saveBeforeAbort) {
            await new Promise<void>((resolve) => setTimeout(resolve, 30_000));
            return route.abort('failed').catch(() => undefined);
          }
          failRefresh = true;
          return route.fulfill({
            status: 201,
            json: topics.find((topic) => topic.id === target.id),
          });
        }
        if (
          path === `/api/topics/${target.id}/queries` &&
          request.method() === 'POST'
        ) {
          assert.deepEqual(request.postDataJSON(), {
            query: 'basketball OR playoffs',
          });
          writes++;
          if (queryFailure) return route.fulfill({ status: 503, json: {} });
          if (queryRefreshFailure) failRefresh = true;
          topics = topics.map((topic) =>
            topic.id === target.id ? { ...topic, sources: [source.id] } : topic,
          );
          if (queryTimeout) return; // Hold response past the real deadline.
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
            return; // Hold the request until the real browser deadline aborts it.
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
      await page
        .getByRole('alert')
        .filter({ hasText: 'Could not load sources.' })
        .waitFor({ timeout: 20_000 });
      await page
        .getByRole('button', { name: 'Retry loading sources', exact: true })
        .scrollIntoViewIfNeeded();
      await page.screenshot({
        path: `docs/screenshots/ui/source-catalog-timeout-${device}.png`,
      });
      assert.equal(await connect.isEnabled(), false);
      assert.equal(writes, 0);
      await page
        .getByRole('button', { name: 'Retry loading sources', exact: true })
        .click();
      await connect.waitFor({ state: 'visible' });
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
        .filter({ hasText: 'Feed request failed.' })
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
        .waitFor({ timeout: 20_000 });
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
      await name.fill('Unsubmitted feed');
      await url.fill('https://example.org/pending.xml');
      await page
        .getByRole('button', { name: 'Retry loading sources', exact: true })
        .scrollIntoViewIfNeeded();
      await page.screenshot({
        path: `docs/screenshots/ui/source-catalog-retry-${device}.png`,
      });
      const writesBeforeRetry = writes;
      await page
        .getByRole('button', { name: 'Retry loading sources', exact: true })
        .click();
      await checkbox.waitFor();
      assert.equal(await checkbox.isChecked(), true);
      assert.equal(await name.inputValue(), 'Unsubmitted feed');
      assert.equal(await url.inputValue(), 'https://example.org/pending.xml');
      assert.equal(
        writes,
        writesBeforeRetry,
        'Catalog retry must not reconnect the feed',
      );
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
      // A completed POST can stall before the UI learns the topic.
      saveBeforeAbort = true;
      await name.fill(source.name);
      await url.fill(source.url);
      await connect.click();
      await page
        .getByRole('status')
        .filter({
          hasText: 'Could not confirm the feed connection.',
        })
        .waitFor({ timeout: 20_000 });
      assert.ok(
        await connect.isEnabled(),
        'Deadline releases connection controls',
      );
      await page
        .getByText(
          'Could not confirm the feed connection. Your entries are still here; reload the page to check saved sources before trying again.',
          { exact: true },
        )
        .waitFor();
      assert.equal(await name.inputValue(), source.name);
      assert.equal(await url.inputValue(), source.url);
      assert.ok(!(await checkbox.isChecked()), 'Unconfirmed topic stays stale');
      await page
        .getByRole('status')
        .filter({
          hasText: 'Could not confirm the feed connection.',
        })
        .scrollIntoViewIfNeeded();
      await page.screenshot({
        path: `docs/screenshots/ui/custom-feed-timeout-${device}.png`,
      });
      await page.reload();
      await page.getByText('Manage topics', { exact: true }).click();
      await open.click();
      await checkbox.waitFor();
      assert.ok(
        await checkbox.isChecked(),
        'Reload recovers completed feed connection',
      );
      await card.locator('.headlines a').first().waitFor();
      assert.equal(writes, 6, 'Reload must not repeat the POST');
      await checkbox.uncheck();
      await save.click();
      await form
        .getByRole('status')
        .filter({
          hasText: 'Source connections saved.',
        })
        .waitFor();
      const queryInput = newsQuery.getByLabel('News query', { exact: true });
      const connectQuery = newsQuery.getByRole('button', {
        name: 'Connect news query',
        exact: true,
      });
      await queryInput.fill('basketball OR playoffs');
      await connectQuery.click();
      await newsQuery
        .getByRole('button', {
          name: 'Connecting…',
          exact: true,
        })
        .waitFor();
      assert.ok(await queryInput.isDisabled());
      assert.ok(
        await feed
          .getByRole('button', { name: 'Connecting…', exact: true })
          .isDisabled(),
      );
      await form
        .getByRole('status')
        .filter({
          hasText: 'Could not confirm the news query connection.',
        })
        .waitFor({ timeout: 20_000 });
      assert.ok(await connectQuery.isEnabled());
      assert.ok(await queryInput.isEnabled());
      assert.equal(await queryInput.inputValue(), 'basketball OR playoffs');
      assert.ok(!(await checkbox.isChecked()));
      await queryInput.scrollIntoViewIfNeeded();
      await page.screenshot({
        path: `docs/screenshots/ui/news-query-timeout-${device}.png`,
      });
      await page.reload();
      await page.getByText('Manage topics', { exact: true }).click();
      await open.click();
      await checkbox.waitFor();
      assert.ok(
        await checkbox.isChecked(),
        'Reload recovers completed query connection',
      );
      assert.equal(await queryInput.inputValue(), '');
      assert.equal(
        writes,
        8,
        'Query timeout and reload must not repeat the POST',
      );

      queryTimeout = false;
      queryFailure = true;
      await queryInput.fill('basketball OR playoffs');
      await connectQuery.click();
      await form
        .getByRole('status')
        .filter({
          hasText: 'News query request failed.',
        })
        .waitFor();
      assert.equal(await queryInput.inputValue(), 'basketball OR playoffs');
      assert.ok(await connectQuery.isEnabled());
      queryFailure = false;
      queryRefreshFailure = true;
      await connectQuery.click();
      await form
        .getByRole('status')
        .filter({
          hasText:
            'News query connected, but the source list could not refresh.',
        })
        .waitFor({ timeout: 20_000 });
      assert.equal(await queryInput.inputValue(), '');
      assert.ok(await checkbox.isChecked());
      await page
        .getByRole('button', { name: 'Retry loading sources', exact: true })
        .click();
      await checkbox.waitFor();
      assert.equal(writes, 10, 'Catalog retry must not repeat query POST');
      queryRefreshFailure = false;
      await queryInput.fill('basketball OR playoffs');
      await connectQuery.click();
      await form
        .getByRole('status')
        .filter({
          hasText:
            'News query connected. Collection starts within one minute; check Source & run status for results.',
        })
        .waitFor();
      assert.equal(await queryInput.inputValue(), '');
      assert.ok(await connectQuery.isEnabled());
      assert.ok(await checkbox.isChecked());
      assert.equal(writes, 11, 'Confirmed query sends exactly one POST');
      await queryInput.scrollIntoViewIfNeeded();
      await page.screenshot({
        path: `docs/screenshots/ui/news-query-connected-${device}.png`,
      });

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
      'Custom feeds desktop/mobile: initial catalog real timeout/retry, confirmed-save catalog real timeout/retry without another write or lost entries, validation response, pending control locks and single request, uncertain network outcome, save failure, confirmed save with refresh failure, cleared fields, stored content, replay reload, disconnect, completed news-query POST with retained input and reload recovery, query-specific timeout and confirmed-connection feedback, and completed feed POST with real timeout releasing controls and recovered without another write passed; full live topics/profile/edition unchanged, browser writes guarded and credentials absent, no inference.',
    );
  } finally {
    await browser.close();
  }
}
void smoke().catch((error: unknown) => {
  console.error(error);
  process.exitCode = 1;
});
