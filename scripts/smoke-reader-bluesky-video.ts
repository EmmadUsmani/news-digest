// Saved edition with synthetic media variants; no external requests or writes.
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
    ] as const) {
      for (const theme of ['light', 'dark'] as const) {
        for (const count of [1]) {
          post.media = Array.from({ length: count }, (_, index) => ({
            type: 'video' as const,
            playlist: 'https://video.bsky.app/synthetic/playlist.m3u8',
            thumbnail: `https://cdn.bsky.app/media-grid-${index}.svg`,

            alt: `Synthetic layout image ${index + 1}`,
          }));
          readerEditionSchema.parse(edition);
          const page = await browser.newPage({
            viewport: { width, height },
            colorScheme: theme,
          });
          await page.route('**/*', (route) => {
            const url = new URL(route.request().url());
            assert.equal(route.request().method(), 'GET');
            if (url.pathname.startsWith('/media-grid-'))
              return route.fulfill({
                contentType: 'image/svg+xml',
                body: '<svg xmlns="http://www.w3.org/2000/svg" width="900" height="450"><rect width="900" height="450" fill="#537a95"/><text x="40" y="220" fill="white" font-size="40">Synthetic media layout</text></svg>',
              });
            if (url.origin !== origin) return route.abort();
            if (url.pathname === '/api/editions/latest')
              return route.fulfill({ json: edition });
            return route.continue();
          });
          await page.goto(origin);
          const card = page.locator('.bluesky-card').first();
          await card.scrollIntoViewIfNeeded();
          const grid = card.locator('.bluesky-media');
          await grid
            .locator('img')
            .first()
            .evaluate(async (img: HTMLImageElement) => img.decode());
          const boxes = await grid.locator('a').evaluateAll((nodes) =>
            nodes.map((node) => {
              const rect = node.getBoundingClientRect();
              return { x: rect.x, y: rect.y, width: rect.width };
            }),
          );
          const videoLink = grid.locator('a').first();
          assert.equal(await videoLink.getAttribute('href'), post.url);
          assert.equal(await videoLink.getAttribute('target'), '_blank');
          await videoLink.getByText('Watch video on Bluesky ↗').waitFor();
          const play = videoLink.locator('[aria-hidden="true"]');
          assert.equal(await play.innerText(), '▶');
          assert.equal(
            await play.evaluate((node) => getComputedStyle(node).position),
            'absolute',
          );
          const gridWidth = await grid.evaluate((node) => node.clientWidth);
          if (count === 1 || device === 'mobile')
            assert.ok(
              Math.abs(boxes[0].width - gridWidth) < 2,
              'Single image and mobile images fill the row',
            );
          assert.ok(
            await card.evaluate((node) => node.scrollWidth <= node.clientWidth),
          );
          if (count === 1)
            await card.screenshot({
              path: `docs/screenshots/ui/reader-bluesky-video-${device}-${theme}.png`,
            });
          await page.close();
        }
      }
    }
    console.log(
      'Bluesky synthetic video: play cue and original links passed desktop/mobile light/dark; external requests blocked.',
    );
  } finally {
    await browser.close();
  }
}
void main();
