// Read-only layout/navigation checks against the real saved edition.
import assert from 'node:assert/strict';

import {
  digestPreviewSchema,
  readerEditionSchema,
  readerPostSchema,
} from '@digest/contracts';
import { chromium } from 'playwright';

import { localAdminJson } from './lib/local-admin-fetch';

async function smoke() {
  const origin = 'http://127.0.0.1:8000';
  const edition = readerEditionSchema.parse(
    await (await fetch(`${origin}/api/editions/latest`)).json(),
  );
  const saved = digestPreviewSchema.parse(
    await localAdminJson(`/api/admin/digest-previews/${edition.id}`),
  );
  assert.deepEqual(
    edition.topics.map((topic) => topic.posts),
    saved.topics.map((topic) =>
      (topic.posts ?? []).map((post) => readerPostSchema.parse(post)),
    ),
    'Reader posts retain saved editorial context and original text',
  );
  const browser = await chromium.launch();
  try {
    for (const [device, width, height] of [
      ['desktop', 1440, 1100],
      ['mobile', 390, 844],
    ] as const) {
      for (const theme of ['light', 'dark'] as const) {
        const context = await browser.newContext({
          viewport: { width, height },
          colorScheme: theme,
          reducedMotion: 'reduce',
        });
        const page = await context.newPage();
        const errors: string[] = [],
          forbidden: string[] = [];
        page.on('pageerror', (error) => errors.push(error.message));
        await context.route('**/*', (route) => {
          const request = route.request(),
            url = new URL(request.url());
          if (
            !['GET', 'HEAD'].includes(request.method()) ||
            (url.origin === origin && url.pathname.startsWith('/api/admin'))
          ) {
            forbidden.push(url.pathname);
            return route.abort();
          }
          // Do not make third-party requests during layout checks; app-drawn post cards stay visible.
          if (url.origin !== origin) return route.abort();
          return route.continue();
        });
        await page.goto(origin);
        await page.locator('.digest-topic').last().waitFor();
        await page.evaluate(() => document.fonts.ready);
        if (device === 'mobile') {
          await page.setViewportSize({ width: 320, height });
          const header = page.locator('header');
          const brand = header.getByRole('link', {
            name: 'News Digest',
            exact: true,
          });
          const date = header.locator('time');
          assert.equal(await date.getAttribute('datetime'), edition.windowEnd);
          assert.equal(
            await date.locator('..').getAttribute('aria-description'),
            await page.evaluate(
              (value) =>
                new Date(value).toLocaleDateString(undefined, {
                  dateStyle: 'long',
                }),
              edition.windowEnd,
            ),
            'The compact date retains its full date in its accessible description',
          );
          for (const item of [brand, date.locator(':scope > span').first()]) {
            assert.ok(
              await item.evaluate((node) => {
                const style = getComputedStyle(node);
                return (
                  node.getBoundingClientRect().height <=
                  parseFloat(style.lineHeight) + 1
                );
              }),
              'Small-screen wordmark and edition date stay on one line',
            );
          }
          assert.ok(
            await header.evaluate(
              (node) => node.scrollWidth <= node.clientWidth,
            ),
            'Small-screen header controls fit inside the reader',
          );
          await header.screenshot({
            path: `docs/screenshots/ui/reader-header-small-${theme}.png`,
          });
          await page.setViewportSize({ width, height });
        }
        assert.equal(
          await page.locator('.digest-topic').count(),
          edition.topics.length,
        );
        assert.equal(
          await page.locator('[data-slot="card"]').count(),
          edition.topics.reduce((n, topic) => n + topic.stories.length, 0),
        );
        for (const topic of edition.topics) {
          const brief = page
            .locator('.digest-topic')
            .filter({
              has: page.locator(`[id="topic-${topic.id}"]`),
            })
            .locator('.topic-brief');
          for (const line of topic.brief) {
            const story = topic.stories.find((item) => item.title === line);
            if (!story) continue;
            const link = brief.getByRole('link', { name: line, exact: true });
            assert.equal(
              await link.evaluate((node) => getComputedStyle(node).fontSize),
              '16px',
              'Brief links retain the brief text size',
            );
            await link.focus();
            await page.keyboard.press('Enter');
            await page.waitForURL((url) => url.hash === `#story-${story.id}`);
            assert.equal(new URL(page.url()).hash, `#story-${story.id}`);
            assert.equal(
              await page.locator(':focus').getAttribute('id'),
              `story-${story.id}`,
              'Brief navigation moves keyboard focus to the saved story',
            );
            const bounds = await page
              .locator(`[id="story-${story.id}"]`)
              .boundingBox();
            assert.ok(
              bounds && bounds.y >= 65 && bounds.y < height,
              'Brief destination is visible below the sticky navigation',
            );
          }
        }
        await page.goto(origin);
        await page.locator('.digest-topic').last().waitFor();
        await page.screenshot({
          path: `docs/screenshots/ui/reader-brief-${device}-${theme}.png`,
          fullPage: false,
        });
        for (const grid of await page.locator('.post-grid').all()) {
          const cards = await grid.locator('.post-card').all();
          let previousBottom = 0;
          for (const card of cards) {
            const bounds = await card.boundingBox();
            assert.ok(bounds);
            assert.ok(bounds.y >= previousBottom, 'Posts occupy separate rows');
            const gridBounds = await grid.boundingBox();
            assert.ok(gridBounds);
            assert.ok(
              Math.abs(bounds.width - gridBounds.width) < 2,
              'Each post fills the reader column',
            );
            previousBottom = bounds.y + bounds.height;
          }
        }
        const postTimes = page.locator('.post-card .byline time');
        const savedPosts = edition.topics.flatMap((topic) => topic.posts);
        assert.equal(await postTimes.count(), savedPosts.length);
        for (const [index, post] of savedPosts.entries()) {
          if (post.platform === 'x') {
            const author = page
              .locator('.post-card')
              .nth(index)
              .locator('.byline')
              .first()
              .getByRole('link', {
                name: post.author,
                exact: true,
              });
            assert.equal(await author.getAttribute('href'), post.authorUrl);
            assert.equal(await author.getAttribute('target'), '_blank');
            assert.equal(await author.getAttribute('rel'), 'noreferrer');
            assert.equal(
              await author.evaluate((node) => getComputedStyle(node).fontSize),
              '12px',
            );
            await author.focus();
            assert.ok(
              await author.evaluate((node) => document.activeElement === node),
            );
          }
          const time = postTimes.nth(index);
          assert.equal(await time.getAttribute('datetime'), post.publishedAt);
          assert.equal(
            await time.innerText(),
            await page.evaluate(
              (value) =>
                new Date(value).toLocaleString(undefined, {
                  dateStyle: 'medium',
                  timeStyle: 'short',
                }),
              post.publishedAt,
            ),
            'Post dates use the same readable local format as stories',
          );
        }
        await page
          .locator('.post-card')
          .first()
          .screenshot({
            path: `docs/screenshots/ui/reader-post-date-${device}-${theme}.png`,
          });
        const expectedContexts = edition.topics.flatMap((topic) =>
          topic.posts.flatMap((post) =>
            post.whyItMatters?.trim() ? [post.whyItMatters] : [],
          ),
        );
        assert.deepEqual(
          await page.locator('.post-context-text').allTextContents(),
          expectedContexts,
        );
        for (const note of await page.locator('.post-context').all()) {
          assert.equal(
            await note.locator('span').first().textContent(),
            'Digest context',
            'Editorial context is distinguished from the original author’s words',
          );
          assert.ok(
            await note.evaluate((element) => {
              const card = element.closest('.post-card')!;
              const text = card.querySelector('.post-text')!;
              return (
                element.getBoundingClientRect().top >=
                text.getBoundingClientRect().bottom
              );
            }),
            'Read the original post before its editorial context',
          );
        }
        for (const post of edition.topics.flatMap((topic) => topic.posts)) {
          if (post.platform !== 'x') continue;
          const link = page
            .getByRole('link', {
              name: `${post.displayText ?? post.text} — View post by ${post.author} on X`,
              exact: true,
            })
            .filter({ hasText: post.displayText ?? post.text });
          assert.equal(await link.getAttribute('href'), post.url);
          assert.equal(
            await link.evaluate((node) => getComputedStyle(node).fontSize),
            '16px',
          );
        }
        assert.equal(
          await page
            .getByText('Open original post on X', { exact: true })
            .count(),
          0,
        );
        for (const topic of edition.topics) {
          for (const story of topic.stories) {
            const card = page.locator(`[id="story-${story.id}"]`);
            assert.equal(await card.locator('h3').innerText(), story.title);
            const sources = card.locator('.story-sources');
            const published = sources.locator(':scope > time');
            assert.equal(
              await published.getAttribute('datetime'),
              story.publishedAt,
            );
            assert.equal(
              await published.innerText(),
              await page.evaluate(
                (value) =>
                  new Date(value).toLocaleString(undefined, {
                    dateStyle: 'medium',
                    timeStyle: 'short',
                  }),
                story.publishedAt,
              ),
              'Every story shows its exact saved publication date and local time',
            );
            assert.ok(await published.isVisible());
            if ((story.coverage?.length ?? 0) > 1) {
              await card.locator('.coverage summary').click();
              const times = card.locator('.coverage time');
              assert.deepEqual(
                await times.evaluateAll((nodes) =>
                  nodes.map((node) => node.getAttribute('datetime')),
                ),
                story.coverage!.map((article) => article.publishedAt),
                'Every grouped report retains its saved publication time',
              );
              for (const time of await times.all()) {
                assert.ok(await time.isVisible());
                assert.ok((await time.innerText()).trim().length > 0);
              }
              await card.locator('.coverage summary').click();
            }
            const expected = new Map<string, string>();
            const primary = story.coverage?.find(
              (article) => article.url === story.url,
            );
            for (const article of [
              primary ?? story,
              story,
              ...(story.coverage ?? []),
            ]) {
              for (const name of article.sources) {
                const report = story.coverage?.find((item) =>
                  item.sources.includes(name),
                );
                const key = new URL(
                  report?.url ?? article.url,
                ).hostname.replace(/^www\./, '');
                if (name.trim() && !expected.has(key)) expected.set(key, name);
              }
            }
            if (primary) {
              assert.equal(
                [...expected.values()][0],
                primary.sources[0],
                'Headline attribution starts with the primary publisher',
              );
            }
            const visibleLinks = sources.locator(':scope > a');
            if (await visibleLinks.count()) {
              assert.equal(
                await visibleLinks
                  .first()
                  .locator('span')
                  .evaluate((node) => getComputedStyle(node).fontSize),
                '12px',
              );
            }
            assert.deepEqual(
              await visibleLinks.allTextContents(),
              [...expected.values()].slice(0, 2),
            );
            for (const link of await visibleLinks.all()) {
              const name = (await link.innerText()).trim();
              const report = story.coverage?.find((article) =>
                article.sources.includes(name),
              );
              assert.equal(
                await link.getAttribute('href'),
                report?.url ?? story.url,
              );
              const icon = link.locator('img');
              if (await icon.count()) {
                assert.equal(
                  await icon.getAttribute('src'),
                  `${new URL(report?.url ?? story.url).origin}/favicon.ico`,
                );
              }
            }
            for (const image of await visibleLinks.locator('img').all()) {
              assert.equal(
                await image.getAttribute('referrerpolicy'),
                'no-referrer',
              );
              assert.equal(await image.getAttribute('alt'), '');
            }
            if (
              expected.size > 2 &&
              story.coverage &&
              story.coverage.length > 1
            ) {
              assert.equal(
                await sources.locator('summary').innerText(),
                `${story.coverage.length} articles · +${expected.size - 2} more ${expected.size === 3 ? 'outlet' : 'outlets'}`,
              );
            }
            if (primary && story.sources[0] !== primary.sources[0]) {
              assert.equal(
                await visibleLinks.first().innerText(),
                primary.sources[0],
                'Grouped World story credits the headline destination first',
              );
              assert.equal(
                await visibleLinks.first().getAttribute('href'),
                story.url,
              );
              const publishers = await visibleLinks.evaluateAll((links) =>
                links.map(
                  (link) => new URL((link as HTMLAnchorElement).href).hostname,
                ),
              );
              assert.equal(
                new Set(publishers).size,
                publishers.length,
                'Distinct publisher links occupy the visible source slots',
              );
              await card.scrollIntoViewIfNeeded();
              await page.screenshot({
                path: `docs/screenshots/ui/reader-primary-source-${device}-${theme}.png`,
              });
            }
            if (story.coverage && story.coverage.length > 1) {
              const disclosure = sources.locator('details');
              assert.ok(
                (await disclosure.locator('summary').innerText()).startsWith(
                  `${story.coverage.length} articles`,
                ),
                'Readers see the complete report count before expanding coverage',
              );
              await disclosure.locator('summary').click();
              assert.deepEqual(
                await disclosure.locator('li > a').allTextContents(),
                story.coverage.map((article) => article.title),
                'Expanded coverage lists every saved report, including the primary',
              );
              assert.deepEqual(
                await disclosure
                  .locator('li > a')
                  .evaluateAll((links) =>
                    links.map((link) => link.getAttribute('href')),
                  ),
                story.coverage.map((article) => article.url),
              );
              if (story.id === edition.topics[1]?.stories[0]?.id) {
                await card.scrollIntoViewIfNeeded();
                await page.screenshot({
                  path: `docs/screenshots/ui/reader-coverage-${device}-${theme}.png`,
                });
              }
              await disclosure.locator('summary').click();
            }
            if (story.summary)
              assert.equal(
                await card.locator('.excerpt').innerText(),
                story.summary,
              );
          }
        }
        assert.equal(await page.locator('form, a[href^="/admin"]').count(), 0);
        assert.doesNotMatch(
          await page.locator('main').innerText(),
          /Why it matters|Why selected|AI edited|Non-AI ranking|candidates examined|Browse saved editions|Immutable editions|Nothing added to fill/,
        );
        // Coverage clicks scroll through topics; reset before contents navigation.
        await page.goto(origin);
        await page.locator('.digest-topic').last().waitFor();
        await page.evaluate(() => document.fonts.ready);
        const second = edition.topics[1];
        assert.ok(second);
        if (device === 'mobile') {
          await page
            .getByRole('button', { name: 'Contents', exact: true })
            .click();
          await page.keyboard.press('Escape');
          await page.getByRole('dialog').waitFor({ state: 'hidden' });
          assert.equal(await page.locator(':focus').innerText(), 'Contents');
          await page.keyboard.press('Enter');
          const mobileContents = page.getByRole('navigation', {
            name: 'Mobile contents',
          });
          for (const story of edition.topics[0].stories) {
            const link = mobileContents.getByRole('link', {
              name: story.title,
              exact: true,
            });
            assert.ok(
              await link.evaluate(
                (element) => element.scrollWidth <= element.clientWidth + 1,
              ),
              `Mobile contents shows the full headline: ${story.title}`,
            );
          }
          await page.screenshot({
            path: `docs/screenshots/ui/reader-contents-${device}-${theme}.png`,
          });
          const firstStory = edition.topics[0].stories[0];
          await mobileContents
            .getByRole('link', { name: firstStory.title, exact: true })
            .focus();
          await page.keyboard.press('Enter');
          await page.getByRole('dialog').waitFor({ state: 'hidden' });
          assert.equal(new URL(page.url()).hash, `#story-${firstStory.id}`);
          await page.waitForFunction(
            (id) => document.activeElement?.id === `story-${id}`,
            firstStory.id,
          );
          // Let Radix finish removing the modal focus scope before the next key.
          await page.evaluate(
            () =>
              new Promise<void>((resolve) =>
                requestAnimationFrame(() =>
                  requestAnimationFrame(() => resolve()),
                ),
              ),
          );
          await page.keyboard.press('Tab');
          assert.equal(
            await page.locator(':focus').getAttribute('href'),
            firstStory.url,
          );
          await page
            .getByRole('button', { name: 'Contents', exact: true })
            .click();
          await page
            .getByRole('navigation', { name: 'Mobile contents' })
            .getByRole('link', { name: second.name, exact: true })
            .click();
          await page.getByRole('dialog').waitFor({ state: 'hidden' });
        } else {
          await page
            .getByRole('navigation', { name: 'Edition contents' })
            .getByRole('link', { name: second.name, exact: true })
            .click();
        }
        await page.waitForFunction((id) => {
          const box = document
            .getElementById(`topic-${id}`)
            ?.getBoundingClientRect();
          return box && box.top >= 60 && box.top < 190;
        }, second.id);
        assert.equal(new URL(page.url()).hash, `#topic-${second.id}`);
        await page.waitForFunction(
          (id) => document.activeElement?.id === `topic-${id}`,
          second.id,
        );
        const navigation =
          device === 'desktop'
            ? page.getByRole('navigation', { name: 'Edition contents' })
            : null;
        if (navigation) {
          for (const story of second.stories) {
            const link = navigation.getByRole('link', {
              name: story.title,
              exact: true,
            });
            assert.ok(
              await link.evaluate(
                (element) => element.scrollWidth <= element.clientWidth + 1,
              ),
              `Desktop contents must show the full headline: ${story.title}`,
            );
          }
          const story = second.stories[0];
          await navigation
            .getByRole('link', { name: story.title, exact: true })
            .focus();
          await page.keyboard.press('Enter');
          await page.waitForFunction(
            (id) => document.activeElement?.id === `story-${id}`,
            story.id,
          );
          await page.keyboard.press('Tab');
          assert.equal(
            await page.locator(':focus').getAttribute('href'),
            story.url,
          );
          await page.waitForFunction(
            (id) =>
              document.querySelector(
                `nav a[href="#story-${id}"][aria-current="location"]`,
              ) !== null,
            story.id,
          );
          const coverage = page.locator('.coverage').first();
          if (await coverage.count()) {
            await coverage.locator('summary').click();
            assert.ok(await coverage.locator('a').count());
          }
        }
        await page.goto(
          `${origin}/editions/${edition.id}#story-${second.stories[0].id}`,
        );
        await page.locator('.digest-topic').last().waitFor();
        await page.evaluate(() => document.fonts.ready);
        await page.waitForFunction((id) => {
          const box = document
            .getElementById(`story-${id}`)
            ?.getBoundingClientRect();
          return box && box.top >= 60 && box.top < 190;
        }, second.stories[0].id);
        await page.goto(origin);
        await page.locator('.digest-topic').last().waitFor();
        await page.evaluate(() => document.fonts.ready);
        assert.equal(
          await page.evaluate(
            () => document.documentElement.scrollWidth > innerWidth,
          ),
          false,
        );
        await page.screenshot({
          path: `docs/screenshots/ui/reader-layout-${device}-${theme}.png`,
        });
        assert.deepEqual(errors, []);
        assert.deepEqual(forbidden, []);
        await context.close();
      }
    }
    console.log(
      'Reader layout: real saved stories, four device/theme views, contents tracking, mobile sheet, deep links, coverage, no overflow/writes/admin reads; passed. External embeds blocked for deterministic layout checks.',
    );
  } finally {
    await browser.close();
  }
}
void smoke();
