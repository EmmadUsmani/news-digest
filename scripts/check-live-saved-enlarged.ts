// Real published content, browser-local saves only; no account/provider writes.
import assert from 'node:assert/strict';

import { readerEditionSchema } from '@digest/contracts';
import { chromium, expect } from 'playwright/test';

async function main() {
  const origin = 'http://127.0.0.1:8000';
  const headers = { 'X-Forwarded-For': '192.0.2.169' };
  const response = await fetch(`${origin}/api/editions/latest`, { headers });
  assert.equal(response.status, 200);
  const edition = readerEditionSchema.parse(await response.json());
  const browser = await chromium.launch();
  try {
    for (const width of [320, 390, 1440]) {
      for (const theme of ['light', 'dark'] as const) {
        const context = await browser.newContext({
          viewport: { width, height: 844 },
          colorScheme: theme,
          extraHTTPHeaders: headers,
        });
        const errors: string[] = [];
        await context.route('**/*', (route) => {
          const request = route.request();
          assert.ok(['GET', 'HEAD'].includes(request.method()));
          const url = new URL(request.url());
          if (url.origin !== origin) return route.abort();
          // Reuse one actual saved projection rather than consume API admission
          // during repeated navigation and reloads.
          if (url.pathname === `/api/editions/${edition.id}`)
            return route.fulfill({ json: edition });
          return route.continue();
        });
        const page = await context.newPage();
        page.on('pageerror', (error) => errors.push(error.message));
        await page.goto(`${origin}/editions/${edition.id}`);
        for (const name of [/^Save story:/, /^Save post on/]) {
          const save = page.getByRole('button', { name }).first();
          await save.click();
          await expect(save).toHaveAttribute('aria-pressed', 'true');
        }
        await page.goto(`${origin}/saved`);
        const items = page.locator('main > ul > li');
        await expect(items).toHaveCount(2);
        const urls = await items
          .locator('h2 a')
          .evaluateAll((links) =>
            links.map((link) => link.getAttribute('href')),
          );
        assert.ok(urls.every((url) => url?.startsWith('https://')));
        await page.reload();
        await expect(items).toHaveCount(2);
        await page.addStyleTag({
          content: 'html { font-size: 200% !important; }',
        });
        assert.deepEqual(
          await items
            .locator('h2 a')
            .evaluateAll((links) =>
              links.map((link) => link.getAttribute('href')),
            ),
          urls,
        );
        for (const control of await items.locator('a, button').all()) {
          await control.focus();
          await expect(control).toBeFocused();
          const box = await control.boundingBox();
          assert.ok(box && box.x >= 0 && box.x + box.width <= width + 1);
          if (
            !(await control.evaluate((element) =>
              element.closest('.post-text'),
            ))
          )
            assert.ok(box.height >= 44, 'saved controls retain touch targets');
        }
        assert.ok(
          await page.evaluate(
            () => document.documentElement.scrollWidth <= innerWidth,
          ),
        );
        await page.evaluate(() => window.scrollTo(0, 0));
        await page.screenshot({
          path: `docs/screenshots/ui/saved-content-enlarged-${width}-${theme}.png`,
          fullPage: true,
        });
        const remove = page.getByRole('button', {
          name: /^Remove saved item:/,
        });
        await remove.first().focus();
        await page.keyboard.press('Enter');
        await expect(items).toHaveCount(1);
        await expect(remove).toBeFocused();
        await expect(
          page.getByRole('status').filter({ hasText: 'Removed' }),
        ).toContainText('1 saved item remaining.');
        await page.keyboard.press('Enter');
        await expect(items).toHaveCount(0);
        await expect(
          page.getByRole('heading', { name: 'Saved items', exact: true }),
        ).toBeFocused();
        await expect(
          page.getByRole('link', { name: 'Browse the latest edition' }),
        ).toBeVisible();
        assert.deepEqual(errors, []);
        await context.close();
        console.log(
          `${width}/${theme}: two real saved items persist, reflow at 200%, and remove by keyboard with focus retained`,
        );
      }
    }
    console.log(`Published edition: ${edition.id}`);
  } finally {
    await browser.close();
  }
}

void main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
