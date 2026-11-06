// Read-only saved-edition replay; history failures are injected locally.
import assert from 'node:assert/strict';

import {
  readerEditionHistorySchema,
  readerEditionSchema,
} from '@digest/contracts';
import { chromium, type Route } from 'playwright';

async function main() {
  const origin = 'http://127.0.0.1:8000';
  const edition = readerEditionSchema.parse(
    await (await fetch(`${origin}/api/editions/latest`)).json(),
  );
  const history = readerEditionHistorySchema.parse(
    await (await fetch(`${origin}/api/editions?offset=0`)).json(),
  );
  assert.ok(
    edition &&
      history.entries[0]?.id === edition.id &&
      history.entries.length > 1,
  );
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
        });
        let calls = 0;
        let recovering = false;
        let pending: Route | undefined;
        const errors: string[] = [];
        page.on('pageerror', (error) => errors.push(error.message));
        await page.route('**/*', (route) => {
          const url = new URL(route.request().url());
          if (url.origin !== origin) return route.abort();
          assert.equal(route.request().method(), 'GET');
          if (url.pathname === '/api/editions/latest')
            return route.fulfill({ json: edition });
          if (url.pathname === '/api/editions') {
            calls++;
            if (!recovering) return route.fulfill({ json: { invalid: true } });
            pending = route;
            return;
          }
          return route.continue();
        });
        await page.goto(origin);
        const nav = page.getByRole('navigation', {
          name: 'Edition dates',
          exact: true,
        });
        const retry = nav.getByRole('button', { name: 'Retry edition dates' });
        await retry.waitFor({ timeout: 5000 });
        const initialCalls = calls;
        assert.ok(
          initialCalls <= 2,
          'Only loader and navigation may read invalid history',
        );
        assert.equal(
          await nav
            .getByRole('link', { name: 'Browse past editions' })
            .isVisible(),
          true,
        );
        assert.equal(
          await page.locator('.digest-topic').count(),
          edition.topics.length,
        );
        await page.screenshot({
          path: `docs/screenshots/ui/reader-date-recovery-${device}-${theme}.png`,
        });
        recovering = true;
        await retry.focus();
        await page.keyboard.press('Enter');
        await page.waitForFunction(
          () =>
            document.querySelector<HTMLButtonElement>(
              '[aria-label="Retry edition dates"]',
            )?.disabled,
        );
        assert.ok(pending);
        await pending.fulfill({ status: 404, json: {} });
        await retry.waitFor();
        await page.waitForFunction(
          () =>
            !document.querySelector<HTMLButtonElement>(
              '[aria-label="Retry edition dates"]',
            )?.disabled,
        );
        await retry.click();
        await page.waitForFunction(
          () =>
            document.querySelector<HTMLButtonElement>(
              '[aria-label="Retry edition dates"]',
            )?.disabled,
        );
        assert.ok(pending);
        await pending.fulfill({ json: history });
        const older = nav.getByRole('link', {
          name: 'Older edition',
          exact: true,
        });
        await older.waitFor();
        assert.equal(
          await older.getAttribute('href'),
          `/editions/${history.entries[1].id}`,
        );
        assert.equal(
          await older.evaluate((node) => node === document.activeElement),
          true,
        );
        assert.equal(await retry.count(), 0);
        assert.equal(calls, initialCalls + 2);
        assert.equal(
          await page.evaluate(
            () => document.documentElement.scrollWidth <= innerWidth,
          ),
          true,
        );
        assert.deepEqual(errors, []);
        await page.close();
        console.log(
          `${device}/${theme}: invalid history, repeated failure, retry and keyboard recovery passed`,
        );
      }
    }
  } finally {
    await browser.close();
  }
}
void main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
