// Read-only browser check of live coverage; no inference or configuration writes.
import assert from 'node:assert/strict';

import { operationsStatusSchema } from '@digest/contracts';
import { chromium } from 'playwright';

async function main() {
  const browser = await chromium.launch();
  try {
    for (const [name, width, height] of [
      ['desktop', 1440, 1100],
      ['mobile', 390, 844],
    ] as const) {
      const page = await browser.newPage({ viewport: { width, height } });
      const errors: string[] = [];
      page.on('pageerror', (error) => errors.push(error.message));
      const status = operationsStatusSchema.parse(
        await (
          await page.request.get('http://localhost:8000/api/status')
        ).json(),
      );
      assert.ok(status.coverage);
      // Replay this read to keep browser assertions stable across collection updates.
      await page.route('**/api/status', (route) =>
        route.fulfill({ json: status }),
      );
      await page.goto('http://localhost:8000');
      await page.getByText('Source & run status', { exact: true }).click();
      const coverage = page.getByRole('region', {
        name: 'Topic coverage',
        exact: true,
      });
      await coverage.waitFor();
      const reddit = page.getByRole('region', {
        name: 'Reddit collection',
        exact: true,
      });
      await reddit.waitFor();
      assert.match(await reddit.innerText(), /parked by owner/);
      assert.match(await reddit.innerText(), /disabled and unscheduled/);
      await reddit.screenshot({
        path: `docs/screenshots/reddit-parked-${name}.png`,
      });
      assert.equal(
        await coverage.locator('article').count(),
        status.coverage.topics.length,
      );
      for (const topic of status.coverage.topics) {
        const card = coverage.locator('article').filter({
          has: page.getByRole('heading', { name: topic.name, exact: true }),
        });
        assert.match(
          await card.innerText(),
          new RegExp(
            `${topic.articles} articles · ${topic.xPosts} X posts · ${topic.redditPosts} Reddit posts`,
          ),
        );
      }
      await coverage.scrollIntoViewIfNeeded();
      assert.equal(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth,
        ),
        true,
      );
      assert.deepEqual(errors, []);
      await coverage.screenshot({
        path: `docs/screenshots/topic-coverage-${name}.png`,
      });
      await page.close();
    }
    console.log(
      'Live topic coverage desktop/mobile checks passed; no writes or inference.',
    );
  } finally {
    await browser.close();
  }
}
void main().catch((error: unknown) => {
  console.error(error);
  process.exitCode = 1;
});
