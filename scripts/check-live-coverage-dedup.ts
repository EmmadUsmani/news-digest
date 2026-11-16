// GET-only acceptance against the real saved Nov 15 edition over public HTTPS.
import assert from 'node:assert/strict';
import { Resolver } from 'node:dns/promises';

import { readerEditionSchema } from '@digest/contracts';
import { chromium } from 'playwright';

async function main() {
  const host = 'news-digest.exe.xyz';
  const origin = `https://${host}`;
  const resolver = new Resolver();
  resolver.setServers(['1.1.1.1']);
  const [address] = await resolver.resolve4(host);
  const browser = await chromium.launch({
    args: [`--host-resolver-rules=MAP ${host} ${address}`],
  });
  try {
    for (const width of [1440, 390]) {
      const page = await browser.newPage({ viewport: { width, height: 1000 } });
      const errors: string[] = [];
      page.on('pageerror', (error) => errors.push(error.message));
      await page.route('**/*', (route) => {
        assert.equal(route.request().method(), 'GET');
        return new URL(route.request().url()).origin === origin
          ? route.continue()
          : route.abort();
      });
      const editionId = 'a0fa3916-f1dc-4fbd-8d76-2884d5e01c06';
      const response = await page.goto(`${origin}/api/editions/${editionId}`);
      assert.equal(response?.status(), 200);
      const edition = readerEditionSchema.parse(await response.json());
      const story = edition.topics
        .flatMap((topic) => topic.stories)
        .find((story) => story.id === 'b509c8e8-981c-4116-b97e-becb0b4ae68e');
      assert.ok(story);
      assert.equal(story.coverage?.length, 2);
      assert.equal(
        story.coverage[1].id,
        '462ed47c-3e59-4729-a2d7-705bb398a15d',
      );
      await page.goto(`${origin}/editions/${editionId}`);
      const card = page.locator(`#story-${story.id}`);
      await card.locator('.coverage summary').click();
      assert.equal(await card.locator('.coverage li').count(), 2);
      assert.equal(
        await card
          .locator('.coverage li > a')
          .filter({ hasText: 'A Human Reads the Anthropic' })
          .count(),
        1,
      );
      await card.scrollIntoViewIfNeeded();
      await card.screenshot({
        path: `docs/screenshots/ui/reader-coverage-dedup-${width}.png`,
      });
      assert.deepEqual(errors, []);
      await page.close();
    }
    console.log(
      'Public HTTPS saved IPO coverage: two distinct reports, one NYT citation, desktop/mobile; GET-only, no browser errors.',
    );
  } finally {
    await browser.close();
  }
}
void main();
