// Real saved edition; GET-only browser check with external traffic blocked.
import assert from 'node:assert/strict';

import { readerEditionSchema } from '@digest/contracts';
import { chromium } from 'playwright';

const origin = 'http://127.0.0.1:8000';
async function main() {
  const edition = readerEditionSchema.parse(
    await (await fetch(`${origin}/api/editions/latest`)).json(),
  );
  const posts = edition.topics
    .flatMap((topic) => topic.posts)
    .filter((post) => post.platform === 'x' || post.platform === 'bluesky');
  assert.ok(posts.some((post) => post.platform === 'x'));
  assert.ok(posts.some((post) => post.platform === 'bluesky'));
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
          assert.equal(route.request().method(), 'GET');
          const url = new URL(route.request().url());
          if (url.origin !== origin) return route.abort();
          if (url.pathname === '/api/editions/latest')
            return route.fulfill({ json: edition });
          return route.continue();
        });
        await page.goto(origin);
        await page.locator('.post-card').first().waitFor();
        for (const post of posts) {
          const platform = post.platform === 'x' ? 'X' : 'Bluesky';
          const time = page
            .locator('.post-card .byline a')
            .filter({
              has: page.locator(`time[datetime="${post.publishedAt}"]`),
            })
            .filter({ visible: true });
          // Match destination too: unrelated posts can share publication times.
          const link = time.locator(`xpath=self::a[@href="${post.url}"]`);
          assert.equal(await link.count(), 1);
          const exactDate = await link
            .locator('time')
            .getAttribute('aria-label');
          assert.ok(exactDate);
          assert.equal(
            await page
              .getByRole('link', {
                name: `View post on ${platform} · ${exactDate}`,
                exact: true,
              })
              .filter({
                has: page.locator(`time[datetime="${post.publishedAt}"]`),
              })
              .count(),
            1,
          );
          await link.focus();
          assert.ok(
            await link.evaluate((node) => document.activeElement === node),
          );
          assert.ok(
            await link.evaluate((node) => node.scrollWidth <= node.clientWidth),
          );
        }
        await page
          .locator('.bluesky-card')
          .first()
          .screenshot({
            path: `docs/screenshots/ui/reader-post-timestamp-${device}-${theme}.png`,
          });
        assert.deepEqual(errors, []);
        await page.close();
      }
    }
    console.log(
      `${posts.length} saved post timestamps expose platform, exact date and destination; keyboard focus passes desktop/mobile light/dark. GET-only, no external calls.`,
    );
  } finally {
    await browser.close();
  }
}
void main();
