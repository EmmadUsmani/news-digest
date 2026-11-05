import assert from 'node:assert/strict';

import { readerEditionSchema } from '@digest/contracts';
import { chromium } from 'playwright';

async function smoke() {
  // Read-only live edition; every generation request is intercepted (no inference).
  const readLatest = async () => {
    const response = await fetch('http://localhost:8000/api/editions/latest', {
      signal: AbortSignal.timeout(15000),
    });
    assert.equal(response.status, 200);
    return readerEditionSchema.parse(await response.json());
  };
  const edition = await readLatest();
  const browser = await chromium.launch({ headless: true });
  try {
    for (const [name, width, height] of [
      ['desktop', 1440, 1100],
      ['mobile', 390, 844],
    ] as const) {
      const page = await browser.newPage({ viewport: { width, height } });
      const errors: string[] = [];
      page.on('pageerror', (error) => errors.push(error.message));
      page.setDefaultTimeout(15000);
      const writes: string[] = [];
      await page.route('**/api/**', (route) => {
        const request = route.request();
        if (!['GET', 'HEAD'].includes(request.method())) {
          writes.push(`${request.method()} ${new URL(request.url()).pathname}`);
          return route.abort();
        }
        return route.continue();
      });
      let submissions = 0;
      let state = 'waiting';
      let disconnected = false;
      let stage = 'triage';
      await page.route('**/api/digest-previews/jobs', async (route) => {
        assert.equal(route.request().method(), 'POST');
        submissions++;
        await route.fulfill({ status: 202, json: { id: '123' } });
      });
      await page.route('**/api/digest-previews/jobs/123', async (route) => {
        if (disconnected) return route.fulfill({ status: 503, json: {} });
        await route.fulfill({
          json: {
            id: '123',
            state,
            progress:
              state === 'active'
                ? {
                    stage: stage === 'publishing' ? 'publishing' : 'topics',
                    topics: [{ id: 'fixture', name: 'Fixture topic', stage }],
                  }
                : null,
            editionId: state === 'completed' ? edition.id : null,
          },
        });
      });
      await page.goto('http://localhost:8000');
      const create = page.getByRole('button', {
        name: 'Create edition · last 24 hours',
      });
      await create.waitFor();
      await page.waitForFunction(
        () =>
          !document.querySelector<HTMLFieldSetElement>(
            '.window-controls fieldset',
          )?.disabled,
      );
      await create.click();
      await page
        .getByRole('status')
        .filter({ hasText: 'Edition queued' })
        .waitFor();
      assert.equal(
        await page
          .getByRole('button', { name: 'Creating edition…' })
          .isDisabled(),
        true,
      );
      state = 'active';
      await page
        .getByRole('status')
        .filter({ hasText: 'triaging stories' })
        .waitFor();
      await page.screenshot({
        path: `docs/screenshots/edition-job-${name}.png`,
        fullPage: true,
      });
      await page.reload();
      await page
        .getByRole('status')
        .filter({ hasText: 'triaging stories' })
        .waitFor();
      assert.equal(submissions, 1);
      for (const [next, label] of [
        ['editing', 'editing stories'],
        ['posts', 'triaging and editing posts'],
        ['publishing', 'Publishing your edition'],
      ]) {
        stage = next;
        await page.getByRole('status').filter({ hasText: label }).waitFor();
      }
      disconnected = true;
      await page
        .getByRole('status')
        .filter({ hasText: 'Connection interrupted' })
        .waitFor();
      disconnected = false;
      state = 'completed';
      await page
        .getByRole('status')
        .filter({ hasText: 'Edition ready.' })
        .waitFor();
      await page.waitForURL(`**/editions/${edition.id}`);
      assert.equal(new URL(page.url()).pathname, `/editions/${edition.id}`);
      const firstStory = edition.topics.flatMap((topic) => topic.stories)[0];
      assert.ok(
        firstStory,
        'Need saved stories to verify completed job content',
      );
      await page.locator(`[id="story-${firstStory.id}"]`).waitFor();
      assert.equal(
        await page.locator('.digest-topic').count(),
        edition.topics.length,
      );
      for (const topic of edition.topics) {
        const section = page.locator('.digest-topic').filter({
          has: page.getByRole('heading', { name: topic.name, exact: true }),
        });
        for (const story of topic.stories) {
          const item = section.locator(`[id="story-${story.id}"]`);
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
      assert.equal(
        await page.evaluate(() => sessionStorage.getItem('edition-job')),
        null,
      );
      state = 'failed';
      await create.click();
      await page
        .getByRole('status')
        .filter({ hasText: 'Edition generation failed' })
        .waitFor();
      assert.equal(await create.isEnabled(), true);
      assert.equal(submissions, 2);
      assert.deepEqual(errors, []);
      assert.deepEqual(writes, []);
      assert.ok(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth,
        ),
      );
      await page.close();
    }
    assert.deepEqual(
      await readLatest(),
      edition,
      'Simulated jobs must not change saved editions',
    );
    console.log(
      'Async edition UI: desktop/mobile queue, active, reload, reconnect, completion, saved story text and failure passed; unexpected API writes blocked, saved edition unchanged.',
    );
  } finally {
    await browser.close();
  }
}
void smoke();
