// Saved-edition replay: changed background data must preserve the reading position.
import assert from 'node:assert/strict';

import { readerEditionSchema } from '@digest/contracts';
import { chromium } from 'playwright';

async function smoke() {
  const origin = 'http://127.0.0.1:8000';
  const saved = readerEditionSchema.parse(
    await (await fetch(`${origin}/api/editions/latest`)).json(),
  );
  const browser = await chromium.launch();
  try {
    for (const [device, width, height] of [
      ['desktop', 1440, 1100],
      ['mobile', 390, 844],
    ] as const) {
      for (const theme of ['light', 'dark'] as const) {
        const page = await browser.newPage({
          viewport: { width, height },
          colorScheme: theme,
          reducedMotion: 'reduce',
        });
        let requests = 0;
        await page.route('**/*', (route) => {
          const url = new URL(route.request().url());
          if (url.origin !== origin) return route.abort();
          assert.equal(route.request().method(), 'GET');
          if (url.pathname === `/api/editions/${saved.id}`) {
            requests++;
            const edition = structuredClone(saved);
            // Replay an actual changed payload, so query structural sharing cannot hide the bug.
            if (requests > 1)
              edition.topics[0].brief.push('Refresh position replay.');
            return route.fulfill({ json: edition });
          }
          return route.continue();
        });
        const anchor = `story-${saved.topics[0].stories[0].id}`;
        await page.goto(`${origin}/editions/${saved.id}#${anchor}`);
        await page.locator(`#${anchor}`).waitFor();
        await page.evaluate(() => document.fonts.ready);
        const initialTop = await page
          .locator(`#${anchor}`)
          .evaluate((el) => el.getBoundingClientRect().top);
        assert.ok(
          initialTop >= 64 && initialTop <= 180,
          'Initial deep link is visible below sticky navigation',
        );
        await page
          .locator(`#topic-${saved.topics[2].id}`)
          .evaluate((el) => el.scrollIntoView({ behavior: 'instant' }));
        const position = await page.evaluate(() => window.scrollY);
        await page.clock.install();
        await page.clock.fastForward(61000);
        await page.evaluate(() =>
          window.dispatchEvent(new Event('visibilitychange')),
        );
        await page
          .getByText('Refresh position replay.', { exact: true })
          .waitFor();
        await page.clock.runFor(200);
        assert.ok(
          Math.abs((await page.evaluate(() => window.scrollY)) - position) <
            100,
          'Changed background refresh preserves reading position instead of replaying the old hash',
        );
        assert.equal(new URL(page.url()).hash, `#${anchor}`);
        await page.screenshot({
          path: `docs/screenshots/ui/reader-position-${device}-${theme}.png`,
        });
        await page.close();
      }
    }
    console.log(
      'Reader position: initial deep link and changed refresh passed desktop/mobile light/dark (saved-data replay; no external calls).',
    );
  } finally {
    await browser.close();
  }
}
void smoke();
