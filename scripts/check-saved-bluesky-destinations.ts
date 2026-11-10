// GET-only saved-content check; blocks third-party requests and all writes.
import assert from 'node:assert/strict';

import { readerEditionSchema } from '@digest/contracts';
import { chromium } from 'playwright';
import { z } from 'zod';

async function main() {
  const id = z.string().uuid().parse(process.argv[2]);
  const origin = 'http://127.0.0.1:8000';
  const response = await fetch(`${origin}/api/editions/${id}`, {
    redirect: 'error',
    signal: AbortSignal.timeout(10000),
  });
  assert.equal(response.status, 200);
  const edition = readerEditionSchema.parse(await response.json());
  const saved = edition.topics
    .flatMap((topic) => topic.posts)
    .filter((post) => post.platform === 'bluesky');
  assert.ok(saved.length, 'Edition must contain saved Bluesky posts');
  const browser = await chromium.launch();
  try {
    for (const width of [1440, 390]) {
      for (const theme of ['light', 'dark'] as const) {
        const page = await browser.newPage({
          viewport: { width, height: 1100 },
          colorScheme: theme,
          serviceWorkers: 'block',
        });
        const errors: string[] = [];
        page.on('pageerror', (error) => errors.push(error.message));
        await page.route('**/*', (route) => {
          const request = route.request();
          if (
            new URL(request.url()).origin !== origin ||
            !['GET', 'HEAD'].includes(request.method())
          )
            return route.abort();
          return route.continue();
        });
        await page.goto(`${origin}/editions/${id}`);
        await page.locator('.digest-topic').last().waitFor();
        assert.equal(await page.locator('.bluesky-card').count(), saved.length);
        for (const [index, post] of saved.entries()) {
          const card = page.locator('.bluesky-card').nth(index);
          const text = card.locator('.post-text');
          const expected = post.displayText ?? post.text;
          assert.equal(await text.textContent(), expected);
          const original = card
            .locator('.byline a')
            .filter({ has: page.locator('time') });
          assert.equal(await original.getAttribute('href'), post.url);
          const destinations = expected.match(/https?:\/\/[^\s<>]+/g) ?? [];
          for (const url of destinations) {
            const link = text.getByRole('link', { name: url, exact: true });
            assert.equal(await link.getAttribute('href'), url);
            assert.equal(await link.getAttribute('target'), '_blank');
          }
          assert.equal(await card.locator('a a').count(), 0);
          await card.scrollIntoViewIfNeeded();
          assert.ok(
            await card.evaluate((node) => node.scrollWidth <= node.clientWidth),
          );
          await card.screenshot({
            path: `docs/screenshots/saved-${id.slice(0, 8)}-bluesky-${index}-${width}-${theme}.png`,
          });
          console.log(
            JSON.stringify({
              width,
              theme,
              id: post.externalId,
              original: post.url,
              destinations,
            }),
          );
        }
        assert.deepEqual(errors, []);
        await page.close();
      }
    }
  } finally {
    await browser.close();
  }
}
void main();
