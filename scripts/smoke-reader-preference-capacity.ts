// Real published story plus synthetic removal records to exercise capacity.
// Capture one public reader response, then replay it; no server writes or provider calls.
import assert from 'node:assert/strict';

import { readerEditionSchema } from '@digest/contracts';
import { chromium, expect } from 'playwright/test';

async function smoke() {
  const origin = 'http://127.0.0.1:8000';
  const headers = { 'X-Forwarded-For': '192.0.2.166' };
  const response = await fetch(`${origin}/api/editions/latest`, {
    headers,
    redirect: 'error',
    signal: AbortSignal.timeout(15_000),
  });
  assert.equal(response.status, 200, 'capture published reader edition');
  const edition = readerEditionSchema.parse(await response.json());
  const story = edition.topics[0].stories[0];
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
          extraHTTPHeaders: headers,
        });
        const errors: string[] = [];
        const writes: string[] = [];
        await context.route('**/*', (route) => {
          const request = route.request();
          if (!['GET', 'HEAD'].includes(request.method())) {
            writes.push(request.method());
            return route.abort();
          }
          const url = new URL(request.url());
          if (url.origin !== origin) return route.abort();
          assert.ok(!url.pathname.startsWith('/api/admin/'));
          if (
            url.pathname === '/api/editions/latest' ||
            url.pathname === `/api/editions/${edition.id}`
          )
            return route.fulfill({ json: edition });
          return route.continue();
        });
        const page = await context.newPage();
        page.on('pageerror', (error) => errors.push(error.message));
        await page.goto(origin);
        await page.evaluate(() => {
          const bookmarks = Object.fromEntries(
            Array.from({ length: 999 }, (_, i) => [
              `story:offline-removed-${i}`,
              { copy: null, updatedAt: 1 },
            ]),
          );
          localStorage.setItem(
            'news-digest.reader-preferences.v1',
            JSON.stringify({
              version: 1,
              hiddenTopics: {},
              bookmarks,
            }),
          );
        });
        await page.reload();
        await page
          .getByRole('button', {
            name: `Save story: ${story.title}`,
            exact: true,
          })
          .click();
        await page.goto(`${origin}/saved`);
        await expect(
          page.getByRole('heading', { name: story.title, exact: true }),
        ).toBeVisible();
        const writer = await context.newPage();
        await writer.goto(`${origin}/saved`);
        // A second tab's stale snapshot omits the bookmark but contains its
        // independent topic choice. Dispatch the real cross-tab storage event.
        await writer.evaluate((topicId) => {
          localStorage.setItem(
            'news-digest.reader-preferences.v1',
            JSON.stringify({
              version: 1,
              hiddenTopics: {
                [topicId]: { hidden: true, updatedAt: Date.now() },
              },
              bookmarks: {
                ...Object.fromEntries(
                  Array.from({ length: 999 }, (_, i) => [
                    `story:offline-removed-${i}`,
                    { copy: null, updatedAt: 1 },
                  ]),
                ),
                'story:offline-concurrent-removal': {
                  copy: null,
                  updatedAt: 2,
                },
              },
            }),
          );
        }, edition.topics[0].id);
        await expect
          .poll(() =>
            page.evaluate(() => {
              const store = JSON.parse(
                localStorage.getItem('news-digest.reader-preferences.v1')!,
              );
              return Object.keys(store.bookmarks).length;
            }),
          )
          .toBe(1001);
        await page.reload();
        await expect(
          page.getByRole('heading', { name: story.title, exact: true }),
        ).toBeVisible();
        assert.equal(
          await page.evaluate(
            () =>
              Object.keys(
                JSON.parse(
                  localStorage.getItem('news-digest.reader-preferences.v1')!,
                ).bookmarks,
              ).length,
          ),
          1001,
        );
        assert.equal(
          await page.evaluate(
            (topicId) =>
              JSON.parse(
                localStorage.getItem('news-digest.reader-preferences.v1')!,
              ).hiddenTopics[topicId].hidden,
            edition.topics[0].id,
          ),
          true,
        );
        // Repair must settle, rather than repeatedly bounce writes between tabs.
        await writer.evaluate(() => {
          (window as unknown as { preferenceEvents: number }).preferenceEvents =
            0;
          window.addEventListener(
            'storage',
            () =>
              (window as unknown as { preferenceEvents: number })
                .preferenceEvents++,
          );
        });
        await page.waitForTimeout(300);
        assert.equal(
          await writer.evaluate(
            () =>
              (window as unknown as { preferenceEvents: number })
                .preferenceEvents,
          ),
          0,
        );
        await page.screenshot({
          path: `docs/screenshots/ui/saved-capacity-${device}-${theme}.png`,
        });
        assert.deepEqual(errors, []);
        assert.deepEqual(writes, []);
        await context.close();
        console.log(
          `${device}/${theme}: capacity union preserves saved story and removal records on reload; storage settles`,
        );
      }
    }
  } finally {
    await browser.close();
  }
}
void smoke();
