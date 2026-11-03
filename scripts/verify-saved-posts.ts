// Explicit live, read-only browser evidence. Never generates an edition or calls an LLM.
import assert from 'node:assert/strict';

import { digestPreviewSchema } from '@digest/contracts';
import { chromium } from 'playwright';

async function main() {
  const editionId = process.argv[2];
  assert.match(
    editionId ?? '',
    /^[a-f0-9-]{36}$/i,
    'Pass an existing edition UUID',
  );
  const base = 'http://127.0.0.1:8000';
  const response = await fetch(`${base}/api/digest-previews/${editionId}`);
  assert.equal(response.status, 200);
  const edition = digestPreviewSchema.parse(await response.json());
  const browser = await chromium.launch({ headless: true });
  try {
    for (const [view, width] of [
      ['desktop', 1440],
      ['mobile', 390],
    ] as const) {
      const page = await browser.newPage({ viewport: { width, height: 1000 } });
      // Block writes to the app, and all parked Reddit requests. External official
      // X widgets remain live; no fabricated embed responses or API fixtures.
      await page.route('**/*', async (route) => {
        const request = route.request();
        const url = new URL(request.url());
        if (
          /(^|\.)reddit\.com$/.test(url.hostname) ||
          (url.origin === base && !['GET', 'HEAD'].includes(request.method()))
        )
          return route.abort();
        return route.continue();
      });
      const errors: { name: string; officialWidget: boolean }[] = [];
      page.on('pageerror', (error) =>
        errors.push({
          name: error.name,
          officialWidget:
            !!error.stack?.includes('https://platform.twitter.com/embed/') &&
            !error.stack.includes(`${base}/assets/`),
        }),
      );
      await page.goto(`${base}/?edition=${editionId}`);
      await page.locator('.digest-topic').last().waitFor();
      assert.equal(
        await page.locator('.digest-topic').count(),
        edition.topics.length,
      );
      for (const [index, topic] of edition.topics.entries()) {
        const section = page.locator('.digest-topic').nth(index);
        const posts = section.locator('.top-posts');
        const cards = posts.locator('.post-card');
        assert.equal(await cards.count(), topic.posts.length);
        const outcomes = [];
        for (let i = 0; i < topic.posts.length; i++) {
          const card = cards.nth(i);
          await card.scrollIntoViewIfNeeded();
          if (topic.posts[i].platform !== 'x') continue;
          await card
            .locator('.saved-post-text, .post-embed-status')
            .waitFor({ timeout: 35000 });
          const iframe = card.locator('.official-post iframe');
          const embedded = (await iframe.count()) > 0;
          const frame = embedded
            ? await iframe.elementHandle().then((el) => el?.contentFrame())
            : null;
          const media = frame
            ? await frame
                .locator('img')
                .evaluateAll(
                  (images) =>
                    images.filter(
                      (image) =>
                        image.src.includes('/media/') &&
                        image.complete &&
                        image.naturalWidth > 0,
                    ).length,
                )
            : 0;
          outcomes.push({
            id: topic.posts[i].externalId,
            embedded,
            loadedMediaImages: media,
          });
        }
        // Capture the viewport, not a tall offscreen section: X may stop painting
        // offscreen iframe contents even after successful media loading.
        await posts.evaluate((element) =>
          element.scrollIntoView({ block: 'start' }),
        );
        await page.waitForTimeout(1000);
        assert.ok(
          await page.evaluate(
            () => document.documentElement.scrollWidth <= window.innerWidth,
          ),
          'No horizontal page overflow',
        );
        const slug = topic.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
        await page.screenshot({
          path: `docs/screenshots/saved-${edition.id.slice(0, 8)}-${slug}-${view}.png`,
        });
        console.log(
          JSON.stringify({
            editionId,
            view,
            topic: topic.name,
            posts: topic.posts.length,
            outcomes,
          }),
        );
      }
      console.log(
        JSON.stringify({
          view,
          officialWidgetErrors: errors.filter((error) => error.officialWidget)
            .length,
        }),
      );
      assert.deepEqual(
        errors.filter((error) => !error.officialWidget),
        [],
        'No uncaught app errors',
      );
      await page.close();
    }
  } finally {
    await browser.close();
  }
}
main().catch((error: unknown) => {
  console.error(error);
  process.exitCode = 1;
});
