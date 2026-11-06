// Synthetic browser replay only; never writes an edition or calls inference.
import assert from 'node:assert/strict';

import {
  readerEditionSchema,
  selectedBlueskyPostSchema,
} from '@digest/contracts';
import { chromium } from 'playwright';

const baseUrl = process.env.READER_BASE_URL ?? 'http://localhost:8000';

async function main() {
  const browser = await chromium.launch();
  try {
    for (const [name, width, height, colorScheme] of [
      ['desktop', 1440, 1100, 'light'],
      ['mobile', 390, 844, 'light'],
      ['desktop-dark', 1440, 1100, 'dark'],
      ['mobile-dark', 390, 844, 'dark'],
    ] as const) {
      const page = await browser.newPage({
        viewport: { width, height },
        colorScheme,
      });
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
        text: 'Synthetic Bluesky card — browser verification\nFull original text, including <script>literal markup</script>. Read https://example.com/story?item=1&source=post. Unsafe javascript:alert(1) stays text. Also (https://example.org/story), [https://example.net/read]. Balanced https://en.wikipedia.org/wiki/News_(disambiguation).',
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
          whyItMatters: `  ${post.text.toUpperCase().replace(/\s+/g, ' ')}  `,
          url: 'https://bsky.app/profile/did%3Aplc%3Asynthetic/post/synthetic',
          media: [],
        },
      ];
      // The edition contract accepts both variants and rejects incomplete Bluesky evidence.
      const replay = readerEditionSchema.parse(snapshot);
      assert.ok(
        replay.topics[0].posts.every(
          (item) => Boolean(item.whyItMatters) && !('reasons' in item),
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
      await page.route('**/api/**', async (route) => {
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
        if (baseUrl !== 'http://localhost:8000') {
          const response = await route.fetch({
            url: `http://localhost:8000${new URL(request.url()).pathname}${new URL(request.url()).search}`,
          });
          return route.fulfill({ response });
        }
        return route.continue();
      });
      await page.goto(baseUrl);
      const cards = page.locator('.bluesky-card');
      await cards.first().scrollIntoViewIfNeeded();
      assert.equal(await cards.count(), 2);
      const authorLink = cards
        .first()
        .getByRole('link', { name: post.author, exact: true });
      assert.equal(
        await authorLink.getAttribute('href'),
        'https://bsky.app/profile/example.test',
      );
      assert.equal(await authorLink.getAttribute('target'), '_blank');
      assert.equal(
        await cards
          .nth(1)
          .getByRole('link', { name: post.author, exact: true })
          .getAttribute('href'),
        'https://bsky.app/profile/did%3Aplc%3Asynthetic',
      );
      assert.match(
        await cards.first().innerText(),
        /1,200 likes · 84 reposts · 12 replies/,
      );
      assert.match(await cards.first().innerText(), /Full original text/);
      assert.equal(
        await cards.first().locator('.post-context-text').innerText(),
        post.whyItMatters,
      );
      assert.equal(
        await cards.nth(1).locator('.post-context-text').count(),
        0,
        'A note repeating the original text is omitted despite case/spacing differences',
      );
      assert.ok(
        !(await cards.first().innerText()).includes(post.reasons[0]),
        'Private selection reasons must stay out of reader cards',
      );
      assert.equal(
        await cards
          .first()
          .getByRole('link', { name: 'View post on Bluesky' })
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
      const linkedSource = cards
        .first()
        .locator('.post-text a')
        .filter({ hasText: 'https://example.com/' });
      assert.equal(await linkedSource.count(), 1);
      assert.equal(
        await linkedSource.getAttribute('href'),
        'https://example.com/story?item=1&source=post',
      );
      assert.equal(await linkedSource.getAttribute('target'), '_blank');
      for (const url of [
        'https://example.org/story',
        'https://example.net/read',
        'https://en.wikipedia.org/wiki/News_(disambiguation)',
      ]) {
        const link = cards
          .first()
          .getByRole('link', { name: url, exact: true });
        assert.equal(await link.getAttribute('href'), url);
        assert.equal(await link.getAttribute('target'), '_blank');
      }

      assert.equal(
        await cards.first().locator('.post-text').innerText(),
        post.text,
      );

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
      // A failed third-party image retains a usable original-image link.
      await page.route('https://cdn.bsky.app/**', (route) => route.abort());
      await page.reload();
      const failedImage = page.getByRole('link', {
        name: 'Image unavailable · Open image ↗ — Synthetic image',
        exact: true,
      });
      await cards.first().scrollIntoViewIfNeeded();
      await failedImage.waitFor();
      assert.equal(
        await failedImage.getAttribute('href'),
        post.media![0].fullsize,
      );
      await failedImage.focus();
      assert.ok(
        await failedImage.evaluate((node) => node === document.activeElement),
      );
      assert.equal(await cards.first().locator('img').count(), 0);
      assert.equal(
        await cards.first().locator('.post-text').innerText(),
        post.text,
      );
      assert.ok(
        await cards
          .first()
          .evaluate((node) => node.scrollWidth <= node.clientWidth),
      );
      await cards.first().screenshot({
        path: `docs/screenshots/ui/reader-bluesky-image-failed-${name}.png`,
      });
      assert.deepEqual(errors, []);
      await page.close();
    }
    console.log(
      'Synthetic Bluesky cards: desktop/mobile light/dark passed; reader context visible, selection reasons private; no edition writes or inference.',
    );
  } finally {
    await browser.close();
  }
}
void main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
