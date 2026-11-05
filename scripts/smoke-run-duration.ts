import assert from 'node:assert/strict';

import { operationsStatusSchema, readerEditionSchema } from '@digest/contracts';
import { chromium } from 'playwright';

import { localAdminJson } from './lib/local-admin-fetch';
import { replayAdminPage } from './lib/replay-admin-page';

async function smoke() {
  const baseline = operationsStatusSchema.parse(
    await localAdminJson('/api/admin/status'),
  );
  const readEdition = async (id: string) => {
    const response = await fetch(`http://localhost:8000/api/editions/${id}`, {
      signal: AbortSignal.timeout(15_000),
    });
    assert.equal(response.status, 200);
    return readerEditionSchema.parse(await response.json());
  };
  const edition = await readEdition('latest');
  const writes: string[] = [];
  const browser = await chromium.launch({ headless: true });
  try {
    for (const [name, width, height] of [
      ['desktop', 1440, 1100],
      ['mobile', 390, 844],
    ] as const) {
      const page = await browser.newPage({ viewport: { width, height } });
      page.setDefaultTimeout(15_000);
      await page.route('**/api/**', (route) => {
        const request = route.request();
        if (!['GET', 'HEAD'].includes(request.method())) {
          writes.push(`${request.method()} ${new URL(request.url()).pathname}`);
          return route.abort();
        }
        return route.continue();
      });
      const errors: string[] = [];
      page.on('pageerror', (error) => errors.push(error.message));
      const status = structuredClone(baseline);
      // Replay queue telemetry only; never submit jobs or call inference.
      const queue = status.queues.find(
        (queue: { name: string }) => queue.name === 'digest-generation',
      );
      assert.ok(queue);
      queue.runs = [
        {
          id: 'duration-smoke',
          state: 'completed',
          attempts: 1,
          scheduledAt: null,
          startedAt: '2026-11-02T13:00:00.000Z',
          finishedAt: '2026-11-02T13:01:05.432Z',
          durationMs: 65432,
          editionId: null,
          skipped: null,
        },
        {
          id: 'waiting-smoke',
          state: 'waiting',
          attempts: 0,
          scheduledAt: null,
          startedAt: null,
          finishedAt: null,
          durationMs: null,
          editionId: null,
          skipped: null,
        },
      ];
      await page.route('**/api/admin/status', (route) => {
        assert.equal(route.request().method(), 'GET');
        return route.fulfill({ json: status });
      });
      await replayAdminPage(page);
      await page.goto('http://127.0.0.1:8000/admin');
      await page.locator('.status-panel summary').click();
      await page
        .getByText('Last finished run: 65.4s', { exact: false })
        .waitFor();
      const completed = page
        .locator('.run-list li')
        .filter({ hasText: '65.4s processing' });
      assert.equal(await completed.count(), 1);
      assert.ok((await completed.innerText()).includes('on-demand'));
      assert.equal(
        await page
          .locator('.run-list li')
          .filter({ hasText: 'waiting' })
          .getByText('processing')
          .count(),
        0,
      );
      await page
        .getByRole('heading', { name: 'Recent edition runs' })
        .scrollIntoViewIfNeeded();
      await page.screenshot({
        path: `docs/screenshots/run-duration-${name}.png`,
      });
      assert.deepEqual(errors, []);
      await page.close();
    }
    assert.deepEqual(writes, [], 'Unexpected browser API writes');
    assert.deepEqual(await readEdition(edition.id), edition);
    console.log(
      'Status duration: desktop/mobile completed and waiting telemetry pass; intercepted telemetry, API writes blocked, saved edition unchanged, no generation.',
    );
  } finally {
    await browser.close();
  }
}
void smoke();
