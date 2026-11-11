// Real saved coverage; GET-only, external traffic blocked.
import assert from 'node:assert/strict';

import { readerEditionSchema } from '@digest/contracts';
import { chromium } from 'playwright';

async function main() {
  const origin = 'http://127.0.0.1:8000';
  const edition = readerEditionSchema.parse(
    await (await fetch(`${origin}/api/editions/latest`)).json(),
  );
  const story = edition.topics
    .flatMap((topic) => topic.stories)
    .find((item) => {
      const primary = item.coverage?.find((report) => report.url === item.url);
      return (
        primary &&
        !primary.publisher &&
        item.sources.some((source) => !primary.sources.includes(source)) &&
        item.coverage?.some((report) => report.publisher) &&
        item.coverage.length > 2
      );
    });
  assert.ok(story?.coverage, 'Saved mixed feed/publisher coverage is required');
  const outletCount = new Set(
    story.coverage.map((report) =>
      report.publisher
        ? `publisher:${report.publisher.name.trim().toLocaleLowerCase()}`
        : new URL(report.url).hostname.replace(/^www\./, ''),
    ),
  ).size;
  assert.ok(outletCount > 2);
  const browser = await chromium.launch();
  try {
    for (const [device, width, height] of [
      ['desktop', 1440, 1100],
      ['mobile', 390, 844],
    ] as const) {
      for (const theme of ['light', 'dark'] as const) {
        const page = await browser.newPage({
          viewport: { width, height },
          colorScheme: theme,
        });
        const errors: string[] = [];
        page.on('pageerror', (error) => errors.push(error.message));
        await page.route('**/*', (route) => {
          assert.equal(route.request().method(), 'GET');
          const url = new URL(route.request().url());
          if (url.origin !== origin) return route.abort();
          if (url.pathname === '/api/editions/latest')
            return route.fulfill({ json: edition });
          return route.continue();
        });
        await page.goto(origin);
        const card = page.locator(`#story-${story.id}`);
        const sources = card.locator('.story-sources');
        const summary = sources.locator('summary');
        await summary.waitFor();
        assert.equal(
          await summary.innerText(),
          `${story.coverage.length} articles · +${outletCount - 2} ${outletCount === 3 ? 'outlet' : 'outlets'}`,
        );
        assert.equal(
          await sources.locator('details').getAttribute('open'),
          null,
        );
        await summary.click();
        assert.deepEqual(
          await sources
            .locator('details li > a')
            .evaluateAll((nodes) =>
              nodes.map((node) => node.getAttribute('href')),
            ),
          story.coverage.map((item) => item.url),
        );
        await summary.click();
        await card.scrollIntoViewIfNeeded();
        assert.ok(
          await card.evaluate((node) => node.scrollWidth <= node.clientWidth),
        );
        await card.screenshot({
          path: `docs/screenshots/ui/reader-coverage-count-${device}-${theme}.png`,
        });
        assert.deepEqual(errors, []);
        await page.close();
      }
    }
    console.log(
      'Saved mixed-publisher coverage has exact outlet counts and every report link on desktop/mobile light/dark; GET-only, no writes.',
    );
  } finally {
    await browser.close();
  }
}
void main();
