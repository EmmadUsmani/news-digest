// Signed-out public HTTPS check of real saved editions; no writes or provider calls.
import assert from 'node:assert/strict';
import { Resolver } from 'node:dns/promises';

import {
  readerEditionHistorySchema,
  readerEditionSchema,
} from '@digest/contracts';
import { chromium, expect } from 'playwright/test';

async function main() {
  const host = 'news-digest.exe.xyz';
  const origin = `https://${host}`;
  const resolver = new Resolver();
  resolver.setServers(['1.1.1.1']);
  const [address] = await resolver.resolve4(host);
  const browser = await chromium.launch({
    args: [`--host-resolver-rules=MAP ${host} ${address}`],
  });
  try {
    for (const width of [1440, 390]) {
      const context = await browser.newContext({
        viewport: { width, height: 900 },
      });
      const errors: string[] = [];
      await context.route('**/*', (route) => {
        assert.ok(['GET', 'HEAD'].includes(route.request().method()));
        return new URL(route.request().url()).origin === origin
          ? route.continue()
          : route.abort();
      });
      const page = await context.newPage();
      page.on('pageerror', (error) => errors.push(error.message));
      await page.goto(`${origin}/editions`);
      const history = readerEditionHistorySchema.parse(
        await page.evaluate(async () => {
          const response = await fetch('/api/editions?offset=0');
          if (!response.ok) throw new Error(`History: ${response.status}`);
          return response.json();
        }),
      );
      assert.ok(history.entries.length >= 2);
      await page.screenshot({
        path: `docs/screenshots/ui/public-archive-index-${width}.png`,
      });
      // Recent and oldest entries on the actual first page, without replaying data.
      for (const entry of [history.entries[0], history.entries.at(-1)!]) {
        const link = page.locator(`main li a[href="/editions/${entry.id}"]`);
        await expect(link).toBeVisible();
        await link.click();
        await expect(page).toHaveURL(`${origin}/editions/${entry.id}`);
        const edition = readerEditionSchema.parse(
          await page.evaluate(async (id) => {
            const response = await fetch(`/api/editions/${id}`);
            if (!response.ok) throw new Error(`Edition: ${response.status}`);
            return response.json();
          }, entry.id),
        );
        assert.equal(edition.windowEnd, entry.windowEnd);
        assert.deepEqual(
          edition.topics.map((topic) => topic.id),
          entry.topics.map((topic) => topic.id),
        );
        for (const topic of edition.topics) {
          await expect(page.locator(`#topic-${topic.id}`)).toBeAttached();
        }
        assert.ok(
          await page.evaluate(
            () => document.documentElement.scrollWidth <= innerWidth,
          ),
        );
        await page.screenshot({
          path: `docs/screenshots/ui/public-archive-${width}-${entry.id}.png`,
        });
        await page.goBack();
        await expect(
          page.getByRole('heading', { name: 'Past editions' }),
        ).toBeVisible();
      }
      assert.deepEqual(errors, []);
      console.log(
        `${width}px: signed-out public archive opens recent/oldest first-page editions; dates, topics, back navigation and layout pass (${history.entries.length} entries, hasMore=${history.hasMore})`,
      );
      await context.close();
    }
  } finally {
    await browser.close();
  }
}
void main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
