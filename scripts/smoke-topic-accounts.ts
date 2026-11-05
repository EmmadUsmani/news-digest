// Explicit browser replay; protected live reads, no writes or inference/search.
import assert from 'node:assert/strict';

import { topicSchema, topicUpdateSchema } from '@digest/contracts';
import { chromium } from 'playwright';

import { localAdminJson } from './lib/local-admin-fetch';

const base = 'http://localhost:8000';
async function main() {
  const browser = await chromium.launch();
  const context = await browser.newContext();
  const original = topicSchema
    .array()
    .parse(await localAdminJson('/api/admin/topics'));
  const latest = (await localAdminJson(
    '/api/admin/digest-previews/latest',
  )) as { id: string } | null;
  const id = '00000000-0000-4000-8000-999999999998';
  const input = {
    name: 'X account settings check',
    description: '',
    includeGuidance: '',
    excludeGuidance: '',
    enabled: false,
    storyBudget: 0,
    postBudget: 0,
    relevancePolicy: { includeAny: [], excludeAny: [] },
    accounts: ['NBA'],
  };
  const replayTopics = structuredClone(original);
  const initial = topicSchema.parse({
    ...input,
    id,
    profileId: original[0].profileId,
    position: original.length,
    sources: [],
    queries: [],
  });
  replayTopics.push(structuredClone(initial));
  let saves = 0;
  await context.route('**/api/**', async (route) => {
    const request = route.request();
    const path = new URL(request.url()).pathname;
    if (path === '/api/topics' && request.method() === 'GET') {
      await route.fulfill({ json: replayTopics });
      return;
    }
    if (path === `/api/topics/${id}` && request.method() === 'PUT') {
      const parsed = topicUpdateSchema.safeParse(request.postDataJSON());
      assert.equal(
        parsed.success,
        true,
        'Browser must reject duplicate handles before sending',
      );
      if (!parsed.success) throw new Error('Invalid browser update');
      const saved = topicSchema.parse({ ...initial, ...parsed.data });
      replayTopics[original.length] = saved;
      saves++;
      await route.fulfill({ json: saved });
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
      replayTopics[original.length] = structuredClone(initial);
      const page = await context.newPage();
      await page.setViewportSize({ width, height });
      const previousSaves = saves;
      const errors: string[] = [];
      page.on('pageerror', (error) => errors.push(error.message));
      await page.goto(base);
      await page.getByText('Manage topics', { exact: true }).click();
      await page
        .getByRole('button', { name: `Edit ${input.name}`, exact: true })
        .click();
      const form = page.getByRole('form', {
        name: `Edit ${input.name}`,
        exact: true,
      });
      await form
        .getByRole('textbox', {
          name: 'X accounts · one handle per line',
          exact: true,
        })
        .fill('@NBA\nNBAPR');
      await form
        .getByRole('button', { name: 'Save topic', exact: true })
        .click();
      await page
        .getByRole('status')
        .filter({ hasText: `Saved ${input.name}.` })
        .waitFor();
      await page.reload();
      await page.getByText('Manage topics', { exact: true }).click();
      await page
        .getByRole('button', { name: `Edit ${input.name}`, exact: true })
        .click();
      const handles = form.getByRole('textbox', {
        name: 'X accounts · one handle per line',
        exact: true,
      });
      assert.equal(await handles.inputValue(), 'NBA\nNBAPR');
      await handles.fill('NBA\nnba');
      await form
        .getByRole('button', { name: 'Save topic', exact: true })
        .click();
      await page
        .getByRole('status')
        .filter({ hasText: 'up to 20 unique handles' })
        .waitFor();
      assert.equal(
        saves,
        previousSaves + 1,
        'Duplicate handles must not send another save',
      );
      assert.deepEqual(replayTopics[original.length].accounts, [
        'NBA',
        'NBAPR',
      ]);
      await handles.fill('NBA\nNBAPR');
      await handles.scrollIntoViewIfNeeded();
      await page.screenshot({
        path: `docs/screenshots/topic-accounts-${name}.png`,
      });
      assert.equal(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= window.innerWidth,
        ),
        true,
      );
      assert.deepEqual(errors, []);
      await page.close();
    }
    console.log(
      'X account settings: desktop/mobile browser-only save/reload, @ normalization and duplicate prevention pass; protected reads prove live topics/edition unchanged; no inference/search',
    );
  } finally {
    assert.deepEqual(await localAdminJson('/api/admin/topics'), original);
    if (latest)
      assert.deepEqual(
        await localAdminJson('/api/admin/digest-previews/' + latest.id),
        latest,
      );
    await context.close();
    await browser.close();
  }
}
void main();
