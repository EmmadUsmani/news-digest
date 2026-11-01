import assert from 'node:assert/strict';
import { chromium } from 'playwright';
import { topicSchema } from '@digest/contracts';
async function smoke() {
  const base = 'http://localhost:8000';
  const browser = await chromium.launch();
  const context = await browser.newContext();
  const api = context.request;
  const topics = topicSchema
    .array()
    .parse(await (await api.get(base + '/api/topics')).json());
  const ids = topics.map((topic) => topic.id);
  const latest = await (
    await api.get(base + '/api/digest-previews/latest')
  ).json();
  try {
    for (const [name, width, height] of [
      ['desktop', 1440, 1100],
      ['mobile', 390, 844],
    ] as const) {
      const page = await browser.newPage({ viewport: { width, height } });
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
        .filter({ hasText: 'Topic order saved.' })
        .waitFor();
      const expected = [ids[1], ids[0], ...ids.slice(2)];
      const persisted = topicSchema
        .array()
        .parse(await (await api.get(base + '/api/topics')).json());
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
      const end = new Date(),
        start = new Date(end.getTime() - 86400000);
      const edition = await (
        await api.post(base + '/api/digest-previews', {
          data: {
            windowStart: start.toISOString(),
            windowEnd: end.toISOString(),
          },
        })
      ).json();
      assert.deepEqual(
        edition.topics.map((t: { id: string }) => t.id),
        expected,
      );
      if (latest)
        assert.deepEqual(
          await (
            await api.get(base + '/api/digest-previews/' + latest.id)
          ).json(),
          latest,
        );
      assert.equal(
        (await api.put(base + '/api/topics/order', { data: { ids } })).status(),
        200,
      );
      await page.close();
    }
    for (const invalid of [
      [],
      ids.slice(1),
      [...ids, ids[0]],
      ['bad', ...ids.slice(1)],
      ['00000000-0000-4000-8000-999999999999', ...ids.slice(1)],
    ]) {
      assert.equal(
        (
          await api.put(base + '/api/topics/order', { data: { ids: invalid } })
        ).status(),
        400,
      );
      assert.deepEqual(
        (await (await api.get(base + '/api/topics')).json()).map(
          (t: { id: string }) => t.id,
        ),
        ids,
      );
    }
    console.log(
      'Topic reorder desktop/mobile, persistence, new-edition order, immutable history and invalid atomicity passed',
    );
  } finally {
    assert.equal(
      (await api.put(base + '/api/topics/order', { data: { ids } })).status(),
      200,
    );
    await browser.close();
  }
}
void smoke();
