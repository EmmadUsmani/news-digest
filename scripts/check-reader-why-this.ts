// Read-only live reader check; no model calls or edition changes.
import assert from 'node:assert/strict';
import { mkdir } from 'node:fs/promises';

import { readerEditionSchema } from '@digest/contracts';
import { chromium } from 'playwright';

async function main() {
  const origin = 'http://127.0.0.1:8000';
  const headers = { 'X-Forwarded-For': '192.0.2.158' };
  const response = await fetch(`${origin}/api/editions/latest`, { headers });
  assert.equal(response.status, 200);
  const edition = readerEditionSchema.parse(await response.json());
  const story = edition.topics
    .flatMap((topic) => topic.stories)
    .find((item) => item.selectionReason);
  const post = edition.topics
    .flatMap((topic) => topic.posts)
    .find((item) => item.selectionReason);
  assert.ok(
    story,
    'published edition must contain a saved story editor reason',
  );
  assert.ok(post, 'published edition must contain a saved post editor reason');
  const browser = await chromium.launch();
  await mkdir('docs/screenshots/ui', { recursive: true });
  try {
    for (const width of [390, 1440]) {
      for (const theme of ['light', 'dark'] as const) {
        const page = await browser.newPage({
          viewport: { width, height: 1000 },
          colorScheme: theme,
          extraHTTPHeaders: headers,
        });
        const errors: string[] = [];
        page.on('pageerror', (error) => errors.push(error.message));
        // Avoid third-party embeds; the real saved post text and disclosure remain visible.
        await page.route('**/*', (route) =>
          new URL(route.request().url()).origin === origin
            ? route.continue()
            : route.abort(),
        );
        await page.goto(`${origin}/editions/${edition.id}`);
        for (const [kind, id, reason] of [
          ['story', `story-${story.id}`, story.selectionReason],
          [
            'post',
            `post-${encodeURIComponent(JSON.stringify([post.platform, post.externalId]))}`,
            post.selectionReason,
          ],
        ] as const) {
          const card = page.locator(`[id="${id}"]`);
          const summary = card
            .locator('summary')
            .filter({ hasText: 'Why this' });
          await summary.waitFor();
          const details = summary.locator('..');
          assert.equal(await details.getAttribute('open'), null);
          await summary.focus();
          await page.keyboard.press('Enter');
          assert.notEqual(await details.getAttribute('open'), null);
          assert.equal(await details.locator('p').textContent(), reason);
          await summary.scrollIntoViewIfNeeded();
          assert.ok(
            await page.evaluate(
              () => document.documentElement.scrollWidth <= innerWidth,
            ),
            'no horizontal overflow',
          );
          await page.screenshot({
            path: `docs/screenshots/ui/why-this-live-${kind}-${width}-${theme}.png`,
          });
          await summary.click();
          assert.equal(await details.getAttribute('open'), null);
        }
        assert.deepEqual(errors, []);
        console.log(
          `Live ${edition.id}, ${width}px ${theme}: saved story/post reasons, collapsed defaults, keyboard/click, no overflow/errors`,
        );
        await page.close();
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
