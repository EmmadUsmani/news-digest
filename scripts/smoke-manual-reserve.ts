// Protected live snapshot plus browser-only synthetic budget and job responses.
import assert from 'node:assert/strict';

import { operationsStatusSchema, readerEditionSchema } from '@digest/contracts';
import { chromium } from 'playwright';

import { localAdminJson } from './lib/local-admin-fetch';
import { replayAdminPage } from './lib/replay-admin-page';

async function main() {
  const live = operationsStatusSchema.parse(
    await localAdminJson('/api/admin/status'),
  );
  const readLatest = async () => {
    const response = await fetch('http://localhost:8000/api/editions/latest', {
      signal: AbortSignal.timeout(15000),
    });
    assert.equal(response.status, 200);
    return readerEditionSchema.parse(await response.json());
  };
  const edition = await readLatest();
  const browser = await chromium.launch({ headless: true });
  try {
    for (const [name, width, height] of [
      ['desktop', 1440, 1100],
      ['mobile', 390, 844],
    ] as const) {
      const page = await browser.newPage({ viewport: { width, height } });
      const errors: string[] = [];
      page.on('pageerror', (error) => errors.push(error.message));
      page.setDefaultTimeout(15000);
      const writes: string[] = [];
      await page.route('**/api/**', (route) => {
        const request = route.request();
        if (!['GET', 'HEAD'].includes(request.method())) {
          writes.push(`${request.method()} ${new URL(request.url()).pathname}`);
          return route.abort();
        }
        return route.continue();
      });
      await page.route('**/api/admin/status', (route) =>
        route.fulfill({ json: live }),
      );
      await replayAdminPage(page);
      await page.goto('http://127.0.0.1:8000/admin/editions/new');
      await page
        .getByRole('button', {
          name: 'Create edition · last 24 hours',
          exact: true,
        })
        .waitFor();
      await page.screenshot({
        path: `docs/screenshots/manual-reserve-${name}.png`,
      });
      const synthetic = structuredClone(live);
      assert.ok(synthetic.llm.scheduledReserve);
      Object.assign(synthetic.llm.scheduledReserve, {
        enabled: true,
        state: 'pending',
        reserveMicros: 100000,
        limitedByReserve: true,
        otherAvailableMicros: 0,
      });
      await page.route('**/api/admin/status', (route) =>
        route.fulfill({ json: synthetic }),
      );
      await page.reload();
      const notice = page.getByRole('status', {
        name: 'Manual edition AI budget',
      });
      await notice
        .getByText('AI budget reserved for the scheduled edition.', {
          exact: false,
        })
        .waitFor();
      assert.match(await notice.innerText(), /\$0.000000 available/);
      // Submission refreshes the budget; it must never create a real job.
      synthetic.llm.scheduledReserve.otherAvailableMicros = 1234;
      let submissions = 0;
      await page.route('**/api/admin/digest-previews/jobs', (route) => {
        assert.equal(route.request().method(), 'POST');
        submissions++;
        return route.fulfill({ json: { id: '999999999' } });
      });
      await page.route(
        '**/api/admin/digest-previews/jobs/999999999',
        (route) => {
          assert.equal(route.request().method(), 'GET');
          return route.fulfill({
            json: {
              id: '999999999',
              state: 'failed',
              editionId: null,
              progress: null,
            },
          });
        },
      );
      await page
        .getByRole('button', {
          name: 'Create edition · last 24 hours',
          exact: true,
        })
        .click();
      await page
        .getByText('Edition generation failed. Try again later.', {
          exact: true,
        })
        .waitFor();
      assert.equal(submissions, 1);
      assert.match(await notice.innerText(), /\$0.001234 available/);
      synthetic.llm.scheduledReserve.limitedByReserve = false;
      await page.reload();
      await page
        .getByRole('button', {
          name: 'Create edition · last 24 hours',
          exact: true,
        })
        .waitFor();
      await page.waitForLoadState('networkidle');
      assert.equal(await notice.count(), 0);
      await page.route('**/api/admin/status', (route) =>
        route.fulfill({ status: 503, json: {} }),
      );
      await page.reload();
      await notice
        .getByText('AI budget availability could not be checked.', {
          exact: false,
        })
        .waitFor();
      assert.equal(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth,
        ),
        true,
      );
      assert.deepEqual(writes, []);
      assert.deepEqual(errors, []);
      await page.close();
    }
    assert.deepEqual(await readLatest(), edition);
    console.log(
      'Manual reserve: desktop/mobile live screenshots; synthetic protected, refreshed, released and unavailable states passed. Unexpected API writes blocked; saved reader edition unchanged. No live jobs or inference.',
    );
  } finally {
    await browser.close();
  }
}
void main().catch((error: unknown) => {
  console.error(error);
  process.exitCode = 1;
});
