import assert from 'node:assert/strict';

import { operationsStatusSchema, sourceCatalogSchema } from '@digest/contracts';
import { chromium } from 'playwright';
async function smoke() {
  const browser = await chromium.launch({ headless: true });
  try {
    for (const [name, width, height] of [
      ['desktop', 1440, 1100],
      ['mobile', 390, 844],
    ] as const) {
      const page = await browser.newPage({ viewport: { width, height } });
      const errors: string[] = [];
      page.on('pageerror', (error) => errors.push(error.message));
      await page.goto('http://localhost:8000');
      await page.getByText('Source & run status', { exact: true }).click();
      await page
        .getByRole('heading', { name: 'Recent automatic runs', exact: true })
        .waitFor();
      await page
        .getByText('After an outage, queued runs up to six hours late', {
          exact: false,
        })
        .waitFor();
      const response = await page.request.get(
        'http://localhost:8000/api/status',
      );
      assert.equal(response.status(), 200);
      const status = operationsStatusSchema.parse(await response.json());
      const catalog = sourceCatalogSchema.parse(
        await (
          await page.request.get('http://localhost:8000/api/topics/sources')
        ).json(),
      );
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
        status.sources.length + status.queues.length,
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
      const usagePanel = page.getByRole('region', {
        name: 'AI usage',
        exact: true,
      });
      await usagePanel
        .getByRole('heading', { name: 'AI usage', exact: true })
        .waitFor();
      assert.ok(status.llm.monthlyCapMicros <= 14000000);
      assert.ok(
        status.llm.todayMicros > 0,
        'Real live probe spend must be visible',
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
      const edition = page.locator('.run-list a').first();
      if (await edition.count()) {
        await edition.click();
        await page.waitForURL('**/?edition=*');
        await page
          .locator('.period')
          .filter({ hasText: 'Saved edition' })
          .waitFor();
      }
      await page.goto('http://localhost:8000');
      await page.route('**/api/status', (route) =>
        route.fulfill({ status: 503, body: 'Unavailable' }),
      );
      await page.getByText('Source & run status', { exact: true }).click();
      await page
        .getByRole('button', { name: 'Refresh status', exact: true })
        .click();
      await page
        .getByRole('alert')
        .filter({ hasText: 'Status could not be refreshed' })
        .waitFor();
      assert.deepEqual(errors, []);
      await page.close();
    }
    // Exercise visible failure states with explicit synthetic browser responses only.
    const page = await browser.newPage();
    const live = operationsStatusSchema.parse(
      await (await page.request.get('http://localhost:8000/api/status')).json(),
    );
    live.queues[2].runs = [
      {
        id: 'synthetic-missed-run',
        state: 'completed',
        attempts: 1,
        scheduledAt: '2020-01-01T00:00:00.000Z',
        finishedAt: live.checkedAt,
        editionId: null,
        skipped:
          'Missed run: more than six hours late; generate a custom window to recover coverage',
      },
    ];
    live.llm.blockedUntil = '2027-01-01T00:00:00.000Z';
    live.llm.availableMicros = 0;
    live.llm.lastError = { code: 'provider-spend-limit', at: live.checkedAt };
    live.sources[0].error = 'Recorded collection failure';
    live.sources[1].lastSuccess = '2020-01-01T00:00:00.000Z';
    live.sources[2].active = false;
    live.queues[0].workers = 0;
    live.queues[1].available = false;
    live.queues[2].paused = true;
    await page.route('**/api/status', (route) => route.fulfill({ json: live }));
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
      .getByText('Provider spend limit reached. Calls stopped until', {
        exact: false,
      })
      .waitFor();
    await page
      .getByText('Last provider error: provider-spend-limit', { exact: false })
      .waitFor();
    await page.close();
    console.log(
      'Status desktop/mobile, real telemetry, edition links, refresh errors and synthetic failure rendering passed',
    );
  } finally {
    await browser.close();
  }
}
void smoke();
