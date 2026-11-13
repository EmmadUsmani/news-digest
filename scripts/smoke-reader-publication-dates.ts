// Actual saved edition, read-only requests; advance browser time without changing data.
import assert from 'node:assert/strict';

import { readerEditionSchema } from '@digest/contracts';
import { chromium, expect } from 'playwright/test';

async function smoke() {
  const origin = 'http://127.0.0.1:8000';
  const edition = readerEditionSchema.parse(
    await (await fetch(`${origin}/api/editions/latest`)).json(),
  );
  const story = edition.topics.flatMap((topic) => topic.stories)[0];
  assert.ok(story);
  const published = new Date(story.publishedAt);
  const browser = await chromium.launch();
  try {
    for (const [device, width, height] of [
      ['desktop', 1440, 1100],
      ['mobile', 390, 844],
    ] as const) {
      for (const theme of ['light', 'dark'] as const) {
        const context = await browser.newContext({
          viewport: { width, height },
          colorScheme: theme,
          locale: 'en-US',
        });
        await context.route('**/*', (route) => {
          assert.ok(['GET', 'HEAD'].includes(route.request().method()));
          return new URL(route.request().url()).origin === origin
            ? route.continue()
            : route.abort();
        });
        const page = await context.newPage();
        const errors: string[] = [];
        page.on('pageerror', (error) => errors.push(error.message));
        await page.clock.setFixedTime(
          new Date(published.getTime() + 60 * 60_000),
        );
        await page.goto(`${origin}/editions/${edition.id}`);
        const timestamp = page
          .locator(`time[title][datetime="${story.publishedAt}"]`)
          .first();
        await expect(timestamp).toHaveText('1h ago');
        await page.clock.setFixedTime(
          new Date(published.getTime() + 1440 * 60_000),
        );
        await page.reload();
        await expect(timestamp).toHaveText(
          published.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
          }),
        );
        await expect(timestamp).toHaveAttribute('aria-label', /\d/);
        await expect(timestamp).toHaveAttribute('title', /\d/);
        assert.ok(
          await page.evaluate(
            () => document.documentElement.scrollWidth <= innerWidth,
          ),
        );
        await timestamp.scrollIntoViewIfNeeded();
        await page.screenshot({
          path: `docs/screenshots/ui/reader-publication-${device}-${theme}.png`,
        });
        assert.deepEqual(errors, []);
        console.log(
          `${device}/${theme}: actual story relative time and 24-hour calendar boundary pass`,
        );
        await context.close();
      }
    }
  } finally {
    await browser.close();
  }
}
void smoke();
