// Saved edition with synthetic URL punctuation; GET-only, third-party requests blocked.
import assert from 'node:assert/strict';

import { readerEditionSchema } from '@digest/contracts';
import { chromium } from 'playwright';

async function main() {
  const origin = 'http://127.0.0.1:8000';
  const headers = { 'X-Forwarded-For': '192.0.2.158' };
  const response = await fetch(`${origin}/api/editions/latest`, { headers });
  assert.equal(response.status, 200);
  const edition = readerEditionSchema.parse(await response.json());
  const post = edition.topics
    .flatMap((t) => t.posts)
    .find((p) => p.platform === 'bluesky');
  assert.ok(post?.platform === 'bluesky');
  const browser = await chromium.launch();
  try {
    for (const [device, width, height] of [
      ['desktop', 1440, 1100],
      ['mobile', 390, 844],
    ] as const)
      for (const theme of ['light', 'dark'] as const) {
        const page = await browser.newPage({
          viewport: { width, height },
          colorScheme: theme,
          extraHTTPHeaders: headers,
        });
        const errors: string[] = [];
        page.on('pageerror', (e) => errors.push(e.message));
        let text = '';
        await page.route('**/*', (route) => {
          assert.ok(['GET', 'HEAD'].includes(route.request().method()));
          const url = new URL(route.request().url());
          if (url.origin !== origin) return route.abort();
          if (url.pathname === '/api/editions/latest')
            return route.fulfill({ json: edition });
          return route.continue();
        });
        for (const [input, expected] of [
          ['See https://example.com/report…).', post.url],
          ['See https://example.com/report...!', post.url],
          ['See “https://example.com/report…”', post.url],
          ['See https://example.com/report…', post.url],
          ['See https://example.com/report.', 'https://example.com/report'],
          [
            'See https://example.com/wiki/Report_(2026).',
            'https://example.com/wiki/Report_(2026)',
          ],
        ] as const) {
          text = input;
          post.displayText = text;
          await page.goto(origin);
          const card = page.locator('.bluesky-card').first();
          const body = card.locator('.post-text');
          await body.waitFor();
          assert.equal(await body.innerText(), text);
          const link = body.locator('a.underline');
          assert.equal(await link.getAttribute('href'), expected, input);
          if (expected === post.url)
            assert.equal(
              await link.getAttribute('title'),
              'Open original post for the full link',
            );
          await link.focus();
          assert.equal(
            await link.evaluate((n) => n === document.activeElement),
            true,
          );
          assert.ok(
            await page.evaluate(
              () => document.documentElement.scrollWidth <= innerWidth,
            ),
          );
          if (input.endsWith('…).')) {
            await card.scrollIntoViewIfNeeded();
            await card.screenshot({
              path: `docs/screenshots/ui/reader-clipped-punctuation-${device}-${theme}.png`,
            });
          }
        }
        assert.deepEqual(errors, []);
        await page.close();
        console.log(
          `${device}/${theme}: synthetic clipped punctuation and complete URL controls pass; text, keyboard and layout preserved`,
        );
      }
  } finally {
    await browser.close();
  }
}
void main().catch((error: unknown) => {
  console.error(error);
  process.exitCode = 1;
});
