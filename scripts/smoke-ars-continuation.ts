// Recorded publisher reporting injected into an edition fixture; browser-local saves, GET-only.
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

import { readerEditionSchema } from '@digest/contracts';
import { chromium, expect } from 'playwright/test';

import { parseFeed } from '../apps/api/src/modules/ingestion/adapters/feed.adapter';
import { storyNeedsContinuation } from '../apps/web/src/story-continuation';

async function smoke() {
  const publisher = process.argv[2] ?? 'ars';
  assert.ok(
    ['ars', 'verge', 'eurogamer', 'rps', 'playstation', 'xbox'].includes(
      publisher,
    ),
  );
  for (const text of [
    'Read more',
    'Reporting. Read more',
    'Reporting! Read more.',
    'Reporting […]',
    'Reporting [...]',
  ])
    assert.ok(storyNeedsContinuation(text));
  for (const text of [
    'Readers should read more',
    'Readers should read more.',
    'Read more about the announcement here.',
    'Reporting. Read more. Further reporting.',
    'Reporting […] continues.',
    'Reporting [citation]',
  ])
    assert.equal(storyNeedsContinuation(text), false);
  const origin = 'http://127.0.0.1:8000';
  const edition = readerEditionSchema.parse(
    await (await fetch(`${origin}/api/editions/latest`)).json(),
  );
  const stories = edition.topics.flatMap((topic) => topic.stories);
  const story = stories.find((item) =>
    item.summary?.endsWith('Read the full article on pushsquare.com'),
  );
  const complete = stories.find((item) =>
    item.title.includes('Mouhamed Gueye'),
  );
  assert.ok(story && complete);
  const [report] = parseFeed(
    await readFile(
      publisher === 'ars'
        ? 'apps/api/test/fixtures/ars-outage-2026-11-13.xml'
        : publisher === 'verge'
          ? 'apps/api/test/fixtures/atom.xml'
          : `apps/api/test/fixtures/${publisher}.xml`,
      'utf8',
    ),
  );
  assert.ok(storyNeedsContinuation(report.excerpt));
  assert.ok(
    report.excerpt.endsWith(
      publisher === 'ars'
        ? 'Read full article Comments'
        : publisher === 'verge'
          ? 'Read the full story at The Verge.'
          : ['playstation', 'xbox'].includes(publisher)
            ? '[…]'
            : 'Read more',
    ),
  );
  // Keep the fixture's actual reporting, URL and title; publication is simulated.
  Object.assign(story, {
    title: report.title,
    summary: report.excerpt,
    url: report.url,
    publishedAt: report.publishedAt,
    sources: [
      publisher === 'ars'
        ? 'Ars Technica'
        : publisher === 'verge'
          ? 'The Verge'
          : publisher === 'rps'
            ? 'Rock Paper Shotgun'
            : publisher === 'playstation'
              ? 'PlayStation Blog'
              : publisher === 'xbox'
                ? 'Xbox Wire'
                : 'Eurogamer',
    ],
    coverage: undefined,
    publisher: undefined,
  });
  readerEditionSchema.parse(edition);
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
        });
        await context.route('**/*', (route) => {
          assert.ok(['GET', 'HEAD'].includes(route.request().method()));
          const url = new URL(route.request().url());
          if (
            url.origin === origin &&
            url.pathname === `/api/editions/${edition.id}`
          )
            return route.fulfill({ json: edition });
          return url.origin === origin ? route.continue() : route.abort();
        });
        const page = await context.newPage();
        const errors: string[] = [];
        page.on('pageerror', (error) => errors.push(error.message));
        await page.goto(`${origin}/editions/${edition.id}`);
        const card = page.locator(`[id="story-${story.id}"]`);
        await expect(card.locator('.excerpt')).toHaveText(story.summary!);
        const continuation = card.getByRole('link', {
          name: `Continue reading: ${story.title}`,
          exact: true,
        });
        await expect(continuation).toHaveAttribute('href', story.url);
        await expect(continuation).toHaveAttribute('target', '_blank');
        await continuation.focus();
        await expect(continuation).toBeFocused();
        await card.screenshot({
          path: `docs/screenshots/ui/${publisher}-continuation-edition-${device}-${theme}.png`,
        });
        await expect(
          page
            .locator(`[id="story-${complete.id}"]`)
            .getByRole('link', { name: /^Continue reading:/ }),
        ).toHaveCount(0);
        await page
          .getByRole('button', {
            name: `Save story: ${story.title}`,
            exact: true,
          })
          .click();
        await page.goto(`${origin}/saved`);
        const saved = page.getByRole('listitem').filter({
          has: page.getByRole('link', { name: story.title, exact: true }),
        });
        const savedText = await saved.locator('p.post-text').innerText();
        if (story.summary!.length <= 600)
          assert.equal(savedText, story.summary);
        else {
          assert.ok(savedText.length <= 600 && savedText.endsWith('…'));
          assert.ok(story.summary!.startsWith(savedText.slice(0, -1)));
        }
        await expect(
          saved.getByRole('link', {
            name: `Continue reading: ${story.title}`,
            exact: true,
          }),
        ).toHaveAttribute('href', story.url);
        await page.reload();
        await expect(saved.locator('p.post-text')).toHaveText(savedText);
        await expect(
          saved.getByRole('link', {
            name: `Continue reading: ${story.title}`,
            exact: true,
          }),
        ).toBeVisible();
        assert.ok(
          await page.evaluate(
            () => document.documentElement.scrollWidth <= innerWidth,
          ),
        );
        await page.screenshot({
          path: `docs/screenshots/ui/${publisher}-continuation-${device}-${theme}.png`,
          fullPage: true,
        });
        assert.deepEqual(errors, []);
        await context.close();
        console.log(
          `${device}/${theme}: recorded ${publisher} fixture and saved copy retain text, source destination and reload; complete story unchanged`,
        );
      }
    }
  } finally {
    await browser.close();
  }
}
void smoke();
