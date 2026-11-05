// Read saved production data; intercept every write and block external requests.
import assert from 'node:assert/strict';

import { chromium } from 'playwright';

import { localAdminFetch } from './lib/local-admin-fetch';
import { replayAdminPage } from './lib/replay-admin-page';

const origin = 'http://127.0.0.1:8000';
async function smoke() {
  const browser = await chromium.launch();
  try {
    const topicsResponse = await localAdminFetch(`${origin}/api/admin/topics`);
    assert.equal(topicsResponse.status, 200);
    const topics = await topicsResponse.json();
    const catalogResponse = await localAdminFetch(
      `${origin}/api/admin/topics/sources`,
    );
    assert.equal(catalogResponse.status, 200);
    const catalog = await catalogResponse.json();
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
        page.setDefaultTimeout(10_000);
        const errors: string[] = [];
        page.on('pageerror', (error) => errors.push(error.message));
        let saved = structuredClone(topics);
        const id = saved[0].id;
        const writes: {
          path: string;
          method: string;
          body: Record<string, unknown>;
        }[] = [];
        await context.route('**/*', (route) => {
          const request = route.request();
          assert.equal(new URL(request.url()).origin, origin);
          assert.equal(request.method(), 'GET');
          assert.equal('admin_local_token' in request.headers(), false);
          return route.continue();
        });
        await page.route('**/api/admin/**', async (route) => {
          const request = route.request(),
            path = new URL(request.url()).pathname;

          if (request.method() === 'GET') {
            if (path === '/api/admin/topics')
              return route.fulfill({ json: saved });
            if (path === '/api/admin/topics/sources')
              return route.fulfill({ json: catalog });
            if (path === '/api/admin/profile') {
              const response = await localAdminFetch(request.url());
              assert.equal(response.status, 200);
              return route.fulfill({ json: await response.json() });
            }
            throw new Error(`Unexpected admin read ${path}`);
          }
          assert.ok(path.startsWith(`/api/admin/topics/${id}`));
          const body =
            request.method() === 'DELETE' ? {} : request.postDataJSON();
          writes.push({ path, method: request.method(), body });
          if (request.method() === 'DELETE') {
            saved = saved.filter((topic: { id: string }) => topic.id !== id);
            return route.fulfill({ json: saved });
          }
          const topic = saved.find((item: { id: string }) => item.id === id);
          if (path.endsWith('/sources')) topic.sources = body.ids;
          else if (path.endsWith('/feeds') || path.endsWith('/queries'))
            topic.sources = [...topic.sources];
          else Object.assign(topic, body);
          return route.fulfill({ json: topic });
        });
        await replayAdminPage(page);
        await page.goto(`${origin}/admin/topics/${id}`);
        await page.getByRole('region', { name: 'Topic editor' }).waitFor();
        await page
          .getByRole('button', { name: 'Save sources', exact: true })
          .waitFor();
        await page
          .getByLabel('Name', { exact: true })
          .fill('Browser replay topic');
        await page
          .getByLabel('Include guidance', { exact: true })
          .fill('Saved browser guidance');
        await page
          .getByLabel('X accounts', { exact: true })
          .fill('@example\nexample_two');
        await page.getByLabel('X minimum likes', { exact: true }).fill('250');
        await page
          .getByLabel('X exclusions', { exact: true })
          .fill('crypto OR betting');
        await page
          .getByRole('button', { name: 'Save topic', exact: true })
          .click();
        await page
          .getByRole('status')
          .filter({ hasText: 'xDiscovery.exclusions' })
          .waitFor();
        assert.equal(writes.length, 0);

        await page
          .getByLabel('X exclusions', { exact: true })
          .fill('-crypto\n-betting');
        await page
          .getByLabel('Bluesky query', { exact: true })
          .fill('basketball highlights');
        await page
          .getByLabel('Reddit communities', { exact: true })
          .fill('r/nba');
        await page
          .getByRole('button', { name: 'Save topic', exact: true })
          .click();
        await page
          .getByRole('status')
          .filter({ hasText: 'Topic saved.' })
          .waitFor();
        assert.deepEqual(writes[0].body.xDiscovery, {
          minimumLikes: 250,
          exclusions: ['-crypto', '-betting'],
        });
        assert.equal(writes[0].body.blueskyQuery, 'basketball highlights');
        assert.equal(writes[0].body.includeGuidance, 'Saved browser guidance');
        assert.deepEqual(writes[0].body.accounts, ['example', 'example_two']);
        assert.deepEqual(writes[0].body.redditCommunities, ['nba']);
        await page.reload();
        await page.getByRole('region', { name: 'Topic editor' }).waitFor();
        assert.equal(
          await page.getByLabel('Name', { exact: true }).inputValue(),
          'Browser replay topic',
        );
        assert.equal(
          await page
            .getByLabel('Include guidance', { exact: true })
            .inputValue(),
          'Saved browser guidance',
        );
        assert.equal(
          await page.evaluate(
            () => document.documentElement.scrollWidth > innerWidth,
          ),
          false,
        );
        assert.equal(
          await page
            .getByLabel('X minimum likes', { exact: true })
            .inputValue(),
          '250',
        );
        assert.equal(
          await page.getByLabel('X exclusions', { exact: true }).inputValue(),
          '-crypto\n-betting',
        );
        assert.equal(
          await page.getByLabel('Bluesky query', { exact: true }).inputValue(),
          'basketball highlights',
        );
        await page.screenshot({
          path: `docs/screenshots/ui/admin-topic-editor-${device}-${theme}.png`,
          fullPage: true,
        });
        await page
          .getByRole('link', { name: '← All topics', exact: true })
          .click();
        await page
          .getByRole('link', { name: 'Browser replay topic', exact: true })
          .click();
        await page.getByRole('region', { name: 'Topic editor' }).waitFor();
        const firstSource = page
          .getByRole('group', { name: 'Connected sources' })
          .getByRole('checkbox')
          .first();
        const wasChecked = await firstSource.isChecked();
        await firstSource.setChecked(!wasChecked);
        await page
          .getByRole('button', { name: 'Save sources', exact: true })
          .click();

        await page.waitForFunction(() =>
          document.querySelector('[aria-live]')?.textContent?.trim(),
        );
        assert.equal(
          await page.getByRole('status').textContent(),
          'Source connections saved.',
        );
        assert.equal(
          (writes.at(-1)?.body.ids as string[]).includes(catalog[0].id),
          !wasChecked,
        );
        await page.getByLabel('Feed name', { exact: true }).fill('Replay feed');
        await page
          .getByLabel('Feed URL', { exact: true })
          .fill('https://example.com/feed');
        await page
          .getByRole('button', { name: 'Connect feed', exact: true })
          .click();
        await page.waitForFunction(
          () =>
            (document.querySelector('[name="feedUrl"]') as HTMLInputElement)
              ?.value === '',
        );
        assert.deepEqual(writes.at(-1)?.body, {
          name: 'Replay feed',
          url: 'https://example.com/feed',
        });
        await page.getByLabel('News query', { exact: true }).fill('AI demo');
        await page
          .getByRole('button', { name: 'Connect news query', exact: true })
          .click();
        await page.waitForFunction(
          () =>
            (document.querySelector('[name="query"]') as HTMLInputElement)
              ?.value === '',
        );
        assert.deepEqual(writes.at(-1)?.body, { query: 'AI demo' });
        await page
          .getByRole('button', { name: 'Delete topic', exact: true })
          .click();
        await page.getByRole('dialog').waitFor();
        await page.screenshot({
          path: `docs/screenshots/ui/admin-topic-delete-${device}-${theme}.png`,
          fullPage: true,
        });
        await page
          .getByRole('button', { name: 'Keep topic', exact: true })
          .click();
        assert.equal(
          writes.some((write) => write.method === 'DELETE'),
          false,
        );
        await page
          .getByRole('button', { name: 'Delete topic', exact: true })
          .click();
        await page
          .getByRole('button', { name: 'Confirm deletion', exact: true })
          .click();
        await page.waitForURL(`${origin}/admin/topics`);
        assert.equal(
          writes.filter((write) => write.method === 'DELETE').length,
          1,
        );
        assert.equal(
          saved.some((topic: { id: string }) => topic.id === id),
          false,
        );
        assert.deepEqual(errors, []);
        await context.close();
      }
    }
    const after = await localAdminFetch(`${origin}/api/admin/topics`);
    assert.equal(after.status, 200);
    assert.deepEqual(await after.json(), topics);
    console.log(
      'Topic editor: saved data, intercepted settings/sources/feed/query/delete, reload and desktop/mobile light/dark screenshots passed.',
    );
  } finally {
    await browser.close();
  }
}
void smoke().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
