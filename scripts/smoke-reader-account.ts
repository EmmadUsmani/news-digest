// Isolated prepared UI with fixture state/actions; no live account requests.
import assert from 'node:assert/strict';
import { rm, writeFile } from 'node:fs/promises';

import { chromium, expect } from 'playwright/test';

import { spawnTestServer } from './lib/test-server';

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
      await expect(page.getByLabel('Reader email')).toHaveCount(0);
      await expect(page.getByLabel('Reader account ID')).toHaveCount(0);
      await render({
        status: 'idle',
        session: { signedIn: true, isAdmin: true },
      });
      let issued = 0;
      await page.route(origin + '/api/account/links', async (route) => {
        issued++;
        assert.equal(route.request().method(), 'POST');
        assert.deepEqual(route.request().postDataJSON(), {
          email: 'friend@example.test',
        });
        await route.fulfill({
          status: issued === 1 ? 403 : 201,
          contentType: 'application/json',
          body: JSON.stringify({
            url: origin + '/account/sign-in#' + 'a'.repeat(43),
          }),
        });
      });
      await page.getByLabel('Reader email').fill('friend@example.test');
      await page
        .getByRole('button', { name: 'Create sign-in link', exact: true })
        .click();
      await expect(page.getByRole('alert')).toContainText('Could not create');
      await expect(page.getByLabel('Reader email')).toHaveValue(
        'friend@example.test',
      );
      await page
        .getByRole('button', { name: 'Create sign-in link', exact: true })
        .click();
      await expect(page.getByLabel('One-time sign-in link')).toHaveValue(
        origin + '/account/sign-in#' + 'a'.repeat(43),
      );
      await expect(page.getByLabel('Reader email')).toHaveValue('');
      await page.screenshot({
        path: `docs/screenshots/accounts/admin-invite-${width}.png`,
      });
      await page.getByRole('button', { name: 'Dismiss link' }).click();
      await expect(page.getByLabel('One-time sign-in link')).toHaveCount(0);
      assert.equal(issued, 2);
      await page.route(origin + '/api/account/links', (route) =>
        route.fulfill({
          status: 201,
          contentType: 'application/json',
          body: JSON.stringify({
            url: 'https://other.example/account/sign-in#' + 'b'.repeat(43),
          }),
        }),
      );
      await page.getByLabel('Reader email').fill('friend@example.test');
      await page
        .getByRole('button', { name: 'Create sign-in link', exact: true })
        .click();
      await expect(page.getByRole('alert')).toContainText('Could not create');
      await expect(page.getByLabel('One-time sign-in link')).toHaveCount(0);
      await page.getByLabel('Reader email').fill('');
      let revokedRequests = 0;
      const targetId = '11111111-1111-4111-8111-111111111111';
      await page.route(
        origin + '/api/account/sessions/revoke',
        async (route) => {
          revokedRequests++;
          assert.equal(route.request().method(), 'POST');
          assert.deepEqual(route.request().postDataJSON(), {
            userId: targetId,
          });
          await route.fulfill({
            status: revokedRequests === 1 ? 403 : 200,
            contentType: 'application/json',
            body: JSON.stringify({ revoked: revokedRequests === 2 ? 2 : 0 }),
          });
        },
      );
      const revokeButton = page.getByRole('button', {
        name: 'Confirm reader sign-out',
      });
      const confirmation = page.getByLabel(
        'Sign out all devices for this account',
      );
      await expect(revokeButton).toBeDisabled();
      await page.getByLabel('Reader account ID').fill(targetId);
      await confirmation.check();
      await page
        .getByLabel('Reader account ID')
        .fill('22222222-2222-4222-8222-222222222222');
      await expect(confirmation).not.toBeChecked();
      await expect(revokeButton).toBeDisabled();
      await page.getByLabel('Reader account ID').fill(targetId);
      await confirmation.check();
      await revokeButton.click();
      await expect(
        page.getByRole('alert').filter({ hasText: 'Could not sign out' }),
      ).toBeVisible();
      await expect(page.getByLabel('Reader account ID')).toHaveValue(targetId);
      await revokeButton.click();
      await expect(
        page.getByText('Reader sign-out complete. Sessions removed: 2.'),
      ).toBeVisible();
      await expect(page.getByLabel('Reader account ID')).toHaveValue('');
      await expect(confirmation).not.toBeChecked();
      await page.getByLabel('Reader account ID').fill(targetId);
      await confirmation.check();
      await revokeButton.click();
      await expect(
        page.getByText('Reader sign-out complete. Sessions removed: 0.'),
      ).toBeVisible();
      assert.equal(revokedRequests, 3);
      assert.equal(
        await page.evaluate(
          () =>
            (window as unknown as { calls: string[] }).calls.filter(
              (call) => call === 'refresh',
            ).length,
        ),
        3,
      );
      await page.route(origin + '/api/account/sessions/revoke', (route) =>
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ revoked: -1 }),
        }),
      );
      await page.getByLabel('Reader account ID').fill(targetId);
      await confirmation.check();
      await revokeButton.click();
      await expect(
        page.getByRole('alert').filter({ hasText: 'Could not sign out' }),
      ).toBeVisible();
      await expect(
        page.getByText('Reader sign-out complete.', { exact: false }),
      ).toHaveCount(0);
      await page.getByLabel('Reader account ID').fill('');

      await page.getByLabel('Reader account ID').scrollIntoViewIfNeeded();
      await page.screenshot({
        path: `docs/screenshots/accounts/admin-revoke-${width}.png`,
      });
      assert.equal(
        await page.evaluate(() => localStorage.length + sessionStorage.length),
        0,
      );
      await render({ session: { signedIn: true, isAdmin: false } });
      await expect(page.getByLabel('Reader email')).toHaveCount(0);
      await expect(page.getByLabel('Reader account ID')).toHaveCount(0);
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
    server.stop();
    await browser?.close();
    await rm(harness, { force: true });
  }
}
void smoke().catch((error: unknown) => {
  console.error(error);
  process.exitCode = 1;
});
