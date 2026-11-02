// Read-only UI replay of actual saved candidates; never publishes an edition.
// Official widgets are stubbed for deterministic checks; opt in separately to live embeds.
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

import { digestPreviewSchema, selectedPostSchema } from '@digest/contracts';
import { chromium } from 'playwright';

async function main() {
  const path = process.argv[2];
  if (!path) throw new Error('Supply screen-social-posts.ts JSONL output');
  const screened = (await readFile(path, 'utf8'))
    .trim()
    .split('\n')
    .map((line) => {
      const value = JSON.parse(line) as { topic: string; selected: unknown[] };
      return {
        topic: value.topic,
        selected: value.selected.map((post) => selectedPostSchema.parse(post)),
      };
    });
  assert.ok(screened.some((topic) => topic.selected.length > 0));
  const browser = await chromium.launch();
  try {
    for (const [name, width, height] of [
      ['desktop', 1440, 1100],
      ['mobile', 390, 844],
    ] as const) {
      for (const mode of process.env.POST_EMBED_LIVE === '1'
        ? (['live'] as const)
        : (['success', 'blocked', 'hanging'] as const)) {
        const page = await browser.newPage({ viewport: { width, height } });
        const errors: string[] = [];
        page.on('pageerror', (error) =>
          errors.push(error.stack ?? error.message),
        );
        const snapshot = digestPreviewSchema.parse(
          await (
            await page.request.get(
              'http://localhost:8000/api/digest-previews/latest',
            )
          ).json(),
        );
        snapshot.topics.forEach((topic) => {
          topic.posts = (
            screened.find((row) => row.topic === topic.name)?.selected ?? []
          ).slice(0, mode === 'live' ? 1 : undefined);
          if (process.env.POST_EDITORIAL_REPLAY === '1') {
            topic.postSelectionMethod = 'verified-semantic-editor-v1';
            topic.postEditorial = {
              mode: 'ai',
              model: 'synthetic-replay',
              reason: 'Synthetic UI replay',
              triage: [],
              unscoredIds: [],
            };
            topic.posts.forEach((post) => {
              post.whyItMatters =
                'Synthetic context for UI verification; not a live editorial result.';
            });
          }
        });
        if (process.env.POST_COVERAGE_REPLAY === '1') {
          for (const topic of snapshot.topics) {
            const story = topic.stories[0];
            if (!story) continue;
            for (const post of topic.posts ?? [])
              post.citingStories = [{ id: story.id, title: story.title }];
          }
        }
        // Exercise historical snapshots without the optional display field too.
        const legacyPost = snapshot.topics
          .flatMap((topic) => topic.posts ?? [])
          .at(-1);
        if (legacyPost) delete legacyPost.displayText;
        if (mode === 'hanging') {
          // Accelerate only the production embed deadline; leave other timers intact.
          await page.addInitScript(() => {
            const original = window.setTimeout.bind(window);
            window.setTimeout = ((
              handler: TimerHandler,
              timeout?: number,
              ...args: unknown[]
            ) =>
              original(
                handler,
                timeout === 15000 ? 100 : timeout,
                ...args,
              )) as typeof window.setTimeout;
          });
        }
        let scriptRequests = 0;
        let allowRetry = false;
        if (mode !== 'live')
          await page.route(
            'https://platform.twitter.com/widgets.js',
            async (route) => {
              scriptRequests++;
              if (mode === 'blocked' && !allowRetry) return route.abort();
              await route.fulfill({
                contentType: 'text/javascript',
                body:
                  mode === 'hanging' && !allowRetry
                    ? `window.twttr = { widgets: { createTweet: (id, target) => new Promise(resolve => { (window.finishStalledWidgets ??= []).push(() => { const element = document.createElement('div'); element.dataset.latePost = id; target.append(element); resolve(element); }); }) } };`
                    : `window.twttr = { widgets: { createTweet: async (id, target, options) => { const element = document.createElement('div'); element.dataset.postId = id; element.textContent = 'Recorded widget protocol stub'; target.append(element); return element; } } };`,
              });
            },
          );
        await page.route('**/api/digest-previews/latest', (route) =>
          route.fulfill({ json: snapshot }),
        );
        await page.goto('http://localhost:8000');
        await page.locator('.top-posts').first().waitFor();
        assert.equal(
          scriptRequests,
          0,
          'Widgets must wait until posts approach the viewport',
        );
        const cards = page.locator('.post-card');
        const expected = snapshot.topics.flatMap((topic) => topic.posts ?? []);
        assert.equal(await cards.count(), expected.length);
        for (let index = 0; index < expected.length; index++) {
          const card = cards.nth(index);
          const post = expected[index];
          await card.scrollIntoViewIfNeeded();
          assert.equal(
            await card
              .getByRole('link', { name: 'Open original post on X' })
              .getAttribute('href'),
            post.url,
          );
          if (process.env.POST_EDITORIAL_REPLAY === '1') {
            assert.equal(
              await card.locator('.post-context').textContent(),
              post.whyItMatters,
            );
          }
          if (post.citingStories?.length) {
            const link = card.locator('.post-coverage a').first();
            assert.equal(await link.textContent(), post.citingStories[0].title);
            await link.click();
            assert.equal(
              await page.locator(`#story-${post.citingStories[0].id}`).count(),
              1,
            );
            await card.scrollIntoViewIfNeeded();
          }
          if (mode === 'live') {
            await card.locator('iframe').waitFor({ timeout: 30000 });
          } else if (mode === 'success') {
            await card.locator(`[data-post-id="${post.externalId}"]`).waitFor();
            assert.equal(
              await card.locator('.saved-post-text .post-text').textContent(),
              post.displayText ?? post.text,
            );
          } else {
            await card.getByRole('button', { name: 'Retry X media' }).waitFor();
            assert.equal(
              await card
                .locator('.post-text')
                .evaluate((element) => getComputedStyle(element).whiteSpace),
              'pre-wrap',
            );
            assert.equal(
              await card.locator('.post-text').textContent(),
              post.displayText ?? post.text,
            );
          }
        }
        if (mode !== 'live')
          assert.equal(scriptRequests, 1, 'One shared widget script per page');
        assert.equal(
          await page.evaluate(
            () => document.documentElement.scrollWidth <= innerWidth,
          ),
          true,
        );
        assert.deepEqual(errors, []);
        if (mode === 'blocked' || mode === 'hanging' || mode === 'live') {
          await cards.first().scrollIntoViewIfNeeded();
          await page.evaluate((live) => {
            const banner = document.createElement('p');
            banner.textContent = live
              ? 'Read-only replay · real verified posts · official X widgets · not a published edition'
              : 'Read-only replay · real verified posts · synthetic coverage links when enabled · widget unavailable · not a published edition';
            document.querySelector('.post-card')?.prepend(banner);
          }, mode === 'live');
          await cards.first().screenshot({
            path: `docs/screenshots/posts-${process.env.POST_EDITORIAL_REPLAY === '1' ? 'semantic-replay-' : ''}${mode}-${name}.png`,
          });
        }
        if (mode === 'blocked' || mode === 'hanging') {
          // A failed shared script must remain retryable without reloading the page.
          allowRetry = true;
          const card = cards.first();
          await card.scrollIntoViewIfNeeded();
          await card.getByRole('button', { name: 'Retry X media' }).click();
          await card
            .locator(`[data-post-id="${expected[0].externalId}"]`)
            .waitFor();
          await card.locator('.saved-post-text').waitFor();
          assert.equal(await card.locator('.post-embed-status').count(), 0);
          assert.equal(scriptRequests, 2, 'Retry loads one replacement script');
          if (mode === 'hanging') {
            // Expired widget promises may resolve and mutate their old target later.
            await page.evaluate(() => {
              const callbacks = (
                window as Window & { finishStalledWidgets?: Array<() => void> }
              ).finishStalledWidgets;
              callbacks?.forEach((finish) => finish());
            });
            assert.equal(await card.locator('[data-late-post]').count(), 0);
            assert.equal(await card.locator('[data-post-id]').count(), 1);
          }
          assert.equal(
            await card.locator('.saved-post-text .post-text').textContent(),
            expected[0].displayText ?? expected[0].text,
          );
        }
        await page.close();
      }
    }
    console.log(
      `Post replay passed (${process.env.POST_EMBED_LIVE === '1' ? 'live official widgets' : 'stubbed widgets, blocked and timed-out recovery'}): desktop/mobile, no overflow or page errors. No edition published.`,
    );
  } finally {
    await browser.close();
  }
}
void main();
