import assert from 'node:assert/strict';

import { topicSchema, topicUpdateSchema } from '@digest/contracts';
import { chromium } from 'playwright';

import { localAdminJson } from './lib/local-admin-fetch';
const base = 'http://localhost:8000';
async function smoke() {
  const browser = await chromium.launch();
  const context = await browser.newContext();
  const topics = topicSchema
    .array()
    .parse(await localAdminJson('/api/admin/topics'));
  const original = topics[0];
  assert.ok(
    original?.enabled,
    'Need an enabled first topic for browser verification',
  );
  const replayTopics = structuredClone(topics);
  let saves = 0;
  await context.route('**/api/**', async (route) => {
    const request = route.request();
    const path = new URL(request.url()).pathname;
    if (path === '/api/topics' && request.method() === 'GET')
      return route.fulfill({ json: replayTopics });
    if (path === `/api/topics/${original.id}` && request.method() === 'PUT') {
      const update = topicUpdateSchema.parse(request.postDataJSON());
      replayTopics[0] = topicSchema.parse({ ...replayTopics[0], ...update });
      saves++;
      return route.fulfill({ json: replayTopics[0] });
    }
    if (request.method() !== 'GET') {
      await route.abort();
      assert.fail(`Unexpected browser write: ${path}`);
    }
    await route.continue();
  });
  const latest = (await localAdminJson(
    '/api/admin/digest-previews/latest',
  )) as { id: string } | null;
  try {
    for (const [name, width, height] of [
      ['desktop', 1440, 1100],
      ['mobile', 390, 844],
    ] as const) {
      replayTopics[0] = structuredClone(original);
      const previousSaves = saves;
      const page = await context.newPage();
      await page.setViewportSize({ width, height });
      const errors: string[] = [];
      page.on('pageerror', (error) => errors.push(error.message));
      await page.goto(base);
      await page.getByText('Manage topics', { exact: true }).click();
      await page
        .getByRole('button', { name: `Edit ${original.name}`, exact: true })
        .click();
      const form = page.getByRole('form', {
        name: `Edit ${original.name}`,
        exact: true,
      });
      await form
        .getByLabel('Name', { exact: true })
        .fill('Tech settings verification');
      await form.getByLabel('Story budget', { exact: true }).fill('1');
      await form.locator('textarea[name=includeAny]').fill('');
      await page
        .locator('.topic-settings')
        .screenshot({ path: `docs/screenshots/topics-${name}.png` });
      await form
        .getByRole('button', { name: 'Save topic', exact: true })
        .click();
      await page
        .getByRole('status')
        .filter({ hasText: 'Saved Tech settings verification.' })
        .waitFor();
      await page.reload();
      await page
        .locator('.topic-grid')
        .getByRole('heading', {
          name: 'Tech settings verification',
          exact: true,
        })
        .waitFor();
      assert.equal(replayTopics[0].storyBudget, 1);
      assert.equal(replayTopics[0].name, 'Tech settings verification');
      assert.deepEqual(replayTopics[0].relevancePolicy.includeAny, []);
      await page.getByText('Manage topics', { exact: true }).click();
      await page
        .getByRole('button', {
          name: 'Edit Tech settings verification',
          exact: true,
        })
        .click();
      await page.getByLabel('Include this topic', { exact: true }).uncheck();
      await page
        .getByRole('button', { name: 'Save topic', exact: true })
        .click();
      await page
        .getByRole('status')
        .filter({ hasText: 'Saved Tech settings verification.' })
        .waitFor();
      assert.equal(
        await page.locator('.topic-grid article').count(),
        topics.filter((topic) => topic.enabled && topic.id !== original.id)
          .length,
      );
      assert.equal(replayTopics[0].enabled, false);
      assert.equal(saves, previousSaves + 2);
      assert.deepEqual(errors, []);
      assert.equal(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth,
        ),
        true,
      );
      await page.close();
    }
    console.log(
      'Topic desktop/mobile browser-only edit, reload, disable and budget checks passed; protected reads prove live topics/edition unchanged; server validation stays in isolated tests',
    );
  } finally {
    assert.deepEqual(await localAdminJson('/api/admin/topics'), topics);
    if (latest)
      assert.deepEqual(
        await localAdminJson('/api/admin/digest-previews/' + latest.id),
        latest,
      );
    await context.close();
    await browser.close();
  }
}
void smoke();
