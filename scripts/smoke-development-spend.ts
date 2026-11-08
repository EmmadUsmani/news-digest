// Real read-only spending response; stopped/unavailable states are browser fixtures.
import assert from 'node:assert/strict';

import { chromium } from 'playwright';

import { localAdminJson } from './lib/local-admin-fetch';
import { replayAdminPage } from './lib/replay-admin-page';

async function smoke() {
  const origin = 'http://127.0.0.1:8000';
  const status = await localAdminJson('/api/admin/status');
  assert.equal(status.developmentSpend.length, 2);
  const browser = await chromium.launch();
  try {
    for (const [device, width, height] of [
      ['desktop', 1440, 1000],
      ['mobile', 390, 844],
    ] as const) {
      for (const theme of ['light', 'dark'] as const) {
        const context = await browser.newContext({
          viewport: { width, height },
          colorScheme: theme,
          serviceWorkers: 'block',
        });
        const page = await context.newPage();
        const errors: string[] = [];
        page.on('pageerror', (error) => errors.push(error.message));
        let response = status;
        await context.route('**/*', (route) => {
          assert.equal(route.request().method(), 'GET');
          assert.equal(new URL(route.request().url()).origin, origin);
          if (new URL(route.request().url()).pathname === '/api/admin/status')
            return route.fulfill({ json: response });
          return route.continue();
        });
        await replayAdminPage(page);
        await page.goto(`${origin}/admin/spend`);
        const card = page.getByRole('region', {
          name: 'Development allowances',
        });
        await card.getByText('Anthropic', { exact: true }).waitFor();
        for (const pool of status.developmentSpend) {
          assert.ok(
            (await card.innerText()).includes(
              `Charged: $${(pool.chargedMicros / 1e6).toFixed(6)}`,
            ),
          );
          assert.ok(
            (await card.innerText()).includes(
              `Held: $${(pool.heldMicros / 1e6).toFixed(6)}`,
            ),
          );
        }
        assert.equal(
          await page.evaluate(
            () => document.documentElement.scrollWidth > innerWidth,
          ),
          false,
        );
        await page.screenshot({
          path: `docs/screenshots/ui/development-spend-${device}-${theme}.png`,
          fullPage: true,
        });
        response = {
          ...status,
          developmentSpend: status.developmentSpend.map(
            (pool: Record<string, unknown>) => ({
              ...pool,
              mustReport: true,
              availableMicros: 0,
              heldMicros: 100000,
              unresolvedCount: 1,
            }),
          ),
        };
        await page.getByRole('button', { name: 'Refresh spend' }).click();
        await card
          .getByRole('alert')
          .filter({ hasText: 'Anthropic development allowance stopped' })
          .waitFor();
        assert.equal(await card.getByRole('alert').count(), 2);
        response = { ...status };
        delete response.developmentSpend;
        await page.getByRole('button', { name: 'Refresh spend' }).click();
        await card
          .getByText('Development allowance figures unavailable.')
          .waitFor();
        assert.deepEqual(errors, []);
        await context.close();
      }
    }
  } finally {
    await browser.close();
  }
  console.log(
    'Development spend: four device/theme views; real totals, fixture stop/unavailable states; no writes or provider calls.',
  );
}
void smoke();
