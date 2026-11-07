// Saved edition with synthetic coverage order; GET-only, external traffic blocked.
import assert from 'node:assert/strict';

import { readerEditionSchema } from '@digest/contracts';
import { chromium } from 'playwright';

const origin = 'http://127.0.0.1:8010';
async function main() {
  const edition = readerEditionSchema.parse(
    await (await fetch(`http://127.0.0.1:8000/api/editions/latest`)).json(),
  );
  const story = edition.topics[0].stories[0];
  assert.ok(story);
  story.url = 'https://news.google.com/rss/articles/cnbc';
  story.sources = ['Google News: Tech'];
  story.publisher = { name: 'CNBC', url: 'https://www.cnbc.com/' };
  const article = {
    title: story.title,
    publishedAt: story.publishedAt,
    sources: story.sources,
  };
  story.coverage = [
    {
      ...article,
      id: '00000000-0000-4000-8000-000000000001',
      url: story.url,
      publisher: story.publisher,
    },
    {
      ...article,
      id: '00000000-0000-4000-8000-000000000002',
      url: 'https://news.google.com/rss/articles/reuters',
      publisher: { name: 'Reuters', url: 'https://www.reuters.com/' },
    },
    {
      ...article,
      id: '00000000-0000-4000-8000-000000000003',
      url: 'https://news.google.com/rss/articles/unknown',
    },
  ];
  readerEditionSchema.parse(edition);
  const historical = structuredClone(edition);
  delete historical.topics[0].stories[0].publisher;
  historical.topics[0].stories[0].coverage?.forEach((report) => {
    delete report.publisher;
  });
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
        const card = page.locator(`#story-${story.id}`);
        const sources = card.locator('.story-sources');
        await sources.waitFor();
        assert.equal(
          await sources
            .getByRole('link', {
              name: 'CNBC · via Google News: Tech',
              exact: true,
            })
            .first()
            .getAttribute('href'),
          story.url,
        );
        assert.equal(
          await sources
            .getByRole('link', {
              name: 'Reuters · via Google News: Tech',
              exact: true,
            })
            .first()
            .getAttribute('href'),
          'https://news.google.com/rss/articles/reuters',
        );
        await sources.locator('summary').click();
        assert.equal(
          await sources
            .getByRole('link', { name: 'via Google News: Tech', exact: true })
            .count(),
          1,
        );
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
          path: `docs/screenshots/ui/reader-publisher-evidence-${device}-${theme}.png`,
        });
        const evidence = structuredClone(story);
        Object.assign(story, historical.topics[0].stories[0]);
        delete story.publisher;
        await page.reload();
        await sources.waitFor();
        assert.equal(
          await sources
            .getByRole('link', { name: 'via Google News: Tech', exact: true })
            .count(),
          1,
        );
        assert.equal(
          await sources.getByRole('link', { name: /CNBC|Reuters/ }).count(),
          0,
        );
        Object.assign(story, evidence);
        assert.deepEqual(errors, []);
        await page.close();
      }
    }
    console.log(
      'Structured CNBC/Reuters labels and all three coverage links passed desktop/mobile light/dark; synthetic replay, no writes.',
    );
  } finally {
    await browser.close();
  }
}
void main();
