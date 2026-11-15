// Saved reader content, fixture account transport only; no live account writes.
import assert from 'node:assert/strict';

import {
  readerEditionHistorySchema,
  readerEditionSchema,
} from '@digest/contracts';
import { chromium, expect } from 'playwright/test';

import {
  mergeReaderSync,
  type ReaderSyncState,
} from '../apps/api/src/modules/accounts/domain/reader-sync';
import { spawnTestServer } from './lib/test-server';

async function main() {
  const headers = { 'X-Forwarded-For': '192.0.2.165' };
  const response = await fetch('http://127.0.0.1:8000/api/editions/latest', {
    headers,
    redirect: 'error',
    signal: AbortSignal.timeout(15_000),
  });
  assert.equal(response.status, 200, 'public reader latest edition');
  const edition = readerEditionSchema.parse(await response.json());
  const historyResponse = await fetch('http://127.0.0.1:8000/api/editions', {
    headers,
    redirect: 'error',
    signal: AbortSignal.timeout(15_000),
  });
  assert.equal(historyResponse.status, 200, 'public reader history');
  const history = readerEditionHistorySchema.parse(
    await historyResponse.json(),
  );
  const origin = 'http://127.0.0.1:4188';
  const server = spawnTestServer(
    'pnpm',
    [
      '--filter',
      '@digest/web',
      'exec',
      'vite',
      '--host',
      '127.0.0.1',
      '--port',
      '4188',
      '--strictPort',
    ],
    {
      env: { ...process.env, VITE_READER_ACCOUNTS: '1', VITE_PUBLIC_MODE: '1' },
      stdio: 'ignore',
      detached: true,
    },
  );
  let browser;
  try {
    for (let attempt = 0; ; attempt++) {
      try {
        if ((await fetch(origin)).ok) break;
      } catch {
        /* starting */
      }
      if (attempt > 100) throw new Error('Vite did not start');
      await new Promise((resolve) => setTimeout(resolve, 100));
    }
    browser = await chromium.launch();
    for (const width of [1440, 390]) {
      for (const theme of ['light', 'dark'] as const) {
        const page = await browser.newPage({
          viewport: { width, height: 900 },
          colorScheme: theme,
        });
        const errors: string[] = [];
        let signedIn = true;
        let syncs = 0;
        page.on('pageerror', (error) => errors.push(error.message));
        await page.route('**/*', (route) => {
          const url = new URL(route.request().url());
          if (url.origin !== origin) return route.abort();
          if (url.pathname === '/api/editions')
            return route.fulfill({ json: history });
          if (url.pathname === '/api/editions/latest')
            return route.fulfill({ json: edition });
          if (url.pathname === '/api/account/session') {
            assert.equal(route.request().method(), 'GET');
            return route.fulfill({ json: { signedIn, isAdmin: false } });
          }
          if (url.pathname === '/api/account/sync') {
            assert.equal(route.request().method(), 'POST');
            syncs++;
            return route.fulfill({ json: route.request().postDataJSON() });
          }
          if (
            url.pathname === '/api/account/logout' ||
            url.pathname === '/api/account/delete'
          ) {
            assert.equal(route.request().method(), 'POST');
            if (url.pathname.endsWith('/delete'))
              assert.deepEqual(route.request().postDataJSON(), {
                confirmation: 'DELETE',
              });
            signedIn = false;
            return route.fulfill({ status: 204 });
          }
          if (url.pathname.startsWith('/api/')) {
            assert.fail(
              `Unexpected fixture API request: ${route.request().method()} ${url.pathname}`,
            );
          }
          return route.continue();
        });
        await page.goto(origin);
        await expect(
          page.getByRole('link', { name: 'Admin', exact: true }),
        ).toHaveCount(0);
        await page
          .getByRole('button', { name: 'Account', exact: true })
          .click();
        await expect(
          page
            .getByRole('dialog', { name: 'Your account' })
            .getByRole('status'),
        ).toHaveText('Your topics and saved items are synced.');
        assert.ok(syncs > 0);
        await page.screenshot({
          path: `docs/screenshots/accounts/reader-header-${width}${theme === 'dark' ? '-dark' : ''}.png`,
        });
        await page.keyboard.press('Escape');
        await page
          .getByRole('link', { name: 'Saved items', exact: true })
          .click();
        await page
          .getByRole('button', { name: 'Account', exact: true })
          .click();
        await expect(
          page
            .getByRole('dialog', { name: 'Your account' })
            .getByRole('status'),
        ).toHaveText('Your topics and saved items are synced.');
        await page
          .getByRole('button', { name: 'Sign out', exact: true })
          .click();
        await expect(
          page.getByRole('link', { name: 'Sign in', exact: true }),
        ).toBeVisible();
        assert.equal(
          await page.evaluate(() =>
            localStorage.getItem('news-digest.reader-preferences.v1'),
          ),
          null,
        );
        assert.equal(
          await page.evaluate(
            () => document.documentElement.scrollWidth > innerWidth,
          ),
          false,
        );
        signedIn = true;
        await page.reload();
        await page
          .getByRole('button', { name: 'Account', exact: true })
          .click();
        await expect(
          page
            .getByRole('dialog', { name: 'Your account' })
            .getByRole('status'),
        ).toHaveText('Your topics and saved items are synced.');
        await page
          .getByRole('button', { name: 'Delete account', exact: true })
          .click();
        await page.getByLabel('Type DELETE to confirm').fill('DELETE');
        await page
          .getByRole('button', {
            name: 'Permanently delete account',
            exact: true,
          })
          .click();
        await expect(
          page.getByRole('link', { name: 'Sign in', exact: true }),
        ).toBeVisible();
        await expect(page.getByLabel('Type DELETE to confirm')).toHaveCount(0);
        assert.equal(signedIn, false);
        assert.equal(
          await page.evaluate(() =>
            localStorage.getItem('news-digest.reader-preferences.v1'),
          ),
          null,
        );
        assert.deepEqual(errors, []);
        await page.close();
      }
    }
    // Separate browser contexts model two devices; only the fixture server is shared.
    let shared: ReaderSyncState = {
      version: 1,
      hiddenTopics: {},
      bookmarks: {},
    };
    const devices = await Promise.all(
      [1440, 390].map(async (width) => {
        const page = await browser!.newPage({
          viewport: { width, height: 900 },
        });
        await page.route('**/*', (route) => {
          const url = new URL(route.request().url());
          if (url.origin !== origin) return route.abort();
          if (url.pathname === '/api/editions')
            return route.fulfill({ json: history });
          if (url.pathname === '/api/editions/latest')
            return route.fulfill({ json: edition });
          if (url.pathname === '/api/account/session')
            return route.fulfill({ json: { signedIn: true, isAdmin: false } });
          if (url.pathname === '/api/account/sync') {
            shared = mergeReaderSync(shared, route.request().postDataJSON());
            return route.fulfill({ json: shared });
          }
          if (url.pathname.startsWith('/api/')) return route.abort();
          return route.continue();
        });
        await page.goto(origin);
        return page;
      }),
    );
    const [desktop, mobile] = devices;
    const waitForSync = async (page: typeof desktop) => {
      await page.getByRole('button', { name: 'Account', exact: true }).click();
      await expect(
        page.getByRole('dialog', { name: 'Your account' }).getByRole('status'),
      ).toHaveText('Your topics and saved items are synced.');
      await page.keyboard.press('Escape');
    };
    const save = desktop.getByRole('button', { name: /^Save story:/ }).first();
    const label = await save.getAttribute('aria-label');
    assert.ok(label);
    const title = label.slice('Save story: '.length);
    await save.click();
    await expect
      .poll(
        () =>
          Object.values(shared.bookmarks).filter((entry) => entry.copy !== null)
            .length,
      )
      .toBe(1);
    // A fresh visit downloads the other device's change without shared storage.
    await mobile.goto(`${origin}/saved`);
    const remove = mobile.getByRole('button', {
      name: `Remove saved item: ${title}`,
      exact: true,
    });
    await expect(remove).toBeVisible();
    await mobile.screenshot({
      path: 'docs/screenshots/accounts/two-device-saved-mobile.png',
    });
    await remove.click();
    await expect
      .poll(
        () =>
          Object.values(shared.bookmarks).filter((entry) => entry.copy !== null)
            .length,
      )
      .toBe(0);
    assert.equal(
      Object.keys(shared.bookmarks).length,
      1,
      'removal keeps a sync tombstone',
    );
    await desktop.goto(`${origin}/saved`);
    await waitForSync(desktop);
    await expect(
      desktop.getByRole('button', {
        name: `Remove saved item: ${title}`,
        exact: true,
      }),
    ).toHaveCount(0);
    // Reload the removing device too: the deleted bookmark must not reappear.
    await mobile.reload();
    await waitForSync(mobile);
    await expect(
      mobile.getByRole('button', {
        name: `Remove saved item: ${title}`,
        exact: true,
      }),
    ).toHaveCount(0);
    for (const device of devices) await device.close();
    console.log(
      'Reader account integration and two-device bookmark/tombstone sync pass (fixture accounts).',
    );
  } finally {
    server.stop();
    await browser?.close();
  }
}
void main();
