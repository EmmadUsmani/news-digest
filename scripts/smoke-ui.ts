// Read-only browser verification of saved reader content; never generate editions.
import assert from 'node:assert/strict';

import {
  readerEditionHistorySchema,
  readerEditionSchema,
} from '@digest/contracts';
import { chromium } from 'playwright';

async function smoke() {
  const base = 'http://127.0.0.1:8000';
  const snapshot = readerEditionSchema.parse(
    await (
      await fetch(`${base}/api/editions/latest`, {
        signal: AbortSignal.timeout(15000),
      })
    ).json(),
  );
  const history = readerEditionHistorySchema.parse(
    await (
      await fetch(`${base}/api/editions`, {
        signal: AbortSignal.timeout(15000),
      })
    ).json(),
  );
  const older = history.entries.find((entry) => entry.id !== snapshot.id);
  assert.ok(older, 'Saved archive must include an older edition');
  const previous = readerEditionSchema.parse(
    await (
      await fetch(`${base}/api/editions/${older.id}`, {
        signal: AbortSignal.timeout(15000),
      })
    ).json(),
  );
  const browser = await chromium.launch();
  try {
    for (const [name, width, height] of [
      ['desktop', 1440, 1100],
      ['mobile', 390, 844],
    ] as const) {
      const page = await browser.newPage({ viewport: { width, height } });
      page.setDefaultTimeout(15000);
      const errors: string[] = [];
      const writes: string[] = [];
      page.on('pageerror', (error) => errors.push(error.message));
      await page.route('**/api/**', async (route) => {
        const request = route.request();
        if (!['GET', 'HEAD'].includes(request.method())) {
          writes.push(`${request.method()} ${new URL(request.url()).pathname}`);
          return route.abort();
        }
        if (new URL(request.url()).origin !== base) return route.abort();
        return route.continue();
      });
      const expectEdition = async (id: string) => {
        await page.waitForURL(
          id === snapshot.id ? `${base}/` : `**/editions/${id}`,
        );
        const expected = id === snapshot.id ? snapshot : previous;
        await page.locator('.digest-topic').last().waitFor();
        for (const topic of expected.topics) {
          for (const story of topic.stories) {
            const link = page.locator(`[id="story-${story.id}"] h3 a`);
            await link.waitFor();
            assert.equal(await link.textContent(), story.title);
          }
        }
      };
      await page.goto(base);
      await expectEdition(snapshot.id);
      assert.equal(
        await page.locator('.digest-topic').count(),
        snapshot.topics.length,
      );
      for (const topic of snapshot.topics) {
        const article = page.locator('.digest-topic').filter({
          has: page.getByRole('heading', { name: topic.name, exact: true }),
        });
        for (const story of topic.stories) {
          const item = article.locator(`[id="story-${story.id}"]`);
          assert.equal(await item.locator('h3 a').textContent(), story.title);
          assert.equal(
            await item.locator('h3 a').getAttribute('href'),
            story.url,
          );
          if (story.summary)
            assert.equal(
              await item.locator('.excerpt').textContent(),
              story.summary,
            );
        }
      }
      assert.equal(
        await page.locator('.editorial-label, .selection-count').count(),
        0,
      );
      for (const image of await page.locator('.story-image').all()) {
        assert.equal(await image.getAttribute('alt'), '');
        assert.equal(await image.getAttribute('loading'), 'lazy');
        assert.equal(await image.getAttribute('referrerpolicy'), 'no-referrer');
      }
      await page.reload();
      await expectEdition(snapshot.id);
      await page.screenshot({
        path: `docs/screenshots/foundation-${name}.png`,
        fullPage: true,
      });
      await page.getByRole('link', { name: 'Browse past editions' }).click();
      await page.locator(`main a[href="/editions/${older.id}"]`).click();
      await page.waitForURL(`**/editions/${older.id}`);
      await expectEdition(older.id);
      await page.reload();
      await expectEdition(older.id);
      await page.getByRole('link', { name: 'Browse past editions' }).click();
      await page
        .getByRole('link', { name: 'News Digest', exact: true })
        .click();
      await expectEdition(snapshot.id);
      await page.getByRole('link', { name: 'Browse past editions' }).click();
      await page.getByRole('heading', { name: 'Past editions' }).waitFor();
      if (history.hasMore) {
        await page.getByRole('link', { name: 'Older editions' }).click();
        await page.getByText('Page 2', { exact: true }).waitFor();
        await page.getByRole('link', { name: 'Newer editions' }).click();
        await page.getByText('Page 1', { exact: true }).waitFor();
      }
      await page
        .getByRole('heading', { name: 'Past editions' })
        .scrollIntoViewIfNeeded();
      await page.screenshot({ path: `docs/screenshots/history-${name}.png` });
      assert.equal(await page.getByRole('heading', { level: 1 }).count(), 1);
      assert.equal(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth,
        ),
        true,
      );
      assert.deepEqual(errors, []);
      assert.deepEqual(writes, []);
      await page.close();
    }
    assert.deepEqual(
      readerEditionSchema.parse(
        await (
          await fetch(`${base}/api/editions/latest`, {
            signal: AbortSignal.timeout(15000),
          })
        ).json(),
      ),
      snapshot,
    );
    console.log(
      'Reader content, summaries, images, archive navigation/reload and desktop/mobile layout passed; no API writes or browser errors.',
    );
  } finally {
    await browser.close();
  }
}
void smoke();
