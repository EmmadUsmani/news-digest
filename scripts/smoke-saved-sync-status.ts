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
        await context.addInitScript(() => {
          const key = 'news-digest.reader-preferences.v1';
          if (!localStorage.getItem(key)) {
            localStorage.setItem(
              key,
              JSON.stringify({
                version: 1,
                hiddenTopics: {},
                bookmarks: {
                  'story:sync-recovery': {
                    updatedAt: 1,
                    copy: {
                      title: 'Saved sync recovery fixture',
                      url: 'https://example.org/sync-recovery',
                      attribution: 'Offline fixture',
                      excerpt:
                        'Fixture content for sync recovery verification.',
                      platform: 'story',
                      editionId: 'fixture-edition',
                    },
                  },
                },
              }),
            );
          }
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
        await expect(
          page.getByRole('button', { name: 'Retry sync', exact: true }),
        ).toHaveCount(0);
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
          .getByRole('button', { name: 'Retry sync', exact: true })
          .click();
        await expect(status).toHaveText(
          'Could not sync. Your choices are kept here. Try again.',
        );
        await expect(
          page.getByRole('link', {
            name: 'Saved sync recovery fixture',
            exact: true,
          }),
        ).toBeVisible();
        failing = false;
        await page
          .getByRole('button', { name: 'Retry sync', exact: true })
          .click();
        await expect(
          page.getByRole('button', { name: 'Retry sync', exact: true }),
        ).toHaveCount(0);
        await expect(page.getByRole('dialog')).toHaveCount(0);
        await expect(status).toHaveText(
          'Your topics and saved items are synced.',
        );
        await expect(
          page.getByRole('link', {
            name: 'Saved sync recovery fixture',
            exact: true,
          }),
        ).toBeVisible();
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
        await expect(
          page.getByRole('button', { name: 'Retry sync', exact: true }),
        ).toHaveCount(0);
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
