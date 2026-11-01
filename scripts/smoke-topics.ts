import assert from 'node:assert/strict';

import { topicSchema, topicUpdateSchema } from '@digest/contracts';
import { chromium } from 'playwright';
const base = 'http://localhost:8000';
async function smoke() {
  const browser = await chromium.launch();
  const request = await browser.newContext();
  const topics = topicSchema
    .array()
    .parse(await (await request.request.get(`${base}/api/topics`)).json());
  const original = topics[0];
  const latest = await (
    await request.request.get(`${base}/api/digest-previews/latest`)
  ).json();
  try {
    for (const [name, width, height] of [
      ['desktop', 1440, 1100],
      ['mobile', 390, 844],
    ] as const) {
      const page = await browser.newPage({ viewport: { width, height } });
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
      const changed = await (
        await page.request.get(`${base}/api/topics`)
      ).json();
      assert.equal(changed[0].storyBudget, 1);
      const end = new Date(),
        start = new Date(end.getTime() - 86400000);
      const edition = await (
        await page.request.post(`${base}/api/digest-previews`, {
          data: {
            windowStart: start.toISOString(),
            windowEnd: end.toISOString(),
          },
        })
      ).json();
      assert.equal(edition.topics[0].name, 'Tech settings verification');
      assert.ok(edition.topics[0].stories.length <= 1);
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
      assert.equal(await page.locator('.topic-grid article').count(), 3);
      const disabled = await (
        await page.request.post(`${base}/api/digest-previews`, {
          data: {
            windowStart: start.toISOString(),
            windowEnd: end.toISOString(),
          },
        })
      ).json();
      assert.ok(
        disabled.topics.every((t: { id: string }) => t.id !== original.id),
      );
      if (latest)
        assert.deepEqual(
          await (
            await page.request.get(`${base}/api/digest-previews/${latest.id}`)
          ).json(),
          latest,
        );
      assert.equal(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth,
        ),
        true,
      );
      await page.request.put(`${base}/api/topics/${original.id}`, {
        data: topicUpdateSchema.strip().parse(original),
      });
      await page.close();
    }
    const invalid = {
      ...topicUpdateSchema.strip().parse(original),
      storyBudget: 21,
    };
    assert.equal(
      (
        await request.request.put(`${base}/api/topics/${original.id}`, {
          data: invalid,
        })
      ).status(),
      400,
    );
    assert.equal(
      (
        await request.request.put(`${base}/api/topics/not-a-uuid`, {
          data: topicUpdateSchema.strip().parse(original),
        })
      ).status(),
      400,
    );
    assert.equal(
      (
        await request.request.put(
          `${base}/api/topics/00000000-0000-4000-8000-999999999999`,
          { data: topicUpdateSchema.strip().parse(original) },
        )
      ).status(),
      404,
    );
    console.log(
      'Topic desktop/mobile edit, persist, disable, budget, immutable history and API validation passed',
    );
  } finally {
    const restore = await request.request.put(
      `${base}/api/topics/${original.id}`,
      { data: topicUpdateSchema.strip().parse(original) },
    );
    assert.equal(restore.status(), 200);
    await browser.close();
  }
}
void smoke();
