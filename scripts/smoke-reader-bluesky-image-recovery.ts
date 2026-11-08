// Saved edition with synthetic image failures; GET-only, external requests blocked.
import assert from 'node:assert/strict';

import { readerEditionSchema } from '@digest/contracts';
import { chromium } from 'playwright';

async function main() {
  const origin = 'http://127.0.0.1:8000';
  const edition = readerEditionSchema.parse(
    await (await fetch(`${origin}/api/editions/latest`)).json(),
  );
  const post = edition.topics
    .flatMap((topic) => topic.posts)
    .find((post) => post.platform === 'bluesky');
  assert.ok(post?.platform === 'bluesky', 'Requires a saved Bluesky post');
  const browser = await chromium.launch();
  try {
    for (const [device, width, height] of [
      ['desktop', 1440, 1100],
      ['mobile', 390, 844],
      ['narrow', 320, 844],
    ] as const) {
      for (const theme of ['light', 'dark'] as const) {
        for (const variant of [
          'loaded',
          'recovered',
          'failed',
          'same-url',
        ] as const) {
          const thumbnail = 'https://cdn.bsky.app/synthetic-thumb.svg';
          const fullsize =
            variant === 'same-url'
              ? thumbnail
              : 'https://cdn.bsky.app/synthetic-original.svg';
          post.media = [
            {
              type: 'image',
              thumbnail,
              fullsize,
              alt: 'Synthetic recovery image',
            },
          ];
          readerEditionSchema.parse(edition);
          const page = await browser.newPage({
            viewport: { width, height },
            colorScheme: theme,
            locale: 'en-US',
            timezoneId: 'UTC',
          });
          const requests: string[] = [];
          const errors: string[] = [];
          page.on('pageerror', (error) => errors.push(error.message));
          await page.route('**/*', (route) => {
            const url = new URL(route.request().url());
            assert.equal(route.request().method(), 'GET');
            if (url.href === thumbnail || url.href === fullsize) {
              requests.push(url.href);
              if (
                variant === 'failed' ||
                variant === 'same-url' ||
                (variant === 'recovered' && url.href === thumbnail)
              )
                return route.abort();
              return route.fulfill({
                contentType: 'image/svg+xml',
                body: '<svg xmlns="http://www.w3.org/2000/svg" width="900" height="450"><rect width="900" height="450" fill="#537a95"/><text x="40" y="220" fill="white" font-size="36">Synthetic recovered image</text></svg>',
              });
            }
            if (url.origin !== origin) return route.abort();
            if (url.pathname === '/api/editions/latest')
              return route.fulfill({ json: edition });
            return route.continue();
          });
          await page.goto(origin);
          const card = page.locator('.bluesky-card').first();
          await card.scrollIntoViewIfNeeded();
          const media = card.locator('.bluesky-media');
          if (variant === 'loaded' || variant === 'recovered') {
            const image = media.locator('img');
            await page.waitForFunction(
              (expected) => {
                const image = document.querySelector<HTMLImageElement>(
                  '.bluesky-card .bluesky-media img',
                );
                return (
                  image?.src === expected &&
                  image.complete &&
                  image.naturalWidth > 0
                );
              },
              variant === 'loaded' ? thumbnail : fullsize,
            );
            assert.equal(
              await image.getAttribute('alt'),
              'Synthetic recovery image',
            );
            assert.equal(
              await media
                .getByText('Image unavailable', { exact: false })
                .count(),
              0,
            );
          } else {
            await media
              .getByText('Image unavailable · Open image ↗', { exact: false })
              .waitFor();
            assert.equal(await media.locator('img').count(), 0);
          }
          assert.deepEqual(
            requests,
            variant === 'recovered' || variant === 'failed'
              ? [thumbnail, fullsize]
              : [thumbnail],
          );
          const link = media.locator('a');
          assert.equal(await link.getAttribute('href'), fullsize);
          const identity = `from ${post.author}, ${new Date(post.publishedAt).toLocaleString('en-US', { dateStyle: 'long', timeStyle: 'long', timeZone: 'UTC' })}`;
          assert.equal(
            await link.getAttribute('aria-label'),
            `Open image 1 ${identity} — Synthetic recovery image`,
          );
          await link.scrollIntoViewIfNeeded();
          const bounds = await link.boundingBox();
          assert.ok(bounds && bounds.height >= 44 && bounds.width >= 44);
          await link.focus();
          await page.keyboard.press('Tab');
          await page.keyboard.press('Shift+Tab');
          assert.equal(
            await link.evaluate((node) => getComputedStyle(node).outlineStyle),
            'solid',
          );
          assert.ok(
            await link.evaluate((node) => node === document.activeElement),
          );
          assert.ok(
            await card.evaluate((node) => node.scrollWidth <= node.clientWidth),
          );
          assert.deepEqual(errors, []);
          if (variant === 'recovered' || variant === 'failed')
            await card.screenshot({
              path: `docs/screenshots/ui/reader-bluesky-image-${variant}-${device}-${theme}.png`,
            });
          await page.close();
        }
      }
    }
    console.log(
      'Bluesky image recovery: 24 loaded/recovered/failed/same-URL cases passed desktop/mobile/narrow light/dark; GET-only, external requests blocked.',
    );
  } finally {
    await browser.close();
  }
}
void main();
