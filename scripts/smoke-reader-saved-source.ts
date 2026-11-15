// Saved edition plus explicit synthetic publisher/legacy controls; GET-only.
import assert from 'node:assert/strict';

import { readerEditionSchema } from '@digest/contracts';
import { chromium, expect } from 'playwright/test';

const origin = 'http://127.0.0.1:8000';
function expectedAttribution(report: {
  publisher?: { name: string };
  sources: string[];
  url: string;
}) {
  if (report.publisher) return report.publisher.name;
  const host = new URL(report.url).hostname.replace(/^www\./, '');
  return report.sources
    .map((source) =>
      source === 'Hacker News' || source.startsWith('Google News:')
        ? `${host} · via ${source}`
        : source,
    )
    .join(', ');
}
async function main() {
  // Loopback visitor admission only; this supplies no reader identity.
  const visitorHeaders = { 'X-Forwarded-For': '192.0.2.170' };
  const response = await fetch(`${origin}/api/editions/latest`, {
    headers: visitorHeaders,
    redirect: 'error',
  });
  assert.equal(response.status, 200, 'Saved reader edition must be available');
  const edition = readerEditionSchema.parse(await response.json());
  const discovery = edition.topics
    .flatMap((topic) => topic.stories)
    .find((story) => {
      const report =
        story.coverage?.find((item) => item.url === story.url) ?? story;
      return !report.publisher && report.sources.join(', ') === 'Hacker News';
    });
  assert.ok(discovery, 'a real discovery-only story is required');
  const discoveryAttribution = `${new URL(discovery.url).hostname.replace(/^www\./, '')} · via Hacker News`;
  const grouped = edition.topics
    .flatMap((topic) => topic.stories)
    .find(
      (story) =>
        story.coverage &&
        story.coverage.length > 1 &&
        story.sources.join(', ') !==
          story.coverage
            .find((article) => article.url === story.url)
            ?.sources.join(', '),
    );
  assert.ok(
    grouped,
    'a real grouped story with distinct primary provenance is required',
  );
  const primary = grouped.coverage!.find(
    (article) => article.url === grouped.url,
  )!;
  const publisher = structuredClone(grouped);
  publisher.id = '00000000-0000-4000-8000-000000000001';
  publisher.title = 'Synthetic publisher attribution control';
  publisher.publisher = {
    name: 'Aggregate publisher',
    url: 'https://aggregate.example/',
  };
  publisher.coverage!.find(
    (article) => article.url === publisher.url,
  )!.publisher = {
    name: 'Primary publisher',
    url: 'https://primary.example/',
  };
  const legacy = structuredClone(grouped);
  legacy.id = '00000000-0000-4000-8000-000000000002';
  legacy.title = 'Synthetic legacy attribution control';
  delete legacy.coverage;
  edition.topics[0].stories = [discovery, grouped, publisher, legacy];
  readerEditionSchema.parse(edition);
  const browser = await chromium.launch();
  try {
    for (const [device, width, height] of [
      ['desktop', 1440, 1100],
      ['mobile', 390, 844],
      ['narrow', 320, 844],
    ] as const) {
      for (const theme of ['light', 'dark'] as const) {
        const context = await browser.newContext({
          viewport: { width, height },
          colorScheme: theme,
          locale: 'en-US',
          timezoneId: theme === 'light' ? 'America/New_York' : 'Asia/Tokyo',
        });
        const errors: string[] = [];
        await context.route('**/*', (route) => {
          assert.equal(route.request().method(), 'GET');
          const url = new URL(route.request().url());
          if (url.origin !== origin) return route.abort();
          if (url.pathname === '/api/editions/latest')
            return route.fulfill({ json: edition });
          return route.continue({
            headers: { ...route.request().headers(), ...visitorHeaders },
          });
        });
        const page = await context.newPage();
        page.on('pageerror', (error) => errors.push(error.message));
        await page.goto(origin);
        for (const story of edition.topics[0].stories) {
          await page
            .locator(`#story-${story.id}`)
            .getByRole('button', {
              name: `Save story: ${story.title}`,
              exact: true,
            })
            .click();
        }
        await page.goto(`${origin}/saved`);
        await expect(
          page.getByRole('heading', { name: 'Saved items', exact: true }),
        ).toBeVisible();
        for (const [story, attribution] of [
          [discovery, discoveryAttribution],
          [grouped, expectedAttribution(primary)],
          [publisher, 'Primary publisher'],
          [legacy, expectedAttribution(legacy)],
        ] as const) {
          const titleLink = page.getByRole('link', {
            name: story.title,
            exact: true,
          });
          const item = page.locator('li').filter({ has: titleLink });
          await expect(item.locator(':scope > p').first()).toHaveText(
            attribution,
          );
          await expect(item.locator('.saved-published time')).toHaveAttribute(
            'datetime',
            story.publishedAt,
          );
          await expect(item.locator('.saved-published time')).toHaveText(
            new Date(story.publishedAt).toLocaleString('en-US', {
              year: 'numeric',
              month: 'short',
              day: 'numeric',
              hour: 'numeric',
              minute: '2-digit',
              timeZoneName: 'short',
              timeZone: theme === 'light' ? 'America/New_York' : 'Asia/Tokyo',
            }),
          );
          await expect(
            item.getByRole('link', { name: story.title, exact: true }),
          ).toHaveAttribute('href', story.url);
        }
        // Reproduce a pre-site-attribution bookmark without changing its URL or timestamp.
        const legacySnapshot = await page.evaluate(() => {
          const key = 'news-digest.reader-preferences.v1';
          const store = JSON.parse(localStorage.getItem(key)!);
          for (const change of Object.values<{
            copy: { attribution: string } | null;
          }>(store.bookmarks)) {
            if (change.copy?.attribution.endsWith(' · via Hacker News'))
              change.copy.attribution = 'Hacker News';
          }
          const snapshot = JSON.stringify(store);
          localStorage.setItem(key, snapshot);
          return snapshot;
        });
        await page.reload();
        await expect(
          page
            .locator('li')
            .filter({
              has: page.getByRole('link', {
                name: discovery.title,
                exact: true,
              }),
            })
            .locator(':scope > p')
            .first(),
        ).toHaveText(discoveryAttribution);
        assert.equal(
          await page.evaluate(() =>
            localStorage.getItem('news-digest.reader-preferences.v1'),
          ),
          legacySnapshot,
          'rendering old attribution must preserve stored snapshots',
        );
        await expect(
          page.getByRole('link', { name: grouped.title, exact: true }),
        ).toBeVisible();
        assert.equal(
          await page.evaluate(
            () => document.documentElement.scrollWidth > innerWidth,
          ),
          false,
        );
        await page.screenshot({
          path: `docs/screenshots/ui/reader-saved-source-${device}-${theme}.png`,
          fullPage: true,
        });
        assert.deepEqual(errors, []);
        await context.close();
      }
    }
    console.log(
      'Saved source attribution: real discovery site and grouped report, synthetic publisher override and legacy fallback pass in desktop/mobile/320px light/dark; reload and URLs preserved.',
    );
  } finally {
    await browser.close();
  }
}
void main();
