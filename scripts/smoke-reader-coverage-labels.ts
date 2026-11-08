// Real saved edition; GET-only browser check, external traffic blocked.
import assert from 'node:assert/strict';

import { readerEditionSchema } from '@digest/contracts';
import { chromium } from 'playwright';

const origin = 'http://127.0.0.1:8000';
async function main() {
  const edition = readerEditionSchema.parse(
    await (await fetch(`${origin}/api/editions/latest`)).json(),
  );
  const stories = edition.topics
    .flatMap((topic) => topic.stories)
    .filter((story) => story.coverage?.length);
  assert.ok(stories.length);
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
        });
        const errors: string[] = [];
        page.on('pageerror', (error) => errors.push(error.message));
        await page.route('**/*', (route) => {
          assert.equal(route.request().method(), 'GET');
          const url = new URL(route.request().url());
          if (url.origin !== origin) return route.abort();
          if (url.pathname === '/api/editions/latest')
            return route.fulfill({ json: edition });
          return route.continue();
        });
        await page.goto(origin);
        for (const story of stories) {
          const count = story.coverage!.length;
          const card = page.locator(`#story-${story.id}`);
          const control = card.locator('details.coverage summary');
          await control.waitFor();
          assert.equal(
            await control.getAttribute('aria-label'),
            `Show ${count} ${count === 1 ? 'article' : 'articles'} covering ${story.title}`,
          );
          await control.focus();
          assert.ok(
            await control.evaluate((node) => document.activeElement === node),
          );
          await page.keyboard.press('Enter');
          assert.equal(
            await card.locator('details.coverage').getAttribute('open'),
            '',
          );
          const links = card.locator('details.coverage li > a');
          assert.equal(await links.count(), count);
          for (let index = 0; index < count; index++) {
            const report = links.nth(index);
            const bounds = await report.boundingBox();
            assert.ok(bounds && bounds.width >= 44 && bounds.height >= 44);
            await report.focus();
            await page.keyboard.press('Tab');
            await page.keyboard.press('Shift+Tab');
            assert.equal(
              await report.evaluate((el) => getComputedStyle(el).outlineStyle),
              'solid',
            );
            assert.equal(
              await report.getAttribute('href'),
              story.coverage![index].url,
            );
          }
          assert.ok(
            await card.evaluate((node) => node.scrollWidth <= node.clientWidth),
          );
          await control.focus();
          await page.keyboard.press('Enter');
          assert.equal(
            await card.locator('details.coverage').getAttribute('open'),
            null,
          );
        }
        const card = page.locator(`#story-${stories[0].id}`);
        await card.locator('summary').click();
        await card.screenshot({
          path: `docs/screenshots/ui/reader-coverage-labels-${device}-${theme}.png`,
        });
        assert.deepEqual(errors, []);
        await page.close();
      }
    }
    console.log(
      `${stories.length} saved coverage controls name their story; keyboard expansion, 44px report targets, focus outlines, destinations and layout pass desktop/mobile light/dark. GET-only; external traffic blocked.`,
    );
  } finally {
    await browser.close();
  }
}
void main();
