// Synthetic browser replay only; never writes an edition or calls inference.
import assert from 'node:assert/strict';

import {
  readerEditionSchema,
  selectedBlueskyPostSchema,
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
      const post = selectedBlueskyPostSchema.parse({
        platform: 'bluesky',
        externalId: 'synthetic-card',
        url: 'https://bsky.app/profile/example.test/post/synthetic',
        author: 'Synthetic author (example.test)',
        publishedAt: '2026-11-03T02:00:00Z',
        observedAt: '2026-11-03T03:00:00Z',
        text: 'Synthetic Bluesky card — browser verification\nFull original text, including <script>literal markup</script>.',
        metrics: { likes: 1200, reposts: 84, replies: 12 },
        media: [
          {
            type: 'image',
            thumbnail: 'https://cdn.bsky.app/synthetic.png',
            fullsize: 'https://cdn.bsky.app/full.png',
            alt: 'Synthetic image',
          },
          {
            type: 'video',
            thumbnail: null,
            playlist: 'https://video.bsky.app/synthetic.m3u8',
            alt: 'Synthetic video',
          },
        ],
        reasons: ['Synthetic evidence; not a live selection.'],
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
          media: [],
        },
      ];
      // The edition contract accepts both variants and rejects incomplete Bluesky evidence.
      const replay = readerEditionSchema.parse(snapshot);
      assert.ok(
        replay.topics[0].posts.every(
          (item) => !('whyItMatters' in item) && !('reasons' in item),
        ),
      );

      assert.equal(
        selectedBlueskyPostSchema.safeParse({ ...post, observedAt: 'invalid' })
          .success,
        false,
      );
      let widgets = 0;
      await page.route('https://platform.twitter.com/**', (route) => {
        widgets++;
        return route.abort();
      });
      await page.route('https://cdn.bsky.app/**', (route) =>
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
      const cards = page.locator('.bluesky-card');
      await cards.first().scrollIntoViewIfNeeded();
      assert.equal(await cards.count(), 2);
      assert.match(
        await cards.first().innerText(),
        /1,200 likes · 84 reposts · 12 replies/,
      );
      assert.match(await cards.first().innerText(), /Full original text/);
      assert.equal(
        await cards
          .first()
          .getByRole('link', { name: 'Open original post on Bluesky' })
          .getAttribute('href'),
        post.url,
      );
      assert.equal(await cards.first().locator('img').count(), 1);
      assert.equal(await cards.nth(1).locator('img').count(), 0);
      assert.equal(
        await cards
          .first()
          .getByRole('link', { name: 'Watch video on Bluesky' })
          .getAttribute('href'),
        post.url,
      );
      assert.equal(await cards.first().locator('script').count(), 0);
      assert.equal(
        selectedBlueskyPostSchema.safeParse({
          ...post,
          media: [{ ...post.media![0], thumbnail: 'javascript:alert(1)' }],
        }).success,
        false,
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
        .screenshot({ path: `docs/screenshots/bluesky-card-${name}.png` });
      await page.close();
    }
    console.log(
      'Synthetic Bluesky cards: desktop/mobile passed; no edition writes or inference.',
    );
  } finally {
    await browser.close();
  }
}
void main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
