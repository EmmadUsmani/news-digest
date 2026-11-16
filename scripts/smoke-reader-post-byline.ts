// Published content only; GET/HEAD requests, with external traffic blocked.
import assert from 'node:assert/strict';

import { readerEditionSchema } from '@digest/contracts';
import { chromium, expect } from 'playwright/test';

async function smoke() {
  const origin = 'http://127.0.0.1:8000';
  const browser = await chromium.launch();
  try {
    for (const width of [1440, 390, 320]) {
      for (const theme of ['light', 'dark'] as const) {
        const context = await browser.newContext({
          // Loopback probe of trusted-proxy visitor admission; grants no identity.
          extraHTTPHeaders: { 'X-Forwarded-For': '192.0.2.161' },
          viewport: { width, height: 900 },
          colorScheme: theme,
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
        const cards = page.locator('.post-card').filter({
          has: page.locator('.byline a:has(time)'),
        });
        await expect(cards.first()).toBeVisible();
        const publishedPosts = edition.topics.flatMap((topic) => topic.posts);
        assert.ok(publishedPosts.length > 0);
        await expect(cards).toHaveCount(publishedPosts.length);
        for (const card of await cards.all()) {
          const links = card.locator('.byline').first().locator('a');
          await expect(links).toHaveCount(2);
          for (const link of await links.all()) {
            await link.scrollIntoViewIfNeeded();
            const bounds = await link.boundingBox();
            assert.ok(bounds && bounds.width >= 44 && bounds.height >= 44);
            assert.ok(
              bounds.x >= -1 && bounds.x + bounds.width <= width + 1,
              'Author and timestamp links stay horizontally reachable at 200% text',
            );
            assert.match((await link.getAttribute('href'))!, /^https:\/\//);
            await expect(link).toHaveAttribute('target', '_blank');
            await link.focus();
            await page.keyboard.press('Tab');
            await page.keyboard.press('Shift+Tab');
            await expect(link).toBeFocused();
            assert.equal(
              await link.evaluate(
                (node) => getComputedStyle(node).outlineStyle,
              ),
              'solid',
            );
          }
        }
        const card = cards.first();
        assert.ok(
          await page.evaluate(
            () => document.documentElement.scrollWidth <= innerWidth,
          ),
        );
        await card.screenshot({
          path: `docs/screenshots/ui/reader-post-byline-${width}-${theme}.png`,
        });
        assert.deepEqual(errors, []);
        await context.close();
        console.log(
          `${width}/${theme}: published post author and timestamp targets/focus pass at 200% text`,
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
