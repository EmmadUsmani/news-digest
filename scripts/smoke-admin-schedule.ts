import assert from 'node:assert/strict';

import { chromium, expect } from 'playwright/test';

import { localAdminFetch } from './lib/local-admin-fetch';
import { replayAdminPage } from './lib/replay-admin-page';

const origin = 'http://127.0.0.1:8000';
async function smoke() {
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
        const errors: string[] = [];
        page.on('pageerror', (error) => errors.push(error.message));
        assert.equal(
          (await page.goto(origin + '/admin/schedule'))?.status(),
          404,
        );
        let saved = 0;
        let fail = false;
        let systemMode: 'private' | 'public' | 'unavailable' = 'private';
        let profileReads = 0;
        const profileResponse = await localAdminFetch(
          origin + '/api/admin/profile',
        );
        const profile = await profileResponse.json();
        await context.route('**/*', async (route) => {
          const request = route.request();
          const url = new URL(request.url());
          assert.equal(url.origin, origin);
          assert.equal('admin_local_token' in request.headers(), false);
          assert.equal('x-exedev-email' in request.headers(), false);
          if (url.pathname === '/api/settings/schedule') {
            return route.fulfill({
              status:
                systemMode === 'private'
                  ? 404
                  : systemMode === 'unavailable'
                    ? 503
                    : 200,
              json: systemMode === 'public' ? profile.schedule : {},
            });
          }
          if (
            url.pathname === '/api/admin/profile' &&
            request.method() === 'GET'
          )
            profileReads++;
          if (url.pathname.startsWith('/api/admin/')) {
            if (request.method() === 'PUT') {
              assert.equal(url.pathname, '/api/admin/profile/schedule');
              saved++;
              if (fail) return route.fulfill({ status: 503, json: {} });
              const response = await localAdminFetch(
                origin + '/api/admin/profile',
              );
              const profile = await response.json();
              return route.fulfill({
                json: { ...profile, schedule: request.postDataJSON() },
              });
            }
            assert.equal(request.method(), 'GET');
            const response = await localAdminFetch(request.url());
            assert.equal(response.status, 200);
            return route.fulfill({
              status: 200,
              contentType: 'application/json',
              body: await response.text(),
            });
          }
          assert.equal(request.method(), 'GET');
          return route.continue();
        });
        await replayAdminPage(page);
        await page.goto(origin + '/admin/schedule');
        await page
          .getByRole('heading', { name: 'Schedule', exact: true })
          .waitFor();
        await page.getByLabel('Daily local time').waitFor();
        await page.reload();
        const time = page.getByLabel('Daily local time');
        await time.waitFor();
        assert.ok(await time.inputValue());
        await page
          .getByText('Loading next run…', { exact: true })
          .waitFor({ state: 'hidden' });
        assert.equal(
          await page.evaluate(
            () => document.documentElement.scrollWidth > innerWidth,
          ),
          false,
        );
        await page.screenshot({
          path:
            'docs/screenshots/admin-schedule-' + device + '-' + theme + '.png',
          fullPage: true,
        });
        await time.fill('08:45');
        await page
          .getByRole('button', { name: 'Save schedule', exact: true })
          .click();
        await page
          .getByRole('status')
          .filter({ hasText: 'Schedule settings saved' })
          .waitFor();
        assert.equal(saved, 1);
        assert.equal(await time.inputValue(), '08:45');
        fail = true;
        await time.fill('09:15');
        await page
          .getByRole('button', { name: 'Save schedule', exact: true })
          .click();
        await page
          .getByRole('status')
          .filter({ hasText: 'Schedule request failed' })
          .waitFor();
        assert.equal(await time.inputValue(), '09:15');
        assert.equal(saved, 2);
        if (device === 'mobile') {
          await page.getByRole('button', { name: 'Open admin menu' }).click();
          await page
            .getByRole('dialog')
            .getByRole('link', { name: 'Schedule', exact: true })
            .click();
          await page.getByRole('dialog').waitFor({ state: 'hidden' });
        }
        systemMode = 'public';
        profileReads = 0;
        await page.reload();
        await expect(time).toHaveValue(
          profile.schedule.cadence
            .split(' ')
            .slice(0, 2)
            .reverse()
            .map((part: string) => part.padStart(2, '0'))
            .join(':'),
        );
        assert.equal(
          profileReads,
          0,
          'System reads must not request the owner profile',
        );
        systemMode = 'unavailable';
        await page.reload();
        await expect(
          page.getByText('Schedule could not be loaded.', { exact: true }),
        ).toBeVisible({ timeout: 20000 });
        assert.equal(
          profileReads,
          0,
          'System failures must not fall back to owner data',
        );
        systemMode = 'public';
        await page.getByRole('button', { name: 'Retry schedule' }).click();
        await expect(time).toBeVisible();
        // Admit the existing admin route, then simulate identity loss on its
        // fresh component read. Public HTML/router promotion is a separate step.
        let identities = 0;
        await page.route('**/api/me', (route) =>
          route.fulfill({ json: { isAdmin: ++identities === 1 } }),
        );
        await page.reload();
        await expect(
          page.getByText(
            'Read-only schedule. Sign in as an admin to change it.',
          ),
        ).toBeVisible();
        await expect(time).toBeDisabled();
        await expect(
          page.getByRole('button', { name: 'Save schedule', exact: true }),
        ).toBeDisabled();
        await page
          .getByText('Loading next run…', { exact: true })
          .waitFor({ state: 'hidden' });
        await page.screenshot({
          path: `docs/screenshots/admin-schedule-read-only-${device}-${theme}.png`,
          fullPage: true,
        });
        assert.equal(saved, 2);
        assert.deepEqual(errors, []);
        await context.close();
      }
    }
  } finally {
    await browser.close();
  }
  console.log(
    'Schedule: four viewport/theme combinations, anonymous denial, reload, mobile navigation, no overflow or browser credentials; private fallback, system reads, failure/retry and read-only controls replayed without live writes.',
  );
}
void smoke();
