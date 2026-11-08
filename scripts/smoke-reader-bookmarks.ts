// Actual saved editions; GET-only, external requests blocked.
import assert from 'node:assert/strict';

import { readerEditionSchema } from '@digest/contracts';
import { chromium, expect } from 'playwright/test';

async function smoke() {
  const origin = 'http://127.0.0.1:8000';
  const edition = readerEditionSchema.parse(
    await (await fetch(`${origin}/api/editions/latest`)).json(),
  );
  const history = await (
    await fetch(`${origin}/api/editions?limit=20&offset=0`)
  ).json();
  const older = history.entries.find(
    (entry: { id: string }) => entry.id !== edition.id,
  );
  assert.ok(older, 'a historical edition is required');
  const historical = readerEditionSchema.parse(
    await (await fetch(`${origin}/api/editions/${older.id}`)).json(),
  );
  const historicalStory = historical.topics.flatMap(
    (topic) => topic.stories,
  )[0];
  const historicalPost = historical.topics.flatMap((topic) => topic.posts)[0];
  assert.ok(historicalStory);
  assert.ok(historicalPost);
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
          other.getByRole('link', {
            name: `View edition containing saved item: ${story.title}`,
            exact: true,
          }),
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
        // Keyboard removal keeps a useful focus target, including the last item.
        const removals = other.getByRole('button', {
          name: /^Remove saved item:/,
        });
        assert.ok((await removals.count()) >= 3);
        // Removing the last card moves to its previous neighbor.
        await removals.last().focus();
        const previousName = await removals
          .nth((await removals.count()) - 2)
          .getAttribute('aria-label');
        await other.keyboard.press('Enter');
        await expect(
          other.getByRole('button', { name: previousName!, exact: true }),
        ).toBeFocused();
        // Removing the first card moves to its next neighbor.
        while ((await removals.count()) > 1) {
          const nextName = await removals.nth(1).getAttribute('aria-label');
          await removals.first().focus();
          await other.keyboard.press('Enter');
          await expect(
            other.getByRole('button', { name: nextName!, exact: true }),
          ).toBeFocused();
        }
        await removals.first().focus();
        await other.keyboard.press('Enter');
        await expect(
          other.getByRole('heading', { name: 'Saved items', exact: true }),
        ).toBeFocused();
        await expect(
          other.getByText('No saved items yet.', { exact: false }),
        ).toBeVisible();
        await other.screenshot({
          path: `docs/screenshots/ui/saved-empty-${device}-${theme}.png`,
          fullPage: true,
        });
        await expect(save).toHaveAttribute('aria-pressed', 'false');
        await save.click();
        // Old editions use their own saved display copy and edition link.
        await page.goto(`${origin}/editions/${historical.id}`);
        const oldControls = [
          {
            name: `Save story: ${historicalStory.title}`,
            title: historicalStory.title,
            url: historicalStory.url,
          },
          {
            name: `Save post on ${historicalPost.platform} from ${historicalPost.author}, ${historicalPost.publishedAt}`,
            title:
              historicalPost.platform === 'reddit'
                ? historicalPost.title
                : `${historicalPost.platform === 'x' ? 'X' : 'Bluesky'} post from ${historicalPost.author}`,
            url: historicalPost.url,
          },
        ];
        for (const item of oldControls) {
          const control = page.getByRole('button', {
            name: item.name,
            exact: true,
          });
          // A stable item may already be saved from the latest edition.
          if ((await control.getAttribute('aria-pressed')) === 'true')
            await control.click();
          await control.click();
          await page.reload();
          await expect(control).toHaveAttribute('aria-pressed', 'true');
          await other.reload();
          const card = other.locator('li').filter({
            has: other.getByRole('link', { name: item.title, exact: true }),
          });
          await expect(
            card.getByRole('link', { name: item.title, exact: true }),
          ).toHaveAttribute('href', item.url);
          await expect(
            card.getByRole('link', {
              name: `View edition containing saved item: ${item.title}`,
              exact: true,
            }),
          ).toHaveAttribute('href', `/editions/${historical.id}`);
          await card
            .getByRole('button', {
              name: `Remove saved item: ${item.title}`,
              exact: true,
            })
            .click();
          await expect(control).toHaveAttribute('aria-pressed', 'false');
          await page.reload();
          await expect(control).toHaveAttribute('aria-pressed', 'false');
        }
        await page.goto(`${origin}/editions/${edition.id}`);
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
          `${device}/${theme}: save/reload/copy/destination/remove/cross-tab/layout and historical ${historical.id} story/post pass`,
        );
      }
    }
  } finally {
    await browser.close();
  }
}
void smoke();
