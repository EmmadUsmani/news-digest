// Offline fixture browser rehearsal of the public status view/page and router.
import assert from 'node:assert/strict';
import { mkdir, rm, writeFile } from 'node:fs/promises';

import { chromium } from 'playwright';

import { createServer } from '../apps/web/node_modules/vite/dist/node/index.js';

async function main() {
  const root = `${process.cwd()}/apps/web/`;
  const harness = `${root}public-status-review.html`;
  const fixture = {
    checkedAt: '2026-11-10T13:00:00.000Z',
    sources: [
      {
        id: 'healthy',
        name: 'Fixture healthy source',
        lastAttempt: '2026-11-10T12:55:00.000Z',
        lastSuccess: '2026-11-10T12:55:00.000Z',
        hasError: false,
        active: true,
        enabled: true,
        lastItemCount: 10,
        storedItems: 100,
        items24h: 20,
        items7d: 80,
      },
      {
        id: 'failed',
        name: 'Fixture failed source',
        lastAttempt: null,
        lastSuccess: null,
        hasError: true,
        active: true,
        enabled: true,
        lastItemCount: 0,
        storedItems: 0,
        items24h: 0,
        items7d: 0,
      },
    ],
    queues: [
      {
        name: 'ingestion',
        available: true,
        workers: 1,
        paused: false,
        counts: { waiting: 2 },
        nextRun: null,
      },
    ],
    llm: {
      todayMicros: 10000,
      monthMicros: 20000,
      todayReservedMicros: 3000,
      monthReservedMicros: 3000,
      dailyCapMicros: 470000,
      monthlyCapMicros: 15000000,
      availableMicros: 457000,
    },
    xDiscovery: {
      todayMicros: 10000,
      monthMicros: 20000,
      reservedMicros: 0,
      dailyMicros: 10000,
      monthlyMicros: 2000000,
      availableMicros: 0,
      blocked: true,
    },
    coverage: {
      start: '2026-11-09T13:00:00.000Z',
      end: '2026-11-10T13:00:00.000Z',
      topics: [
        {
          topicId: '10000000-0000-4000-8000-000000000001',
          name: 'Fixture Tech',
          enabled: true,
          connectedSources: 2,
          healthySources: 1,
          articles: 12,
          xPosts: 3,
          redditPosts: 0,
        },
      ],
    },
  };
  let server: Awaited<ReturnType<typeof createServer>> | undefined;
  const browser = await chromium.launch({ headless: true });
  try {
    await writeFile(
      harness,
      `<html><head><meta name="viewport" content="width=device-width, initial-scale=1"></head><body><main style="max-width:1100px;margin:auto;padding:24px"><p>Offline fixture review</p><div id="root"></div></main><script type="module">
import React from 'react';
import {createRoot} from 'react-dom/client';
import {PublicStatus} from '/src/PublicStatus.tsx';
import {OperationsOverviewPage} from '/src/OperationsOverviewPage.tsx';
import {loadOperationsOverview} from '/src/operations-overview-loader.ts';
import {QueryClient, QueryClientProvider} from '@tanstack/react-query';
import '/src/style.css';
const fixture = ${JSON.stringify(fixture)};
const root = createRoot(document.getElementById('root'));
window.showStatus = (empty) => root.render(React.createElement(PublicStatus, {data: empty ? {checkedAt: fixture.checkedAt, sources: [], queues: []} : fixture}));
window.showStatus(false);
window.checkOverviewLoaders = async () => {
  const keys = [];
  const client = {ensureQueryData: (query) => {
    keys.push(query.queryKey);
    return Promise.resolve();
  }};
  await loadOperationsOverview(client, true);
  const publicKeys = keys.splice(0);
  await loadOperationsOverview(client, false);
  return {publicKeys, privateKeys: keys};
};
window.showRouter = async (path) => {
  const {router, queryClient} = await import('/src/router.tsx');
  const {RouterProvider, createMemoryHistory} = await import('@tanstack/react-router');
  queryClient.clear();
  router.update({history: createMemoryHistory({initialEntries: [path]})});
  await router.load();
  root.render(React.createElement(QueryClientProvider, {client: queryClient}, React.createElement(RouterProvider, {router})));
};
window.showPage = () => {
  const client = new QueryClient({defaultOptions: {queries: {gcTime: 0}}});
  client.setQueryData(['status'], {private: 'private-cache-marker'});
  void loadOperationsOverview(client, true);
  root.render(React.createElement(QueryClientProvider, {client}, React.createElement(OperationsOverviewPage, {publicMode: true})));
};
</script></body></html>`,
    );
    server = await createServer({
      root,
      server: { host: '127.0.0.1', port: 0 },
      define: { 'import.meta.env.VITE_PUBLIC_MODE': JSON.stringify('1') },
      logLevel: 'error',
    });
    await server.listen();
    const address = server.httpServer!.address();
    assert.ok(address && typeof address === 'object');
    const page = await browser.newPage();
    page.setDefaultTimeout(15000);
    const errors: string[] = [];
    page.on('pageerror', (error) => errors.push(error.message));
    await page.goto(
      `http://127.0.0.1:${address.port}/public-status-review.html`,
    );
    await page.getByRole('heading', { name: 'System status' }).waitFor();
    const loaderKeys = await page.evaluate(() =>
      (
        window as unknown as {
          checkOverviewLoaders: () => Promise<{
            publicKeys: string[][];
            privateKeys: string[][];
          }>;
        }
      ).checkOverviewLoaders(),
    );
    assert.deepEqual(loaderKeys.publicKeys, [['public', 'status']]);
    assert.equal(loaderKeys.privateKeys.length, 3);
    assert.ok(
      loaderKeys.privateKeys.some((key: string[]) => key[0] === 'status'),
    );
    assert.ok(
      loaderKeys.privateKeys.every((key: string[]) => key[0] !== 'public'),
    );
    assert.equal(
      await page.getByText('Recent collection failed', { exact: true }).count(),
      1,
    );
    assert.equal(
      await page.getByText('Collecting', { exact: true }).count(),
      1,
    );
    assert.equal(
      await page.getByText('Discovery paused by budget controls').count(),
      1,
    );
    assert.equal(
      await page.getByText('12 articles', { exact: false }).count(),
      1,
    );
    assert.equal(await page.locator('button, input, a').count(), 0);
    await mkdir('docs/screenshots/ui', { recursive: true });
    for (const width of [390, 1440]) {
      await page.setViewportSize({ width, height: 1000 });
      for (const theme of ['light', 'dark']) {
        await page.evaluate(
          (dark) => document.documentElement.classList.toggle('dark', dark),
          theme === 'dark',
        );
        assert.equal(
          await page.evaluate(
            () => document.documentElement.scrollWidth > innerWidth,
          ),
          false,
        );
        await page.screenshot({
          path: `docs/screenshots/ui/public-status-fixture-${width}-${theme}.png`,
          fullPage: true,
        });
      }
    }
    await page.evaluate(() =>
      (
        window as unknown as { showStatus: (empty: boolean) => void }
      ).showStatus(true),
    );
    await page.getByText('Coverage unavailable').waitFor();
    assert.equal(await page.getByText('Budget unavailable').count(), 2);
    assert.equal(await page.getByText('No sources available').count(), 1);
    assert.equal(await page.getByText('No queues available').count(), 1);
    // Exercise the real public query through HTTP, without any private reads.
    let mode: 'pending' | 'valid' | 'failed' | 'malformed' = 'pending';
    let release!: () => void;
    const pending = new Promise<void>((resolve) => {
      release = resolve;
    });
    const reads: string[] = [];
    await page.route('**/api/**', async (route) => {
      const path = new URL(route.request().url()).pathname;
      reads.push(path);
      assert.equal(route.request().method(), 'GET');
      assert.equal(path, '/api/admin/status');
      if (mode === 'pending') await pending;
      await route.fulfill({
        status: mode === 'failed' ? 503 : 200,
        contentType: 'application/json',
        body: JSON.stringify(
          mode === 'valid' ? fixture : { private: 'private-response-marker' },
        ),
      });
    });
    await page.evaluate(() =>
      (window as unknown as { showPage: () => void }).showPage(),
    );
    await page
      .getByRole('status')
      .filter({ hasText: 'Loading system status' })
      .waitFor();
    assert.equal(
      await page.getByRole('button', { name: 'Refresh status' }).isDisabled(),
      true,
    );
    assert.equal(
      await page.getByRole('heading', { name: 'System status' }).count(),
      0,
    );
    mode = 'failed';
    release();
    await page.getByRole('alert').waitFor();
    assert.equal(reads.length, 1);
    assert.equal(
      await page.getByRole('heading', { name: 'System status' }).count(),
      0,
    );
    mode = 'malformed';
    await page.getByRole('button', { name: 'Refresh status' }).click();
    await page.waitForFunction(
      () => !document.querySelector('button')?.disabled,
    );
    assert.equal(reads.length, 2);
    assert.equal(
      await page.getByRole('heading', { name: 'System status' }).count(),
      0,
    );
    assert.equal(
      (await page.locator('body').innerText()).includes('private-'),
      false,
    );
    mode = 'valid';
    await page.getByRole('button', { name: 'Refresh status' }).click();
    await page.getByRole('heading', { name: 'System status' }).waitFor();
    assert.equal(await page.getByRole('alert').count(), 0);
    mode = 'failed';
    await page.getByRole('button', { name: 'Refresh status' }).click();
    await page
      .getByRole('alert')
      .filter({ hasText: 'Previously loaded values may be out of date' })
      .waitFor();
    assert.equal(
      await page.getByRole('heading', { name: 'System status' }).count(),
      1,
    );
    assert.equal(reads.length, 4);
    await page.waitForFunction(
      () => !document.querySelector('button')?.disabled,
    );
    for (const width of [390, 1440]) {
      await page.setViewportSize({ width, height: 1000 });
      for (const theme of ['light', 'dark']) {
        await page.evaluate(
          (dark) => document.documentElement.classList.toggle('dark', dark),
          theme === 'dark',
        );
        assert.equal(
          await page.evaluate(
            () => document.documentElement.scrollWidth > innerWidth,
          ),
          false,
        );
        await page.screenshot({
          path: `docs/screenshots/ui/public-status-page-fixture-${width}-${theme}.png`,
          fullPage: true,
        });
      }
    }
    // Mount the actual application router: anonymous overview must never
    // request private identity, edition, health or legacy status data.
    await page.unroute('**/api/**');
    const routedReads: string[] = [];
    let scheduleStatus = 200;
    let queuesStatus = 200;
    const publicRoute = async (route: import('playwright').Route) => {
      const path = new URL(route.request().url()).pathname;
      routedReads.push(path);
      assert.equal(route.request().method(), 'GET');
      assert.ok(
        [
          '/api/admin/status',
          '/api/queues',
          '/api/me',
          '/api/settings/schedule',
          '/api/admin/topics',
          '/api/admin/topics/sources',
        ].includes(path),
        path,
      );
      await route.fulfill({
        contentType: 'application/json',
        status:
          path === '/api/settings/schedule'
            ? scheduleStatus
            : path === '/api/queues'
              ? queuesStatus
              : 200,
        body: JSON.stringify(
          path === '/api/queues'
            ? {
                queues: [
                  {
                    name: 'operations',
                    counts: {
                      waiting: 2,
                      active: 1,
                      delayed: 0,
                      failed: 0,
                      completed: 42,
                    },
                    nextRunAt: null,
                  },
                  {
                    name: 'digest-generation',
                    counts: {
                      waiting: 0,
                      active: 0,
                      delayed: 1,
                      failed: 0,
                      completed: 7,
                    },
                    nextRunAt: 1794495600000,
                  },
                ],
              }
            : path === '/api/admin/topics'
              ? [
                  {
                    id: '01234567-89ab-4cde-8fab-0123456789ab',
                    name: 'Fixture topic',
                    description: 'Offline topic catalog fixture',
                    includeGuidance: '',
                    excludeGuidance: '',
                    enabled: true,
                    position: 0,
                    storyBudget: 5,
                    postBudget: 4,
                    relevancePolicy: { includeAny: [], excludeAny: [] },
                    sources: ['fixture-source'],
                    queries: [],
                    accounts: [],
                    redditCommunities: [],
                  },
                ]
              : path === '/api/admin/topics/sources'
                ? [{ id: 'fixture-source', name: 'Fixture source' }]
                : path === '/api/me'
                  ? { isAdmin: false }
                  : path === '/api/settings/schedule'
                    ? {
                        cadence: '0 15 * * *',
                        timezone: 'UTC',
                        coverageWindow: 'P1D',
                        storyBudget: 5,
                        postBudget: 5,
                      }
                    : fixture,
        ),
      });
    };
    await page.route('**/api/**', publicRoute);
    const showRouter = (path: string) =>
      page.evaluate(async (path) => {
        await (
          window as unknown as { showRouter: (path: string) => Promise<void> }
        ).showRouter(path);
      }, path);
    await showRouter('/admin');
    await page.getByRole('heading', { name: 'System status' }).waitFor();
    assert.deepEqual(routedReads, ['/api/admin/status']);
    for (const width of [390, 1440]) {
      await page.setViewportSize({ width, height: 1000 });
      for (const theme of ['light', 'dark']) {
        await page.evaluate(
          (dark) => document.documentElement.classList.toggle('dark', dark),
          theme === 'dark',
        );
        assert.equal(
          await page.evaluate(
            () => document.documentElement.scrollWidth > innerWidth,
          ),
          false,
        );
        await page.screenshot({
          path: `docs/screenshots/ui/public-overview-router-fixture-${width}-${theme}.png`,
          fullPage: true,
        });
      }
    }
    routedReads.length = 0;
    await showRouter('/admin/topics');
    await page
      .getByRole('heading', { name: 'Fixture topic', exact: true })
      .waitFor();
    await page
      .getByText('Read-only topics. Sign in as an admin to change them.')
      .waitFor();
    for (const control of await page
      .locator(
        'section[aria-label="Topic management"] button:not(:text("Reload topics")), section[aria-label="Topic management"] input',
      )
      .all()) {
      assert.equal(await control.isDisabled(), true);
    }
    assert.equal(
      await page
        .locator('section[aria-label="Topic management"] [draggable="true"]')
        .count(),
      0,
    );
    assert.ok(routedReads.includes('/api/admin/topics'));
    assert.ok(
      routedReads.every((path) =>
        ['/api/me', '/api/admin/topics'].includes(path),
      ),
    );
    for (const width of [390, 1440]) {
      await page.setViewportSize({ width, height: 1000 });
      for (const theme of ['light', 'dark']) {
        await page.evaluate(
          (dark) => document.documentElement.classList.toggle('dark', dark),
          theme === 'dark',
        );
        assert.equal(
          await page.evaluate(
            () => document.documentElement.scrollWidth > innerWidth,
          ),
          false,
        );
        await page.screenshot({
          path: `docs/screenshots/ui/public-topics-router-fixture-${width}-${theme}.png`,
          fullPage: true,
        });
      }
    }
    routedReads.length = 0;
    await page
      .getByRole('link', { name: 'Fixture topic', exact: true })
      .click();
    await page
      .getByText('Read-only topic. Sign in as an admin to change it.')
      .waitFor();
    await page.getByText('Fixture source', { exact: true }).waitFor();
    assert.equal(
      await page.getByLabel('Description', { exact: true }).inputValue(),
      'Offline topic catalog fixture',
    );
    for (const control of await page
      .locator(
        'section[aria-label="Topic editor"] input, section[aria-label="Topic editor"] textarea, section[aria-label="Topic editor"] button',
      )
      .all()) {
      assert.equal(await control.isDisabled(), true);
    }
    assert.equal(
      await page
        .getByRole('checkbox', { name: 'Fixture source', exact: true })
        .isChecked(),
      true,
    );
    for (const form of await page
      .locator('section[aria-label="Topic editor"] form')
      .all()) {
      await form.dispatchEvent('submit');
    }
    assert.equal(await page.getByRole('dialog').count(), 0);
    assert.ok(routedReads.includes('/api/admin/topics/sources'));
    assert.ok(
      routedReads.every((path) =>
        ['/api/me', '/api/admin/topics', '/api/admin/topics/sources'].includes(
          path,
        ),
      ),
    );
    for (const width of [390, 1440]) {
      await page.setViewportSize({ width, height: 1000 });
      for (const theme of ['light', 'dark']) {
        await page.evaluate(
          (dark) => document.documentElement.classList.toggle('dark', dark),
          theme === 'dark',
        );
        assert.equal(
          await page.evaluate(
            () => document.documentElement.scrollWidth > innerWidth,
          ),
          false,
        );
        await page.screenshot({
          path: `docs/screenshots/ui/public-topic-detail-router-fixture-${width}-${theme}.png`,
          fullPage: true,
        });
      }
    }
    routedReads.length = 0;
    await showRouter('/admin/tools');
    await page.getByRole('heading', { name: 'Tools', exact: true }).waitFor();
    for (const href of ['/docs/', '/db/', '/admin/queues']) {
      assert.equal(await page.locator(`main a[href="${href}"]`).count(), 1);
    }
    for (const href of ['/grafana/', '/queues/', '/logs/', '/metrics/']) {
      assert.equal(await page.locator(`main a[href="${href}"]`).count(), 0);
    }
    assert.equal(
      await page.getByText('Admin sign-in required.', { exact: true }).count(),
      2,
    );
    assert.equal(
      await page
        .getByText('Public access is being prepared.', { exact: true })
        .count(),
      1,
    );
    for (const width of [390, 1440]) {
      await page.setViewportSize({ width, height: 1000 });
      for (const theme of ['light', 'dark']) {
        await page.evaluate(
          (dark) => document.documentElement.classList.toggle('dark', dark),
          theme === 'dark',
        );
        assert.equal(
          await page.evaluate(
            () => document.documentElement.scrollWidth > innerWidth,
          ),
          false,
        );
        await page.screenshot({
          path: `docs/screenshots/ui/public-tools-router-fixture-${width}-${theme}.png`,
          fullPage: true,
        });
      }
    }
    assert.ok(routedReads.every((path) => path === '/api/me'));
    routedReads.length = 0;
    await showRouter('/admin/queues');
    await page.getByRole('heading', { name: 'Queues', exact: true }).waitFor();
    await page
      .getByRole('heading', { name: 'operations', exact: true })
      .waitFor();
    assert.equal(
      await page.getByText('Not scheduled', { exact: false }).count(),
      1,
    );
    assert.equal(
      await page.locator('main input, main select, main textarea').count(),
      0,
    );
    assert.ok(
      routedReads.every((path) => ['/api/queues', '/api/me'].includes(path)),
    );
    await page
      .getByRole('button', { name: 'Refresh queues', exact: true })
      .click();
    for (const width of [390, 1440]) {
      await page.setViewportSize({ width, height: 1000 });
      for (const theme of ['light', 'dark']) {
        await page.evaluate(
          (dark) => document.documentElement.classList.toggle('dark', dark),
          theme === 'dark',
        );
        assert.equal(
          await page.evaluate(
            () => document.documentElement.scrollWidth > innerWidth,
          ),
          false,
        );
        await page.screenshot({
          path: `docs/screenshots/ui/public-queues-router-fixture-${width}-${theme}.png`,
          fullPage: true,
        });
      }
    }
    await page.waitForFunction(
      () =>
        !Array.from(document.querySelectorAll('button')).find(
          (button) => button.textContent === 'Refresh queues',
        )?.disabled,
    );
    queuesStatus = 503;
    await page
      .getByRole('button', { name: 'Refresh queues', exact: true })
      .click();
    await page
      .getByRole('alert')
      .filter({ hasText: 'Queue status could not be refreshed.' })
      .waitFor();
    assert.equal(
      await page
        .getByText('Previously loaded values may be out of date.', {
          exact: false,
        })
        .count(),
      1,
    );
    assert.equal(
      await page
        .getByRole('heading', { name: 'operations', exact: true })
        .count(),
      1,
    );
    queuesStatus = 200;
    await page
      .getByRole('button', { name: 'Refresh queues', exact: true })
      .click();
    await page
      .getByRole('alert')
      .filter({ hasText: 'Queue status could not be refreshed.' })
      .waitFor({ state: 'hidden' });
    routedReads.length = 0;
    await showRouter('/admin/sources');
    await page
      .getByText('Read-only sources. Sign in as an admin to change them.')
      .waitFor();
    await page.getByRole('region', { name: 'Source collection' }).waitFor();
    assert.equal(
      await page.locator('tbody tr').count(),
      fixture.sources.length,
    );
    assert.equal(
      await page
        .getByRole('button', { name: 'Add feed', exact: true })
        .isDisabled(),
      true,
    );
    for (const control of await page.getByRole('switch').all()) {
      assert.equal(await control.isDisabled(), true);
    }
    assert.equal(
      routedReads.some((path) => path.includes('profile')),
      false,
    );
    for (const width of [390, 1440]) {
      await page.setViewportSize({ width, height: 1000 });
      for (const theme of ['light', 'dark']) {
        await page.evaluate(
          (dark) => document.documentElement.classList.toggle('dark', dark),
          theme === 'dark',
        );
        assert.equal(
          await page.evaluate(
            () => document.documentElement.scrollWidth > innerWidth,
          ),
          false,
        );
        await page.screenshot({
          path: `docs/screenshots/ui/public-sources-router-fixture-${width}-${theme}.png`,
          fullPage: true,
        });
      }
    }
    // The actual schedule route consumes only reviewed public contracts.
    routedReads.length = 0;
    await showRouter('/admin/schedule');
    await page
      .getByText('Read-only schedule. Sign in as an admin to change it.')
      .waitFor();
    assert.equal(
      await page.getByLabel('Daily local time').inputValue(),
      '15:00',
    );
    assert.equal(await page.getByLabel('Daily local time').isDisabled(), true);
    assert.equal(
      await page
        .getByRole('button', { name: 'Save schedule', exact: true })
        .isDisabled(),
      true,
    );
    assert.deepEqual([...new Set(routedReads)].sort(), [
      '/api/admin/status',
      '/api/me',
      '/api/settings/schedule',
    ]);
    for (const width of [390, 1440]) {
      await page.setViewportSize({ width, height: 1000 });
      for (const theme of ['light', 'dark']) {
        await page.evaluate(
          (dark) => document.documentElement.classList.toggle('dark', dark),
          theme === 'dark',
        );
        assert.equal(
          await page.evaluate(
            () => document.documentElement.scrollWidth > innerWidth,
          ),
          false,
        );
        await page.screenshot({
          path: `docs/screenshots/ui/public-schedule-router-fixture-${width}-${theme}.png`,
          fullPage: true,
        });
      }
    }
    // Use a new document/module graph so the failed read has no retained observer.
    scheduleStatus = 404;
    routedReads.length = 0;
    const failedSchedule = await browser.newPage();
    failedSchedule.on('pageerror', (error) => errors.push(error.message));
    await failedSchedule.route('**/api/**', publicRoute);
    await failedSchedule.goto(
      `http://127.0.0.1:${address.port}/public-status-review.html`,
    );
    await failedSchedule.evaluate(async () => {
      await (
        window as unknown as { showRouter: (path: string) => Promise<void> }
      ).showRouter('/admin/schedule');
    });
    await failedSchedule
      .getByText('Schedule could not be loaded.', { exact: true })
      .waitFor({ timeout: 30000 });
    assert.ok(routedReads.includes('/api/settings/schedule'));
    assert.ok(!routedReads.includes('/api/admin/profile'));
    assert.equal(
      await failedSchedule.getByLabel('Daily local time').count(),
      0,
    );
    await failedSchedule.close();
    routedReads.length = 0;
    await showRouter('/admin/spend');
    await page
      .getByRole('heading', { name: 'Production spending', exact: true })
      .waitFor();
    await page.getByRole('heading', { name: 'AI production budget' }).waitFor();
    await page.getByRole('heading', { name: 'X production budget' }).waitFor();
    assert.equal(
      await page.getByText('Development allowances', { exact: true }).count(),
      0,
    );
    assert.equal(
      await page.getByRole('heading', { name: 'Source health' }).count(),
      0,
    );
    assert.ok(
      routedReads.every((path) =>
        ['/api/me', '/api/admin/status'].includes(path),
      ),
    );
    for (const width of [390, 1440]) {
      await page.setViewportSize({ width, height: 1000 });
      for (const theme of ['light', 'dark']) {
        await page.evaluate(
          (dark) => document.documentElement.classList.toggle('dark', dark),
          theme === 'dark',
        );
        assert.equal(
          await page.evaluate(
            () => document.documentElement.scrollWidth > innerWidth,
          ),
          false,
        );
        await page.screenshot({
          path: `docs/screenshots/ui/public-spend-router-fixture-${width}-${theme}.png`,
          fullPage: true,
        });
      }
    }
    routedReads.length = 0;
    await showRouter('/admin/editions/new');
    await page.getByRole('heading', { name: 'Page not found' }).waitFor();
    assert.ok(routedReads.every((path) => path === '/api/me'));
    // Rebuild the module graph in private mode to verify rollback uses the
    // original identity guard before constructing any overview requests.
    await page.close();
    await server.close();
    server = await createServer({
      root,
      server: { host: '127.0.0.1', port: 0 },
      define: { 'import.meta.env.VITE_PUBLIC_MODE': JSON.stringify('0') },
      logLevel: 'error',
    });
    await server.listen();
    const privateAddress = server.httpServer!.address();
    assert.ok(privateAddress && typeof privateAddress === 'object');
    const privatePage = await browser.newPage();
    privatePage.on('pageerror', (error) => errors.push(error.message));
    const privateReads: string[] = [];
    await privatePage.route('**/api/**', async (route) => {
      const path = new URL(route.request().url()).pathname;
      privateReads.push(path);
      assert.equal(path, '/api/me');
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ isAdmin: false }),
      });
    });
    await privatePage.goto(
      `http://127.0.0.1:${privateAddress.port}/public-status-review.html`,
    );
    await privatePage.evaluate(async () => {
      await (
        window as unknown as { showRouter: (path: string) => Promise<void> }
      ).showRouter('/admin');
    });
    await privatePage
      .getByRole('heading', { name: 'Page not found' })
      .waitFor();
    assert.deepEqual(privateReads, ['/api/me']);
    assert.deepEqual(errors, []);
    console.log(
      'PASS: offline public status rendering; desktop/mobile light/dark, budgets, source failures, coverage, empty sections; query loading, HTTP/schema failures, retry, stale-data warning and isolated cache; public overview/schedule/topic catalog and detail router isolation, disabled anonymous topic controls and guarded form submissions, disabled anonymous schedule controls, schedule 404 without owner fallback, private sibling and rollback refusals; no private reads or overflow.',
    );
  } finally {
    await browser.close();
    await server?.close();
    await rm(harness, { force: true });
  }
}
void main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
