// Read-only layout/navigation checks against the real saved edition.
import assert from 'node:assert/strict';

import {
  digestPreviewSchema,
  readerEditionSchema,
  readerPostSchema,
} from '@digest/contracts';
import { chromium } from 'playwright';

import { localAdminJson } from './lib/local-admin-fetch';

const discoveryLabel = (name: string) =>
  name === 'Hacker News' || name.startsWith('Google News:')
    ? `via ${name}`
    : name;

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
  for (const topic of saved.topics) {
    for (const story of topic.stories) {
      const actual = edition.topics
        .find((item) => item.id === topic.id)!
        .stories.find((item) => item.id === story.id)!;
      const expected = [
        ...(story.coverage ?? []),
        ...(story.evidence ?? []),
      ].filter(
        (article, index, articles) =>
          articles.findIndex((other) => other.id === article.id) === index,
      );
      assert.deepEqual(
        actual.coverage?.map((article) => article.id) ?? [],
        expected.map((article) => article.id),
        'Reader reports retain every saved coverage article and editorial citation',
      );
    }
  }
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
        await page.clock.install();
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
        const editionHeading = page.getByRole('heading', { level: 1 });
        assert.equal(await editionHeading.count(), 1);
        assert.equal(
          await editionHeading.innerText(),
          await page.evaluate(
            (date) =>
              `News Digest — ${new Date(date).toLocaleDateString(undefined, { dateStyle: 'long' })}`,
            edition.windowEnd,
          ),
          'Heading navigation identifies the dated edition before its topics',
        );
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
          await page.locator('[id^="story-"][data-slot="card"]').count(),
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
        const storyAppearance = await page
          .locator('[id^="story-"]')
          .first()
          .evaluate((node) => {
            const style = getComputedStyle(node);
            return {
              radius: style.borderRadius,
              padding: style.padding,
              border: style.borderColor,
              background: style.backgroundColor,
              shadow: style.boxShadow,
            };
          });
        for (const heading of await page
          .getByRole('heading', { name: 'Posts', exact: true })
          .all()) {
          assert.equal(
            await heading.evaluate((node) => node.tagName),
            'H3',
            'Posts share the story heading level under their topic',
          );
          assert.deepEqual(
            await heading.evaluate((node) => {
              const style = getComputedStyle(node);
              return [style.fontSize, style.fontWeight];
            }),
            ['20px', '600'],
            'Posts use the approved section heading scale',
          );
        }
        for (const grid of await page.locator('.post-grid').all()) {
          assert.ok(
            await grid.evaluate((node) => {
              const style = getComputedStyle(node);
              return (
                style.maxHeight === 'none' &&
                style.overflowY === 'visible' &&
                node.scrollHeight <= node.clientHeight + 1
              );
            }),
            'Posts have no inner scrolling',
          );
          for (const card of await grid.locator('.post-card').all()) {
            await card.evaluate((node) =>
              window.scrollTo(
                0,
                window.scrollY + node.getBoundingClientRect().top - 120,
              ),
            );
            assert.ok(
              await card.evaluate((node) => {
                const bounds = node.getBoundingClientRect();
                return bounds.bottom > 0 && bounds.top < innerHeight;
              }),
              'Every saved post is reachable through page scrolling',
            );
            assert.equal(await grid.evaluate((node) => node.scrollTop), 0);
          }
          await page.clock.runFor(300);
          const cards = await grid.locator('.post-card').all();
          let previousBottom = -Infinity;
          for (const card of cards) {
            assert.equal(
              await card.evaluate((node) => node.tagName),
              'ARTICLE',
            );
            assert.deepEqual(
              await card.evaluate((node) => {
                const style = getComputedStyle(node);
                return {
                  radius: style.borderRadius,
                  padding: style.padding,
                  border: style.borderColor,
                  background: style.backgroundColor,
                  shadow: style.boxShadow,
                };
              }),
              storyAppearance,
              'Story and post cards share the final reader appearance',
            );
            const bounds = await card.boundingBox();
            assert.ok(bounds);
            assert.ok(bounds.y >= previousBottom, 'Posts occupy separate rows');
            const gridBounds = await grid.boundingBox();
            assert.ok(gridBounds);
            assert.ok(
              Math.abs(
                bounds.width -
                  (await grid.evaluate((node) => node.clientWidth)),
              ) < 2,
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
          const exact = await page.evaluate(
            (value) =>
              new Date(value).toLocaleString(undefined, {
                dateStyle: 'long',
                timeStyle: 'long',
              }),
            post.publishedAt,
          );
          assert.equal(await time.getAttribute('title'), exact);
          assert.equal(await time.getAttribute('aria-label'), exact);
          assert.match(
            await time.innerText(),
            /^(Just now|\d+[mhd] ago|[A-Z][a-z]+ \d+, \d{4})$/,
            'Post dates show compact ages while retaining exact timestamps',
          );
        }
        await page
          .locator('.post-card')
          .first()
          .screenshot({
            path: `docs/screenshots/ui/reader-post-date-${device}-${theme}.png`,
          });
        const expectedContexts = edition.topics.flatMap((topic) =>
          topic.posts.flatMap((post) => {
            const note = post.whyItMatters?.trim();
            const text = post.platform === 'reddit' ? post.title : post.text;
            const words = (value: string) =>
              value.trim().toLowerCase().split(/\s+/).join(' ');
            return note &&
              ![text, post.displayText].some(
                (value) => value && words(value) === words(note),
              )
              ? [note]
              : [];
          }),
        );
        assert.deepEqual(
          await page.locator('.post-context-text').allTextContents(),
          expectedContexts,
        );
        for (const note of await page.locator('.post-context').all()) {
          assert.ok(
            await note.locator('.post-context-text').evaluate((element) => {
              const style = getComputedStyle(element);
              return (
                style.whiteSpace === 'nowrap' &&
                style.textOverflow === 'ellipsis' &&
                element.getBoundingClientRect().height <=
                  Number.parseFloat(style.lineHeight) + 1
              );
            }),
            'Editorial notes occupy at most one line on desktop and mobile',
          );
          assert.ok(
            await note.locator('.post-context-text').evaluate((element) => {
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
          const card = page.locator('.post-card').filter({
            has: page.locator(`a[href="${post.url}"]:has(time)`),
          });
          const text = card.locator('.post-text');
          assert.equal(await text.innerText(), post.displayText ?? post.text);
          const link = text.locator(`a[href="${post.url}"]`).first();
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
            const published = sources.locator(':scope > span > time');
            assert.equal(
              await published.getAttribute('datetime'),
              story.publishedAt,
            );
            const exact = await page.evaluate(
              (value) =>
                new Date(value).toLocaleString(undefined, {
                  dateStyle: 'long',
                  timeStyle: 'long',
                }),
              story.publishedAt,
            );
            assert.equal(await published.getAttribute('title'), exact);
            assert.equal(await published.getAttribute('aria-label'), exact);
            assert.match(
              await published.innerText(),
              /^(Just now|\d+[mhd] ago|[A-Z][a-z]+ \d+, \d{4})$/,
            );
            assert.ok(await published.isVisible());
            if ((story.coverage?.length ?? 0) > 0) {
              const disclosure = card.locator('.coverage summary');
              assert.equal(
                await disclosure.getAttribute('aria-label'),
                `Show ${story.coverage!.length} ${story.coverage!.length === 1 ? 'article' : 'articles'} covering this story`,
              );
              if (device === 'desktop') {
                const timeBox = await published.boundingBox();
                const toggleBox = await disclosure.boundingBox();
                assert.ok(timeBox && toggleBox);
                assert.ok(
                  Math.abs(timeBox.y - toggleBox.y) < 4,
                  'Collapsed coverage stays on the desktop source row',
                );
                assert.ok(
                  toggleBox.x < timeBox.x,
                  'Grouped outlets stay beside publishers before the publication time',
                );
              }
              await disclosure.click();
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
              [...expected.values()].slice(0, 2).map(discoveryLabel),
            );
            for (const link of await visibleLinks.all()) {
              const name = (await link.innerText()).trim().replace(/^via /, '');
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
                `${story.coverage.length} articles · +${expected.size - 2} ${expected.size === 3 ? 'outlet' : 'outlets'}`,
              );
            }
            if (primary && story.sources[0] !== primary.sources[0]) {
              assert.equal(
                await visibleLinks.first().innerText(),
                discoveryLabel(primary.sources[0]),
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
            if (story.coverage && story.coverage.length > 0) {
              const disclosure = sources.locator('details');
              assert.ok(
                (
                  await disclosure.locator('summary').getAttribute('title')
                )?.startsWith(
                  `${story.coverage.length} ${story.coverage.length === 1 ? 'article' : 'articles'}`,
                ),
                'Readers can inspect the complete report count before expanding coverage',
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
              assert.deepEqual(
                await disclosure
                  .locator('li > span')
                  .evaluateAll((rows) =>
                    rows.map((row) =>
                      Array.from(row.querySelectorAll('a')).map((link) =>
                        link.textContent?.trim(),
                      ),
                    ),
                  ),
                story.coverage.map((article) =>
                  article.sources.slice(0, 1).map(discoveryLabel),
                ),
                'Each report credits one publisher rather than repeating feed sections',
              );
              if (story.title.startsWith('OpenSSH')) {
                await card.screenshot({
                  path: `docs/screenshots/ui/reader-discovery-source-${device}-${theme}.png`,
                });
              }
              if (story.title.includes('Sony lifts profit outlook')) {
                await card.screenshot({
                  path: `docs/screenshots/ui/reader-supporting-reports-${device}-${theme}.png`,
                });
              }
              if (story.id === edition.topics[0]?.stories[0]?.id) {
                await card.screenshot({
                  path: `docs/screenshots/ui/reader-single-report-${device}-${theme}.png`,
                });
              }
              if (
                story.coverage.some((article) => article.sources.length > 1)
              ) {
                await card.scrollIntoViewIfNeeded();
                await page.screenshot({
                  path: `docs/screenshots/ui/reader-coverage-outlets-${device}-${theme}.png`,
                });
              }
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
          // A topic jump must land near the top and below the fixed controls.
          // Failed lazy X embeds above it can add their recovery text after
          // the native anchor jump; allow that visible breathing room.
          return box && box.top >= 60 && box.bottom < innerHeight / 3;
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
        // Age labels follow time while the reader leaves the edition open.
        const firstStory = edition.topics.flatMap((topic) => topic.stories)[0];
        const publication = new Date(firstStory.publishedAt).getTime();
        const storyTime = page.locator(
          `[id="story-${firstStory.id}"] .story-sources > span > time`,
        );
        for (const [age, label] of [
          [60_000, '1m ago'],
          [60 * 60_000, '1h ago'],
          [1440 * 60_000, '1d ago'],
        ] as const) {
          await page.clock.setFixedTime(publication + age);
          await page.clock.fastForward(60_000);
          assert.equal(await storyTime.innerText(), label);
        }
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
