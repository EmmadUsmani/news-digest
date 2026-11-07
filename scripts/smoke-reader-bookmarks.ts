// Actual saved editions; GET-only, external requests blocked.
import assert from 'node:assert/strict';

import { readerEditionSchema } from '@digest/contracts';
import { chromium, expect } from 'playwright/test';

async function smoke() {
  const origin = 'http://127.0.0.1:8000';
  const edition = readerEditionSchema.parse(
    await (await fetch(`${origin}/api/editions/latest`)).json(),
  );
  const story = edition.topics[0].stories[0];
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
        const errors: string[] = [],
          writes: string[] = [];
        await context.route('**/*', (route) => {
          if (!['GET', 'HEAD'].includes(route.request().method())) {
            writes.push(route.request().method());
            return route.abort();
          }
          return new URL(route.request().url()).origin === origin
            ? route.continue()
            : route.abort();
        });
        const page = await context.newPage();
        page.on('pageerror', (error) => errors.push(error.message));
        await page.goto(`${origin}/editions/${edition.id}`);
        const save = page.getByRole('button', {
          name: `Save story: ${story.title}`,
          exact: true,
        });
        await save.click();
        await expect(save).toHaveAttribute('aria-pressed', 'true');
        await page.reload();
        await expect(save).toHaveAttribute('aria-pressed', 'true');
        assert.ok(
          await page.evaluate(
            () => document.documentElement.scrollWidth <= innerWidth,
          ),
        );
        const other = await context.newPage();
        await other.goto(`${origin}/saved`);
        await expect(
          other.getByRole('link', { name: story.title, exact: true }),
        ).toHaveAttribute('href', story.url);
        await expect(
          other.getByRole('link', { name: 'View edition', exact: true }),
        ).toHaveAttribute('href', `/editions/${edition.id}`);
        await other.screenshot({
          path: `docs/screenshots/ui/saved-${device}-${theme}.png`,
          fullPage: true,
        });
        assert.ok(
          await other.evaluate(
            () => document.documentElement.scrollWidth <= innerWidth,
          ),
        );
        await other
          .getByRole('button', {
            name: `Remove saved item: ${story.title}`,
            exact: true,
          })
          .click();
        await expect(save).toHaveAttribute('aria-pressed', 'false');
        await other.reload();
        await expect(
          other.getByText('No saved items yet.', { exact: false }),
        ).toBeVisible();
        await save.click();
        await expect(
          other.getByRole('link', { name: story.title, exact: true }),
        ).toBeVisible();
        for (const post of edition.topics.flatMap((topic) => topic.posts)) {
          const control = page.getByRole('button', {
            name: `Save post on ${post.platform} from ${post.author}, ${post.publishedAt}`,
            exact: true,
          });
          await control.click();
          await expect(control).toHaveAttribute('aria-pressed', 'true');
          await page.reload();
          await expect(control).toHaveAttribute('aria-pressed', 'true');
          const title =
            post.platform === 'reddit'
              ? post.title
              : `${post.platform === 'x' ? 'X' : 'Bluesky'} post from ${post.author}`;
          const link = other
            .locator('a')
            .filter({ hasText: title })
            .and(other.locator(`a[href=${JSON.stringify(post.url)}]`));
          await expect(link).toHaveAttribute('href', post.url);
          await expect(
            other.getByText(post.author, { exact: false }).first(),
          ).toBeVisible();
          await other
            .getByRole('button', {
              name: `Remove saved item: ${title}`,
              exact: true,
            })
            .click();
          await expect(control).toHaveAttribute('aria-pressed', 'false');
          await control.click();
          await expect(link).toBeVisible();
          await control.click();
          await expect(link).toHaveCount(0);
        }
        // Leave actual X and Bluesky copies visible for saved-page screenshots.
        for (const platform of ['x', 'bluesky']) {
          const post = edition.topics
            .flatMap((topic) => topic.posts)
            .find((post) => post.platform === platform);
          assert.ok(post, `actual ${platform} post required`);
          await page
            .getByRole('button', {
              name: `Save post on ${post.platform} from ${post.author}, ${post.publishedAt}`,
              exact: true,
            })
            .click();
        }
        await other.screenshot({
          path: `docs/screenshots/ui/saved-${device}-${theme}.png`,
          fullPage: true,
        });
        assert.ok(
          await other.evaluate(
            () => document.documentElement.scrollWidth <= innerWidth,
          ),
        );
        await page.screenshot({
          path: `docs/screenshots/ui/bookmark-${device}-${theme}.png`,
          fullPage: true,
        });
        await page.evaluate(() => {
          Storage.prototype.setItem = () => {
            throw new Error('Storage blocked by smoke test');
          };
        });
        await save.click();
        await expect(save).toHaveAttribute('aria-pressed', 'false');
        await expect(page.getByRole('alert')).toContainText('could not save');
        assert.deepEqual(errors, []);
        assert.deepEqual(writes, []);
        await context.close();
        console.log(
          `${device}/${theme}: save/reload/copy/destination/remove/cross-tab/layout pass`,
        );
      }
    }
  } finally {
    await browser.close();
  }
}
void smoke();
