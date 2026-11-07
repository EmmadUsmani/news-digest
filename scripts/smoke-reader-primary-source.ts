// Saved edition with synthetic coverage order; GET-only, external traffic blocked.
import assert from 'node:assert/strict';

import { readerEditionSchema } from '@digest/contracts';
import { chromium } from 'playwright';

const origin = 'http://127.0.0.1:8000';
async function main() {
  const edition = readerEditionSchema.parse(
    await (await fetch(`${origin}/api/editions/latest`)).json(),
  );
  const story = edition.topics[0].stories[0];
  assert.ok(story);
  story.url = 'https://publisher.example/primary';
  story.sources = ['Primary publisher', 'Other publisher'];
  const article = { title: story.title, publishedAt: story.publishedAt };
  story.coverage = [
    {
      ...article,
      id: '00000000-0000-4000-8000-000000000001',
      url: 'https://publisher.example/secondary',
      sources: ['Primary publisher'],
    },
    {
      ...article,
      id: '00000000-0000-4000-8000-000000000002',
      url: story.url,
      sources: ['Primary publisher'],
    },
    {
      ...article,
      id: '00000000-0000-4000-8000-000000000003',
      url: 'https://other.example/report',
      sources: ['Other publisher'],
    },
  ];
  readerEditionSchema.parse(edition);
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
        const card = page.locator(`#story-${story.id}`);
        const sources = card.locator('.story-sources');
        await sources.waitFor();
        assert.equal(
          await sources
            .getByRole('link', { name: 'Primary publisher', exact: true })
            .first()
            .getAttribute('href'),
          story.url,
        );
        assert.equal(
          await sources
            .getByRole('link', { name: 'Other publisher', exact: true })
            .first()
            .getAttribute('href'),
          'https://other.example/report',
        );
        await sources.locator('summary').click();
        const articles = sources.locator('details li > a');
        assert.deepEqual(
          await articles.evaluateAll((nodes) =>
            nodes.map((node) => node.getAttribute('href')),
          ),
          story.coverage.map((item) => item.url),
        );
        assert.ok(
          await card.evaluate((node) => node.scrollWidth <= node.clientWidth),
        );
        await card.screenshot({
          path: `docs/screenshots/ui/reader-primary-source-destination-${device}-${theme}.png`,
        });
        assert.deepEqual(errors, []);
        await page.close();
      }
    }
    console.log(
      'Primary publisher destination and all three coverage links passed desktop/mobile light/dark; synthetic replay, no writes.',
    );
  } finally {
    await browser.close();
  }
}
void main();
