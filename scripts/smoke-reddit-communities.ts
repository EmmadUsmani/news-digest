// Browser replay only: intercept topic writes, never change the live configuration.
import assert from 'node:assert/strict';

import { topicSchema, topicUpdateSchema } from '@digest/contracts';
import { chromium } from 'playwright';

import { localAdminJson } from './lib/local-admin-fetch';

const base = 'http://localhost:8000';
async function main() {
  const browser = await chromium.launch();
  try {
    const before = await localAdminJson('/api/admin/topics');
    for (const [name, width, height] of [
      ['desktop', 1440, 1100],
      ['mobile', 390, 844],
    ] as const) {
      const page = await browser.newPage({ viewport: { width, height } });
      const topics = topicSchema.array().parse(before);
      const topic = topics[0];
      let writes = 0;
      const errors: string[] = [];
      page.on('pageerror', (error) => errors.push(error.message));
      await page.route('**/api/topics', async (route) => {
        assert.equal(route.request().method(), 'GET');
        await route.fulfill({ json: topics });
      });
      await page.route(`**/api/topics/${topic.id}`, async (route) => {
        assert.equal(route.request().method(), 'PUT');
        Object.assign(
          topic,
          topicUpdateSchema.parse(route.request().postDataJSON()),
        );
        writes++;
        await route.fulfill({ json: topic });
      });
      const open = async () => {
        await page.getByText('Manage topics', { exact: true }).click();
        await page
          .getByRole('button', { name: `Edit ${topic.name}`, exact: true })
          .click();
      };
      await page.goto(base);
      await open();
      assert.match(
        await page.locator('#reddit-communities-help').innerText(),
        /parked by owner and unscheduled/,
      );
      const field = page.getByRole('textbox', {
        name: 'Reddit communities · one per line',
        exact: true,
      });
      await field.fill('r/nba\nLocalLLaMA');
      await page
        .getByRole('button', { name: 'Save topic', exact: true })
        .click();
      await page
        .getByRole('button', { name: `Edit ${topic.name}`, exact: true })
        .waitFor();
      assert.equal(writes, 1);
      assert.deepEqual(topic.redditCommunities, ['nba', 'LocalLLaMA']);
      await page.reload();
      await open();
      assert.equal(await field.inputValue(), 'nba\nLocalLLaMA');
      await field.fill('nba\nNBA');
      await page
        .getByRole('button', { name: 'Save topic', exact: true })
        .click();
      await page
        .getByRole('status')
        .filter({ hasText: 'Check the name' })
        .waitFor();
      assert.equal(writes, 1);
      await field.fill('nba\nLocalLLaMA');
      await field.scrollIntoViewIfNeeded();
      await page.screenshot({
        path: `docs/screenshots/reddit-communities-${name}.png`,
      });
      assert.equal(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= window.innerWidth,
        ),
        true,
      );
      await field.fill('');
      await page
        .getByRole('button', { name: 'Save topic', exact: true })
        .click();
      await page
        .getByRole('button', { name: `Edit ${topic.name}`, exact: true })
        .waitFor();
      assert.deepEqual(topic.redditCommunities, []);
      assert.equal(writes, 2);
      assert.deepEqual(errors, []);
      await page.close();
    }
    assert.deepEqual(await localAdminJson('/api/admin/topics'), before);
    console.log(
      'Reddit settings replay: desktop/mobile normalize, save, reload, reject duplicates, clear; live topics unchanged; no fetching/inference.',
    );
  } finally {
    await browser.close();
  }
}
void main();
