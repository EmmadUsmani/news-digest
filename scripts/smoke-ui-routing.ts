import assert from 'node:assert/strict';

import {
  readerEditionHistorySchema,
  readerEditionSchema,
} from '@digest/contracts';
import { chromium } from 'playwright';

// Read-only browser checks against actual stored editions. No generation.
async function smoke() {
  const base = 'http://localhost:8000';
  const read = async (path: string) => {
    const response = await fetch(`${base}${path}`, {
      signal: AbortSignal.timeout(15000),
    });
    assert.equal(response.status, 200, path);
    return response.json();
  };
  const history = readerEditionHistorySchema.parse(
    await read('/api/editions?offset=0'),
  );
  const entry = history.entries[1];
  assert.ok(entry, 'Need a historical edition distinct from latest');
  const edition = readerEditionSchema.parse(
    await read(`/api/editions/${entry.id}`),
  );
  const latest = readerEditionSchema.parse(await read('/api/editions/latest'));
  assert.notEqual(edition.id, latest.id);
  const browser = await chromium.launch();
  try {
    const context = await browser.newContext();
    const writes: string[] = [];
    await context.route('**/*', async (route) => {
      const request = route.request();
      if (!['GET', 'HEAD'].includes(request.method())) {
        writes.push(`${request.method()} ${new URL(request.url()).pathname}`);
        return route.abort();
      }
      if (new URL(request.url()).origin !== base) return route.abort();
      return route.continue();
    });
    for (const [device, width, height, theme] of [
      ['desktop', 1440, 1100, 'light'],
      ['desktop', 1440, 1100, 'dark'],
      ['mobile', 390, 844, 'light'],
      ['mobile', 390, 844, 'dark'],
    ] as const) {
      const page = await context.newPage();
      page.setDefaultTimeout(15000);
      await page.emulateMedia({ colorScheme: theme, reducedMotion: 'reduce' });
      const expectSavedContent = async (saved: typeof edition) => {
        await page.locator('.digest-topic').last().waitFor();
        assert.equal(
          await page.locator('.digest-topic').count(),
          saved.topics.length,
        );
        for (const topic of saved.topics) {
          const section = page.locator('.digest-topic').filter({
            has: page.getByRole('heading', { name: topic.name, exact: true }),
          });
          for (const story of topic.stories) {
            const item = section.locator(`[id="story-${story.id}"]`);
            await item.waitFor();
            assert.equal(
              await item.getByRole('heading').getByRole('link').textContent(),
              story.title,
            );
            if (story.summary)
              assert.equal(
                await item.locator('.excerpt').textContent(),
                story.summary,
              );
          }
        }
      };
      await page.setViewportSize({ width, height });
      const errors: string[] = [];
      page.on('pageerror', (error) => errors.push(error.message));
      let legacyHistoryReads = 0;
      page.on('request', (request) => {
        if (
          new URL(request.url()).pathname.startsWith(
            '/api/admin/digest-previews',
          )
        )
          legacyHistoryReads++;
      });
      await page.goto(`http://localhost:8000/?edition=${edition.id}`);
      await page.waitForURL(`**/editions/${edition.id}`);
      await expectSavedContent(edition);
      await page.reload();
      await expectSavedContent(edition);
      await page.getByRole('link', { name: 'Browse past editions' }).click();
      await page.getByRole('heading', { name: 'Past editions' }).waitFor();
      const selected = page.locator(`main a[href="/editions/${edition.id}"]`);
      await selected.waitFor();
      if (history.hasMore) {
        await page.getByRole('link', { name: 'Older editions' }).click();
        await page.waitForURL('**/editions?page=2');
        await page.locator('main li').first().waitFor();
        assert.equal(await selected.count(), 0);
        await page.getByRole('link', { name: 'Newer editions' }).click();
        await selected.waitFor();
      }
      assert.equal(
        legacyHistoryReads,
        0,
        'Edition and history use reader endpoints only',
      );
      let historicalReads = 0;
      page.on('request', (request) => {
        if (request.url().endsWith(`/api/editions/${edition.id}`))
          historicalReads++;
      });
      await page
        .getByRole('link', { name: 'News Digest', exact: true })
        .click();
      await page.waitForURL(`${base}/`);
      await expectSavedContent(latest);
      await page.getByRole('link', { name: 'Browse past editions' }).click();
      await selected.click();
      await page.waitForURL(`**/editions/${edition.id}`);
      await expectSavedContent(edition);
      assert.equal(
        historicalReads,
        0,
        'Fresh historical edition uses shared cache',
      );
      assert.ok(await page.locator('main').isVisible());
      assert.equal(
        await page
          .getByRole('heading', { name: 'Incoming from your sources.' })
          .count(),
        0,
      );
      assert.ok(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth,
        ),
      );
      await page.evaluate(() => document.fonts.ready);
      assert.ok(
        await page.evaluate(() =>
          document.fonts.check('16px "Inter Variable"'),
        ),
        'Self-hosted Inter must load',
      );
      await page.evaluate(() => scrollTo(0, 0));
      await page.screenshot({
        path: `docs/screenshots/ui/foundations-routing-${device}-${theme}.png`,
      });
      const topic = page.locator('.digest-topic').first();
      assert.ok(
        (await topic.locator('li').count()) > 0,
        'Real saved stories render',
      );
      assert.doesNotMatch(
        await topic.innerText(),
        /Why selected|Why it matters|AI edited|Non-AI ranking|candidates examined|filtered by quality rules/,
      );
      await topic.screenshot({
        path: `docs/screenshots/ui/reader-content-${device}-${theme}.png`,
      });
      // A malformed response must not leave the previous edition on screen.
      const invalidId = '00000000-0000-4000-8000-000000000099';
      await page.route(`**/api/editions/${invalidId}`, (route) =>
        route.fulfill({ json: { id: invalidId, topics: [] } }),
      );
      await page.goto(`http://localhost:8000/editions/${invalidId}`);
      await page
        .getByRole('alert')
        .filter({
          hasText: 'Could not load the edition.',
        })
        .waitFor();
      assert.equal(await page.locator('.digest-topic').count(), 0);
      assert.equal(
        await page.getByText('No edition yet.', { exact: false }).count(),
        0,
      );
      await page.goto('http://localhost:8000/unknown-reader-route');
      await page.getByRole('heading', { name: 'Page not found' }).waitFor();
      await page.getByRole('link', { name: 'Back to News Digest' }).click();
      await page.waitForURL('http://localhost:8000/');
      await expectSavedContent(latest);
      assert.deepEqual(errors, []);
      await page.close();
    }
    for (const path of [
      '/api',
      '/api/no-such-route',
      '/healthz/no-such-route',
    ]) {
      const response = await context.request.get(
        `http://localhost:8000${path}`,
      );
      assert.equal(response.status(), 404, path);
      assert.ok(!(await response.text()).includes('<div id="root">'), path);
    }
    const health = await context.request.get('http://localhost:8000/healthz');
    assert.equal(health.status(), 200);
    assert.deepEqual(writes, [], 'No browser API writes');
    assert.deepEqual(
      readerEditionSchema.parse(await read(`/api/editions/${edition.id}`)),
      edition,
    );
    assert.deepEqual(
      readerEditionSchema.parse(await read('/api/editions/latest')),
      latest,
    );
    assert.deepEqual(
      readerEditionHistorySchema.parse(await read('/api/editions?offset=0')),
      history,
    );
    console.log(
      'Desktop/mobile light/dark canonical links, reload, cached edition switching, legacy redirect, not-found and reserved-path checks passed; real saved editions, no writes.',
    );
    await context.close();
  } finally {
    await browser.close();
  }
}
void smoke();
