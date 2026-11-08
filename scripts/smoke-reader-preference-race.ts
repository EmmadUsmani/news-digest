// Real published content; simulate the last write of a concurrent browser race.
// GET-only app traffic; external requests blocked; no provider calls.
import assert from 'node:assert/strict';

import { readerEditionSchema } from '@digest/contracts';
import { chromium, expect } from 'playwright/test';

async function smoke() {
  const origin = 'http://127.0.0.1:8000';
  const edition = readerEditionSchema.parse(
    await (await fetch(`${origin}/api/editions/latest`)).json(),
  );
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
        });
        const errors: string[] = [];
        await context.route('**/*', (route) =>
          ['GET', 'HEAD'].includes(route.request().method()) &&
          new URL(route.request().url()).origin === origin
            ? route.continue()
            : route.abort(),
        );
        const page = await context.newPage();
        page.on('pageerror', (error) => errors.push(error.message));
        await page.goto(origin);
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
              bookmarks: {},
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
          .toBe(1);
        await page.reload();
        await expect(
          page.getByRole('heading', { name: story.title, exact: true }),
        ).toBeVisible();
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
          path: `docs/screenshots/ui/saved-race-recovery-${device}-${theme}.png`,
        });
        assert.deepEqual(errors, []);
        await context.close();
        console.log(
          `${device}/${theme}: concurrent bookmark/topic union survives reload; storage settles`,
        );
      }
    }
  } finally {
    await browser.close();
  }
}
void smoke();
