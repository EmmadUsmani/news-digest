// Synthetic browser replay only; never writes an edition or calls inference.
import assert from 'node:assert/strict';

import {
  readerEditionSchema,
  selectedRedditPostSchema,
} from '@digest/contracts';
import { chromium } from 'playwright';

async function main() {
  const browser = await chromium.launch();
  try {
    for (const [name, width, height] of [
      ['desktop', 1440, 1100],
      ['mobile', 390, 844],
    ] as const) {
      const page = await browser.newPage({ viewport: { width, height } });
      const errors: string[] = [];
      page.on('pageerror', (error) => errors.push(error.message));
      const snapshot = readerEditionSchema.parse(
        await (
          await page.request.get('http://localhost:8000/api/editions/latest')
        ).json(),
      );
      const post = selectedRedditPostSchema.parse({
        platform: 'reddit',
        externalId: 'synthetic-card',
        url: 'https://www.reddit.com/r/nba/comments/synthetic/card/',
        author: 'synthetic_author',
        authorUrl: 'https://www.reddit.com/user/synthetic_author/',
        publishedAt: '2026-11-02T10:00:00Z',
        observedAt: '2026-11-02T12:00:00Z',
        title: 'Synthetic Reddit card — browser verification',
        subreddit: 'nba',
        text: 'Synthetic saved body',
        displayText: 'Synthetic saved body',
        metrics: { score: 1200, comments: 84, upvoteRatio: 0.96 },
        thumbnail: 'https://preview.redd.it/synthetic.png',
        externalUrl: 'https://example.com/synthetic',
        reasons: ['Synthetic historical-strength evidence'],
        whyItMatters: 'Synthetic context; not a live pick.',
      });
      snapshot.topics.forEach((topic) => {
        topic.posts = [];
      });
      snapshot.topics[0].posts = [
        post,
        {
          ...post,
          externalId: 'synthetic-no-media',
          thumbnail: null,
          externalUrl: null,
          displayText: '',
        },
      ];
      // The edition contract accepts both variants and rejects incomplete Reddit evidence.
      const replay = readerEditionSchema.parse(snapshot);
      assert.ok(
        replay.topics[0].posts.every(
          (item) => !('whyItMatters' in item) && !('reasons' in item),
        ),
      );

      assert.equal(
        selectedRedditPostSchema.safeParse({ ...post, observedAt: 'invalid' })
          .success,
        false,
      );
      await page.route(/^https:\/\/(?:www\.)?reddit\.com\//, (route) =>
        route.abort(),
      );
      let widgets = 0;
      await page.route('https://platform.twitter.com/**', (route) => {
        widgets++;
        return route.abort();
      });
      await page.route('https://preview.redd.it/**', (route) =>
        route.fulfill({
          contentType: 'image/svg+xml',
          body: '<svg xmlns="http://www.w3.org/2000/svg" width="320" height="180"><rect width="320" height="180" fill="#456"/></svg>',
        }),
      );
      const unexpectedWrites: string[] = [];
      await page.route('**/api/**', (route) => {
        const request = route.request();
        if (!['GET', 'HEAD'].includes(request.method())) {
          unexpectedWrites.push(
            `${request.method()} ${new URL(request.url()).pathname}`,
          );
          return route.abort();
        }
        if (new URL(request.url()).pathname === '/api/editions/latest') {
          return route.fulfill({ json: replay });
        }
        return route.continue();
      });
      await page.goto('http://localhost:8000');
      const cards = page.locator('.reddit-card');
      await cards.first().scrollIntoViewIfNeeded();
      assert.equal(await cards.count(), 2);
      assert.match(
        await cards.first().innerText(),
        /1,200 score · 84 comments · 96% upvoted/,
      );
      assert.match(await cards.first().innerText(), /Synthetic saved body/);
      assert.equal(
        await cards
          .first()
          .getByRole('link', { name: 'Open original post on Reddit' })
          .getAttribute('href'),
        post.url,
      );
      assert.equal(
        await cards
          .first()
          .getByRole('link', { name: 'Linked source' })
          .getAttribute('href'),
        post.externalUrl,
      );
      assert.equal(await cards.first().locator('img').count(), 1);
      assert.equal(await cards.nth(1).locator('img').count(), 0);
      assert.equal(
        await cards.nth(1).getByRole('link', { name: 'Linked source' }).count(),
        0,
      );
      assert.equal(widgets, 0);
      assert.deepEqual(errors, []);
      assert.deepEqual(unexpectedWrites, []);
      assert.equal(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= window.innerWidth,
        ),
        true,
      );
      await cards
        .first()
        .screenshot({ path: `docs/screenshots/reddit-card-${name}.png` });
      await page.close();
    }
    console.log(
      'Synthetic Reddit cards: desktop/mobile passed; no edition writes or inference.',
    );
  } finally {
    await browser.close();
  }
}
void main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
