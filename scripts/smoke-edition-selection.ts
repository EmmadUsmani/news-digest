import assert from 'node:assert/strict';

import {
  readerEditionHistorySchema,
  readerEditionSchema,
} from '@digest/contracts';
import { chromium } from 'playwright';

// Delay browser GET responses only. No writes or provider calls.
async function smoke() {
  const base = 'http://127.0.0.1:8000';
  const read = async (path: string) => {
    const response = await fetch(`${base}${path}`, {
      signal: AbortSignal.timeout(15000),
    });
    assert.equal(response.status, 200);
    return response.json();
  };
  const latest = readerEditionSchema.parse(await read('/api/editions/latest'));
  const history = readerEditionHistorySchema.parse(
    await read('/api/editions?offset=0'),
  );
  const entry = history.entries.find((candidate) => candidate.id !== latest.id);
  assert.ok(entry, 'Need two different real saved editions');
  const edition = readerEditionSchema.parse(
    await read(`/api/editions/${entry.id}`),
  );
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
            locale: 'en-US',
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
          let markStarted!: () => void;
          const started = new Promise<void>((resolve) => {
            markStarted = resolve;
          });
          let handled!: () => void;
          const delayedHandled = new Promise<void>((resolve) => {
            handled = resolve;
          });
          let release!: () => void;
          const blocked = new Promise<void>((resolve) => {
            release = resolve;
          });
          await page.route('**/api/editions/latest', async (route) => {
            const response = await route.fetch();
            markStarted();
            await blocked;
            await route.fulfill(
              fail ? { status: 503, body: '{}' } : { response },
            );
            handled();
          });
          await page.goto(base, {
            waitUntil: 'domcontentloaded',
          });
          await started;
          assert.equal(
            await page
              .locator('html')
              .evaluate((element) => element.classList.contains('dark')),
            theme === 'dark',
          );
          await page
            .getByRole('link', { name: 'Browse past editions', exact: true })
            .click();
          const selected = page.locator(
            `main li a[href="/editions/${entry.id}"]`,
          );
          await selected.click();
          await page.waitForURL(`**/editions/${entry.id}`);
          const expectSelectedContent = async () => {
            await page.locator('.digest-topic').last().waitFor();
            assert.equal(
              await page
                .getByRole('link', {
                  name: 'Browse past editions',
                  exact: true,
                })
                .innerText(),
              new Date(edition.windowEnd).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
              }),
            );
            assert.equal(
              await page.locator('.digest-topic').count(),
              edition.topics.length,
            );
            for (const topic of edition.topics) {
              const section = page.locator('.digest-topic').filter({
                has: page.getByRole('heading', {
                  name: topic.name,
                  exact: true,
                }),
              });
              await section.waitFor();
              for (const story of topic.stories) {
                const item = section.locator(`[id="story-${story.id}"]`);
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
          await expectSelectedContent();
          release();
          await delayedHandled;
          // Let the fetch continuation and React render settle after the delayed response.
          await page.waitForTimeout(250);
          await expectSelectedContent();
          assert.equal(new URL(page.url()).pathname, `/editions/${entry.id}`);
          assert.deepEqual(errors, []);
          assert.deepEqual(writes, []);
          assert.equal(
            await page
              .getByRole('alert')
              .filter({ hasText: /could not|Could not/ })
              .count(),
            0,
          );
          if (!fail)
            await page.screenshot({
              path: `docs/screenshots/ui/edition-selection-${device}-${theme}.png`,
            });
          assert.ok(
            await page.evaluate(
              () => document.documentElement.scrollWidth <= innerWidth,
            ),
          );
          await page.close();
        }
      }
    }
    assert.deepEqual(
      readerEditionSchema.parse(await read('/api/editions/latest')),
      latest,
    );
    assert.deepEqual(
      readerEditionSchema.parse(await read(`/api/editions/${entry.id}`)),
      edition,
    );
    console.log(
      'Desktop/mobile light/dark delayed edition success/error checks passed; real saved editions, no writes.',
    );
  } finally {
    await browser.close();
  }
}
void smoke();
