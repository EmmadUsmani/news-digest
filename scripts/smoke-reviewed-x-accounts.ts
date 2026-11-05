// Read-only live settings check: never saves topics or triggers discovery.
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

import { topicSchema } from '@digest/contracts';
import { chromium } from 'playwright';

import { localAdminJson } from './lib/local-admin-fetch';
import { replayAdminPage } from './lib/replay-admin-page';

async function main() {
  const base = 'http://localhost:8000';
  const source = await readFile('docs/SOURCES.md', 'utf8');
  const reviewed = [...source.matchAll(/^- \*\*(.+?) \((\d+)\):\*\* (.+)$/gm)]
    .slice(0, 4)
    .map((match) => ({
      name: match[1],
      count: Number(match[2]),
      accounts: [...match[3].matchAll(/https:\/\/x.com\/([A-Za-z0-9_]+)/g)].map(
        (account) => account[1],
      ),
    }));
  assert.equal(reviewed.length, 4);
  const browser = await chromium.launch();
  try {
    const context = await browser.newContext();
    const topics = topicSchema
      .array()
      .parse(await localAdminJson('/api/admin/topics'));
    await context.route('**/api/admin/topics', async (route) => {
      assert.equal(route.request().method(), 'GET');
      await route.fulfill({ json: topics });
    });
    for (const [device, width, height] of [
      ['desktop', 1440, 1100],
      ['mobile', 390, 844],
    ] as const) {
      const page = await context.newPage();
      await page.setViewportSize({ width, height });
      const errors: string[] = [];
      page.on('pageerror', (error) => errors.push(error.message));
      for (const [index, review] of reviewed.entries()) {
        assert.equal(review.accounts.length, review.count);
        assert.deepEqual(
          topics.find((topic) => topic.name === review.name)?.accounts,
          review.accounts,
        );
        await replayAdminPage(page);
        await page.goto(`${base}/admin`);
        await page.getByText('Manage topics', { exact: true }).click();
        await page
          .getByRole('button', { name: `Edit ${review.name}`, exact: true })
          .click();
        const handles = page
          .getByRole('form', { name: `Edit ${review.name}`, exact: true })
          .getByRole('textbox', {
            name: 'X accounts · one handle per line',
            exact: true,
          });
        assert.equal(await handles.inputValue(), review.accounts.join('\n'));
        await handles.scrollIntoViewIfNeeded();
        assert.equal(
          await page.evaluate(
            () => document.documentElement.scrollWidth <= window.innerWidth,
          ),
          true,
        );
        await page.screenshot({
          path: `docs/screenshots/reviewed-x-accounts-${index + 1}-${device}.png`,
        });
      }
      assert.deepEqual(errors, []);
      await page.close();
    }
    assert.deepEqual(
      topicSchema.array().parse(await localAdminJson('/api/admin/topics')),
      topics,
    );
    console.log(
      'Four reviewed account lists match protected API snapshots and desktop/mobile settings; live topics unchanged; no browser credentials, writes, errors or overflow.',
    );
  } finally {
    await browser.close();
  }
}
void main();
