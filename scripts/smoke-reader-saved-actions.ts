// Read-only live edition; saves are isolated to each browser context.
import assert from 'node:assert/strict';

import { chromium, expect } from 'playwright/test';

async function smoke() {
  const origin = 'http://127.0.0.1:8000';
  const browser = await chromium.launch();
  try {
    for (const width of [1440, 390, 320]) {
      for (const theme of ['light', 'dark'] as const) {
        const page = await browser.newPage({
          viewport: { width, height: 844 },
          colorScheme: theme,
        });
        await page.route('**/*', (route) => {
          const request = route.request();
          assert.ok(['GET', 'HEAD'].includes(request.method()));
          if (new URL(request.url()).origin !== origin) return route.abort();
          return route.continue({
            headers: { ...request.headers(), 'X-Forwarded-For': '192.0.2.165' },
          });
        });
        await page.goto(origin);
        await page
          .getByRole('button', { name: /^Save story:/ })
          .first()
          .click();
        await page.goto(`${origin}/saved`);
        await page.addStyleTag({
          content: 'html { font-size: 200% !important; }',
        });
        const card = page.locator('main li').first();
        await expect(card).toBeVisible();
        assert.ok(
          await card.evaluate((element) => {
            const bounds = element.getBoundingClientRect();
            const style = getComputedStyle(element);
            const left =
              bounds.left +
              parseFloat(style.borderLeftWidth) +
              parseFloat(style.paddingLeft);
            const right =
              bounds.right -
              parseFloat(style.borderRightWidth) -
              parseFloat(style.paddingRight);
            return [...element.querySelectorAll('a, button')].every(
              (control) => {
                const box = control.getBoundingClientRect();
                return (
                  box.left >= left - 1 &&
                  box.right <= right + 1 &&
                  box.height >= 44
                );
              },
            );
          }),
          `${width}/${theme}: saved actions must fit inside card padding`,
        );
        const view = card.getByRole('link', {
          name: /^View edition containing/,
        });
        await view.focus();
        await expect(view).toBeFocused();
        await page.keyboard.press('Tab');
        const remove = card.getByRole('button', {
          name: /^Remove saved item:/,
        });
        await expect(remove).toBeFocused();
        await card.screenshot({
          path: `docs/screenshots/ui/saved-actions-${width}-${theme}.png`,
        });
        await page.keyboard.press('Enter');
        await expect(
          page.getByRole('heading', { name: 'Saved items', exact: true }),
        ).toBeFocused();
        await expect(
          page.getByText('No saved items yet.', { exact: false }),
        ).toBeVisible();
        await page.close();
        console.log(
          `${width}/${theme}: enlarged saved actions fit; keyboard removal passes`,
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
