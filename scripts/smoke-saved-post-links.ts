// Actual saved edition; browser-local saves only, external requests blocked.
import assert from 'node:assert/strict';

import { readerEditionSchema } from '@digest/contracts';
import { chromium, expect } from 'playwright/test';

async function smoke() {
  const origin = 'http://127.0.0.1:8000';
  const edition = readerEditionSchema.parse(
    await (await fetch(`${origin}/api/editions/latest`)).json(),
  );
  const story = edition.topics.flatMap((topic) => topic.stories)[0];
  const post = edition.topics
    .flatMap((topic) => topic.posts)
    .find(
      (item) =>
        item.platform === 'bluesky' && item.text.includes('Patch notes:'),
    );
  assert.ok(story && post);
  const excerpt = post.displayText ?? post.text;
  const patchUrl = excerpt.match(
    /https:\/\/store\.steampowered\.com\/\S+/,
  )?.[0];
  assert.ok(patchUrl);
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
          return new URL(route.request().url()).origin === origin
            ? route.continue()
            : route.abort();
        });
        const page = await context.newPage();
        const errors: string[] = [];
        page.on('pageerror', (error) => errors.push(error.message));
        await page.goto(`${origin}/editions/${edition.id}`);
        await page
          .getByRole('button', {
            name: `Save story: ${story.title}`,
            exact: true,
          })
          .click();
        await page
          .getByRole('button', {
            name: `Save post on ${post.platform} from ${post.author}, ${post.publishedAt}`,
            exact: true,
          })
          .click();
        await page.goto(`${origin}/saved`);
        await expect(page.locator('.saved-published')).toHaveCount(2);
        const savedPost = page
          .getByRole('listitem')
          .filter({ hasText: excerpt });
        await expect(savedPost.locator('p.leading-7')).toHaveText(excerpt);
        await expect(savedPost.locator('p.leading-7 a').last()).toHaveAttribute(
          'href',
          patchUrl,
        );
        await expect(
          savedPost.locator('p.leading-7 a').first(),
        ).toHaveAttribute('href', post.url);
        assert.equal(
          await savedPost
            .locator('p.leading-7 a')
            .last()
            .evaluate((link) => getComputedStyle(link).fontSize),
          '16px',
        );
        for (const publishedAt of [story.publishedAt, post.publishedAt]) {
          await expect(
            page.locator(
              `.saved-published time[datetime="${new Date(publishedAt).toISOString()}"]`,
            ),
          ).toBeVisible();
        }
        await page.reload();
        await expect(savedPost.locator('p.leading-7 a').last()).toHaveAttribute(
          'href',
          patchUrl,
        );
        await expect(savedPost.locator('p.leading-7')).toHaveText(excerpt);
        await expect(page.locator('.saved-published')).toHaveCount(2);
        assert.ok(
          await page.evaluate(
            () => document.documentElement.scrollWidth <= innerWidth,
          ),
        );
        await page.screenshot({
          path: `docs/screenshots/ui/saved-post-links-${device}-${theme}.png`,
          fullPage: true,
        });
        // Rehearse a legacy browser save without inventing its publication date.
        await page.evaluate(() => {
          const key = 'news-digest.reader-preferences.v1';
          const store = JSON.parse(localStorage.getItem(key)!);
          for (const change of Object.values<{
            copy: { publishedAt?: string };
          }>(store.bookmarks))
            delete change.copy.publishedAt;
          localStorage.setItem(key, JSON.stringify(store));
        });
        await page.reload();
        await expect(page.locator('.saved-published')).toHaveCount(0);
        await expect(page.getByRole('listitem')).toHaveCount(2);
        assert.deepEqual(errors, []);
        console.log(
          `${device}/${theme}: actual saved patch-notes link and excerpt survive reload; readable link type; no overflow`,
        );
        await context.close();
      }
    }
  } finally {
    await browser.close();
  }
}
void smoke();
