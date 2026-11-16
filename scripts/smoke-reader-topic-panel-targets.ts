// Published content only; browser-local preferences, no server writes.
import assert from 'node:assert/strict';

import { readerEditionSchema } from '@digest/contracts';
import { chromium, expect } from 'playwright/test';

async function smoke() {
  const origin = 'http://127.0.0.1:8000';
  const headers = { 'X-Forwarded-For': '192.0.2.177' };
  const response = await fetch(`${origin}/api/editions/latest`, {
    headers,
    redirect: 'error',
    signal: AbortSignal.timeout(15_000),
  });
  assert.equal(response.status, 200);
  const edition = readerEditionSchema.parse(await response.json());
  assert.ok(edition.topics.length > 1);
  const browser = await chromium.launch();
  try {
    for (const width of [1440, 390, 320]) {
      for (const theme of ['light', 'dark'] as const) {
        const context = await browser.newContext({
          viewport: { width, height: 900 },
          colorScheme: theme,
          reducedMotion: 'reduce',
          extraHTTPHeaders: headers,
        });
        await context.route('**/*', (route) => {
          assert.ok(['GET', 'HEAD'].includes(route.request().method()));
          return new URL(route.request().url()).origin === origin
            ? route.continue()
            : route.abort();
        });
        const page = await context.newPage();
        const errors: string[] = [];
        page.on('pageerror', (error) => errors.push(error.message));
        await page.goto(origin);
        await expect(page.locator('.digest-topic')).toHaveCount(
          edition.topics.length,
        );
        await page.addStyleTag({
          content: 'html { font-size: 200% !important; }',
        });
        await page.evaluate(() => document.fonts.ready);
        const trigger = page.getByRole('button', {
          name: 'Topics',
          exact: true,
        });
        const triggerBounds = await trigger.boundingBox();
        assert.ok(
          triggerBounds &&
            triggerBounds.height >= 44 &&
            triggerBounds.width >= 44,
        );
        await trigger.focus();
        await page.keyboard.press('Enter');
        const dialog = page.getByRole('dialog', { name: 'Your topics' });
        await expect(dialog).toBeVisible();
        const close = dialog.getByRole('button', { name: 'Close menu' });
        const bounds = await close.boundingBox();
        assert.ok(bounds && bounds.height >= 44 && bounds.width >= 44);
        await close.focus();
        await page.keyboard.press('Tab');
        await page.keyboard.press('Shift+Tab');
        await expect(close).toBeFocused();
        assert.equal(
          await close.evaluate((node) => getComputedStyle(node).outlineStyle),
          'solid',
        );
        const titleRight = await dialog
          .getByRole('heading')
          .evaluate((node) => {
            const range = document.createRange();
            range.selectNodeContents(node);
            return range.getBoundingClientRect().right;
          });
        assert.ok(bounds.x >= titleRight);
        const choices = dialog.getByRole('checkbox');
        await expect(choices).toHaveCount(edition.topics.length);
        for (const choice of await choices.all()) {
          const label = choice.locator('..');
          await label.scrollIntoViewIfNeeded();
          const target = await label.boundingBox();
          assert.ok(target && target.height >= 44 && target.width >= 44);
          assert.ok(target.x >= 0 && target.x + target.width <= width);
        }
        await close.scrollIntoViewIfNeeded();
        await page.screenshot({
          path: `docs/screenshots/ui/reader-topic-panel-${width}-${theme}.png`,
        });
        await choices.first().uncheck();
        await close.click();
        await expect(trigger).toBeFocused();
        await expect(page.locator('.digest-topic')).toHaveCount(
          edition.topics.length - 1,
        );
        await page.reload();
        await expect(page.locator('.digest-topic')).toHaveCount(
          edition.topics.length - 1,
        );
        await trigger.click();
        await expect(choices.first()).not.toBeChecked();
        await choices.first().check();
        await page.keyboard.press('Escape');
        await expect(trigger).toBeFocused();
        await expect(page.locator('.digest-topic')).toHaveCount(
          edition.topics.length,
        );
        assert.ok(
          await page.evaluate(
            () => document.documentElement.scrollWidth <= innerWidth,
          ),
        );
        assert.deepEqual(errors, []);
        await context.close();
        console.log(
          `${width}/${theme}: real enlarged topic panel targets, keyboard focus and persisted choices pass`,
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
