import assert from 'node:assert/strict';

import { topicSchema } from '@digest/contracts';
import { chromium } from 'playwright';

import { localAdminJson } from './lib/local-admin-fetch';
async function smoke() {
  const base = 'http://localhost:8000';
  const browser = await chromium.launch();
  const context = await browser.newContext();
  const topics = topicSchema
    .array()
    .parse(await localAdminJson('/api/admin/topics'));
  const ids = topics.map((topic) => topic.id);
  const latest = (await localAdminJson(
    '/api/admin/digest-previews/latest',
  )) as { id: string } | null;
  assert.ok(topics.length >= 2, 'Reorder replay requires two topics');
  let replayTopics = structuredClone(topics);
  let failOrder = true;
  let writes = 0;
  // Browser writes are replayed; protected Node requests are used only for live reads.
  await context.route('**/api/**', async (route) => {
    const request = route.request();
    const path = new URL(request.url()).pathname;
    if (path === '/api/topics' && request.method() === 'GET') {
      await route.fulfill({ json: replayTopics });
      return;
    }
    if (path === '/api/topics/order' && request.method() === 'PUT') {
      const input = request.postDataJSON() as { ids: string[] };
      assert.deepEqual([...input.ids].sort(), [...ids].sort());
      writes++;
      if (failOrder) {
        await route.fulfill({ status: 503, body: 'Unavailable' });
      } else {
        replayTopics = input.ids.map((id, position) => ({
          ...topics.find((topic) => topic.id === id)!,
          position,
        }));
        await route.fulfill({ json: replayTopics });
      }
      return;
    }
    assert.equal(request.method(), 'GET', `Unexpected browser write: ${path}`);
    await route.continue();
  });
  try {
    for (const [name, width, height] of [
      ['desktop', 1440, 1100],
      ['mobile', 390, 844],
    ] as const) {
      replayTopics = structuredClone(topics);
      failOrder = true;
      const writesBefore = writes;
      const page = await context.newPage();
      await page.setViewportSize({ width, height });
      await page.goto(base);
      await page.getByText('Manage topics', { exact: true }).click();
      assert.equal(
        await page
          .getByRole('button', {
            name: `Move ${topics[0].name} up`,
            exact: true,
          })
          .isDisabled(),
        true,
      );
      await page
        .getByRole('button', {
          name: `Move ${topics[0].name} down`,
          exact: true,
        })
        .click();
      await page
        .getByRole('status')
        .filter({ hasText: 'Could not save topic order.' })
        .waitFor();
      assert.deepEqual(replayTopics, topics);
      assert.equal(writes, writesBefore + 1);
      assert.equal(
        await page
          .locator('.topic-settings li')
          .first()
          .locator('span')
          .innerText(),
        `${topics[0].name} · Enabled`,
      );
      failOrder = false;
      await page
        .getByRole('button', {
          name: `Move ${topics[0].name} down`,
          exact: true,
        })
        .click();
      await page
        .getByRole('status')
        .filter({ hasText: 'Topic order saved.' })
        .waitFor();
      const expected = [ids[1], ids[0], ...ids.slice(2)];
      const persisted = topicSchema.array().parse(replayTopics);
      assert.equal(writes, writesBefore + 2);
      assert.deepEqual(
        persisted.map((t) => t.id),
        expected,
      );
      assert.deepEqual(
        persisted.map((t) => t.position),
        expected.map((_, index) => index),
      );
      await page.reload();
      await page.getByText('Manage topics', { exact: true }).click();
      assert.equal(
        await page
          .locator('.topic-settings li')
          .first()
          .locator('span')
          .innerText(),
        `${topics[1].name} · Enabled`,
      );
      assert.equal(
        await page.locator('.topic-grid h3').first().innerText(),
        topics[1].name,
      );
      assert.equal(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth,
        ),
        true,
      );
      await page
        .locator('.topic-settings')
        .screenshot({ path: `docs/screenshots/topic-order-${name}.png` });
      await page.close();
    }
    console.log(
      'Topic reorder desktop/mobile browser replay: failure, retry, reload, positions and overflow passed; no production writes or generation',
    );
  } finally {
    assert.deepEqual(
      await localAdminJson('/api/admin/topics'),
      topics,
      'Browser replay must not change live topics',
    );
    if (latest)
      assert.deepEqual(
        await localAdminJson('/api/admin/digest-previews/' + latest.id),
        latest,
      );
    await browser.close();
  }
}
void smoke();
