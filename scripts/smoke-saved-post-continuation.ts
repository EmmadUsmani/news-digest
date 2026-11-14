// Explicit offline bookmark fixtures; no server writes or external requests.
import assert from 'node:assert/strict';

import { chromium, expect } from 'playwright/test';

import {
  boundBookmarkCopy,
  emptyStore,
  storageKey,
} from '../apps/web/src/reader-preference-store';

async function main() {
  const origin = 'http://127.0.0.1:8000';
  const store = emptyStore();
  const platforms = [
    [
      'bluesky',
      'https://bsky.app/profile/example.test/post/offline',
      'Bluesky',
    ],
    ['reddit', 'https://www.reddit.com/r/example/comments/offline', 'Reddit'],
    ['x', 'https://x.com/example/status/123456789', 'X'],
  ] as const;
  const fullText =
    'Offline fixture: a long post saved for later reading. '.repeat(20);
  for (const [platform, url] of platforms) {
    for (const complete of [false, true]) {
      const title = `Offline ${platform} ${complete ? 'complete' : 'clipped'}`;
      const copy = boundBookmarkCopy({
        title,
        url,
        attribution: 'Explicit offline fixture',
        excerpt: complete ? 'A complete short post.' : fullText,
        platform,
        editionId: '00000000-0000-4000-8000-000000000001',
      });
      assert.ok(copy);
      if (!complete) {
        assert.ok(copy.excerpt.length <= 600 && copy.excerpt.endsWith('…'));
        assert.ok(fullText.startsWith(copy.excerpt.slice(0, -1)));
      }
      store.bookmarks[`post:${platform}-${complete}`] = {
        updatedAt: 1,
        copy,
      };
    }
  }
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
        await context.addInitScript(
          ({ key, value }) => {
            if (!localStorage.getItem(key)) localStorage.setItem(key, value);
          },
          { key: storageKey, value: JSON.stringify(store) },
        );
        await context.route('**/*', (route) => {
          assert.ok(['GET', 'HEAD'].includes(route.request().method()));
          return new URL(route.request().url()).origin === origin
            ? route.continue()
            : route.abort();
        });
        const page = await context.newPage();
        const errors: string[] = [];
        page.on('pageerror', (error) => errors.push(error.message));
        await page.goto(`${origin}/saved`);
        for (const [platform, url, label] of platforms) {
          const card = page.getByRole('listitem').filter({
            has: page.getByRole('link', {
              name: `Offline ${platform} clipped`,
              exact: true,
            }),
          });
          const link = card.getByRole('link', {
            name: `Continue reading: Offline ${platform} clipped`,
            exact: true,
          });
          await expect(link).toHaveText(`Continue reading on ${label}`);
          await expect(link).toHaveAttribute('href', url);
          await expect(link).toHaveAttribute('target', '_blank');
          await link.focus();
          await expect(link).toBeFocused();
          await expect(card.locator('.post-text')).toHaveText(
            store.bookmarks[`post:${platform}-false`].copy!.excerpt,
          );
          const complete = page.getByRole('listitem').filter({
            has: page.getByRole('link', {
              name: `Offline ${platform} complete`,
              exact: true,
            }),
          });
          await expect(
            complete.getByRole('link', { name: /Continue reading/ }),
          ).toHaveCount(0);
        }
        await page.reload();
        await expect(
          page.getByRole('link', { name: /^Continue reading:/ }),
        ).toHaveCount(3);
        assert.equal(
          await page.evaluate((key) => localStorage.getItem(key), storageKey),
          JSON.stringify(store),
        );
        assert.ok(
          await page.evaluate(
            () => document.documentElement.scrollWidth <= innerWidth,
          ),
        );
        await page.screenshot({
          path: `docs/screenshots/ui/saved-post-continuation-${device}-${theme}.png`,
          fullPage: true,
        });
        assert.deepEqual(errors, []);
        await context.close();
        console.log(
          `${device}/${theme}: three clipped platforms, complete controls, focus, reload and layout pass`,
        );
      }
    }
  } finally {
    await browser.close();
  }
}
void main();
