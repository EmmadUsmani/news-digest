// Read-only UI replay of actual saved candidates; never publishes an edition.
// Official widgets are stubbed for deterministic checks; opt in separately to live embeds.
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

import { readerEditionSchema, selectedPostSchema } from '@digest/contracts';
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
  const readEdition = async (path = '/api/editions/latest') => {
    const response = await fetch(`http://localhost:8000${path}`, {
      signal: AbortSignal.timeout(15_000),
    });
    assert.equal(response.status, 200);
    return readerEditionSchema.parse(await response.json());
  };
  const saved = await readEdition();
  const savedPath = `/api/editions/${saved.id}`;
  const unexpectedWrites: string[] = [];
  const browser = await chromium.launch();
  try {
    for (const [name, width, height] of [
      ['desktop', 1440, 1100],
      ['mobile', 390, 844],
    ] as const) {
      for (const mode of process.env.POST_EMBED_LIVE === '1'
        ? (['live'] as const)
        : ([
            'success',
            'blocked',
            'script-timeout',
            'hanging',
            'rejected',
            'empty',
          ] as const)) {
        const page = await browser.newPage({ viewport: { width, height } });
        const errors: string[] = [];
        page.on('pageerror', (error) =>
          errors.push(error.stack ?? error.message),
        );
        const snapshot = structuredClone(saved);
        snapshot.topics.forEach((topic) => {
          topic.posts = (
            screened.find((row) => row.topic === topic.name)?.selected ?? []
          ).slice(0, mode === 'live' ? 1 : undefined);
        });
        const replay = readerEditionSchema.parse(snapshot);
        assert.ok(replay.topics.flatMap((topic) => topic.posts).length > 0);
        assert.ok(
          replay.topics
            .flatMap((topic) => topic.posts)
            .every((post) => !('whyItMatters' in post) && !('reasons' in post)),
        );
        // Exercise historical snapshots without the optional display field too.
        const legacyPost = replay.topics
          .flatMap((topic) => topic.posts ?? [])
          .at(-1);
        if (legacyPost) delete legacyPost.displayText;
        if (mode === 'hanging' || mode === 'script-timeout') {
          // Accelerate only the production embed deadline; leave other timers intact.
          await page.addInitScript(
            (deadline) => {
              const original = window.setTimeout.bind(window);
              window.setTimeout = ((
                handler: TimerHandler,
                timeout?: number,
                ...args: unknown[]
              ) =>
                original(
                  handler,
                  timeout === 15000 ? deadline : timeout,
                  ...args,
                )) as typeof window.setTimeout;
            },
            mode === 'script-timeout' ? 1000 : 100,
          );
        }
        if (mode === 'script-timeout') {
          await page.addInitScript(() => {
            // Preserve the native receiver with apply below.
            // eslint-disable-next-line @typescript-eslint/unbound-method
            const append = HTMLHeadElement.prototype.append;
            HTMLHeadElement.prototype.append = function (
              ...nodes: (Node | string)[]
            ) {
              for (const node of nodes) {
                if (
                  node instanceof HTMLScriptElement &&
                  node.src.includes('platform.twitter.com')
                ) {
                  (
                    window as Window & { firstWidgetScript?: HTMLScriptElement }
                  ).firstWidgetScript ??= node;
                }
              }
              append.apply(this, nodes);
            };
          });
        }
        let releaseInitial!: () => void;
        const initialDownload = new Promise<void>((resolve) => {
          releaseInitial = resolve;
        });
        let scriptRequests = 0;
        let allowRetry = false;
        let releaseRetry!: () => void;
        const retryDownload = new Promise<void>((resolve) => {
          releaseRetry = resolve;
        });
        let retryStarted!: () => void;
        const retryRequest = new Promise<void>((resolve) => {
          retryStarted = resolve;
        });
        if (mode !== 'live')
          await page.route(
            'https://platform.twitter.com/widgets.js',
            async (route) => {
              scriptRequests++;
              if (mode === 'script-timeout' && !allowRetry) {
                await initialDownload;
                return route.abort();
              }
              if (mode === 'blocked' && !allowRetry) return route.abort();
              if (mode === 'blocked') {
                retryStarted();
                await retryDownload;
              }
              await route.fulfill({
                contentType: 'text/javascript',
                body:
                  mode === 'hanging' && !allowRetry
                    ? `window.twttr = { widgets: { createTweet: (id, target) => new Promise(resolve => { (window.finishStalledWidgets ??= []).push(() => { const element = document.createElement('div'); element.dataset.latePost = id; target.append(element); resolve(element); }); }) } };`
                    : (mode === 'rejected' || mode === 'empty') && !allowRetry
                      ? `window.twttr = { widgets: { createTweet: async (id, target) => { const partial = document.createElement('div'); partial.dataset.partialPost = id; target.append(partial); (window.finishStalledWidgets ??= []).push(() => { const late = document.createElement('div'); late.dataset.latePost = id; target.append(late); }); ${mode === 'rejected' ? "throw new Error('Widget rejected after inserting markup');" : 'return undefined;'} } } };`
                      : `window.twttr = { widgets: { createTweet: async (id, target, options) => { const element = document.createElement('div'); element.dataset.postId = id; element.dataset.theme = options.theme; element.textContent = 'Recorded widget protocol stub'; target.append(element); return element; } } };`,
              });
            },
          );
        await page.route('**/api/**', (route) => {
          const request = route.request();
          if (!['GET', 'HEAD'].includes(request.method())) {
            unexpectedWrites.push(
              `${request.method()} ${new URL(request.url()).pathname}`,
            );
            return route.abort();
          }
          if (new URL(request.url()).pathname === '/api/editions/latest')
            return route.fulfill({ json: replay });
          return route.continue();
        });
        await page.emulateMedia({ colorScheme: 'light' });
        await page.goto('http://localhost:8000');
        await page.locator('.top-posts').first().waitFor();
        assert.equal(
          scriptRequests,
          0,
          'Widgets must wait until posts approach the viewport',
        );
        for (const topic of replay.topics) {
          const section = page.locator('.digest-topic').filter({
            has: page.getByRole('heading', { name: topic.name, exact: true }),
          });
          assert.deepEqual(
            await section.locator('li > a').allTextContents(),
            topic.stories.map((story) => story.title),
          );
          assert.deepEqual(
            await section.locator('p.excerpt').allTextContents(),
            topic.stories.map((story) => story.summary).filter(Boolean),
          );
        }
        const cards = page.locator('.post-card');
        const expected = replay.topics
          .flatMap((topic) => topic.posts)
          .filter((post) => post.platform === 'x');
        assert.equal(await cards.count(), expected.length);
        if (mode === 'success') {
          const distant = cards.last();
          const bounds = await distant.boundingBox();
          assert.ok(bounds && bounds.y > height + 200);
          assert.equal(await distant.locator('[data-post-id]').count(), 0);
          await cards.first().scrollIntoViewIfNeeded();
          await cards.first().locator('[data-post-id]').waitFor();
          await page.emulateMedia({ colorScheme: 'dark' });
          await cards.first().locator('[data-theme="dark"]').waitFor();
          assert.equal(
            await distant.locator('[data-post-id]').count(),
            0,
            'Theme changes must not create widgets for distant posts',
          );
          await distant.scrollIntoViewIfNeeded();
          await distant.locator('[data-theme="dark"]').waitFor();
          assert.equal(scriptRequests, 1);
          await distant.screenshot({
            path: `docs/screenshots/ui/posts-lazy-dark-${name}.png`,
          });
          await page.emulateMedia({ colorScheme: 'light' });
          await distant.locator('[data-theme="light"]').waitFor();
        }
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
            assert.equal(await card.locator('.official-post > *').count(), 0);
            await page.evaluate(() => {
              (
                window as Window & { finishStalledWidgets?: Array<() => void> }
              ).finishStalledWidgets?.forEach((finish) => finish());
            });
            assert.equal(await card.locator('[data-late-post]').count(), 0);
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
        if (mode === 'success') {
          const card = cards.first();
          await card.scrollIntoViewIfNeeded();
          for (const colorScheme of ['dark', 'light'] as const) {
            await page.emulateMedia({ colorScheme });
            await card
              .locator(`[data-post-id][data-theme="${colorScheme}"]`)
              .waitFor();
          }
          for (const theme of ['light', 'dark', 'light'] as const) {
            if (
              theme !== 'light' ||
              (await page
                .locator('html')
                .evaluate((element) => element.classList.contains('dark')))
            ) {
              await page
                .getByRole('button', { name: `Switch to ${theme} theme` })
                .click();
              await card.scrollIntoViewIfNeeded();
            }
            await card
              .locator(`[data-post-id][data-theme="${theme}"]`)
              .waitFor();
            assert.equal(await card.locator('[data-post-id]').count(), 1);
            assert.equal(
              scriptRequests,
              1,
              'Theme changes reuse the loaded widget API',
            );
            await card.screenshot({
              path: `docs/screenshots/ui/posts-theme-${theme}-${name}.png`,
            });
          }
        }
        if (mode !== 'success') {
          await cards.first().scrollIntoViewIfNeeded();
          await page.evaluate((live) => {
            const banner = document.createElement('p');
            banner.textContent = live
              ? 'Read-only replay · real verified posts · official X widgets · not a published edition'
              : 'Read-only replay · real verified posts · widget unavailable · not a published edition';
            document.querySelector('.post-card')?.prepend(banner);
          }, mode === 'live');
          await cards.first().screenshot({
            path: `docs/screenshots/posts-${mode}-${name}.png`,
          });
        }
        if (mode !== 'success' && mode !== 'live') {
          // A failed shared script must remain retryable without reloading the page.
          allowRetry = true;
          // Replace only the failed widget method, as a recovered provider would.
          // A successfully loaded script must not be fetched again for a card retry.
          if (mode !== 'blocked' && mode !== 'script-timeout')
            await page.evaluate(() => {
              const api = (
                window as Window & {
                  twttr?: {
                    widgets: {
                      createTweet: (
                        id: string,
                        target: HTMLElement,
                      ) => Promise<HTMLElement>;
                    };
                  };
                }
              ).twttr;
              if (api)
                api.widgets.createTweet = (id, target) => {
                  const element = document.createElement('div');
                  element.dataset.postId = id;
                  element.textContent = 'Recorded widget protocol stub';
                  target.append(element);
                  return Promise.resolve(element);
                };
            });
          if (mode === 'script-timeout') {
            assert.deepEqual(
              await page.evaluate(() => {
                const script = (
                  window as Window & { firstWidgetScript?: HTMLScriptElement }
                ).firstWidgetScript;
                return {
                  connected: script?.isConnected,
                  load: script?.onload,
                  error: script?.onerror,
                };
              }),
              { connected: false, load: null, error: null },
              'Timed-out downloads detach callbacks before retry',
            );
            releaseInitial();
          }
          const card = cards.first();
          await card.scrollIntoViewIfNeeded();
          await card.getByRole('button', { name: 'Retry X media' }).click();
          if (mode === 'blocked') {
            await retryRequest;
            assert.ok(expected.length > 1, 'Concurrent retries need two cards');
            const second = cards.nth(1);
            await second.scrollIntoViewIfNeeded();
            await second.getByRole('button', { name: 'Retry X media' }).click();
            await page.evaluate(
              () =>
                new Promise<void>((resolve) =>
                  requestAnimationFrame(() =>
                    requestAnimationFrame(() => resolve()),
                  ),
                ),
            );
            releaseRetry();
            await second
              .locator(`[data-post-id="${expected[1].externalId}"]`)
              .waitFor();
          }
          await card
            .locator(`[data-post-id="${expected[0].externalId}"]`)
            .waitFor();
          await card.locator('.saved-post-text').waitFor();
          assert.equal(await card.locator('.post-embed-status').count(), 0);
          assert.equal(
            scriptRequests,
            mode === 'blocked' || mode === 'script-timeout' ? 2 : 1,
            'Only a failed script download needs a replacement script',
          );
          releaseInitial();
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
        assert.deepEqual(errors, []);
        assert.equal(
          await page.evaluate(
            () => document.documentElement.scrollWidth <= innerWidth,
          ),
          true,
        );
        await page.close();
      }
    }
    assert.deepEqual(unexpectedWrites, []);
    assert.deepEqual(
      await readEdition(savedPath),
      saved,
      'Saved edition must remain unchanged',
    );
    console.log(
      `Post replay passed (${process.env.POST_EMBED_LIVE === '1' ? 'live official widgets' : 'stubbed widgets, blocked/stalled downloads, timed-out, rejected and empty-widget recovery'}): desktop/mobile, no overflow or page errors. No edition published.`,
    );
  } finally {
    await browser.close();
  }
}
void main();
