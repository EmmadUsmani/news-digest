// Real saved-items UI, fixture account responses. No account writes reach the API.
import assert from 'node:assert/strict';

import { chromium, expect } from 'playwright/test';

async function main() {
  const origin = 'http://127.0.0.1:8000';
  const browser = await chromium.launch();
  try {
    for (const [device, width] of [
      ['desktop', 1440],
      ['mobile', 320],
    ] as const) {
      for (const colorScheme of ['light', 'dark'] as const) {
        const context = await browser.newContext({
          viewport: { width, height: 900 },
          colorScheme,
        });
        let signedIn = false;
        let failing = false;
        let failSession = false;
        let syncs = 0;
        const unexpected: string[] = [];
        const errors: string[] = [];
        await context.route('**/*', (route) => {
          const request = route.request();
          const url = new URL(request.url());
          if (url.origin !== origin) return route.abort();
          if (url.pathname === '/api/account/session')
            return route.fulfill({
              status: failSession ? 503 : 200,
              json: { signedIn, isAdmin: false },
            });
          if (url.pathname === '/api/account/sync') {
            syncs++;
            return route.fulfill({
              status: failing ? 503 : 200,
              json: failing ? {} : request.postDataJSON(),
            });
          }
          if (
            !['GET', 'HEAD'].includes(request.method()) ||
            url.pathname.startsWith('/api/account/')
          ) {
            unexpected.push(`${request.method()} ${url.pathname}`);
            return route.abort();
          }
          return route.continue();
        });
        const page = await context.newPage();
        page.on('pageerror', (error) => errors.push(error.message));
        await page.goto(`${origin}/saved`);
        const status = page.getByRole('status', {
          name: 'Saved item sync',
          exact: true,
        });
        await expect(status).toHaveText(
          'Sign in to sync your topics and saved items across devices.',
        );
        await expect(
          page.getByText('Saved in this browser. No account is needed.'),
        ).toHaveCount(0);
        const brand = await page.locator('header > a').boundingBox();
        const navigation = await page.locator('header nav').boundingBox();
        assert.ok(
          brand && navigation && brand.x + brand.width + 12 <= navigation.x,
          'Saved-items brand and header navigation must not overlap',
        );
        assert.equal(syncs, 0);
        signedIn = true;
        await page.reload();
        await expect(status).toHaveText(
          'Your topics and saved items are synced.',
        );
        assert.ok(syncs > 0);
        failing = true;
        await page.reload();
        await expect(status).toHaveText(
          'Could not sync. Your choices are kept here. Try again.',
        );
        await page.screenshot({
          path: `docs/screenshots/accounts/saved-sync-failed-${device}-${colorScheme}.png`,
        });
        await page
          .getByRole('button', { name: 'Account', exact: true })
          .click();
        failing = false;
        await page
          .getByRole('button', { name: 'Retry sync', exact: true })
          .click();
        await expect(page.getByRole('dialog').getByRole('status')).toHaveText(
          'Your topics and saved items are synced.',
        );
        await page.keyboard.press('Escape');
        await expect(status).toHaveText(
          'Your topics and saved items are synced.',
        );
        await page.screenshot({
          path: `docs/screenshots/accounts/saved-sync-restored-${device}-${colorScheme}.png`,
        });
        assert.equal(
          await page.evaluate(
            () => document.documentElement.scrollWidth > innerWidth,
          ),
          false,
        );
        failSession = true;
        await page.reload();
        await expect(status).toHaveText(
          'Could not update your sign-in. Your choices are kept here and syncing is paused.',
        );
        assert.deepEqual(unexpected, []);
        assert.deepEqual(errors, []);
        await context.close();
      }
    }
    console.log(
      'Saved-items signed-out, synced, failed/retried sync and failed sign-in checks pass in four device/theme views (fixture accounts).',
    );
  } finally {
    await browser.close();
  }
}
void main();
