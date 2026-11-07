// Synthetic context over a saved edition; GET-only, external traffic blocked.
import assert from 'node:assert/strict';

import { readerEditionSchema } from '@digest/contracts';
import { chromium } from 'playwright';

const origin = 'http://127.0.0.1:8000';
async function main() {
  const edition = readerEditionSchema.parse(
    await (await fetch(`${origin}/api/editions/latest`)).json(),
  );
  const post = edition.topics
    .flatMap((topic) => topic.posts)
    .find((post) => post.platform === 'bluesky');
  assert.ok(post);
  post.whyItMatters =
    'Synthetic context: ' +
    'This saved note explains why the post matters to readers. '.repeat(12);
  edition.topics[0].posts = [post];
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
          hasTouch: true,
        });
        await page.route('**/*', (route) => {
          assert.equal(route.request().method(), 'GET');
          const url = new URL(route.request().url());
          if (url.origin !== origin) return route.abort();
          if (url.pathname === '/api/editions/latest')
            return route.fulfill({ json: edition });
          return route.continue();
        });
        await page.goto(origin);
        const card = page.locator('.bluesky-card').first();
        const note = card.locator('.post-context');
        const text = note.locator('.post-context-text');
        await note.scrollIntoViewIfNeeded();
        assert.equal(await note.getAttribute('open'), null);
        assert.ok(
          await text.evaluate((node) => node.scrollWidth > node.clientWidth),
        );
        const collapsed = (await note.boundingBox())!.height;
        await note.locator('summary').tap();
        assert.notEqual(await note.getAttribute('open'), null);
        assert.ok((await note.boundingBox())!.height > collapsed * 2);
        assert.equal((await text.innerText()).trim(), post.whyItMatters.trim());
        assert.ok(
          await text.evaluate((node) => node.scrollWidth <= node.clientWidth),
        );
        await card.screenshot({
          path: `docs/screenshots/ui/reader-expanded-context-${device}-${theme}.png`,
        });
        await note.locator('summary').focus();
        await page.keyboard.press('Enter');
        assert.equal(await note.getAttribute('open'), null);
        await page.keyboard.press('Space');
        assert.notEqual(await note.getAttribute('open'), null);
        await page.close();
      }
    }
    console.log(
      'Context expands by touch and keyboard in desktop/mobile light/dark; synthetic replay, no writes.',
    );
  } finally {
    await browser.close();
  }
}
void main();
