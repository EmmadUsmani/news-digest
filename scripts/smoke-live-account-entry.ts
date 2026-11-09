// Read-only checks against the deployed local app; never requests a code or signs in.
import assert from 'node:assert/strict';
import { mkdir } from 'node:fs/promises';

import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch();
  try {
    await mkdir('docs/screenshots/accounts', { recursive: true });
    for (const [device, width, height] of [
      ['desktop', 1280, 900],
      ['mobile', 390, 844],
    ] as const) {
      for (const colorScheme of ['light', 'dark'] as const) {
        const context = await browser.newContext({
          viewport: { width, height },
          colorScheme,
        });
        const page = await context.newPage();
        const errors: string[] = [];
        const writes: string[] = [];
        page.on('pageerror', (e) => errors.push(e.message));
        page.on('request', (r) => {
          if (r.url().includes('/api/account/') && r.method() !== 'GET')
            writes.push(r.method());
        });
        await page.goto('http://127.0.0.1:8000/');
        await page
          .getByRole('button', { name: 'Account', exact: true })
          .click();
        const signIn = page.getByRole('link', { name: 'Sign in', exact: true });
        await signIn.waitFor();
        assert.equal(await signIn.getAttribute('href'), '/account/login');
        await page.screenshot({
          path: `docs/screenshots/accounts/live-entry-${device}-${colorScheme}.png`,
        });
        await signIn.click();
        await page.getByLabel('Email', { exact: true }).waitFor();
        assert.equal(
          await page.getByLabel('Email', { exact: true }).inputValue(),
          '',
        );
        assert.equal(
          await page
            .getByRole('button', { name: 'Request code', exact: true })
            .count(),
          1,
        );
        const session = await context.request.get(
          'http://127.0.0.1:8000/api/account/session',
        );
        assert.equal(session.status(), 200);
        assert.equal(session.headers()['cache-control'], 'no-store');
        assert.equal((await session.json()).signedIn, false);
        await page.screenshot({
          path: `docs/screenshots/accounts/live-login-${device}-${colorScheme}.png`,
        });
        assert.deepEqual(errors, []);
        assert.deepEqual(writes, []);
        await context.close();
      }
    }
    console.log(
      'Live anonymous desktop/mobile light/dark account panel, sign-in page and no-store signed-out session pass; zero account writes.',
    );
  } finally {
    await browser.close();
  }
})().catch(() => {
  console.error('Live account entry check failed');
  process.exitCode = 1;
});
