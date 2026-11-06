// Real saved edition; no writes or third-party requests.
import assert from 'node:assert/strict';

import { readerEditionSchema } from '@digest/contracts';
import { chromium } from 'playwright';

const base = 'http://127.0.0.1:8000';
async function smoke() {
  const saved = readerEditionSchema.parse(
    await (await fetch(`${base}/api/editions/latest`)).json(),
  );
  const browser = await chromium.launch();
  try {
    for (const width of [390, 320]) {
      for (const theme of ['light', 'dark'] as const) {
        const page = await browser.newPage({
          viewport: { width, height: 844 },
          colorScheme: theme,
          reducedMotion: 'reduce',
        });
        const errors: string[] = [];
        page.on('pageerror', (error) => errors.push(error.message));
        await page.route('**/*', (route) => {
          assert.ok(['GET', 'HEAD'].includes(route.request().method()));
          return new URL(route.request().url()).origin === base
            ? route.continue()
            : route.abort();
        });
        await page.goto(`${base}/editions/${saved.id}`);
        await page.locator('.digest-topic').last().waitFor();
        await page.evaluate(() => document.fonts.ready);
        for (const topic of [
          ...saved.topics,
          ...[...saved.topics].reverse(),
          saved.topics[saved.topics.length - 1],
        ]) {
          // Reading the page, rather than clicking a chip, must reveal the active chip.
          const readingPosition = await page
            .locator(`[id="topic-${topic.id}"]`)
            .evaluate((element) => {
              element.scrollIntoView();
              return window.scrollY;
            });
          const chip = page
            .locator(
              `a[href="#topic-${topic.id}"][aria-current="location"]:visible`,
            )
            .last();
          await chip.waitFor();
          await page.waitForFunction(
            (id) => {
              const chip = [
                ...document.querySelectorAll<HTMLAnchorElement>(
                  `a[href="#topic-${id}"][aria-current="location"]`,
                ),
              ].find(
                (node) =>
                  node.offsetParent !== null &&
                  node.parentElement!.scrollWidth >
                    node.parentElement!.clientWidth,
              );
              if (!chip) return false;
              const bounds = chip.getBoundingClientRect(),
                parent = chip.parentElement!.getBoundingClientRect();
              return (
                bounds.left >= parent.left - 1 &&
                bounds.right <= parent.right + 1
              );
            },
            topic.id,
            { timeout: 3000 },
          );
          assert.equal(
            await page.evaluate(() => window.scrollY),
            readingPosition,
            'Revealing a chip must preserve the vertical reading position',
          );
          assert.ok(
            await page
              .getByRole('button', { name: 'Contents', exact: true })
              .isVisible(),
          );
          assert.equal(
            await page.evaluate(
              () => document.documentElement.scrollWidth <= innerWidth,
            ),
            true,
          );
        }
        await page.screenshot({
          path: `docs/screenshots/ui/topic-chips-${width}-${theme}.png`,
        });
        assert.deepEqual(errors, []);
        await page.close();
      }
    }
    assert.deepEqual(
      readerEditionSchema.parse(
        await (await fetch(`${base}/api/editions/latest`)).json(),
      ),
      saved,
    );
    console.log(
      'Active topic chips stay visible during forward/backward reading at 390px/320px, light/dark; no writes, saved edition unchanged.',
    );
  } finally {
    await browser.close();
  }
}
void smoke();
