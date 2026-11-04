import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';

import { topicSchema, topicUpdateSchema } from '@digest/contracts';
import { chromium } from 'playwright';

const base = 'http://localhost:8000';
async function smoke() {
  const browser = await chromium.launch();
  const context = await browser.newContext();
  const original = topicSchema
    .array()
    .parse(await (await context.request.get(`${base}/api/topics`)).json());
  const latest = await (
    await context.request.get(`${base}/api/digest-previews/latest`)
  ).json();
  const replayTopics = structuredClone(original);
  let creates = 0;
  // Browser writes stay in memory; APIRequestContext below only reads live state.
  await context.route('**/api/**', async (route) => {
    const request = route.request();
    const path = new URL(request.url()).pathname;
    if (path === '/api/topics' && request.method() === 'GET') {
      await route.fulfill({ json: replayTopics });
      return;
    }
    if (path === '/api/topics' && request.method() === 'POST') {
      const input = topicUpdateSchema.parse(request.postDataJSON());
      const saved = topicSchema.parse({
        ...input,
        id: randomUUID(),
        profileId: original[0].profileId,
        position: replayTopics.length,
        sources: [],
        queries: [],
      });
      replayTopics.push(saved);
      creates++;
      await route.fulfill({ status: 201, json: saved });
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
        creates,
        device === 'desktop' ? 0 : 1,
        'Required validation must prevent a replayed creation request',
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
      assert.equal(creates, device === 'desktop' ? 1 : 2);
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
      // Replay checks browser behavior; server behavior belongs to isolated API tests.
      replayTopics.splice(original.length);
      await page.close();
    }
    assert.deepEqual(
      await (await context.request.get(`${base}/api/topics`)).json(),
      original,
    );
    console.log(
      'Topic creation desktop/mobile: browser-only create/reload, required validation, source-less state and order passed; live topics/editions unchanged',
    );
  } finally {
    assert.deepEqual(
      await (await context.request.get(`${base}/api/topics`)).json(),
      original,
      'Browser replay must never change live topics',
    );
    if (latest)
      assert.deepEqual(
        await (
          await context.request.get(`${base}/api/digest-previews/${latest.id}`)
        ).json(),
        latest,
      );
    await browser.close();
  }
}
void smoke();
