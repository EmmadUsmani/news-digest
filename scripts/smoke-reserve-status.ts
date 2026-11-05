// Protected live snapshot; intercepted variants below are synthetic, never saved.
import assert from 'node:assert/strict';

import { operationsStatusSchema, readerEditionSchema } from '@digest/contracts';
import { chromium } from 'playwright';

import { localAdminJson } from './lib/local-admin-fetch';

async function main() {
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
      const live = structuredClone(baseline);
      assert.ok(live.llm.scheduledReserve);
      await page.route('**/api/status', (route) => {
        assert.equal(route.request().method(), 'GET');
        return route.fulfill({ json: live });
      });
      await page.goto('http://localhost:8000');
      await page.getByText('Source & run status', { exact: true }).click();
      const panel = page.getByRole('region', {
        name: 'Scheduled AI budget',
        exact: true,
      });
      await panel
        .getByText(
          `Protection ${live.llm.scheduledReserve.enabled ? 'enabled' : 'disabled'}.`,
          { exact: false },
        )
        .waitFor();
      await panel.screenshot({
        path: `docs/screenshots/status-reserve-${name}.png`,
      });
      // Exercise the protected and released states without writing live data or
      // invoking providers. The browser receives an explicitly synthetic copy.
      const synthetic = structuredClone(live);
      synthetic.llm.scheduledReserve = {
        ...live.llm.scheduledReserve,
        enabled: true,
        state: 'pending',
        reserveMicros: 100000,
        sizedReserveMicros: 100000,
        otherSpendLimitMicros: 300000,
        otherAvailableMicros: 200000,
        limitedByReserve: true,
        lastOutcome: null,
      };
      await page.route('**/api/status', (route) => {
        assert.equal(route.request().method(), 'GET');
        return route.fulfill({ json: synthetic });
      });
      await page
        .getByRole('button', { name: 'Refresh status', exact: true })
        .click();
      await panel
        .getByText(
          'AI budget reserved for the scheduled edition limits manual and development runs.',
          { exact: true },
        )
        .waitFor();
      synthetic.llm.scheduledReserve.lastOutcome = {
        budgetDay: '2026-11-02',
        scheduledAt: '2026-11-02T15:00:00.000Z',
        state: 'succeeded',
        outcome: {
          editionId: '00000000-0000-4000-8000-000000000001',
          mode: 'fallback',
          reason: 'Synthetic reserve smoke fallback reason.',
        },
      };
      synthetic.llm.scheduledReserve.state = 'succeeded';
      synthetic.llm.scheduledReserve.reserveMicros = 0;
      synthetic.llm.scheduledReserve.limitedByReserve = false;
      await page
        .getByRole('button', { name: 'Refresh status', exact: true })
        .click();
      await panel
        .getByText('Synthetic reserve smoke fallback reason.', { exact: false })
        .waitFor();
      assert.equal(
        await panel
          .getByText(
            'AI budget reserved for the scheduled edition limits manual and development runs.',
            { exact: true },
          )
          .count(),
        0,
      );
      assert.equal(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth,
        ),
        true,
      );
      assert.deepEqual(errors, []);
      await page.close();
    }
    assert.deepEqual(writes, [], 'Unexpected browser API writes');
    assert.deepEqual(await readEdition(edition.id), edition);
    console.log(
      'Reserve Status: live desktop/mobile screenshots and synthetic protected/released states passed; API writes blocked, saved edition unchanged, no inference.',
    );
  } finally {
    await browser.close();
  }
}
void main().catch((error: unknown) => {
  console.error(error);
  process.exitCode = 1;
});
