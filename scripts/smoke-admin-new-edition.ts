// Live budget/edition reads; every job response is simulated in the browser.
import assert from 'node:assert/strict';

import { chromium } from 'playwright';

import { localAdminFetch, localAdminJson } from './lib/local-admin-fetch';
import { replayAdminPage } from './lib/replay-admin-page';

async function main() {
  const origin = 'http://127.0.0.1:8000';
  const saved = (await localAdminJson('/api/admin/digest-previews/latest')) as {
    id: string;
  };
  const browser = await chromium.launch();
  try {
    for (const [device, width, height] of [
      ['desktop', 1440, 1000],
      ['mobile', 390, 844],
    ] as const) {
      for (const theme of ['light', 'dark'] as const) {
        const page = await browser.newPage({
          viewport: { width, height },
          colorScheme: theme,
          serviceWorkers: 'block',
        });
        const errors: string[] = [];
        page.on('pageerror', (error) => errors.push(error.message));
        await page.route('**/*', (route) => {
          const req = route.request();
          assert.equal(req.method(), 'GET');
          assert.equal(new URL(req.url()).origin, origin);
          assert.equal('admin_local_token' in req.headers(), false);
          assert.equal('x-exedev-email' in req.headers(), false);
          return route.continue();
        });
        assert.equal(
          (await page.goto(`${origin}/admin/editions/new`))?.status(),
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
        let submissions = 0;
        let complete = false;
        let fail = false;
        await page.route('**/api/admin/digest-previews/jobs', (route) => {
          assert.equal(route.request().method(), 'POST');
          const body = route.request().postDataJSON();
          assert.equal(
            new Date(body.windowEnd).getTime() -
              new Date(body.windowStart).getTime(),
            6 * 3600000,
          );
          submissions++;
          return route.fulfill({ json: { id: '881' } });
        });
        await page.route('**/api/admin/digest-previews/jobs/881', (route) =>
          route.fulfill({
            json: {
              id: '881',
              state: fail ? 'failed' : complete ? 'completed' : 'active',
              editionId: complete ? saved.id : null,
              progress: {
                stage: 'topics',
                topics: [
                  { id: 'tech', name: 'Tech', stage: 'editing' },
                  { id: 'nba', name: 'NBA', stage: 'posts' },
                ],
              },
            },
          }),
        );
        await page.goto(`${origin}/admin/editions/new`);
        await page
          .getByRole('heading', { name: 'New edition', exact: true })
          .waitFor();
        await page
          .getByText('This spends AI budget', { exact: false })
          .waitFor();
        await page.getByLabel('Period', { exact: true }).selectOption('custom');
        await page
          .getByLabel('Start', { exact: true })
          .fill('2026-11-04T12:00');
        await page.getByLabel('End', { exact: true }).fill('2026-11-03T12:00');
        await page
          .getByRole('button', { name: 'Create edition · custom period' })
          .click();
        await page
          .getByRole('alert')
          .getByText('Choose a start before the end', { exact: false })
          .waitFor();
        assert.equal(submissions, 0);
        await page.getByLabel('Period', { exact: true }).selectOption('6');
        await page
          .getByRole('button', { name: 'Create edition · last 6 hours' })
          .click();
        await page
          .getByRole('listitem')
          .filter({ hasText: 'Tech · editing' })
          .waitFor();
        assert.equal(submissions, 1);
        assert.equal(
          await page
            .getByRole('button', { name: 'Creating edition…' })
            .isDisabled(),
          true,
        );
        await page.reload();
        await page
          .getByRole('listitem')
          .filter({ hasText: 'NBA · posts' })
          .waitFor();
        assert.equal(submissions, 1);
        assert.equal(
          await page.evaluate(
            () => document.documentElement.scrollWidth > innerWidth,
          ),
          false,
        );
        await page.screenshot({
          path: `docs/screenshots/ui/admin-new-edition-${device}-${theme}.png`,
          fullPage: true,
        });
        complete = true;
        await page
          .getByRole('link', { name: 'Inspect created edition' })
          .waitFor();
        assert.equal(
          await page
            .getByRole('link', { name: 'Inspect created edition' })
            .getAttribute('href'),
          `/admin/editions/${saved.id}`,
        );
        assert.equal(
          await page.evaluate(() => sessionStorage.getItem('edition-job')),
          null,
        );
        complete = false;
        fail = true;
        await page.getByLabel('Period', { exact: true }).selectOption('6');
        await page
          .getByRole('button', { name: 'Create edition · last 6 hours' })
          .click();
        await page
          .getByText('Edition generation failed. Try again later.', {
            exact: true,
          })
          .waitFor();
        assert.equal(submissions, 2);
        assert.deepEqual(errors, []);
        await page.close();
      }
    }
    assert.deepEqual(
      await localAdminJson('/api/admin/digest-previews/latest'),
      saved,
    );
    console.log(
      'New edition: four viewport/theme captures; anonymous denial, custom validation, simulated submission/progress/reload/completion/failure, no real writes or paid calls; saved edition unchanged.',
    );
  } finally {
    await browser.close();
  }
}
void main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
