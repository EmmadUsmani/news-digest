// Read-only saved-edition replay; third-party requests are blocked.
import assert from 'node:assert/strict';

import { readerEditionSchema } from '@digest/contracts';
import { chromium } from 'playwright';

async function main() {
  const origin = 'http://127.0.0.1:8000';
  const edition = readerEditionSchema.parse(
    await (await fetch(`${origin}/api/editions/latest`)).json(),
  );
  const saved = edition.topics
    .flatMap((topic) => topic.posts)
    .find(
      (post) =>
        post.platform === 'x' &&
        /https?:\/\//.test(post.displayText ?? post.text),
    );
  assert.ok(saved, 'A real saved X post is required');
  assert.equal(saved.platform, 'x');
  const savedText = saved.displayText ?? saved.text;
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
          const url = new URL(route.request().url());
          if (url.origin !== origin) return route.abort();
          assert.equal(route.request().method(), 'GET');
          if (url.pathname === '/api/editions/latest')
            return route.fulfill({ json: edition });
          return route.continue();
        });
        await page.goto(origin);
        const card = page
          .locator('.post-card')
          .filter({ has: page.locator(`.byline a[href="${saved.url}"]`) });
        await card.waitFor();
        await card.scrollIntoViewIfNeeded();
        const text = card.locator('.post-text');
        assert.equal(await text.textContent(), savedText);
        assert.equal(
          await card
            .locator('.byline time')
            .evaluate((node) => getComputedStyle(node).fontSize),
          '12px',
          'Linked timestamp retains the compact author-row typography',
        );
        const original = text.locator(`a[href="${saved.url}"]`).first();
        assert.equal(await original.count(), 1);
        assert.equal(await original.getAttribute('href'), saved.url);
        assert.equal(await original.getAttribute('target'), '_blank');
        const urls = savedText.match(/https?:\/\/[^\s<>]+/g) ?? [];
        assert.ok(urls.length > 0, 'Saved post exercises inline source links');
        for (const url of urls) {
          assert.equal(
            await text
              .getByRole('link', { name: url, exact: true })
              .getAttribute('href'),
            url,
          );
        }
        assert.equal(await text.locator('a a').count(), 0);

        await original.focus();
        assert.equal(
          await original.evaluate((node) => node === document.activeElement),
          true,
        );
        assert.ok(
          await card.evaluate((node) => node.scrollWidth <= node.clientWidth),
        );
        await page.evaluate(() => document.fonts.ready);
        await card.screenshot({
          path: `docs/screenshots/ui/reader-x-links-${device}-${theme}.png`,
        });
        assert.deepEqual(errors, []);
        await page.close();
        console.log(
          `${device}/${theme}: saved text, original/source links, keyboard focus and layout passed`,
        );
      }
    }
  } finally {
    await browser.close();
  }
}
void main();
