// Capture published reader content; local preferences only.
// GET-only app traffic; external requests blocked; no provider calls.
import assert from 'node:assert/strict';

import { readerEditionSchema } from '@digest/contracts';
import { chromium, expect } from 'playwright/test';

async function smoke() {
  const origin = 'http://127.0.0.1:8000';
  const headers = { 'X-Forwarded-For': '192.0.2.170' };
  const response = await fetch(`${origin}/api/editions/latest`, {
    headers,
    redirect: 'error',
    signal: AbortSignal.timeout(15_000),
  });
  assert.equal(response.status, 200, 'capture published reader edition');
  const edition = readerEditionSchema.parse(await response.json());
  const topic = edition.topics.find(
    (topic) => topic.stories.length && topic.posts.length,
  );
  assert.ok(topic);
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
          extraHTTPHeaders: headers,
        });
        const errors: string[] = [];
        page.on('pageerror', (error) => errors.push(error.message));
        await page.route('**/*', (route) => {
          assert.ok(['GET', 'HEAD'].includes(route.request().method()));
          const url = new URL(route.request().url());
          if (url.origin !== origin) return route.abort();
          assert.ok(!url.pathname.startsWith('/api/admin/'));
          if (
            url.pathname === '/api/editions/latest' ||
            url.pathname === `/api/editions/${edition.id}`
          )
            return route.fulfill({ json: edition });
          return route.continue();
        });
        const post = topic.posts[0];
        for (const hash of [
          `story-${topic.stories[0].id}`,
          `post-${encodeURIComponent(JSON.stringify([post.platform, post.externalId]))}`,
        ]) {
          await page.goto(origin);
          await page
            .getByRole('button', { name: 'Topics', exact: true })
            .click();
          await page
            .getByRole('dialog')
            .getByRole('checkbox', { name: topic.name, exact: true })
            .uncheck();
          await page.goto(`${origin}/editions/${edition.id}#${hash}`);
          const reveal = page.getByRole('button', {
            name: `Show ${topic.name}`,
            exact: true,
          });
          await expect(reveal).toBeVisible();
          assert.equal(
            await page.evaluate((id) => !!document.getElementById(id), hash),
            false,
          );
          if (hash.startsWith('story-')) {
            await page.screenshot({
              path: `docs/screenshots/ui/hidden-destination-${device}-${theme}.png`,
              fullPage: false,
            });
          }
          const box = await reveal.boundingBox();
          assert.ok(box && box.height >= 44);
          await reveal.click();
          await expect(reveal).toHaveCount(0);
          await expect
            .poll(() => page.evaluate(() => document.activeElement?.id))
            .toBe(hash);
          await page.reload();
          await expect
            .poll(() =>
              page.evaluate((id) => !!document.getElementById(id), hash),
            )
            .toBe(true);
          assert.ok(
            await page.evaluate(
              () => document.documentElement.scrollWidth <= innerWidth,
            ),
          );
        }
        assert.deepEqual(errors, []);
        console.log(
          `${device}/${theme}: hidden story/post destination reveal, focus and persistence pass`,
        );
        await page.close();
      }
    }
  } finally {
    await browser.close();
  }
}
void smoke();
