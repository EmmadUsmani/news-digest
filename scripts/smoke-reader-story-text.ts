import assert from 'node:assert/strict';

import { readerEditionSchema } from '@digest/contracts';
import { chromium } from 'playwright';

// Read-only regression check; optional edition UUID and screenshot prefix.
const editionId = process.argv[2] ?? '3bf10f5b-4c00-48b2-85bd-8e6dac7e3238';
const screenshotPrefix = process.argv[3] ?? 'nba-story-text';
assert.match(editionId, /^[a-f0-9-]{36}$/);
assert.match(screenshotPrefix, /^[a-z0-9-]+$/);
const origin = 'http://localhost:8000';
async function smoke() {
  const readEdition = async () => {
    const response = await fetch(`${origin}/api/editions/${editionId}`, {
      signal: AbortSignal.timeout(15_000),
    });
    assert.equal(response.status, 200);
    return readerEditionSchema.parse(await response.json());
  };
  const writes: string[] = [];
  const browser = await chromium.launch();
  try {
    const edition = await readEdition();
    assert.ok(edition.topics.length > 0, 'saved edition has no topics');
    const nba = edition.topics.find((topic) => topic.name === 'NBA');
    assert.ok(nba);
    if (!process.argv[2]) assert.equal(nba.stories.length, 5);
    else assert.ok(nba.stories.length > 0);
    assert.ok(nba.stories.every((story) => story.summary?.trim()));
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
        await context.route('**/api/**', async (route) => {
          const request = route.request();
          if (!['GET', 'HEAD'].includes(request.method())) {
            writes.push(
              `${request.method()} ${new URL(request.url()).pathname}`,
            );
            return route.abort();
          }
          return route.continue();
        });
        const page = await context.newPage();
        const errors: string[] = [];
        page.on('pageerror', (error) => errors.push(error.message));
        await page.goto(`${origin}/editions/${editionId}`);
        await page.locator('.digest-topic').first().waitFor();
        assert.equal(
          await page.locator('.digest-topic').count(),
          edition.topics.length,
        );
        for (const saved of edition.topics) {
          const section = page.locator('.digest-topic').filter({
            has: page.getByRole('heading', { name: saved.name, exact: true }),
          });
          await section.waitFor();
          assert.equal(
            await section.locator('[data-slot="card"][id^="story-"]').count(),
            saved.stories.length,
          );
          for (const story of saved.stories) {
            const item = section.locator(`[id="story-${story.id}"]`);
            assert.equal(
              await item.locator('h3 > a').textContent(),
              story.title,
            );
            assert.ok(
              story.summary?.trim(),
              `${saved.name}: missing story text`,
            );
            assert.equal(
              await item.locator('.excerpt').textContent(),
              story.summary,
            );
          }
        }
        assert.equal(
          await page.evaluate(() =>
            document.documentElement.classList.contains('dark'),
          ),
          theme === 'dark',
        );
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
            .querySelectorAll('h3, p.excerpt, .byline, .top-posts')
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
        for (const [index, saved] of edition.topics.entries()) {
          const section = page.locator('.digest-topic').filter({
            has: page.getByRole('heading', { name: saved.name, exact: true }),
          });
          if (!process.argv[3] && saved.name !== 'NBA') continue;
          await section.screenshot({
            path: `docs/screenshots/ui/${screenshotPrefix}${process.argv[3] ? `-${index}` : ''}-${device}${theme === 'dark' ? '-dark' : ''}.png`,
          });
        }
        assert.deepEqual(errors, []);
        await context.close();
      }
    }
    assert.deepEqual(writes, []);
    assert.deepEqual(await readEdition(), edition);
    console.log(
      `${editionId}: all ${edition.topics.length} topics match saved story titles/text; NBA ${nba.stories.length}/${nba.stories.length} summaries; desktop/mobile light/dark labels/layout passed; no browser writes/errors; saved edition unchanged.`,
    );
  } finally {
    await browser.close();
  }
}
void smoke();
