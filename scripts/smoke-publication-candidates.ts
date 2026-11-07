// Supply the read-only inventory JSON; reuse it against the future flagged app.
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

import { readerEditionSchema } from '@digest/contracts';
import { chromium, expect } from 'playwright/test';

async function main() {
  assert.ok(
    process.argv[2],
    'usage: smoke-publication-candidates.ts inventory.json [origin]',
  );
  const inventory = JSON.parse(await readFile(process.argv[2], 'utf8'));
  const candidates = inventory.editions.filter(
    (edition: { proposedPublication: { publishedAt: string | null } }) =>
      edition.proposedPublication.publishedAt !== null,
  ) as { id: string; topics: number; stories: number; posts: number }[];
  assert.ok(
    candidates.length > 0,
    'inventory must contain published candidates',
  );
  const origin = new URL(process.argv[3] ?? 'http://127.0.0.1:8000').origin;
  const browser = await chromium.launch();
  try {
    for (const [device, width, height] of [
      ['desktop', 1440, 1100],
      ['mobile', 390, 844],
    ] as const) {
      for (const theme of ['light', 'dark'] as const) {
        const context = await browser.newContext({
          viewport: { width, height },
          colorScheme: theme,
        });
        context.setDefaultTimeout(15_000);
        const errors: string[] = [],
          writes: string[] = [];
        await context.route('**/*', (route) => {
          if (!['GET', 'HEAD'].includes(route.request().method())) {
            writes.push(route.request().method());
            return route.abort();
          }
          return new URL(route.request().url()).origin === origin
            ? route.continue()
            : route.abort();
        });
        const page = await context.newPage();
        page.on('pageerror', (error) => errors.push(error.message));
        for (const candidate of candidates) {
          const response = await context.request.get(
            `${origin}/api/editions/${candidate.id}`,
          );
          assert.equal(response.status(), 200);
          const edition = readerEditionSchema.parse(await response.json());
          assert.equal(edition.id, candidate.id);
          assert.equal(edition.topics.length, candidate.topics);
          assert.equal(
            edition.topics.reduce(
              (sum, topic) => sum + topic.stories.length,
              0,
            ),
            candidate.stories,
          );
          assert.equal(
            edition.topics.reduce((sum, topic) => sum + topic.posts.length, 0),
            candidate.posts,
          );
          await page.goto(`${origin}/editions/${candidate.id}`);
          await expect(page.locator('h2[id^="topic-"]')).toHaveCount(
            candidate.topics,
          );
          await expect(page.locator('[id^="story-"]')).toHaveCount(
            candidate.stories,
          );
          await expect(page.locator('.post-card')).toHaveCount(candidate.posts);
          for (const topic of edition.topics) {
            const section = page
              .locator(`article.digest-topic`)
              .filter({ has: page.locator(`[id="topic-${topic.id}"]`) });
            await expect(section.locator('[id^="story-"]')).toHaveCount(
              topic.stories.length,
            );
            await expect(section.locator('.post-card')).toHaveCount(
              topic.posts.length,
            );
            for (const story of topic.stories) {
              await expect(
                section.locator(`[id="story-${story.id}"]`),
              ).toContainText(story.title);
            }
          }
          assert.ok(
            await page.evaluate(
              () => document.documentElement.scrollWidth <= innerWidth,
            ),
            `${candidate.id} ${device}/${theme}: page overflow`,
          );
        }
        assert.deepEqual(errors, []);
        assert.deepEqual(writes, []);
        await context.close();
      }
    }
    console.log(
      `${candidates.length} actual edition candidates: API/inventory and per-topic rendered counts match on desktop/mobile light/dark; external requests blocked, no writes.`,
    );
  } finally {
    await browser.close();
  }
}
void main();
