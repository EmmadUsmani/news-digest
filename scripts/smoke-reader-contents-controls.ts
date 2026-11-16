// Real published content at 200% text; external traffic and mutations are blocked.
import assert from 'node:assert/strict';

import {
  readerEditionHistorySchema,
  readerEditionSchema,
} from '@digest/contracts';
import { chromium, expect } from 'playwright/test';

async function smoke() {
  const origin = 'http://127.0.0.1:8000';
  const headers = { 'X-Forwarded-For': '192.0.2.176' };
  async function readPublished(path: string) {
    const response = await fetch(`${origin}${path}`, {
      headers,
      signal: AbortSignal.timeout(15_000),
      redirect: 'error',
    });
    assert.equal(response.status, 200, `Capture ${path}`);
    return response.json();
  }
  const edition = readerEditionSchema.parse(
    await readPublished('/api/editions/latest'),
  );
  const history = readerEditionHistorySchema.parse(
    await readPublished('/api/editions?offset=0'),
  );
  assert.ok(edition.topics.length);
  assert.equal(history.entries[0]?.id, edition.id);
  const browser = await chromium.launch();
  try {
    for (const width of [1440, 390, 320]) {
      for (const theme of ['light', 'dark'] as const) {
        const context = await browser.newContext({
          viewport: { width, height: 900 },
          colorScheme: theme,
          extraHTTPHeaders: headers,
        });
        await context.route('**/*', (route) => {
          assert.ok(['GET', 'HEAD'].includes(route.request().method()));
          const url = new URL(route.request().url());
          if (url.origin !== origin) return route.abort();
          return route.continue();
        });
        const page = await context.newPage();
        const errors: string[] = [];
        page.on('pageerror', (error) => errors.push(error.message));
        await page.goto(origin);
        await expect(page.locator('.digest-topic').first()).toBeVisible();
        await page.addStyleTag({
          content: 'html { font-size: 200% !important; }',
        });
        const mobile = width < 1024;
        const trigger = page.getByRole('button', {
          name: 'Contents',
          exact: true,
        });
        const navigation = page.getByRole('navigation', {
          name: mobile ? 'Mobile contents' : 'Edition contents',
          exact: true,
        });
        if (mobile) {
          const bounds = await trigger.boundingBox();
          assert.ok(bounds && bounds.height >= 44 && bounds.width >= 44);
          await trigger.click();
        }
        await expect(navigation).toBeVisible();
        const sectionLinks = navigation.locator('a[href^="#"]');
        assert.ok((await sectionLinks.count()) > 0);
        for (const link of await sectionLinks.all()) {
          await link.scrollIntoViewIfNeeded();
          const target = await link.boundingBox();
          assert.ok(
            target && target.height >= 44 && target.width >= 44,
            `${await link.innerText()}: contents links need 44px targets`,
          );
          assert.ok(
            target.x >= 0 && target.x + target.width <= width,
            'Enlarged contents links stay horizontally reachable',
          );
        }
        const archive = navigation.getByRole('link', { name: 'Past editions' });
        const bounds = await archive.boundingBox();
        assert.ok(bounds && bounds.height >= 44 && bounds.width >= 44);
        await archive.focus();
        await page.keyboard.press('Tab');
        await page.keyboard.press('Shift+Tab');
        await expect(archive).toBeFocused();
        assert.equal(
          await archive.evaluate((node) => getComputedStyle(node).outlineStyle),
          'solid',
        );
        await expect(archive).toHaveAttribute('href', /\/editions/);
        assert.ok(
          await page.evaluate(
            () => document.documentElement.scrollWidth <= innerWidth,
          ),
        );
        await (mobile ? page.getByRole('dialog') : navigation).screenshot({
          path: `docs/screenshots/ui/reader-contents-controls-${width}-${theme}.png`,
        });
        if (mobile) {
          await page.keyboard.press('Escape');
          await expect(trigger).toBeFocused();
          await trigger.click();
        }
        await archive.click();
        await expect(
          page.getByRole('heading', { name: 'Past editions', exact: true }),
        ).toBeVisible();
        assert.deepEqual(errors, []);
        await context.close();
        console.log(
          `${width}/${theme}: real enlarged contents targets, keyboard focus, archive navigation pass`,
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
