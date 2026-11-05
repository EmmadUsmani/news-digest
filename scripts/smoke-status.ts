// Protected live telemetry snapshots replayed in the browser; synthetic failures stay local.
import assert from 'node:assert/strict';

import { operationsStatusSchema, sourceCatalogSchema } from '@digest/contracts';
import { chromium } from 'playwright';

import { localAdminJson } from './lib/local-admin-fetch';
async function smoke() {
  const browser = await chromium.launch({ headless: true });
  const [topics, profile, content, latest] = await Promise.all([
    localAdminJson('/api/admin/topics'),
    localAdminJson('/api/admin/profile'),
    localAdminJson('/api/admin/content'),
    localAdminJson('/api/admin/digest-previews/latest'),
  ]);
  const savedEdition = latest
    ? await localAdminJson(
        '/api/admin/digest-previews/' + (latest as { id: string }).id,
      )
    : null;
  const context = await browser.newContext({ serviceWorkers: 'block' });
  const credentials: string[] = [];
  const unexpectedWrites: string[] = [];
  context.on('request', (request) => {
    const headers = request.headers();
    if ('admin_local_token' in headers || 'x-exedev-email' in headers)
      credentials.push(new URL(request.url()).pathname);
  });
  const snapshots: Record<string, unknown> = {
    '/api/topics': topics,
    '/api/profile': profile,
    '/api/content': content,
  };
  await context.route('**/*', (route) => {
    const request = route.request();
    const path = new URL(request.url()).pathname;
    const headers = request.headers();
    if ('admin_local_token' in headers || 'x-exedev-email' in headers)
      return route.abort();
    if (!['GET', 'HEAD'].includes(request.method())) {
      unexpectedWrites.push(`${request.method()} ${path}`);
      return route.abort();
    }
    if (Object.hasOwn(snapshots, path))
      return route.fulfill({ json: snapshots[path] });
    return route.continue();
  });
  try {
    for (const [name, width, height] of [
      ['desktop', 1440, 1100],
      ['mobile', 390, 844],
    ] as const) {
      const page = await context.newPage();
      await page.setViewportSize({ width, height });
      const errors: string[] = [];
      page.on('pageerror', (error) => errors.push(error.message));
      const status = operationsStatusSchema.parse(
        await localAdminJson('/api/admin/status'),
      );
      const catalog = sourceCatalogSchema.parse(
        await localAdminJson('/api/admin/topics/sources'),
      );
      // Replay one real snapshot so collection jobs cannot race UI assertions.
      // Credentials remain in Node; later routes override this for failure cases.
      await page.route('**/api/status', (route) =>
        route.request().method() === 'GET'
          ? route.fulfill({ json: status })
          : route.fallback(),
      );
      await page.goto('http://localhost:8000');
      assert.equal(
        await page.evaluate(async () => {
          try {
            await fetch('/api/status/unexpected-write-probe', {
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
        'POST /api/status/unexpected-write-probe',
      );
      await page.getByText('Source & run status', { exact: true }).click();
      await page
        .getByRole('heading', { name: 'Recent edition runs', exact: true })
        .waitFor();
      await page
        .getByText('After an outage, queued runs up to six hours late', {
          exact: false,
        })
        .waitFor();
      assert.equal(status.sources.length, catalog.length);
      assert.ok(
        status.sources
          .filter((source) => source.active)
          .every((source) => source.storedItems > 0 && source.lastSuccess),
      );
      assert.ok(
        status.queues.every((queue) => queue.available && queue.workers > 0),
      );
      assert.ok(
        status.queues.find((queue) => queue.name === 'digest-generation')
          ?.nextRun,
      );
      assert.equal(
        await page.locator('.status-grid article').count(),
        status.sources.length +
          status.queues.length +
          (status.coverage?.topics.length ?? 0),
      );
      await page
        .getByRole('button', { name: 'Refresh status', exact: true })
        .click();
      await page
        .getByRole('button', { name: 'Refresh status', exact: true })
        .waitFor();
      await page.locator('.status-panel').scrollIntoViewIfNeeded();
      await page.screenshot({
        path: `docs/screenshots/status-${name}.png`,
        fullPage: false,
      });
      await page
        .getByRole('heading', { name: 'Queues', exact: true })
        .evaluate((element) => element.scrollIntoView({ block: 'start' }));
      await page.screenshot({
        path: `docs/screenshots/status-runs-${name}.png`,
        fullPage: false,
      });
      const social = page.getByRole('region', {
        name: 'Free social collection',
        exact: true,
      });
      await social
        .getByRole('heading', { name: 'Free social collection', exact: true })
        .waitFor();
      const socialRuns = status.queues.find(
        (queue) => queue.name === 'social-collection',
      )!.runs;
      assert.equal(await social.locator('li').count(), socialRuns.length);
      assert.ok(
        socialRuns.some((run) => run.socialCollection),
        'Retained real social counters must be visible',
      );
      await social
        .getByRole('heading', { name: 'Free social collection', exact: true })
        .evaluate((element) => element.scrollIntoView({ block: 'start' }));
      await page.screenshot({
        path: `docs/screenshots/status-social-${name}.png`,
        fullPage: false,
      });
      const xUsage = page.getByRole('region', {
        name: 'X discovery usage',
        exact: true,
      });
      await xUsage
        .getByRole('heading', { name: 'X discovery usage', exact: true })
        .waitFor();
      assert.equal(status.xDiscovery.dailyMicros, 400000);
      assert.equal(status.xDiscovery.monthlyMicros, 12000000);
      await xUsage
        .getByText(
          'Paid X discovery is scheduled 5–30 minutes before the edition',
          {
            exact: false,
          },
        )
        .waitFor();
      await xUsage.scrollIntoViewIfNeeded();
      await page.screenshot({
        path: `docs/screenshots/status-x-usage-${name}.png`,
        fullPage: false,
      });
      const usagePanel = page.getByRole('region', {
        name: 'AI usage',
        exact: true,
      });
      await usagePanel
        .getByRole('heading', { name: 'AI usage', exact: true })
        .waitFor();
      assert.ok(status.llm.monthlyCapMicros <= 14000000);
      assert.ok(
        status.llm.todayMicros >= 0,
        'Daily usage must remain valid even before any paid calls',
      );
      await usagePanel
        .getByText('This month (UTC):', { exact: false })
        .waitFor();
      assert.ok(status.llm.modelAllocation);
      assert.ok(
        status.llm.modelAllocation.dailyCapMicros <= status.llm.dailyCapMicros,
      );
      await usagePanel.getByText('Final editor (', { exact: false }).waitFor();
      await usagePanel.scrollIntoViewIfNeeded();
      await page.screenshot({
        path: `docs/screenshots/status-usage-${name}.png`,
        fullPage: false,
      });
      assert.equal(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth,
        ),
        true,
      );
      await page.route('**/api/status', (route) =>
        route.request().method() === 'GET'
          ? route.fulfill({ status: 503, body: 'Unavailable' })
          : route.fallback(),
      );
      await page
        .getByRole('button', { name: 'Refresh status', exact: true })
        .click();
      await page
        .getByRole('alert')
        .filter({ hasText: 'Status could not be refreshed' })
        .waitFor();
      await page
        .getByRole('button', { name: 'Refresh status', exact: true })
        .waitFor();
      assert.equal(
        await page.locator('.status-grid article').count(),
        status.sources.length +
          status.queues.length +
          (status.coverage?.topics.length ?? 0),
      );
      await page
        .getByRole('alert')
        .filter({ hasText: 'Status could not be refreshed' })
        .screenshot({
          path: `docs/screenshots/status-refresh-failure-${name}.png`,
        });
      await page.route('**/api/status', (route) =>
        route.request().method() === 'GET'
          ? route.fulfill({ json: status })
          : route.fallback(),
      );
      await page
        .getByRole('button', { name: 'Refresh status', exact: true })
        .click();
      await page
        .getByRole('heading', { name: 'Recent edition runs', exact: true })
        .waitFor();
      await page.waitForFunction(
        () =>
          !document
            .querySelector('[role="alert"]')
            ?.textContent?.includes('Status could not be refreshed'),
      );
      assert.equal(
        await page.locator('.status-grid article').count(),
        status.sources.length +
          status.queues.length +
          (status.coverage?.topics.length ?? 0),
      );
      const edition = page.locator('.run-list a').first();
      if (await edition.count()) {
        await edition.click();
        await page.waitForURL('**/editions/*');
        await page
          .locator('.period')
          .filter({ hasText: 'Saved edition' })
          .waitFor();
      }
      assert.deepEqual(errors, []);
      await page.close();
    }
    // Exercise visible failure states with explicit synthetic browser responses only.
    const page = await context.newPage();
    const live = operationsStatusSchema.parse(
      await localAdminJson('/api/admin/status'),
    );
    const digestQueue = live.queues.find(
      (queue) => queue.name === 'digest-generation',
    )!;
    digestQueue.runs = [
      {
        id: 'synthetic-missed-run',
        state: 'completed',
        attempts: 1,
        scheduledAt: '2020-01-01T00:00:00.000Z',
        startedAt: null,
        finishedAt: live.checkedAt,
        durationMs: null,
        editionId: null,
        skipped:
          'Missed run: more than six hours late; generate a custom window to recover coverage',
      },
    ];
    live.xDiscovery.blocked = true;
    live.xDiscovery.availableMicros = 0;
    live.llm.blockedUntil = '2027-01-01T00:00:00.000Z';
    live.llm.availableMicros = 0;
    live.llm.lastError = { code: 'provider-spend-limit', at: live.checkedAt };
    live.sources[0].error = 'Recorded collection failure';
    live.sources[1].lastSuccess = '2020-01-01T00:00:00.000Z';
    live.sources[2].active = false;
    live.queues[0].workers = 0;
    live.queues[1].available = false;
    digestQueue.paused = true;
    const synthetic = operationsStatusSchema.parse(live);
    await page.route('**/api/status', (route) =>
      route.request().method() === 'GET'
        ? route.fulfill({ json: synthetic })
        : route.fallback(),
    );
    await page.goto('http://localhost:8000');
    await page.getByText('Source & run status', { exact: true }).click();
    await page
      .getByText('Missed run: more than six hours late', { exact: false })
      .waitFor();
    for (const text of [
      'Collection failed',
      'Collection overdue',
      'Paused · no enabled topics',
      'No worker connected',
      'Queue unavailable',
      'Queue paused',
    ])
      await page.getByText(text, { exact: true }).waitFor();
    await page
      .getByText('X prepaid credits depleted.', { exact: false })
      .waitFor();
    await page
      .getByText('Provider spend limit reached. Calls stopped until', {
        exact: false,
      })
      .waitFor();
    await page
      .getByText('Last provider error: provider-spend-limit', { exact: false })
      .waitFor();
    await page.close();
    assert.deepEqual(credentials, []);
    assert.deepEqual(unexpectedWrites, []);
    assert.deepEqual(await localAdminJson('/api/admin/topics'), topics);
    assert.deepEqual(await localAdminJson('/api/admin/profile'), profile);
    if (latest)
      assert.deepEqual(
        await localAdminJson(
          '/api/admin/digest-previews/' + (latest as { id: string }).id,
        ),
        savedEdition,
      );
    console.log(
      'Status desktop/mobile protected telemetry, edition links, refresh failure/retry and synthetic failures passed; browser credentials absent, writes guarded, full saved edition/topics/profile unchanged',
    );
  } finally {
    await browser.close();
  }
}
void smoke();
