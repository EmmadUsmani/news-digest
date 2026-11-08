// GET-only published content; local preferences only, external requests blocked.
import assert from 'node:assert/strict';

import { readerEditionSchema } from '@digest/contracts';
import { chromium, expect } from 'playwright/test';

async function smoke() {
  const origin = 'http://127.0.0.1:8000';
  const edition = readerEditionSchema.parse(
    await (await fetch(`${origin}/api/editions/latest`)).json(),
  );
  const topic = edition.topics.find(
    (topic) => topic.stories.length && topic.posts.length,
  );
  assert.ok(topic);
  const browser = await chromium.launch();
  try {
    for (const [device, width, height] of [
      ['desktop', 1440, 1100],
      ['mobile', 390, 844],
    ] as const) {
      for (const theme of ['light', 'dark'] as const) {
        const page = await browser.newPage({
          viewport: { width, height },
          colorScheme: theme,
        });
        const errors: string[] = [];
        page.on('pageerror', (error) => errors.push(error.message));
        await page.route('**/*', (route) => {
          assert.ok(['GET', 'HEAD'].includes(route.request().method()));
          return new URL(route.request().url()).origin === origin
            ? route.continue()
            : route.abort();
        });
        const post = topic.posts[0];
        for (const hash of [
          `story-${topic.stories[0].id}`,
          `post-${encodeURIComponent(JSON.stringify([post.platform, post.externalId]))}`,
        ]) {
          await page.goto(origin);
          await page
            .getByRole('button', { name: 'Topics', exact: true })
            .click();
          await page
            .getByRole('dialog')
            .getByRole('checkbox', { name: topic.name, exact: true })
            .uncheck();
          await page.goto(`${origin}/editions/${edition.id}#${hash}`);
          const reveal = page.getByRole('button', {
            name: `Show ${topic.name}`,
            exact: true,
          });
          await expect(reveal).toBeVisible();
          assert.equal(
            await page.evaluate((id) => !!document.getElementById(id), hash),
            false,
          );
          if (hash.startsWith('story-')) {
            await page.screenshot({
              path: `docs/screenshots/ui/hidden-destination-${device}-${theme}.png`,
              fullPage: false,
            });
          }
          const box = await reveal.boundingBox();
          assert.ok(box && box.height >= 44);
          await reveal.click();
          await expect(reveal).toHaveCount(0);
          await expect
            .poll(() => page.evaluate(() => document.activeElement?.id))
            .toBe(hash);
          await page.reload();
          await expect
            .poll(() =>
              page.evaluate((id) => !!document.getElementById(id), hash),
            )
            .toBe(true);
          assert.ok(
            await page.evaluate(
              () => document.documentElement.scrollWidth <= innerWidth,
            ),
          );
        }
        assert.deepEqual(errors, []);
        console.log(
          `${device}/${theme}: hidden story/post destination reveal, focus and persistence pass`,
        );
        await page.close();
      }
    }
  } finally {
    await browser.close();
  }
}
void smoke();
