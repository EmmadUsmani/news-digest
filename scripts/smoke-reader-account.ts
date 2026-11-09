// Isolated prepared UI with fixture state/actions; no live account requests.
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { rm, writeFile } from 'node:fs/promises';

import { chromium, expect } from 'playwright/test';

async function smoke() {
  const harness = 'apps/web/account-smoke.tsx';
  const origin = 'http://127.0.0.1:4189';
  await writeFile(
    harness,
    `
import React from 'react';
import { createRoot } from 'react-dom/client';
import { ReaderAccount } from './src/ReaderAccount';
import './src/style.css';
let state = { session: { signedIn: false, isAdmin: false }, status: 'idle', sync: 'stopped' };
window.calls = [];
window.renderAccount = (next, enabled = true) => {
  state = { ...state, ...next };
  root.render(<ReaderAccount enabled={enabled} account={{...state,
    refresh: async () => { window.calls.push('refresh'); },
    retrySync: async () => { window.calls.push('retry'); },
    deleteAccount: async () => { window.calls.push('delete'); throw new Error('fixture failure'); },
    signOut: async (all = false) => { window.calls.push(all ? 'all' : 'out'); throw new Error('fixture failure'); },
  }} />);
};
const root = createRoot(document.getElementById('root'));
window.renderAccount({});
`,
  );
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
      '4189',
      '--strictPort',
    ],
    { stdio: 'ignore', detached: true },
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
      const page = await browser.newPage({ viewport: { width, height: 900 } });
      const errors: string[] = [];
      page.on('pageerror', (error) => errors.push(error.message));
      await page.route('**/*', (route) =>
        new URL(route.request().url()).origin === origin
          ? route.continue()
          : route.abort(),
      );
      await page.route(origin + '/', (route) =>
        route.fulfill({
          contentType: 'text/html',
          body: '<div id="root"></div><script type="module" src="/account-smoke.tsx"></script>',
        }),
      );
      await page.goto(origin);
      const render = async (state: Record<string, unknown>, enabled = true) =>
        page.evaluate(
          ({ state, enabled }) =>
            (
              window as unknown as {
                renderAccount: (state: unknown, enabled: boolean) => void;
              }
            ).renderAccount(state, enabled),
          { state, enabled },
        );
      await page.getByRole('button', { name: 'Account', exact: true }).click();
      await expect(
        page.getByRole('link', { name: 'Sign in', exact: true }),
      ).toHaveAttribute('href', '/account/login');
      await render({ status: 'checking' });
      await expect(page.getByRole('status')).toHaveText('Checking sign-in…');
      await expect(
        page.getByRole('link', { name: 'Sign in', exact: true }),
      ).toHaveCount(0);
      await render({ status: 'failed' });
      await page.getByRole('button', { name: 'Retry sign-in check' }).click();
      await render({
        status: 'idle',
        session: { signedIn: true, isAdmin: false },
        sync: 'failed',
      });
      await page.getByRole('button', { name: 'Retry sync' }).click();
      await render({ sync: 'idle' });
      await expect(page.getByRole('status')).toHaveText(
        'Your topics and saved items are synced.',
      );
      await page
        .getByRole('button', { name: 'Delete account', exact: true })
        .click();
      const confirm = page.getByRole('button', {
        name: 'Permanently delete account',
        exact: true,
      });
      await expect(confirm).toBeDisabled();
      await page.getByLabel('Type DELETE to confirm').fill('delete');
      await expect(confirm).toBeDisabled();
      await page.getByLabel('Type DELETE to confirm').fill('DELETE');
      await expect(confirm).toBeEnabled();
      await confirm.click();
      await expect(page.getByLabel('Type DELETE to confirm')).toHaveValue(
        'DELETE',
      );
      await render({ status: 'deleting' });
      await expect(confirm).toBeDisabled();
      await expect(
        page.getByRole('button', { name: 'Cancel deletion' }),
      ).toBeDisabled();
      await expect(page.getByRole('status')).toHaveText('Deleting account…');
      await render({ status: 'idle' });
      await page.screenshot({
        path: `docs/screenshots/accounts/reader-account-${width}.png`,
      });
      await page.getByRole('button', { name: 'Cancel deletion' }).click();
      await expect(page.getByLabel('Type DELETE to confirm')).toHaveCount(0);
      await page.getByRole('button', { name: 'Sign out', exact: true }).click();
      await page.getByRole('button', { name: 'Sign out all devices' }).click();
      await render({ status: 'signing-out' });
      await expect(
        page.getByRole('button', { name: 'Sign out', exact: true }),
      ).toBeDisabled();
      assert.deepEqual(
        await page.evaluate(
          () => (window as unknown as { calls: string[] }).calls,
        ),
        ['refresh', 'retry', 'delete', 'out', 'all'],
      );
      await render({}, false);
      await expect(
        page.getByRole('button', { name: 'Account', exact: true }),
      ).toHaveCount(0);
      assert.deepEqual(errors, []);
      await page.close();
    }
    console.log(
      'Prepared reader account controls pass desktop/mobile fixture checks; disabled UI hidden.',
    );
  } finally {
    await browser?.close();
    if (server.pid) process.kill(-server.pid, 'SIGTERM');
    await rm(harness, { force: true });
  }
}
void smoke().catch((error: unknown) => {
  console.error(error);
  process.exitCode = 1;
});
