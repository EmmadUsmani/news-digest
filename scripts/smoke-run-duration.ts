import assert from 'node:assert/strict';

import { operationsStatusSchema } from '@digest/contracts';
import { chromium } from 'playwright';

import { localAdminJson } from './lib/local-admin-fetch';

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
      const status = operationsStatusSchema.parse(
        await localAdminJson('/api/admin/status'),
      );
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
      await page.route('**/api/status', (route) =>
        route.fulfill({ json: status }),
      );
      await page.goto('http://localhost:8000');
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
    console.log(
      'Status duration: desktop/mobile completed and waiting telemetry pass; intercepted telemetry, no generation.',
    );
  } finally {
    await browser.close();
  }
}
void smoke();
