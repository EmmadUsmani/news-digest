import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';

import { topicSchema } from '@digest/contracts';
import { chromium } from 'playwright';
const base = 'http://localhost:8000';
async function smoke() {
  const browser = await chromium.launch();
  const context = await browser.newContext();
  const original = topicSchema
    .array()
    .parse(await (await context.request.get(base + '/api/topics')).json());
  const latest = await (
    await context.request.get(base + '/api/digest-previews/latest')
  ).json();
  const replayTopics = structuredClone(original);
  let failDelete = true;
  let deletes = 0;
  // Only the browser can write, and every write is intercepted in memory.
  await context.route('**/api/**', async (route) => {
    const request = route.request();
    const path = new URL(request.url()).pathname;
    if (path === '/api/topics' && request.method() === 'GET') {
      await route.fulfill({ json: replayTopics });
      return;
    }
    if (request.method() === 'DELETE') {
      const index = replayTopics.findIndex(
        (topic) => path === '/api/topics/' + topic.id,
      );
      assert.ok(
        index >= original.length,
        'Only a synthetic topic may be deleted',
      );
      deletes++;
      if (failDelete) {
        await route.fulfill({ status: 503, body: 'Unavailable' });
      } else {
        replayTopics.splice(index, 1);
        await route.fulfill({ json: replayTopics });
      }
      return;
    }
    assert.equal(request.method(), 'GET', `Unexpected browser write: ${path}`);
    await route.continue();
  });
  try {
    for (const [device, width, height] of [
      ['desktop', 1440, 1100],
      ['mobile', 390, 844],
    ] as const) {
      const topic = topicSchema.parse({
        ...original[0],
        id: randomUUID(),
        name: 'Delete verification ' + device,
        position: original.length,
      });
      replayTopics.push(topic);
      failDelete = true;
      const deletesBefore = deletes;
      const page = await context.newPage();
      await page.setViewportSize({ width, height });
      await page.goto(base);
      await page.getByText('Manage topics', { exact: true }).click();
      await page
        .getByRole('button', { name: 'Delete ' + topic.name, exact: true })
        .click();
      const confirmation = page.getByRole('region', {
        name: 'Delete ' + topic.name,
        exact: true,
      });
      await confirmation
        .getByRole('button', { name: 'Keep topic', exact: true })
        .click();
      assert.ok(replayTopics.some((saved) => saved.id === topic.id));
      assert.equal(deletes, deletesBefore, 'Cancel must not send a delete');
      await page
        .getByRole('button', { name: 'Delete ' + topic.name, exact: true })
        .click();
      await confirmation.scrollIntoViewIfNeeded();
      await confirmation.screenshot({
        path: 'docs/screenshots/topic-delete-' + device + '.png',
      });
      await confirmation
        .getByRole('button', { name: 'Delete topic permanently', exact: true })
        .click();
      await page
        .getByRole('status')
        .filter({ hasText: 'Could not delete topic.' })
        .waitFor();
      assert.ok(replayTopics.some((saved) => saved.id === topic.id));
      assert.equal(deletes, deletesBefore + 1);
      failDelete = false;
      await confirmation
        .getByRole('button', { name: 'Delete topic permanently', exact: true })
        .click();
      await page
        .getByRole('status')
        .filter({ hasText: 'Deleted ' + topic.name + '.' })
        .waitFor();
      await page.reload();
      await page
        .locator('.topic-grid')
        .getByRole('heading', {
          name: original[0].name,
          exact: true,
        })
        .waitFor();
      assert.equal(
        await page
          .locator('.topic-grid')
          .getByRole('heading', { name: topic.name, exact: true })
          .count(),
        0,
      );
      assert.equal(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth,
        ),
        true,
      );
      assert.deepEqual(replayTopics, original);
      assert.equal(deletes, deletesBefore + 2);
      await page.close();
    }
    console.log(
      'Topic deletion desktop/mobile: browser replay cancel, error/retry, removal, reload and order passed; no production writes or generation',
    );
  } finally {
    assert.deepEqual(
      await (await context.request.get(base + '/api/topics')).json(),
      original,
      'Browser replay must never change live topics',
    );
    if (latest)
      assert.deepEqual(
        await (
          await context.request.get(base + '/api/digest-previews/' + latest.id)
        ).json(),
        latest,
      );
    await browser.close();
  }
}
void smoke();
