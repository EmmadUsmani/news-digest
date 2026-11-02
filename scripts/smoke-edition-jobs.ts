import assert from 'node:assert/strict';

import { chromium } from 'playwright';

async function smoke() {
  // Read-only live edition; every generation request is intercepted (no inference).
  const browser = await chromium.launch({ headless: true });
  try {
    for (const [name, width, height] of [
      ['desktop', 1440, 1100],
      ['mobile', 390, 844],
    ] as const) {
      const page = await browser.newPage({ viewport: { width, height } });
      const errors: string[] = [];
      page.on('pageerror', (error) => errors.push(error.message));
      const latest = await page.request.get(
        'http://localhost:8000/api/digest-previews/latest',
      );
      assert.ok(latest.ok());
      const edition = await latest.json();
      assert.ok(edition?.id);
      let submissions = 0;
      let state = 'waiting';
      let disconnected = false;
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
        .filter({ hasText: 'scoring and editing' })
        .waitFor();
      await page.screenshot({
        path: `docs/screenshots/edition-job-${name}.png`,
        fullPage: true,
      });
      await page.reload();
      await page
        .getByRole('status')
        .filter({ hasText: 'scoring and editing' })
        .waitFor();
      assert.equal(submissions, 1);
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
      assert.equal(new URL(page.url()).searchParams.get('edition'), edition.id);
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
      await page.close();
    }
    console.log(
      'Async edition UI: desktop/mobile queue, active, reload, reconnect, completion and failure passed; no live generation.',
    );
  } finally {
    await browser.close();
  }
}
void smoke();
