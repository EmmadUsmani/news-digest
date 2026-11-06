// Read-only browser check. Synthetic outcomes exercise states absent in old editions.
import assert from 'node:assert/strict';

import { digestPreviewSchema, previewHistorySchema } from '@digest/contracts';
import { chromium } from 'playwright';

import { localAdminFetch } from './lib/local-admin-fetch';
import { replayAdminPage } from './lib/replay-admin-page';

async function smoke() {
  const origin = 'http://127.0.0.1:8000';
  const history = previewHistorySchema.parse(
    await (
      await localAdminFetch(`${origin}/api/admin/digest-previews?offset=0`)
    ).json(),
  );
  const id = history.entries[0].id;
  const endpoint = `${origin}/api/admin/digest-previews/${id}`;
  const saved = digestPreviewSchema.parse(
    await (await localAdminFetch(endpoint)).json(),
  );
  const cases = [
    ['no-slot', 'No open slot'],
    ['no-candidates', 'No candidates'],
    ['nothing-passed-triage', 'Nothing passed triage'],
    ['editor-chose-none', 'Editor chose none'],
    ['picks-made', 'Picks made'],
    ['ai-editing-failed', 'AI editing failed'],
    ['ai-unavailable', 'AI unavailable (reason not recorded)'],
    ['switched-off', 'Switched off'],
  ] as const;
  const browser = await chromium.launch();
  try {
    for (const width of [1440, 390]) {
      const page = await browser.newPage({
        viewport: { width, height: 1000 },
        serviceWorkers: 'block',
      });
      const errors: string[] = [];
      page.on('pageerror', (error) => errors.push(error.message));
      await page.route('**/*', async (route) => {
        assert.equal(route.request().method(), 'GET');
        assert.equal(new URL(route.request().url()).origin, origin);
        if (route.request().url().includes('/api/admin/')) {
          const response = await localAdminFetch(route.request().url());
          await route.fulfill({
            status: response.status,
            contentType: 'application/json',
            body: await response.text(),
          });
        } else await route.continue();
      });
      await replayAdminPage(page);
      await page.goto(`${origin}/admin/editions/${id}`);
      const card = page.getByLabel('Bluesky selection outcomes', {
        exact: true,
      });
      await card.waitFor();
      assert.equal(await card.locator('li').count(), saved.topics.length);
      for (const topic of saved.topics.filter(
        (topic) => !topic.blueskySelection,
      ))
        await card
          .getByText(`${topic.name}: Bluesky: Outcome not recorded`, {
            exact: true,
          })
          .waitFor();
      for (
        let offset = 0;
        offset < cases.length;
        offset += saved.topics.length
      ) {
        const fixture = structuredClone(saved);
        fixture.topics.forEach((topic, index) => {
          topic.blueskySelection = {
            openSlots: 2,
            candidatesRead: 12,
            candidatesShortlisted: 4,
            postsPicked:
              cases[(offset + index) % cases.length][0] === 'picks-made'
                ? 1
                : 0,
            result: cases[(offset + index) % cases.length][0],
          };
        });
        await page.route(endpoint, (route) => route.fulfill({ json: fixture }));
        await page.reload();
        for (const [index, topic] of fixture.topics.entries()) {
          await card
            .getByText(
              `${topic.name}: Bluesky: ${cases[(offset + index) % cases.length][1]}`,
              { exact: false },
            )
            .waitFor();
        }
        assert.equal(
          await card
            .getByText(
              '2 open slots · 12 candidates read · 4 shortlisted · 0 picked',
              { exact: true },
            )
            .count(),
          fixture.topics.filter(
            (topic) => topic.blueskySelection?.postsPicked === 0,
          ).length,
        );
        assert.equal(
          await page.evaluate(
            () => document.documentElement.scrollWidth > innerWidth,
          ),
          false,
        );
      }
      await card.screenshot({
        path: `docs/screenshots/ui/bluesky-outcomes-synthetic-${width}.png`,
      });
      assert.deepEqual(errors, []);
      await page.close();
    }
  } finally {
    await browser.close();
  }
  console.log(
    'Bluesky inspector: saved edition compatibility, eight synthetic results, counts, desktop/mobile layout passed; no writes or external calls.',
  );
}
void smoke();
