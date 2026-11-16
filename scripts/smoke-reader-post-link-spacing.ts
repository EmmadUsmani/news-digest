// Real archived Gaming post; GET-only replay, external requests blocked.
import assert from 'node:assert/strict';

import { readerEditionSchema } from '@digest/contracts';
import { chromium } from 'playwright';

async function main() {
  const origin = 'http://127.0.0.1:8000';
  const headers = { 'X-Forwarded-For': '192.0.2.158' };
  const response = await fetch(
    `${origin}/api/editions/b9d55088-892a-4e34-b77c-a398d64c6a9f`,
    { headers },
  );
  assert.equal(response.status, 200);
  const edition = readerEditionSchema.parse(await response.json());
  const post = edition.topics
    .flatMap((topic) => topic.posts)
    .find(
      (candidate) =>
        candidate.platform === 'x' &&
        candidate.displayText?.includes(
          'https://t.co/SirkNLVto2 pic.twitter.com/BeLskoe2YX',
        ),
    );
  assert.ok(
    post?.platform === 'x',
    'Real saved reminder/media link pair required',
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
          extraHTTPHeaders: headers,
        });
        const errors: string[] = [];
        page.on('pageerror', (error) => errors.push(error.message));
        await page.route('**/*', (route) => {
          assert.equal(route.request().method(), 'GET');
          const url = new URL(route.request().url());
          if (url.origin !== origin) return route.abort();
          if (url.pathname === '/api/editions/latest')
            return route.fulfill({ json: edition });
          return route.continue();
        });
        await page.goto(origin);
        const card = page.locator(
          `[id="post-${encodeURIComponent(JSON.stringify(['x', post.externalId]))}"]`,
        );
        const body = card.locator('.post-text');
        await body.waitFor();
        assert.equal(await body.textContent(), post.displayText);
        const links = body.locator('a');
        for (const link of await links.all()) {
          assert.ok(
            (await link.textContent())?.trim(),
            'Post text must not contain unnamed whitespace links',
          );
        }
        const reminder = body.locator('a[href="https://t.co/SirkNLVto2"]');
        const media = body.locator(
          'a[href="https://pic.twitter.com/BeLskoe2YX"]',
        );
        await reminder.focus();
        await page.keyboard.press('Tab');
        assert.equal(
          await media.evaluate((node) => document.activeElement === node),
          true,
          'Tab must move directly from reminder to media',
        );
        assert.ok(
          await page.evaluate(
            () => document.documentElement.scrollWidth <= innerWidth,
          ),
        );
        await card.scrollIntoViewIfNeeded();
        await card.screenshot({
          path: `docs/screenshots/ui/post-link-spacing-${device}-${theme}.png`,
        });
        assert.deepEqual(errors, []);
        await page.close();
        console.log(
          `${device}/${theme}: real archived post preserves text and URLs; no empty link or keyboard stop`,
        );
      }
    }
  } finally {
    await browser.close();
  }
}
void main().catch((error: unknown) => {
  console.error(error);
  process.exitCode = 1;
});
