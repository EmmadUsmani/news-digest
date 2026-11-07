// Real saved Nov 7 records replayed with prepared official facet expansion.
// GET-only; external embeds/media blocked. Does not rewrite saved editions.
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

import { readerEditionSchema } from '@digest/contracts';
import { chromium } from 'playwright';

import { blueskyDisplayText } from '../apps/api/src/modules/social/adapters/bluesky-text';

async function main() {
  const origin = 'http://127.0.0.1:8010';
  const edition = readerEditionSchema.parse(
    await (await fetch('http://127.0.0.1:8000/api/editions/latest')).json(),
  );
  const records = JSON.parse(
    readFileSync('apps/api/test/fixtures/bluesky-link-records.json', 'utf8'),
  ) as { uri: string; record: { text: string; facets: unknown } }[];
  const posts = edition.topics.flatMap((topic) => topic.posts);
  for (const { uri, record } of records) {
    const post = posts.find((post) => post.externalId === uri);
    assert.ok(post, 'Requires the saved Nov 7 edition');
    assert.equal(post.text, record.text);
    post.displayText = blueskyDisplayText(record.text, record.facets);
  }
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
        await page.route('**/*', async (route) => {
          assert.equal(route.request().method(), 'GET');
          const url = new URL(route.request().url());
          if (url.origin !== origin) return route.abort();
          if (url.pathname === '/api/editions/latest')
            return route.fulfill({ json: edition });
          if (url.pathname.startsWith('/api/'))
            return route.fulfill({
              response: await route.fetch({
                url: `http://127.0.0.1:8000${url.pathname}${url.search}`,
              }),
            });
          return route.continue();
        });
        await page.goto(origin);
        for (const { record } of records) {
          const display = blueskyDisplayText(record.text, record.facets);
          const target = display.slice(display.lastIndexOf('\n') + 1);
          const link = page
            .locator('.post-text')
            .getByRole('link', { name: target, exact: true });
          await link.waitFor();
          assert.equal(await link.getAttribute('href'), target);
          // Use the text block so this check is independent of media loading.
          const text = page.locator('.post-text').filter({
            has: page.getByRole('link', { name: target, exact: true }),
          });
          assert.ok(
            await text.evaluate((node) => node.scrollWidth <= node.clientWidth),
          );
          await text.scrollIntoViewIfNeeded();
          await page.evaluate(async () => {
            await document.fonts.ready;
            await new Promise<void>((resolve) =>
              requestAnimationFrame(() =>
                requestAnimationFrame(() => resolve()),
              ),
            );
          });
          await text.screenshot({
            path: `docs/screenshots/nov7-bluesky-link-${target.includes('forms.gle') ? 'survey' : 'world'}-${device}-${theme}.png`,
          });
        }
        assert.deepEqual(errors, []);
        await page.close();
      }
    }
  } finally {
    await browser.close();
  }
  console.log(
    'Prepared official Bluesky links: two records × desktop/mobile × light/dark pass; no external requests.',
  );
}
void main();
