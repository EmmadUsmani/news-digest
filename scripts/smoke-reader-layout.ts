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
        assert.equal(
          await page.locator('.digest-topic').count(),
          edition.topics.length,
        );
        assert.equal(
          await page.locator('[data-slot="card"]').count(),
          edition.topics.reduce((n, topic) => n + topic.stories.length, 0),
        );
        const expectedContexts = edition.topics.flatMap((topic) =>
          topic.posts.flatMap((post) =>
            post.whyItMatters?.trim() ? [post.whyItMatters] : [],
          ),
        );
        assert.deepEqual(
          await page.locator('.post-context').allTextContents(),
          expectedContexts,
        );
        for (const post of edition.topics.flatMap((topic) => topic.posts)) {
          if (post.platform !== 'x') continue;
          const link = page
            .getByRole('link', {
              name: `View post by ${post.author} on X`,
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
            const expected = new Map<string, string>();
            for (const article of [story, ...(story.coverage ?? [])]) {
              for (const name of article.sources) {
                const key = name.trim().toLocaleLowerCase();
                if (key && !expected.has(key)) expected.set(key, name);
              }
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
                `+${expected.size - 2} more ${expected.size === 3 ? 'outlet' : 'outlets'}`,
              );
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
        const second = edition.topics[1];
        assert.ok(second);
        if (device === 'mobile') {
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
        const navigation =
          device === 'desktop'
            ? page.getByRole('navigation', { name: 'Edition contents' })
            : null;
        if (navigation) {
          const story = second.stories[0];
          await navigation
            .getByRole('link', { name: story.title, exact: true })
            .click();
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
