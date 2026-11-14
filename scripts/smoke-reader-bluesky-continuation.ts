// GET-only real saved editions; block third-party media and embeds.
import assert from 'node:assert/strict';

import { readerEditionSchema } from '@digest/contracts';
import { chromium, expect } from 'playwright/test';

async function main() {
  const origin = 'http://127.0.0.1:8000';
  const edition = readerEditionSchema.parse(
    await (
      await fetch(`${origin}/api/editions/0b73eb47-19cf-48e8-8190-f9500c140fa4`)
    ).json(),
  );
  const posts = edition.topics
    .flatMap((topic) => topic.posts)
    .filter((post) => post.platform === 'bluesky');
  const clipped = posts.filter((post) =>
    /(?:…|\.{3})\s*$/.test(post.displayText ?? post.text),
  );
  assert.equal(
    clipped.length,
    2,
    'Saved survey and news source URLs are clipped',
  );
  const complete = posts.filter((post) => !clipped.includes(post));
  assert.ok(complete.length, 'Complete saved posts provide a negative control');
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
          const url = new URL(route.request().url());
          if (url.origin !== origin) return route.abort();
          if (url.pathname === '/api/editions/latest')
            return route.fulfill({ json: edition });
          return route.continue();
        });
        await page.goto(origin);
        for (const post of [...clipped, ...complete]) {
          const card = page.locator('.bluesky-card').filter({
            has: page.locator(`.byline a[href="${post.url}"]`),
          });
          await expect(card.locator('.post-text')).toHaveText(
            post.displayText ?? post.text,
          );
          const link = card.getByRole('link', {
            name: /^Continue reading on Bluesky /,
          });
          if (!clipped.includes(post)) {
            await expect(link).toHaveCount(0);
            continue;
          }
          await expect(link).toHaveAttribute('href', post.url);
          await expect(link).toHaveAttribute('target', '_blank');
          await expect(link).toHaveText('Continue reading on Bluesky');
          await link.focus();
          await expect(link).toBeFocused();
          assert.ok((await link.boundingBox())!.height >= 44);
          await card.screenshot({
            path: `docs/screenshots/ui/reader-bluesky-continuation-${clipped.indexOf(post)}-${device}-${theme}.png`,
          });
        }
        assert.equal(
          await page.evaluate(
            () => document.documentElement.scrollWidth > innerWidth,
          ),
          false,
        );
        assert.deepEqual(errors, []);
        await page.close();
      }
    }
    console.log(
      'Saved Bluesky continuation: two clipped posts and complete controls pass desktop/mobile light/dark; text, destinations, focus and layout preserved.',
    );
  } finally {
    await browser.close();
  }
}

main().catch((error: unknown) => {
  console.error(error);
  process.exitCode = 1;
});
