// Read-only live empty-history check, then explicitly synthetic weekly UI responses.
// No generation, external requests or paid calls.
import assert from 'node:assert/strict';
import { mkdir } from 'node:fs/promises';

import {
  readerEditionSchema,
  readerWeeklyHistorySchema,
} from '@digest/contracts';
import { chromium } from 'playwright';

const origin = 'http://127.0.0.1:8000';
const headers = { 'X-Forwarded-For': '192.0.2.168' };
async function main() {
  const weeklyResponse = await fetch(`${origin}/api/weekly-editions`, {
    headers,
  });
  assert.equal(weeklyResponse.status, 200);
  const liveHistory = readerWeeklyHistorySchema.parse(
    await weeklyResponse.json(),
  );
  const dailyResponse = await fetch(`${origin}/api/editions/latest`, {
    headers,
  });
  assert.equal(dailyResponse.status, 200);
  const daily = readerEditionSchema.parse(await dailyResponse.json());
  const topic = daily.topics.find(
    (item) => item.stories.length && item.posts.length,
  )!;
  assert.ok(topic);
  const id = '11111111-1111-4111-8111-111111111111';
  const fixture = {
    id,
    kind: 'weekly',
    windowStart: '2026-11-15T17:00:00Z',
    windowEnd: '2026-11-22T17:00:00Z',
    topics: [
      {
        id: topic.id,
        name: topic.name,
        stories: [
          {
            title: 'Synthetic weekly UI example',
            summary:
              'Synthetic summary for layout verification; this is not a published weekly edition.',
            coverage: [
              {
                kind: 'story',
                editionId: daily.id,
                itemId: topic.stories[0].id,
                publishedAt: daily.windowEnd,
                title: topic.stories[0].title,
                url: 'https://example.com/story',
              },
              {
                kind: 'post',
                editionId: daily.id,
                itemId: topic.posts[0].externalId,
                publishedAt: daily.windowEnd,
                title: 'Daily post coverage',
                url: 'https://example.com/post',
              },
            ],
          },
        ],
      },
      {
        id: '22222222-2222-4222-8222-222222222222',
        name: 'Quiet topic',
        stories: [],
      },
    ],
  };
  const entry = {
    ...fixture,
    topics: fixture.topics.map(({ id, name }) => ({ id, name })),
  };
  const browser = await chromium.launch();
  await mkdir('docs/screenshots/ui', { recursive: true });
  try {
    for (const width of [390, 1440])
      for (const theme of ['light', 'dark'] as const) {
        const context = await browser.newContext({
          viewport: { width, height: 1000 },
          colorScheme: theme,
          extraHTTPHeaders: headers,
        });
        const page = await context.newPage();
        const errors: string[] = [];
        page.on('pageerror', (error) => errors.push(error.message));
        let synthetic = false;
        let fail = false;
        await page.route('**/*', async (route) => {
          const url = new URL(route.request().url());
          assert.ok(['GET', 'HEAD'].includes(route.request().method()));
          if (url.origin !== origin) return route.abort();
          if (synthetic && url.pathname === '/api/weekly-editions')
            return route.fulfill({
              json: {
                entries: url.searchParams.get('offset') === '20' ? [] : [entry],
                nextOffset: url.searchParams.get('offset') === '20' ? null : 20,
              },
            });
          if (synthetic && url.pathname === `/api/weekly-editions/${id}`)
            return fail
              ? route.fulfill({ status: 404, json: {} })
              : route.fulfill({ json: fixture });
          return route.continue();
        });
        await page.goto(`${origin}/editions`);
        await page.getByRole('link', { name: 'Week in review →' }).click();
        await page
          .getByRole('heading', { name: 'Week in review', exact: true })
          .waitFor();
        if (!liveHistory.entries.length)
          await page
            .getByText('No weekly editions have been published yet.')
            .waitFor();
        await page.screenshot({
          path: `docs/screenshots/ui/weekly-live-history-${width}-${theme}.png`,
          fullPage: true,
        });
        synthetic = true;
        await page.reload();
        const weeklyLink = page.getByRole('link', { name: /Week in review ·/ });
        await weeklyLink.waitFor();
        await page.getByRole('link', { name: 'Older weeks →' }).click();
        await page.getByText('No weekly editions on this page.').waitFor();
        await page.getByRole('link', { name: '← Newer weeks' }).click();
        await weeklyLink.focus();
        await page.keyboard.press('Enter');
        await page
          .getByRole('heading', { name: fixture.topics[0].stories[0].title })
          .waitFor();
        await page.getByText('No stories in this week’s review.').waitFor();
        const topicNavigation = page.getByRole('navigation', {
          name: 'Topics in this week’s review',
        });
        const quietLink = topicNavigation.getByRole('link', {
          name: 'Quiet topic',
        });
        await quietLink.focus();
        await page.keyboard.press('Enter');
        const quietHeading = page.getByRole('heading', {
          name: 'Quiet topic',
          exact: true,
        });
        await quietHeading.waitFor();
        assert.equal(
          await quietHeading.evaluate(
            (element) => element === document.activeElement,
          ),
          true,
        );
        assert.equal(
          new URL(page.url()).hash,
          `#weekly-topic-${fixture.topics[1].id}`,
        );
        await topicNavigation
          .getByRole('link', { name: topic.name, exact: true })
          .click();
        assert.equal(new URL(page.url()).hash, `#weekly-topic-${topic.id}`);
        await page.evaluate(() => window.scrollTo(0, 0));
        assert.equal(
          await page
            .locator(
              `a[href="/editions/${daily.id}#story-${topic.stories[0].id}"]`,
            )
            .count(),
          1,
        );
        assert.equal(
          await page
            .locator(`a[href="/editions/${daily.id}#posts-${topic.id}"]`)
            .count(),
          1,
        );
        assert.ok(
          await page.evaluate(
            () => document.documentElement.scrollWidth <= innerWidth,
          ),
        );
        await page.screenshot({
          path: `docs/screenshots/ui/weekly-synthetic-detail-${width}-${theme}.png`,
          fullPage: true,
        });
        fail = true;
        await page.reload();
        await page
          .getByText('This weekly edition could not be found.')
          .waitFor();
        assert.deepEqual(errors, []);
        await context.close();
      }
    console.log(
      `PASS: live weekly history (${liveHistory.entries.length} entries); synthetic detail, daily links, quiet topic, pagination, keyboard, 404 and 390/1440 light/dark screenshots.`,
    );
  } finally {
    await browser.close();
  }
}
void main();
