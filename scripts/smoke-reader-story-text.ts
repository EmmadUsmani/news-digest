import assert from 'node:assert/strict';

import { readerEditionSchema } from '@digest/contracts';
import { chromium } from 'playwright';

// Read-only regression check against the immutable Nov 4 scheduled edition.
const editionId = '3bf10f5b-4c00-48b2-85bd-8e6dac7e3238';
const origin = 'http://localhost:8000';
async function smoke() {
  const browser = await chromium.launch();
  try {
    const response = await fetch(`${origin}/api/editions/${editionId}`);
    assert.equal(response.status, 200);
    const edition = readerEditionSchema.parse(await response.json());
    const nba = edition.topics.find((topic) => topic.name === 'NBA');
    assert.ok(nba);
    assert.equal(nba.stories.length, 5);
    assert.ok(nba.stories.every((story) => story.summary?.trim()));
    for (const [device, width, height] of [
      ['desktop', 1440, 1100],
      ['mobile', 390, 844],
    ] as const) {
      const page = await browser.newPage({ viewport: { width, height } });
      const errors: string[] = [];
      page.on('pageerror', (error) => errors.push(error.message));
      await page.goto(`${origin}/editions/${editionId}`);
      const topic = page.locator('.digest-topic').filter({
        has: page.getByRole('heading', { name: 'NBA', exact: true }),
      });
      await topic.waitFor();
      const text = await topic.locator('p.excerpt').allTextContents();
      assert.deepEqual(
        text,
        nba.stories.map((story) => story.summary),
      );
      // Labels exclude content supplied by the publishers and editors.
      const labels = await topic.evaluate((node) => {
        const copy = node.cloneNode(true) as HTMLElement;
        copy
          .querySelectorAll('li > a, p.excerpt, .byline, .top-posts')
          .forEach((el) => el.remove());
        return copy.textContent ?? '';
      });
      assert.doesNotMatch(
        labels,
        /why selected|why it matters|scores|candidates?|triage|AI edited|non-AI|auto-ranked|fallback|excerpts|evidence|independent|parked|budgets/i,
      );
      assert.doesNotMatch(
        await topic
          .locator('.byline, summary, h2, h3')
          .allTextContents()
          .then((parts) => parts.join(' ')),
        /why selected|why it matters|AI edited|non-AI|auto-ranked|fallback|excerpts|triage/i,
      );
      assert.ok(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth,
        ),
      );
      await page.evaluate(() => document.fonts.ready);
      await topic.screenshot({
        path: `docs/screenshots/ui/nba-story-text-${device}.png`,
      });
      assert.deepEqual(errors, []);
      await page.close();
    }
    console.log(
      'Nov 4 NBA: 5/5 summaries; desktop/mobile text, labels, layout and browser errors passed.',
    );
  } finally {
    await browser.close();
  }
}
void smoke();
