// Saved live reads only; all browser writes and external traffic are blocked.
import assert from 'node:assert/strict';

import {
  operationsStatusSchema,
  previewHistorySchema,
} from '@digest/contracts';
import { chromium } from 'playwright';

import { localAdminFetch } from './lib/local-admin-fetch';
import { replayAdminPage } from './lib/replay-admin-page';

const origin = 'http://127.0.0.1:8000';
async function smoke() {
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
        await context.route('**/*', async (route) => {
          const request = route.request();
          assert.equal(request.method(), 'GET');
          assert.equal(new URL(request.url()).origin, origin);
          assert.equal('admin_local_token' in request.headers(), false);
          assert.equal('x-exedev-email' in request.headers(), false);
          await route.continue();
        });
        assert.equal(
          (await page.goto(`${origin}/admin/editions`))?.status(),
          404,
        );
        await page.route('**/api/admin/**', async (route) => {
          assert.equal(route.request().method(), 'GET');
          const response = await localAdminFetch(route.request().url());
          await route.fulfill({
            status: response.status,
            contentType: 'application/json',
            body: await response.text(),
          });
        });
        await replayAdminPage(page);
        await page.goto(`${origin}/admin/editions`);
        await page.locator('tbody tr').first().waitFor();
        assert.ok((await page.locator('tbody tr').count()) > 0);
        const historyResponse = await localAdminFetch(
          `${origin}/api/admin/digest-previews?offset=0`,
        );
        const history = previewHistorySchema.parse(
          await historyResponse.json(),
        );
        const firstRow = page.locator('tbody tr').first();
        for (const topic of history.entries[0].topicModes ?? []) {
          const modes = firstRow.locator('td').nth(3);
          await modes.getByText(topic.name, { exact: true }).waitFor();
          assert.ok(
            (await modes.textContent())?.includes(
              `Stories: ${topic.stories ?? 'Not recorded'} · Posts: ${topic.posts ?? 'Not recorded'}`,
            ),
          );
        }
        await page
          .getByRole('columnheader', { name: 'Recorded runs' })
          .waitFor();
        await page
          .getByText('Loading runs…', { exact: true })
          .first()
          .waitFor({ state: 'hidden' });
        const runResponse = await localAdminFetch(`${origin}/api/admin/status`);
        const status = operationsStatusSchema.parse(await runResponse.json());
        const runs =
          status.queues
            .find((queue) => queue.name === 'digest-generation')
            ?.runs.filter((run) => run.editionId === history.entries[0].id) ??
          [];
        const runCell = firstRow.locator('td').nth(4);
        if (!runs.length)
          await runCell.getByText('Not recorded', { exact: true }).waitFor();
        for (const run of runs) {
          assert.ok(
            (await runCell.textContent())?.includes(
              `Job ${run.id} · ${run.attempts} attempt`,
            ),
          );
          assert.ok(
            (await runCell.textContent())?.includes(
              run.scheduledAt ? 'Scheduled' : 'Manual',
            ),
          );
          if (run.durationMs !== null)
            assert.ok(
              (await runCell.textContent())?.includes(
                `${(run.durationMs / 1000).toFixed(1)} s`,
              ),
            );
        }
        const assertFits = async () =>
          assert.equal(
            await page.evaluate(
              () => document.documentElement.scrollWidth > innerWidth,
            ),
            false,
          );
        await assertFits();
        await page.screenshot({
          path: `docs/screenshots/ui/admin-editions-${device}-${theme}.png`,
          fullPage: true,
        });
        if (device === 'desktop' && theme === 'light') {
          const first = await page
            .locator('tbody a')
            .first()
            .getAttribute('href');
          await page.getByRole('button', { name: 'Older editions' }).click();
          await page.getByText('Page 2', { exact: true }).waitFor();
          await page.locator('tbody tr').first().waitFor();
          assert.notEqual(
            await page.locator('tbody a').first().getAttribute('href'),
            first,
          );
          await page.getByRole('button', { name: 'Newer editions' }).click();
          await page.getByText('Page 1', { exact: true }).waitFor();
          await page.locator('tbody tr').first().waitFor();
          assert.equal(
            await page.locator('tbody a').first().getAttribute('href'),
            first,
          );
        }
        const savedLink = page.locator('tbody a').first();
        const inspectorPath = await savedLink.getAttribute('href');
        assert.ok(inspectorPath?.startsWith('/admin/editions/'));
        await savedLink.click();
        await page.getByRole('tab').first().waitFor();
        assert.equal(await page.getByRole('tab').count(), 4);
        for (const tab of await page.getByRole('tab').all()) {
          await tab.click();
          assert.equal(await tab.getAttribute('aria-selected'), 'true');
          assert.ok(
            await page
              .getByRole('tabpanel')
              .getByRole('heading', { name: /Stories \(/ })
              .count(),
          );
        }
        await page.getByRole('tab').first().click();
        await page.getByRole('tab').first().focus();
        await page.keyboard.press('ArrowRight');
        assert.equal(
          await page.getByRole('tab').nth(1).getAttribute('aria-selected'),
          'true',
        );
        await page.getByRole('tab').first().click();
        await assertFits();
        await page.screenshot({
          path: `docs/screenshots/ui/admin-edition-inspector-${device}-${theme}.png`,
          fullPage: true,
        });
        await page.reload();
        await page.getByRole('tab').first().waitFor();
        assert.ok(
          (
            await page
              .getByRole('link', { name: 'View as reader' })
              .getAttribute('href')
          )?.startsWith('/editions/'),
        );
        if (device === 'mobile') {
          await page.getByRole('button', { name: 'Open admin menu' }).click();
          await page
            .getByRole('dialog')
            .getByRole('link', { name: 'Editions', exact: true })
            .click();
          await page.locator('tbody tr').first().waitFor();
        }
        assert.deepEqual(errors, []);
        await context.close();
      }
    }
  } finally {
    await browser.close();
  }
  console.log(
    'Editions history/inspector: four viewport/theme combinations; live saved data, topic tabs/keyboard, reader link, reload, mobile navigation, anonymous denial; no writes, external calls, browser credentials or overflow.',
  );
}
void smoke();
