import assert from 'node:assert/strict';

import {
  readerEditionHistorySchema,
  readerEditionSchema,
} from '@digest/contracts';
import { chromium } from 'playwright';

// Delay archive refreshes after a reader opens a saved edition.
// All edition content is read from storage; no jobs, writes or provider calls.
async function smoke() {
  const base = 'http://127.0.0.1:8000';
  const read = async (path: string) => {
    const response = await fetch(`${base}${path}`, {
      signal: AbortSignal.timeout(15000),
    });
    assert.equal(response.status, 200);
    return response.json();
  };
  const history = readerEditionHistorySchema.parse(
    await read('/api/editions?offset=0'),
  );
  assert.ok(history.entries.length >= 2, 'Need two real saved editions');
  const latest = readerEditionSchema.parse(await read('/api/editions/latest'));
  assert.equal(history.entries[0].id, latest.id);
  const browser = await chromium.launch();
  try {
    for (const [device, width, height] of [
      ['desktop', 1440, 1100],
      ['mobile', 390, 844],
    ] as const) {
      for (const theme of ['light', 'dark'] as const) {
        for (const fail of [false, true]) {
          const page = await browser.newPage({
            viewport: { width, height },
            colorScheme: theme,
          });
          page.setDefaultTimeout(15000);
          const errors: string[] = [];
          const writes: string[] = [];
          page.on('pageerror', (error) => errors.push(error.message));
          await page.route('**/*', async (route) => {
            const request = route.request();
            if (!['GET', 'HEAD'].includes(request.method())) {
              writes.push(
                `${request.method()} ${new URL(request.url()).pathname}`,
              );
              return route.abort();
            }
            if (new URL(request.url()).origin !== base) return route.abort();
            return route.continue();
          });
          const expectSavedContent = async () => {
            await page.locator('.digest-topic').last().waitFor();
            assert.equal(
              await page.locator('.digest-topic').count(),
              latest.topics.length,
            );
            for (const topic of latest.topics) {
              const section = page.locator('.digest-topic').filter({
                has: page.getByRole('heading', {
                  name: topic.name,
                  exact: true,
                }),
              });
              for (const story of topic.stories) {
                const item = section.locator(`[id="story-${story.id}"]`);
                await item.waitFor();
                assert.equal(
                  await item.locator('h3 a').textContent(),
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
          let handled!: () => void;
          const delayedHandled = new Promise<void>((resolve) => {
            handled = resolve;
          });
          let releaseHistory!: () => void;
          let historyStarted!: () => void;
          const blocked = new Promise<void>((resolve) => {
            releaseHistory = resolve;
          });
          const started = new Promise<void>((resolve) => {
            historyStarted = resolve;
          });
          let requests = 0;
          await page.route('**/api/editions?offset=0', async (route) => {
            requests++;
            if (requests === 2) {
              historyStarted();
              await blocked;
              await route.fulfill(
                fail
                  ? { status: 503, json: {} }
                  : { json: { ...history, entries: history.entries.slice(1) } },
              );
              handled();
            } else await route.fulfill({ json: history });
          });
          await page.goto(`${base}/editions`, {
            waitUntil: 'domcontentloaded',
          });
          assert.equal(
            await page
              .locator('html')
              .evaluate((element) => element.classList.contains('dark')),
            theme === 'dark',
          );
          const newest = page.locator(
            `main li a[href="/editions/${latest.id}"]`,
          );
          await newest.waitFor();
          await page.clock.install();
          await page.clock.fastForward(61000);
          await page.evaluate(() =>
            window.dispatchEvent(new Event('visibilitychange')),
          );
          await started;
          await newest.click();
          await page.waitForURL(`**/editions/${latest.id}`);
          await expectSavedContent();
          releaseHistory();
          await delayedHandled;
          await page.clock.runFor(1000);
          await expectSavedContent();
          assert.deepEqual(errors, []);
          assert.deepEqual(writes, []);
          assert.equal(new URL(page.url()).pathname, `/editions/${latest.id}`);
          assert.equal(await page.getByRole('alert').count(), 0);
          assert.ok(
            await page.evaluate(
              () => document.documentElement.scrollWidth <= innerWidth,
            ),
          );
          if (!fail)
            await page.screenshot({
              path: `docs/screenshots/ui/edition-history-${device}-${theme}.png`,
            });
          await page.close();
        }
      }
    }
    assert.deepEqual(
      readerEditionSchema.parse(await read('/api/editions/latest')),
      latest,
    );
    assert.deepEqual(
      readerEditionHistorySchema.parse(await read('/api/editions?offset=0')),
      history,
    );
    console.log(
      'Desktop/mobile light/dark delayed archive success/error checks passed; selected saved edition preserved, no writes.',
    );
  } finally {
    await browser.close();
  }
}
void smoke();
