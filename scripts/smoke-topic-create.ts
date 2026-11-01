import assert from 'node:assert/strict';

import { topicSchema, topicUpdateSchema } from '@digest/contracts';
import { chromium } from 'playwright';

import { database } from '../apps/api/src/libs/db/connections';
const base = 'http://localhost:8000';
async function smoke() {
  const browser = await chromium.launch();
  const context = await browser.newContext();
  const db = database();
  const created: string[] = [];
  const original = topicSchema
    .array()
    .parse(await (await context.request.get(`${base}/api/topics`)).json());
  const latest = await (
    await context.request.get(`${base}/api/digest-previews/latest`)
  ).json();
  try {
    for (const [device, width, height] of [
      ['desktop', 1440, 1100],
      ['mobile', 390, 844],
    ] as const) {
      const page = await context.newPage();
      await page.setViewportSize({ width, height });
      await page.goto(base);
      await page.getByText('Manage topics', { exact: true }).click();
      await page
        .getByRole('button', { name: 'Create topic', exact: true })
        .click();
      const form = page.getByRole('form', {
        name: 'Create topic',
        exact: true,
      });
      await form
        .getByText('New topics start without source connections.', {
          exact: false,
        })
        .waitFor();
      // Native required validation must prevent an empty-name request.
      await form
        .getByRole('button', { name: 'Create topic', exact: true })
        .click();
      assert.equal(
        (await (await context.request.get(`${base}/api/topics`)).json()).length,
        original.length,
      );
      await form
        .getByLabel('Name', { exact: true })
        .fill(`Science ${device} verification`);
      await form
        .getByLabel('Description', { exact: true })
        .fill('Science research and discoveries.');
      await form.getByLabel('Story budget', { exact: true }).fill('2');
      await form.locator('textarea[name=includeAny]').fill('science\nresearch');
      await page
        .locator('.topic-settings')
        .screenshot({ path: `docs/screenshots/topic-create-${device}.png` });
      const responsePromise = page.waitForResponse(
        (r) =>
          r.url() === `${base}/api/topics` && r.request().method() === 'POST',
      );
      await form
        .getByRole('button', { name: 'Create topic', exact: true })
        .click();
      const response = await responsePromise;
      assert.equal(response.status(), 201);
      const saved = topicSchema.parse(await response.json());
      created.push(saved.id);
      assert.equal(saved.position, original.length);
      assert.deepEqual(saved.sources, []);
      assert.deepEqual(saved.relevancePolicy.includeAny, [
        'science',
        'research',
      ]);
      await page
        .getByRole('status')
        .filter({ hasText: `Saved ${saved.name}.` })
        .waitFor();
      await page
        .locator('.topic-grid')
        .getByRole('heading', { name: saved.name, exact: true })
        .waitFor();
      await page.reload();
      await page
        .locator('.topic-grid')
        .getByRole('heading', { name: saved.name, exact: true })
        .waitFor();
      await page
        .locator('.topic-grid article')
        .filter({
          has: page.getByRole('heading', { name: saved.name, exact: true }),
        })
        .getByText('No sources connected yet.', { exact: false })
        .waitFor();
      assert.equal(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth,
        ),
        true,
      );
      // A source-less topic cannot invent content or change a saved edition.
      const end = new Date(),
        start = new Date(end.getTime() - 86400000);
      const edition = await (
        await context.request.post(`${base}/api/digest-previews`, {
          data: {
            windowStart: start.toISOString(),
            windowEnd: end.toISOString(),
          },
        })
      ).json();
      const section = edition.topics.find(
        (topic: { id: string }) => topic.id === saved.id,
      );
      assert.ok(section);
      assert.deepEqual(section.stories, []);
      assert.equal(section.candidateCount, 0);
      if (latest)
        assert.deepEqual(
          await (
            await context.request.get(
              `${base}/api/digest-previews/${latest.id}`,
            )
          ).json(),
          latest,
        );
      await db.query('DELETE FROM topics WHERE id=$1', [saved.id]);
      await page.close();
    }
    const input = topicUpdateSchema.strip().parse(original[0]);
    for (const invalid of [
      { ...input, name: ' ' },
      { ...input, storyBudget: 21 },
      { ...input, profileId: original[0].profileId },
      { ...input, relevancePolicy: { includeAny: [''], excludeAny: [] } },
    ]) {
      assert.equal(
        (
          await context.request.post(`${base}/api/topics`, { data: invalid })
        ).status(),
        400,
      );
    }
    assert.deepEqual(
      await (await context.request.get(`${base}/api/topics`)).json(),
      original,
    );
    console.log(
      'Topic creation desktop/mobile: validation, persistence, source-less state, ordering and immutable editions passed',
    );
  } finally {
    await db.query('DELETE FROM topics WHERE id=ANY($1::uuid[])', [created]);
    await db.end();
    await browser.close();
  }
}
void smoke();
