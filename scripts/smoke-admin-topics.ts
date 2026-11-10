// Saved live access only; browser writes and external requests are blocked.
import assert from 'node:assert/strict';

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
        const errors: string[] = [],
          adminReads: string[] = [];
        page.on('pageerror', (error) => errors.push(error.message));
        page.on('request', (request) => {
          assert.ok(['GET', 'PUT', 'POST'].includes(request.method()));
          assert.equal('admin_local_token' in request.headers(), false);
          assert.equal('x-exedev-email' in request.headers(), false);
        });
        await context.route('**/*', async (route) => {
          const request = route.request(),
            url = new URL(request.url());
          assert.equal(request.method(), 'GET');
          assert.equal(url.origin, origin);
          assert.equal('admin_local_token' in request.headers(), false);
          if (url.pathname.startsWith('/api/admin/'))
            adminReads.push(url.pathname);
          return route.continue();
        });
        assert.equal(
          (await page.goto(`${origin}/admin/topics`))?.status(),
          404,
        );
        let savedTopics: Record<string, unknown>[] = [];
        const writes: string[] = [];
        await page.route('**/api/admin/**', async (route) => {
          adminReads.push(new URL(route.request().url()).pathname);
          const request = route.request();
          const path = new URL(request.url()).pathname;
          if (request.method() !== 'GET') {
            assert.ok(path.startsWith('/api/admin/topics'));
            writes.push(path);
            const input = request.postDataJSON();
            if (path.endsWith('/order')) {
              savedTopics = input.ids.map((id: string, position: number) => ({
                ...savedTopics.find((topic) => topic.id === id),
                position,
              }));
              return route.fulfill({ json: savedTopics });
            }
            const old = savedTopics.find((topic) =>
              path.endsWith(String(topic.id)),
            );
            const saved = {
              ...(old ?? savedTopics[0]),
              ...input,
              id: old?.id ?? '00000000-0000-4000-8000-000000000888',
              position: old?.position ?? savedTopics.length,
            };
            if (old)
              savedTopics = savedTopics.map((topic) =>
                topic.id === old.id ? saved : topic,
              );
            else savedTopics.push(saved);
            return route.fulfill({ json: saved });
          }
          const response = await localAdminFetch(route.request().url());
          assert.equal(response.status, 200);
          let body = await response.text();
          if (path === '/api/admin/topics') {
            savedTopics = JSON.parse(body);
            // Dark mode replays the owner-free public response contract.
            if (theme === 'dark') {
              savedTopics = savedTopics.map(
                ({ profileId: _owner, ...topic }) => topic,
              );
              body = JSON.stringify(savedTopics);
            }
          }
          await route.fulfill({
            status: 200,
            contentType: 'application/json',
            body,
          });
        });
        await replayAdminPage(page);
        await page.goto(`${origin}/admin/topics`);
        await page
          .getByRole('heading', { name: 'Topics', exact: true })
          .waitFor();
        await page.getByRole('region', { name: 'Topic management' }).waitFor();
        await page
          .getByRole('heading', { name: 'Tech & AI', exact: true })
          .waitFor();
        assert.ok((await page.getByRole('switch').count()) >= 4);
        assert.equal(
          await page.evaluate(
            () => document.documentElement.scrollWidth > innerWidth,
          ),
          false,
        );
        if (device === 'mobile') {
          await page.getByRole('button', { name: 'Open admin menu' }).click();
          await page.getByRole('dialog').waitFor();
          await page.keyboard.press('Escape');
          await page.getByRole('dialog').waitFor({ state: 'hidden' });
          await page.getByRole('button', { name: 'Open admin menu' }).click();
          await page
            .getByRole('dialog')
            .getByRole('link', { name: 'Topics', exact: true })
            .click();
          await page.getByRole('dialog').waitFor({ state: 'hidden' });
        }
        await page.reload();
        await page
          .getByRole('heading', { name: 'Topics', exact: true })
          .waitFor();
        await page
          .getByRole('heading', { name: 'Tech & AI', exact: true })
          .waitFor();
        await page.screenshot({
          path: `docs/screenshots/ui/admin-topics-${device}-${theme}.png`,
          fullPage: true,
        });
        assert.deepEqual(errors, []);
        assert.ok(adminReads.includes('/api/admin/topics'));
        await page
          .getByRole('button', { name: 'New topic', exact: true })
          .click();
        await page.getByRole('dialog').waitFor();
        await page
          .getByRole('dialog')
          .getByLabel('Name', { exact: true })
          .fill('Browser replay topic');
        await page.screenshot({
          path: `docs/screenshots/ui/admin-topics-new-${device}-${theme}.png`,
          fullPage: true,
        });
        await page
          .getByRole('button', { name: 'Create topic', exact: true })
          .click();
        await page.getByRole('dialog').waitFor({ state: 'hidden' });
        await page
          .getByRole('heading', { name: 'Browser replay topic', exact: true })
          .waitFor();
        const enabled = page.getByRole('switch', {
          name: 'Enable Tech & AI',
          exact: true,
        });
        const before = await enabled.getAttribute('aria-checked');
        await enabled.click();
        await page.waitForFunction(
          (previous) =>
            document
              .querySelector('[aria-label="Enable Tech & AI"]')
              ?.getAttribute('aria-checked') !== previous,
          before,
        );
        await page
          .getByRole('spinbutton', {
            name: 'Tech & AI story budget',
            exact: true,
          })
          .fill('7');
        await page
          .getByRole('button', { name: 'Save Tech & AI budgets', exact: true })
          .click();
        await page
          .getByRole('button', { name: 'Move Tech & AI down', exact: true })
          .click();
        await page.waitForFunction(
          () => document.querySelector('ol li h2')?.textContent !== 'Tech & AI',
        );
        assert.equal(
          savedTopics.find((topic) => topic.name === 'Tech & AI')?.storyBudget,
          7,
        );
        assert.equal(writes.length, 4);
        const cards = page
          .getByRole('region', { name: 'Topic management' })
          .locator('ol > li');
        await cards.nth(1).dragTo(cards.nth(0));
        await page.waitForFunction(
          () => document.querySelector('ol li h2')?.textContent === 'Tech & AI',
        );
        assert.equal(writes.length, 5);
        await context.close();
      }
    }
    console.log(
      'Topics desktop/mobile light/dark passed; live reads, intercepted writes.',
    );
  } finally {
    await browser.close();
  }
}
void smoke();
