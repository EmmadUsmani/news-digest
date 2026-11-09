// Saved reader content, fixture account transport only; no live account writes.
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';

import { chromium, expect } from 'playwright/test';

async function main() {
  const edition = await (
    await fetch('http://127.0.0.1:8000/api/editions/latest')
  ).json();
  const origin = 'http://127.0.0.1:4188';
  const server = spawn(
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
      await page.route('**/*', async (route) => {
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
        if (url.pathname === '/api/account/logout') {
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
      assert.deepEqual(errors, []);
      await page.close();
    }
    console.log(
      'Reader account header integration passes at desktop/mobile widths (fixture accounts).',
    );
  } finally {
    await browser?.close();
    if (server.pid) process.kill(-server.pid, 'SIGTERM');
  }
}
void main();
