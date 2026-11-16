// Published content only; external requests blocked and no server writes.
import assert from 'node:assert/strict';

import { readerEditionSchema } from '@digest/contracts';
import { chromium, expect } from 'playwright/test';

async function smoke() {
  const origin = 'http://127.0.0.1:8000';
  // Loopback probe of trusted-proxy visitor admission; grants no identity.
  const headers = { 'X-Forwarded-For': '192.0.2.162' };
  const browser = await chromium.launch();
  try {
    for (const width of [1440, 390, 320]) {
      for (const theme of ['light', 'dark'] as const) {
        const context = await browser.newContext({
          extraHTTPHeaders: headers,
          viewport: { width, height: 900 },
          colorScheme: theme,
          reducedMotion: 'reduce',
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
        const response = await context.request.get(
          `${origin}/api/editions/latest`,
        );
        assert.equal(response.status(), 200);
        const edition = readerEditionSchema.parse(await response.json());
        await page.goto(origin);
        await page.addStyleTag({
          content: 'html { font-size: 200% !important; }',
        });
        await page.evaluate(() => document.fonts.ready);
        const cards = page.locator('.post-card');
        const paragraphs = cards.locator('.post-text');
        const links = paragraphs.locator('a');
        const posts = edition.topics.flatMap((topic) => topic.posts);
        const textPosts = posts.filter(
          (post) => post.platform === 'x' || post.platform === 'bluesky',
        );
        assert.ok(textPosts.length > 0);
        await expect(paragraphs).toHaveCount(textPosts.length);
        for (let index = 0; index < textPosts.length; index++) {
          const post = textPosts[index];
          await expect(paragraphs.nth(index)).toHaveText(
            post.displayText ?? post.text,
          );
        }
        const count = await links.count();
        assert.ok(count >= textPosts.length);
        for (let index = 0; index < count; index++) {
          const link = links.nth(index);
          const href = await link.getAttribute('href');
          assert.ok(href && /^https?:/.test(href));
          await expect(link).toHaveAttribute('target', '_blank');
          await link.scrollIntoViewIfNeeded();
          const fragments = await link.evaluate((node) =>
            Array.from(node.getClientRects(), (rect) => ({
              left: rect.left,
              right: rect.right,
            })),
          );
          assert.ok(fragments.length > 0);
          assert.ok(
            fragments.every(
              (rect) => rect.left >= -1 && rect.right <= width + 1,
            ),
          );
          const bounds = await link.boundingBox();
          assert.ok(bounds && bounds.height > 0 && bounds.width > 0);
          assert.ok(
            bounds.x >= -1 && bounds.x + bounds.width <= width + 1,
            'Published post text links stay horizontally reachable at 200% text',
          );
          await link.focus();
          await page.keyboard.press('Tab');
          await page.keyboard.press('Shift+Tab');
          await expect(link).toBeFocused();
        }
        const first = links.first();
        await first.scrollIntoViewIfNeeded();
        await first.focus();
        await page.keyboard.press('Tab');
        await page.keyboard.press('Shift+Tab');
        await expect(first).toBeFocused();
        assert.equal(
          await first.evaluate((node) => getComputedStyle(node).outlineStyle),
          'solid',
        );
        assert.ok(
          await page.evaluate(
            () => document.documentElement.scrollWidth <= innerWidth,
          ),
        );
        await page
          .locator('.post-card')
          .first()
          .screenshot({
            style: 'header, .fixed { visibility: hidden !important; }',
            path: `docs/screenshots/ui/reader-post-text-links-${width}-${theme}.png`,
          });
        assert.deepEqual(errors, []);
        await context.close();
        console.log(
          `${width}/${theme}: ${textPosts.length} published post texts/${count} inline links retain text at 200%; horizontal bounds, keyboard focus and overflow pass`,
        );
      }
    }
  } finally {
    await browser.close();
  }
}
void smoke().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
