// Published stories; browser-local bookmarks only. No server writes or external calls.
import assert from 'node:assert/strict';

import { chromium, expect } from 'playwright/test';

async function smoke() {
  const origin = 'http://127.0.0.1:8000';
  const browser = await chromium.launch();
  try {
    for (const width of [1440, 390, 320]) {
      for (const theme of ['light', 'dark'] as const) {
        for (const scale of [100, 200]) {
          const page = await browser.newPage({
            viewport: { width, height: 844 },
            colorScheme: theme,
          });
          await page.route('**/*', (route) => {
            const request = route.request();
            assert.ok(['GET', 'HEAD'].includes(request.method()));
            return new URL(request.url()).origin === origin
              ? route.continue({
                  headers: {
                    ...request.headers(),
                    'X-Forwarded-For': '192.0.2.165',
                  },
                })
              : route.abort();
          });
          await page.goto(origin);
          const saves = page.getByRole('button', { name: /^Save story:/ });
          await expect(saves.first()).toBeVisible();
          const names = await saves.evaluateAll((elements) =>
            elements
              .slice(0, 5)
              .map((element) => element.getAttribute('aria-label')!),
          );
          assert.equal(names.length, 5);
          for (const name of names) {
            const save = page.getByRole('button', { name, exact: true });
            await save.click();
            await expect(save).toHaveAttribute('aria-pressed', 'true');
          }
          await page.goto(`${origin}/saved`);
          await page.addStyleTag({
            content: `html { font-size: ${scale}% !important; }`,
          });
          const removes = page.getByRole('button', {
            name: /^Remove saved item:/,
          });
          await expect(removes).toHaveCount(5);
          // First, middle, last, first, final: forward/backward and heading recovery.
          for (const index of [0, 1, 2, 0, 0]) {
            const count = await removes.count();
            const neighbor =
              count > 1
                ? await removes
                    .nth(index + 1 < count ? index + 1 : index - 1)
                    .getAttribute('aria-label')
                : null;
            await removes.nth(index).focus();
            await page.keyboard.press('Enter');
            await expect(removes).toHaveCount(count - 1);
            const target = neighbor
              ? page.getByRole('button', { name: neighbor, exact: true })
              : page.getByRole('heading', { name: 'Saved items', exact: true });
            await expect(target).toBeFocused();
            await expect
              .poll(() =>
                target.evaluate((element) => {
                  const box = element.getBoundingClientRect();
                  return (
                    box.top >= 4 &&
                    box.bottom <= innerHeight - 4 &&
                    box.left >= 0 &&
                    box.right <= innerWidth
                  );
                }),
              )
              .toBe(true);
            if (count === 5 && width === 390 && scale === 200) {
              await page.screenshot({
                path: `docs/screenshots/ui/saved-removal-${theme}.png`,
              });
            }
          }
          await expect(
            page.getByText('No saved items yet.', { exact: false }),
          ).toBeVisible();
          await page.close();
          console.log(
            `${width}/${theme}/${scale}%: five keyboard removals retain visible focus`,
          );
        }
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
