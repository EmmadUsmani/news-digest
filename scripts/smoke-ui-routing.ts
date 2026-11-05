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
    await context.route('**/api/**', async (route) => {
      const request = route.request();
      if (!['GET', 'HEAD'].includes(request.method())) {
        writes.push(`${request.method()} ${new URL(request.url()).pathname}`);
        return route.abort();
      }
      return route.continue();
    });
    for (const [device, width, height] of [
      ['desktop', 1440, 1100],
      ['mobile', 390, 844],
    ] as const) {
      const page = await context.newPage();
      page.setDefaultTimeout(15000);
      const expectSavedContent = async (saved: typeof edition) => {
        await page
          .locator('.period')
          .filter({ hasText: saved.id.slice(0, 8) })
          .waitFor();
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
              await item.locator(':scope > a').textContent(),
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
        if (new URL(request.url()).pathname.startsWith('/api/digest-previews'))
          legacyHistoryReads++;
      });
      await page.goto(`http://localhost:8000/?edition=${edition.id}`);
      await page.waitForURL(`**/editions/${edition.id}`);
      const selected = page.locator(
        `.edition-history a[href="/editions/${edition.id}"]`,
      );
      await selected.waitFor({ state: 'attached' });
      await page.waitForFunction(() =>
        document.querySelector('.edition-history a[aria-current="page"]'),
      );
      assert.equal(await selected.getAttribute('aria-current'), 'page');
      await expectSavedContent(edition);
      await page.reload();
      await page.waitForFunction(() =>
        document.querySelector('.edition-history a[aria-current="page"]'),
      );
      assert.equal(await selected.getAttribute('aria-current'), 'page');
      await expectSavedContent(edition);
      await page.locator('.edition-history summary').click();
      await page.getByRole('button', { name: 'Older editions' }).click();
      await page.getByText('Page 2', { exact: true }).waitFor();
      await page.waitForFunction(
        () =>
          document.querySelectorAll('.edition-history a[href^="/editions/"]')
            .length === 20 &&
          !document.querySelector('.edition-history a[aria-current="page"]'),
      );
      await page.getByRole('button', { name: 'Newer editions' }).click();
      await page.waitForFunction(() =>
        document.querySelector('.edition-history a[aria-current="page"]'),
      );
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
      await page.getByRole('button', { name: 'Open latest edition' }).click();
      await page.waitForURL('http://localhost:8000/');
      await page.waitForFunction(
        (id) =>
          document
            .querySelector('.edition-history a[aria-current="page"]')
            ?.getAttribute('href') !== `/editions/${id}`,
        edition.id,
      );
      await expectSavedContent(latest);
      await selected.click();
      await page.waitForURL(`**/editions/${edition.id}`);
      await page.waitForFunction(
        (id) =>
          document
            .querySelector('.edition-history a[aria-current="page"]')
            ?.getAttribute('href') === `/editions/${id}`,
        edition.id,
      );
      await expectSavedContent(edition);
      assert.equal(
        historicalReads,
        0,
        'Fresh historical edition uses shared cache',
      );
      await page.locator('.edition-history summary').click();
      assert.ok(await page.locator('.digest-preview').isVisible());
      assert.ok(
        await page
          .getByRole('heading', { name: 'Incoming from your sources.' })
          .isVisible(),
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
      const button = page
        .locator('.digest-preview [data-slot="button"]')
        .first();
      assert.equal(
        await button.evaluate((node) => getComputedStyle(node).display),
        'inline-flex',
      );
      assert.equal(
        await button.evaluate((node) => getComputedStyle(node).fontSize),
        '14px',
      );
      await page.evaluate(() => scrollTo(0, 0));
      await page.screenshot({
        path: `docs/screenshots/ui/foundations-routing-${device}.png`,
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
      for (const theme of ['light', 'dark']) {
        await page.evaluate((value) => {
          document.documentElement.classList.toggle('dark', value === 'dark');
        }, theme);
        await topic.screenshot({
          path: `docs/screenshots/ui/reader-content-${device}-${theme}.png`,
        });
      }
      await page.evaluate(() =>
        document.documentElement.classList.remove('dark'),
      );
      // A malformed response must not leave the previous edition on screen.
      const invalidId = '00000000-0000-4000-8000-000000000099';
      await page.route(`**/api/editions/${invalidId}`, (route) =>
        route.fulfill({ json: { id: invalidId, topics: [] } }),
      );
      await page.goto(`http://localhost:8000/editions/${invalidId}`);
      await page
        .getByRole('alert')
        .filter({
          hasText: 'The edition could not be loaded or created.',
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
      await page.locator('.digest-preview').waitFor();
      assert.deepEqual(errors, []);
      await page.close();
    }
    for (const path of [
      '/api',
      '/api/no-such-route',
      '/healthz/no-such-route',
      '/__exe.dev/no-such-route',
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
      'Desktop/mobile canonical links, reload, cached edition switching, legacy redirect, not-found and reserved-path checks passed; real saved editions, no writes.',
    );
    await context.close();
  } finally {
    await browser.close();
  }
}
void smoke();
