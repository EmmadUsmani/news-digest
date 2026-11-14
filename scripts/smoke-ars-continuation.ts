// Recorded Ars reporting injected into an edition fixture; browser-local saves, GET-only.
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

import { readerEditionSchema } from '@digest/contracts';
import { chromium, expect } from 'playwright/test';

import { parseFeed } from '../apps/api/src/modules/ingestion/adapters/feed.adapter';

async function smoke() {
  const origin = 'http://127.0.0.1:8000';
  const edition = readerEditionSchema.parse(
    await (await fetch(`${origin}/api/editions/latest`)).json(),
  );
  const stories = edition.topics.flatMap((topic) => topic.stories);
  const story = stories.find((item) =>
    item.summary?.endsWith('Read the full article on pushsquare.com'),
  );
  const complete = stories.find((item) =>
    item.title.includes('Mouhamed Gueye'),
  );
  assert.ok(story && complete);
  const [report] = parseFeed(
    await readFile('apps/api/test/fixtures/ars-outage-2026-11-13.xml', 'utf8'),
  );
  assert.ok(report.excerpt.endsWith('Read full article Comments'));
  // Keep the fixture's actual reporting, URL and title; publication is simulated.
  Object.assign(story, {
    title: report.title,
    summary: report.excerpt,
    url: report.url,
    publishedAt: report.publishedAt,
    sources: ['Ars Technica'],
    coverage: undefined,
    publisher: undefined,
  });
  readerEditionSchema.parse(edition);
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
        });
        await context.route('**/*', (route) => {
          assert.ok(['GET', 'HEAD'].includes(route.request().method()));
          const url = new URL(route.request().url());
          if (
            url.origin === origin &&
            url.pathname === `/api/editions/${edition.id}`
          )
            return route.fulfill({ json: edition });
          return url.origin === origin ? route.continue() : route.abort();
        });
        const page = await context.newPage();
        const errors: string[] = [];
        page.on('pageerror', (error) => errors.push(error.message));
        await page.goto(`${origin}/editions/${edition.id}`);
        const card = page.locator(`[id="story-${story.id}"]`);
        await expect(card.locator('.excerpt')).toHaveText(story.summary!);
        const continuation = card.getByRole('link', {
          name: `Continue reading: ${story.title}`,
          exact: true,
        });
        await expect(continuation).toHaveAttribute('href', story.url);
        await expect(continuation).toHaveAttribute('target', '_blank');
        await continuation.focus();
        await expect(continuation).toBeFocused();
        await expect(
          page
            .locator(`[id="story-${complete.id}"]`)
            .getByRole('link', { name: /^Continue reading:/ }),
        ).toHaveCount(0);
        await page
          .getByRole('button', {
            name: `Save story: ${story.title}`,
            exact: true,
          })
          .click();
        await page.goto(`${origin}/saved`);
        const saved = page.getByRole('listitem').filter({
          has: page.getByRole('link', { name: story.title, exact: true }),
        });
        await expect(saved.locator('p.post-text')).toHaveText(story.summary!);
        await expect(
          saved.getByRole('link', {
            name: `Continue reading: ${story.title}`,
            exact: true,
          }),
        ).toHaveAttribute('href', story.url);
        await page.reload();
        await expect(saved.locator('p.post-text')).toHaveText(story.summary!);
        await expect(
          saved.getByRole('link', {
            name: `Continue reading: ${story.title}`,
            exact: true,
          }),
        ).toBeVisible();
        assert.ok(
          await page.evaluate(
            () => document.documentElement.scrollWidth <= innerWidth,
          ),
        );
        await page.screenshot({
          path: `docs/screenshots/ui/ars-continuation-${device}-${theme}.png`,
          fullPage: true,
        });
        assert.deepEqual(errors, []);
        await context.close();
        console.log(
          `${device}/${theme}: recorded Ars fixture and saved copy retain text, source destination and reload; complete story unchanged`,
        );
      }
    }
  } finally {
    await browser.close();
  }
}
void smoke();
