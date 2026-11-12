// Saved reader content, fixture account transport only; no live account writes.
import assert from 'node:assert/strict';

import { chromium, expect } from 'playwright/test';

import {
  mergeReaderSync,
  type ReaderSyncState,
} from '../apps/api/src/modules/accounts/domain/reader-sync';
import { spawnTestServer } from './lib/test-server';

async function main() {
  const edition = await (
    await fetch('http://127.0.0.1:8000/api/editions/latest')
  ).json();
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
      env: { ...process.env, VITE_READER_ACCOUNTS: '1' },
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
    const disabled = await browser.newPage();
    const accountRequests: string[] = [];
    await disabled.route('**/*', (route) => {
      const url = new URL(route.request().url());
      if (url.pathname.startsWith('/api/account/'))
        accountRequests.push(url.pathname);
      return url.origin === 'http://127.0.0.1:8000'
        ? route.continue()
        : route.abort();
    });
    await disabled.goto('http://127.0.0.1:8000');
    await expect(
      disabled.getByRole('link', { name: 'Saved items', exact: true }),
    ).toBeVisible();
    await expect(
      disabled.getByRole('button', { name: 'Account', exact: true }),
    ).toHaveCount(0);
    await disabled
      .getByRole('link', { name: 'Saved items', exact: true })
      .click();
    await expect(
      disabled.getByRole('heading', { name: 'Saved items', exact: true }),
    ).toBeVisible();
    await expect(
      disabled.getByRole('button', { name: 'Account', exact: true }),
    ).toHaveCount(0);
    assert.deepEqual(accountRequests, []);
    await disabled.close();
    for (const width of [1440, 390]) {
      const page = await browser.newPage({ viewport: { width, height: 900 } });
      const errors: string[] = [];
      let signedIn = true;
      let syncs = 0;
      page.on('pageerror', (error) => errors.push(error.message));
      await page.route('**/*', (route) => {
        const url = new URL(route.request().url());
        if (url.origin !== origin) return route.abort();
        if (url.pathname === '/api/editions/latest')
          return route.fulfill({ json: edition });
        if (url.pathname === '/api/account/session')
          return route.fulfill({ json: { signedIn, isAdmin: false } });
        if (url.pathname === '/api/account/sync') {
          syncs++;
          return route.fulfill({ json: route.request().postDataJSON() });
        }
        if (
          url.pathname === '/api/account/logout' ||
          url.pathname === '/api/account/delete'
        ) {
          if (url.pathname.endsWith('/delete'))
            assert.deepEqual(route.request().postDataJSON(), {
              confirmation: 'DELETE',
            });
          signedIn = false;
          return route.fulfill({ status: 204 });
        }
        if (url.pathname.startsWith('/api/')) return route.abort();
        return route.continue();
      });
      await page.goto(origin);
      await page.getByRole('button', { name: 'Account', exact: true }).click();
      await expect(
        page.getByText('Your topics and saved items are synced.'),
      ).toBeVisible();
      assert.ok(syncs > 0);
      await page.screenshot({
        path: `docs/screenshots/accounts/reader-header-${width}.png`,
      });
      await page.keyboard.press('Escape');
      await page
        .getByRole('link', { name: 'Saved items', exact: true })
        .click();
      await page.getByRole('button', { name: 'Account', exact: true }).click();
      await expect(
        page.getByText('Your topics and saved items are synced.'),
      ).toBeVisible();
      await page.getByRole('button', { name: 'Sign out', exact: true }).click();
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
      await page.getByRole('button', { name: 'Account', exact: true }).click();
      await expect(
        page.getByText('Your topics and saved items are synced.'),
      ).toBeVisible();
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
        page.getByText('Your topics and saved items are synced.'),
      ).toBeVisible();
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
