import { chromium } from 'playwright';
import assert from 'node:assert/strict';
import { topicSchema, topicUpdateSchema } from '@digest/contracts';
const base = 'http://localhost:8000';
async function smoke() {
  const browser = await chromium.launch();
  const context = await browser.newContext();
  const created: string[] = [];
  const original = topicSchema
    .array()
    .parse(await (await context.request.get(base + '/api/topics')).json());
  const catalog = await (
    await context.request.get(base + '/api/topics/sources')
  ).json();
  const sourceBefore = await (
    await context.request.get(base + '/api/content/sources')
  ).json();
  try {
    for (const [device, width, height] of [
      ['desktop', 1440, 1100],
      ['mobile', 390, 844],
    ] as const) {
      const response = await context.request.post(base + '/api/topics', {
        data: {
          ...topicUpdateSchema.strip().parse(original[0]),
          name: 'Delete verification ' + device,
          relevancePolicy: { includeAny: [], excludeAny: [] },
        },
      });
      assert.equal(response.status(), 201);
      const topic = topicSchema.parse(await response.json());
      created.push(topic.id);
      assert.equal(
        (
          await context.request.put(
            base + '/api/topics/' + topic.id + '/sources',
            { data: { ids: [catalog[0].id] } },
          )
        ).status(),
        200,
      );
      const end = new Date(),
        start = new Date(end.getTime() - 86400000);
      const edition = await (
        await context.request.post(base + '/api/digest-previews', {
          data: {
            windowStart: start.toISOString(),
            windowEnd: end.toISOString(),
          },
        })
      ).json();
      assert.ok(edition.topics.some((t: { id: string }) => t.id === topic.id));
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
      assert.ok(
        (await (await context.request.get(base + '/api/topics')).json()).some(
          (t: { id: string }) => t.id === topic.id,
        ),
      );
      await page
        .getByRole('button', { name: 'Delete ' + topic.name, exact: true })
        .click();
      await confirmation.scrollIntoViewIfNeeded();
      await confirmation.screenshot({
        path: 'docs/screenshots/topic-delete-' + device + '.png',
      });
      // Failed deletion must preserve the topic and allow retry.
      await page.route('**/api/topics/' + topic.id, (route) =>
        route.request().method() === 'DELETE'
          ? route.fulfill({ status: 503, body: 'Unavailable' })
          : route.continue(),
      );
      await confirmation
        .getByRole('button', { name: 'Delete topic permanently', exact: true })
        .click();
      await page
        .getByRole('status')
        .filter({ hasText: 'Could not delete topic.' })
        .waitFor();
      await page.unroute('**/api/topics/' + topic.id);
      await confirmation
        .getByRole('button', { name: 'Delete topic permanently', exact: true })
        .click();
      await page
        .getByRole('status')
        .filter({ hasText: 'Deleted ' + topic.name + '.' })
        .waitFor();
      await page.reload();
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
      assert.deepEqual(
        await (await context.request.get(base + '/api/topics')).json(),
        original,
      );
      assert.equal(
        (
          await context.request.delete(base + '/api/topics/' + topic.id)
        ).status(),
        404,
      );
      assert.deepEqual(
        await (
          await context.request.get(base + '/api/digest-previews/' + edition.id)
        ).json(),
        edition,
      );
      const fresh = await (
        await context.request.post(base + '/api/digest-previews', {
          data: {
            windowStart: start.toISOString(),
            windowEnd: end.toISOString(),
          },
        })
      ).json();
      assert.equal(
        fresh.topics.some((t: { id: string }) => t.id === topic.id),
        false,
      );
      await page.close();
    }
    assert.deepEqual(
      await (await context.request.get(base + '/api/topics/sources')).json(),
      catalog,
    );
    const sources = await (
      await context.request.get(base + '/api/content/sources')
    ).json();
    for (const before of sourceBefore) {
      const after = sources.find((s: { id: string }) => s.id === before.id);
      assert.ok(after);
      assert.ok(after.storedItems >= before.storedItems);
    }
    assert.equal(
      (await context.request.delete(base + '/api/topics/not-a-uuid')).status(),
      400,
    );
    console.log(
      'Topic deletion desktop/mobile: cancel, error/retry, removal, order, immutable history, new editions and shared real content passed',
    );
  } finally {
    for (const id of created)
      await context.request.delete(base + '/api/topics/' + id);
    await browser.close();
  }
}
void smoke();
