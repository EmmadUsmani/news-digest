// Explicit local browser check. Uses a temporary disabled topic; no inference/search.
import assert from 'node:assert/strict';

import { topicSchema } from '@digest/contracts';
import { chromium } from 'playwright';

const base = 'http://localhost:8000';
async function main() {
  const browser = await chromium.launch();
  const context = await browser.newContext();
  const api = context.request;
  let id: string | undefined;
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
  const latest = await (
    await api.get(`${base}/api/digest-previews/latest`)
  ).json();
  try {
    const response = await api.post(`${base}/api/topics`, { data: input });
    assert.equal(response.status(), 201);
    id = topicSchema.parse(await response.json()).id;
    for (const [name, width, height] of [
      ['desktop', 1440, 1100],
      ['mobile', 390, 844],
    ] as const) {
      const page = await browser.newPage({ viewport: { width, height } });
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
      assert.deepEqual(
        topicSchema
          .array()
          .parse(await (await api.get(`${base}/api/topics`)).json())
          .find((t) => t.id === id)?.accounts,
        ['NBA', 'NBAPR'],
      );
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
    assert.equal(
      (
        await api.put(`${base}/api/topics/${id}`, {
          data: { ...input, accounts: ['NBA', 'nba'] },
        })
      ).status(),
      400,
    );
    assert.deepEqual(
      await (await api.get(`${base}/api/digest-previews/latest`)).json(),
      latest,
    );
    console.log(
      'X account settings: desktop/mobile save, reload, @ normalization, duplicate rejection and immutable latest edition pass; no inference/search',
    );
  } finally {
    if (id)
      assert.equal((await api.delete(`${base}/api/topics/${id}`)).ok(), true);
    await context.close();
    await browser.close();
  }
}
void main();
