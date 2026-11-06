// Read-only saved-edition navigation; blocks widgets and all writes.
import assert from 'node:assert/strict';

import { readerEditionSchema } from '@digest/contracts';
import { chromium, expect } from 'playwright/test';

const origin = 'http://127.0.0.1:8000';
async function smoke() {
  const edition = readerEditionSchema.parse(
    await (await fetch(`${origin}/api/editions/latest`)).json(),
  );
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
          reducedMotion: 'reduce',
        });
        const errors: string[] = [],
          writes: string[] = [];
        page.on('pageerror', (error) => errors.push(error.message));
        await page.route('**/*', (route) => {
          const request = route.request();
          if (!['GET', 'HEAD'].includes(request.method())) {
            writes.push(request.method());
            return route.abort();
          }
          return new URL(request.url()).origin === origin
            ? route.continue()
            : route.abort();
        });
        await page.goto(`${origin}/editions/${edition.id}`);
        await page.locator('.digest-topic').last().waitFor();
        await page.evaluate(() => document.fonts.ready);
        // Settle lazy blocked media before measuring scroll positions.
        for (const card of await page.locator('.post-card').all()) {
          await card.scrollIntoViewIfNeeded();
          if ((await card.locator('.byline').innerText()).startsWith('X ·')) {
            await card
              .getByRole('button', { name: 'Retry X media', exact: true })
              .waitFor();
          }
        }
        const stories = edition.topics.flatMap((topic) =>
          topic.stories.map((story) => ({ topic, story })),
        );
        assert.ok(stories.length > 0);
        for (const direction of [stories, [...stories].reverse()]) {
          for (const { topic, story } of direction) {
            // Put the story just above the reading line, without changing hash.
            await page.locator(`[id="story-${story.id}"]`).evaluate((node) => {
              scrollTo({
                top: scrollY + node.getBoundingClientRect().top - 170,
                behavior: 'instant',
              });
            });
            const bounds = await page
              .locator(`[id="story-${story.id}"]`)
              .boundingBox();
            // The last story may not reach the reading line before the page ends.
            if (bounds && bounds.y > 180) {
              assert.ok(
                await page.evaluate(
                  () =>
                    scrollY + innerHeight >=
                    document.documentElement.scrollHeight - 1,
                ),
              );
              continue;
            }
            if (device === 'desktop') {
              await expect(
                page.locator(
                  'nav[aria-label="Edition contents"] [aria-current="location"]',
                ),
              ).toHaveAttribute('href', `#story-${story.id}`);
            } else {
              await expect(
                page
                  .locator('[aria-current="location"]')
                  .filter({ hasText: topic.name })
                  .first(),
              ).toHaveAttribute('href', `#topic-${topic.id}`);
            }
          }
        }
        if (device === 'mobile') {
          await page
            .getByRole('button', { name: 'Contents', exact: true })
            .click();
          await expect(
            page.locator(
              'nav[aria-label="Mobile contents"] [aria-current="location"]',
            ),
          ).toHaveAttribute('href', `#story-${stories[0].story.id}`);
        }
        await page.screenshot({
          path: `docs/screenshots/ui/reader-scroll-${device}-${theme}.png`,
        });
        assert.deepEqual(errors, []);
        assert.deepEqual(writes, []);
        await page.close();
      }
    }
    console.log(
      'Saved story scroll tracking forward/backward: desktop/mobile light/dark passed; no writes or external calls.',
    );
  } finally {
    await browser.close();
  }
}
void smoke();
