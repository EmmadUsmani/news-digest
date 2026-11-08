// Published content only; external requests blocked and no server writes.
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
          viewport: { width, height: 900 },
          colorScheme: theme,
          reducedMotion: 'reduce',
          hasTouch: true,
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
        await page.evaluate(() => document.fonts.ready);
        const summaries = page.locator('.post-context summary');
        const normalize = (value: string) =>
          value.trim().replace(/\s+/g, ' ').toLowerCase();
        const notes = edition.topics.flatMap((topic) =>
          topic.posts.filter(
            (post) =>
              post.whyItMatters?.trim() &&
              ![
                post.platform === 'reddit' ? post.title : post.text,
                post.displayText,
              ].some(
                (text) =>
                  text && normalize(text) === normalize(post.whyItMatters!),
              ),
          ),
        );
        assert.ok(notes.length > 0);
        await expect(summaries).toHaveCount(notes.length);
        for (let index = 0; index < notes.length; index++) {
          const link = summaries.nth(index);
          await expect(link.locator('.post-context-text')).toHaveText(
            notes[index].whyItMatters!,
          );
          const bounds = await link.boundingBox();
          assert.ok(bounds && bounds.height >= 44 && bounds.width >= 44);
        }
        const first = summaries.first();
        await first.scrollIntoViewIfNeeded();
        await first.focus();
        await page.keyboard.press('Tab');
        await page.keyboard.press('Shift+Tab');
        await expect(first).toBeFocused();
        assert.equal(
          await first.evaluate((node) => getComputedStyle(node).outlineStyle),
          'solid',
        );
        await page.keyboard.press('Enter');
        await expect(first.locator('..')).toHaveAttribute('open', '');
        assert.ok(
          await first
            .locator('.post-context-text')
            .evaluate((node) => node.scrollWidth <= node.clientWidth),
        );
        await page.keyboard.press('Space');
        await expect(first.locator('..')).not.toHaveAttribute('open', '');
        await first.tap();
        await expect(first.locator('..')).toHaveAttribute('open', '');
        assert.ok(
          await page.evaluate(
            () => document.documentElement.scrollWidth <= innerWidth,
          ),
        );
        await page
          .locator('.post-card')
          .filter({ has: first })
          .first()
          .screenshot({
            path: `docs/screenshots/ui/reader-context-targets-${width}-${theme}.png`,
          });
        assert.deepEqual(errors, []);
        await context.close();
        console.log(
          `${width}/${theme}: ${notes.length} published post notes retain context and have 44px targets; touch expansion, keyboard toggle/focus and overflow pass`,
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
