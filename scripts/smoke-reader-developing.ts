// Synthetic link on a real saved edition, browser interception only. No DB writes.
import assert from 'node:assert/strict';

import { readerEditionSchema } from '@digest/contracts';
import { chromium } from 'playwright';

async function main() {
  const origin = 'http://127.0.0.1:8000';
  const headers = { 'X-Forwarded-For': '192.0.2.158' };
  const response = await fetch(`${origin}/api/editions/latest`, { headers });
  assert.equal(response.status, 200);
  const edition = readerEditionSchema.parse(await response.json());
  const story = edition.topics[0].stories[0];
  assert.ok(story);
  const previous = structuredClone(edition);
  previous.id = '00000000-0000-4000-8000-000000002886';
  const earlier = previous.topics[0].stories[0];
  earlier.id = '00000000-0000-4000-8000-000000002885';
  earlier.title = 'Synthetic earlier coverage navigation control';
  story.developing = {
    previousEditionId: previous.id,
    previousStoryId: earlier.id,
    previousHeadline: earlier.title,
    previousSummary: earlier.summary ?? null,
    editionCount: 7,
  };
  readerEditionSchema.parse(edition);
  const destination = `/editions/${previous.id}#story-${earlier.id}`;
  const browser = await chromium.launch();
  try {
    for (const width of [320, 390, 1440]) {
      for (const theme of ['light', 'dark'] as const) {
        const page = await browser.newPage({
          viewport: { width, height: 1000 },
          colorScheme: theme,
          extraHTTPHeaders: headers,
        });
        const errors: string[] = [];
        page.on('pageerror', (error) => errors.push(error.message));
        await page.route('**/*', (route) => {
          assert.equal(route.request().method(), 'GET');
          const url = new URL(route.request().url());
          if (url.origin !== origin) return route.abort();
          if (url.pathname === `/api/editions/${edition.id}`)
            return route.fulfill({ json: edition });
          if (url.pathname === `/api/editions/${previous.id}`)
            return route.fulfill({ json: previous });
          return route.continue();
        });
        await page.goto(`${origin}/editions/${edition.id}`);
        const card = page.locator(`#story-${story.id}`);
        const link = card.getByRole('link', {
          name: `Earlier coverage: ${earlier.title}`,
          exact: true,
        });
        await link.waitFor();
        assert.equal(await link.getAttribute('href'), destination);
        assert.equal(
          await page.getByText('Developing · 7 editions').count(),
          1,
        );
        assert.equal(
          await page.getByText('Earlier coverage', { exact: true }).count(),
          1,
        );
        assert.equal(
          await card.locator('.excerpt').textContent(),
          story.summary,
        );
        assert.equal(
          await card.locator('h3 a').getAttribute('href'),
          story.url,
        );
        await link.focus();
        assert.equal(
          await link.evaluate((node) => node === document.activeElement),
          true,
        );
        assert.ok((await link.boundingBox())!.height >= 44);
        assert.ok(
          await page.evaluate(
            () => document.documentElement.scrollWidth <= innerWidth,
          ),
        );
        await card.screenshot({
          path: `docs/screenshots/ui/developing-synthetic-${width}-${theme}.png`,
        });
        await link.press('Enter');
        await page.waitForURL(`${origin}${destination}`);
        const target = page.locator(`#story-${earlier.id}`);
        await target.waitFor();
        await page.waitForFunction((id) => {
          const box = document.getElementById(id)?.getBoundingClientRect();
          return box && box.top >= 0 && box.top < innerHeight;
        }, `story-${earlier.id}`);
        assert.equal(await target.locator('h3').innerText(), earlier.title);
        assert.equal(
          await page.getByText('Earlier coverage', { exact: true }).count(),
          0,
        );
        assert.deepEqual(errors, []);
        await page.close();
        console.log(
          `${width}/${theme}: synthetic label, keyboard link, earlier-story position and legacy absence pass`,
        );
      }
    }
  } finally {
    await browser.close();
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
