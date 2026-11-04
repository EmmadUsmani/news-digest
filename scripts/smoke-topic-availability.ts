import assert from 'node:assert/strict';

import { topicSchema, topicUpdateSchema } from '@digest/contracts';
import { chromium } from 'playwright';

// Browser-only response simulation: no topic writes or digest generation.
async function smoke() {
  const browser = await chromium.launch();
  try {
    for (const [device, width, height] of [
      ['desktop', 1440, 1100],
      ['mobile', 390, 844],
    ] as const) {
      const page = await browser.newPage({ viewport: { width, height } });
      const topics = topicSchema
        .array()
        .parse(
          await (
            await page.request.get('http://localhost:8000/api/topics')
          ).json(),
        );
      const original = topics.find((topic) => topic.enabled);
      assert.ok(original, 'Need an enabled topic for browser verification');
      let fail = true;
      let writes = 0;
      await page.route(`**/api/topics/${original.id}`, async (route) => {
        assert.equal(route.request().method(), 'PUT');
        const body = topicUpdateSchema.parse(route.request().postDataJSON());
        const enabled = writes === 2;
        assert.deepEqual(body, {
          ...topicUpdateSchema.strip().parse(original),
          enabled,
        });
        writes++;
        await route.fulfill({
          status: fail ? 503 : 200,
          contentType: 'application/json',
          body: JSON.stringify(fail ? {} : { ...original, enabled }),
        });
      });
      await page.goto('http://localhost:8000');
      await page.getByText('Manage topics', { exact: true }).click();
      const disable = page.getByRole('button', {
        name: `Disable ${original.name}`,
        exact: true,
      });
      await disable.click();
      await page
        .getByRole('status')
        .filter({ hasText: 'Could not change topic availability.' })
        .waitFor();
      assert.ok(await disable.isEnabled());
      assert.ok(
        await page
          .locator('.topic-grid')
          .getByRole('heading', { name: original.name, exact: true })
          .isVisible(),
      );
      fail = false;
      await disable.click();
      await page
        .getByRole('button', { name: `Enable ${original.name}`, exact: true })
        .waitFor();
      assert.equal(
        await page
          .locator('.topic-grid')
          .getByRole('heading', { name: original.name, exact: true })
          .count(),
        0,
      );
      await page.locator('.topic-settings').screenshot({
        path: `docs/screenshots/topic-availability-${device}.png`,
      });
      await page
        .getByRole('button', { name: `Enable ${original.name}`, exact: true })
        .click();
      await disable.waitFor();
      await page
        .locator('.topic-grid')
        .getByRole('heading', { name: original.name, exact: true })
        .waitFor();
      assert.equal(writes, 3);
      await page
        .getByRole('button', { name: `Edit ${original.name}`, exact: true })
        .click();
      assert.ok(await disable.isDisabled(), 'Do not overwrite an open editor');
      assert.ok(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth,
        ),
      );
      assert.deepEqual(
        await (
          await page.request.get('http://localhost:8000/api/topics')
        ).json(),
        topics,
      );
      await page.close();
    }
    console.log(
      'Topic availability: desktop/mobile failure, retry, disable, enable, editor protection passed; live topics unchanged.',
    );
  } finally {
    await browser.close();
  }
}
void smoke().catch((error: unknown) => {
  console.error(error);
  process.exitCode = 1;
});
