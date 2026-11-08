// Browser-only failed-response replay; published content recovers through GETs.
import assert from 'node:assert/strict';

import { chromium, expect } from 'playwright/test';

async function smoke() {
  const origin = 'http://127.0.0.1:8000';
  const browser = await chromium.launch();
  try {
    for (const [device, width] of [
      ['desktop', 1440],
      ['mobile', 390],
      ['narrow', 320],
    ] as const) {
      for (const theme of ['light', 'dark'] as const) {
        for (const scenario of ['edition', 'archive', 'missing'] as const) {
          const context = await browser.newContext({
            viewport: { width, height: 844 },
            colorScheme: theme,
          });
          let failing = true;
          await context.route('**/*', (route) => {
            const request = route.request();
            assert.ok(['GET', 'HEAD'].includes(request.method()));
            const url = new URL(request.url());
            if (url.origin !== origin) return route.abort();
            const endpoint =
              scenario === 'archive'
                ? '/api/editions'
                : scenario === 'missing'
                  ? '/api/editions/00000000-0000-4000-8000-000000000000'
                  : '/api/editions/latest';
            if (failing && url.pathname === endpoint)
              return route.fulfill({
                status: scenario === 'missing' ? 404 : 200,
                contentType: 'application/json',
                body: scenario === 'missing' ? '{}' : '{',
              });
            return route.continue();
          });
          const page = await context.newPage();
          const errors: string[] = [];
          page.on('pageerror', (error) => errors.push(error.message));
          await page.goto(
            `${origin}${scenario === 'archive' ? '/editions' : scenario === 'missing' ? '/editions/00000000-0000-4000-8000-000000000000' : '/'}`,
          );
          const control =
            scenario === 'missing'
              ? page.getByRole('link', { name: 'Back to latest edition' })
              : page.getByRole('button', {
                  name:
                    scenario === 'archive'
                      ? 'Try again'
                      : 'Try loading edition again',
                  exact: true,
                });
          await expect(control).toBeVisible();
          const bounds = await control.boundingBox();
          assert.ok(bounds && bounds.height >= 44 && bounds.width >= 44);
          await control.focus();
          await page.keyboard.press('Tab');
          await page.keyboard.press('Shift+Tab');
          await expect(control).toBeFocused();
          assert.equal(
            await control.evaluate(
              (node) => getComputedStyle(node).outlineStyle,
            ),
            'solid',
          );
          assert.ok(
            await page.evaluate(
              () => document.documentElement.scrollWidth <= innerWidth,
            ),
          );
          if (device === 'narrow')
            await page.locator('main').screenshot({
              path: `docs/screenshots/ui/reader-recovery-${scenario}-${theme}.png`,
            });
          failing = false;
          await page.keyboard.press('Enter');
          if (scenario === 'archive')
            await expect(page.locator('main li').first()).toBeVisible();
          else
            await expect(page.locator('.digest-topic').first()).toBeVisible();
          assert.deepEqual(errors, []);
          await context.close();
        }
        console.log(
          `${device}/${theme}: edition retry, archive retry and missing-edition return pass`,
        );
      }
    }
  } finally {
    await browser.close();
  }
}
void smoke().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
