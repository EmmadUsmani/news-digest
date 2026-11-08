// Uses a saved real snapshot; all browser writes are intercepted, no provider calls.
import assert from 'node:assert/strict';

import { chromium } from 'playwright';

import { localAdminJson } from './lib/local-admin-fetch';
import { replayAdminPage } from './lib/replay-admin-page';

async function smoke() {
  const origin = 'http://127.0.0.1:8000';
  const snapshot = await localAdminJson('/api/admin/digest-previews/latest');
  const browser = await chromium.launch();
  try {
    for (const [device, width, height] of [
      ['desktop', 1440, 1000],
      ['mobile', 390, 844],
    ] as const) {
      for (const theme of ['light', 'dark'] as const) {
        const context = await browser.newContext({
          viewport: { width, height },
          colorScheme: theme,
          serviceWorkers: 'block',
        });
        const page = await context.newPage();
        const writes: Record<string, unknown>[] = [];
        const errors: string[] = [];
        let refuse = false;
        page.on('pageerror', (error) => errors.push(error.message));
        await context.route('**/*', (route) => {
          const request = route.request();
          assert.equal(new URL(request.url()).origin, origin);
          if (request.method() === 'POST') {
            assert.equal(
              new URL(request.url()).pathname,
              '/api/admin/digest-previews/tests',
            );
            writes.push(request.postDataJSON() as Record<string, unknown>);
            return refuse
              ? route.fulfill({ status: 503, json: { message: 'Disabled' } })
              : route.fulfill({ status: 201, json: snapshot });
          }
          assert.equal(request.method(), 'GET');
          return route.continue();
        });
        await replayAdminPage(page);
        await page.goto(`${origin}/admin/editions/new`);
        const ai = page.getByLabel('AI editing', { exact: true });
        assert.equal(await ai.inputValue(), 'off');
        const paidX = page.getByLabel('Paid X search', { exact: true });
        assert.equal(await paidX.inputValue(), 'off');
        const create = page.getByRole('button', {
          name: 'Create test edition · last 24 hours',
          exact: true,
        });
        await create.click();
        await page
          .getByRole('link', { name: 'Inspect created edition' })
          .waitFor();
        assert.equal(writes[0]?.aiEditing, false);
        assert.equal(writes[0]?.paidXSearch, false);
        await ai.selectOption('on');
        await create.click();
        await page
          .getByText('Private test edition ready.', { exact: true })
          .waitFor();
        await page
          .getByRole('link', { name: 'Inspect created edition' })
          .waitFor();
        assert.equal(writes[1]?.aiEditing, true);
        assert.equal(writes[1]?.paidXSearch, false);
        await ai.selectOption('off');
        await paidX.selectOption('on');
        await create.click();
        await page
          .getByRole('link', { name: 'Inspect created edition' })
          .waitFor();
        assert.equal(writes[2]?.aiEditing, false);
        assert.equal(writes[2]?.paidXSearch, true);
        await ai.selectOption('on');
        await create.click();
        await page
          .getByRole('link', { name: 'Inspect created edition' })
          .waitFor();
        assert.equal(writes[3]?.aiEditing, true);
        assert.equal(writes[3]?.paidXSearch, true);
        refuse = true;
        await create.click();
        await page.getByRole('alert').waitFor();
        assert.equal(writes.length, 5);
        assert.equal(
          await page
            .getByRole('link', { name: 'Inspect created edition' })
            .count(),
          0,
        );
        assert.equal(
          await page.evaluate(
            () => document.documentElement.scrollWidth > innerWidth,
          ),
          false,
        );
        await page.screenshot({
          path: `docs/screenshots/test-edition-form-${device}-${theme}.png`,
          fullPage: true,
        });
        assert.deepEqual(errors, []);
        await context.close();
      }
    }
    console.log(
      'PASS: four form views; free defaults, independent AI/paid-X opt-ins, private route, refusal, no retries or production writes. Intercepted responses use a real saved snapshot.',
    );
  } finally {
    await browser.close();
  }
}
void smoke();
