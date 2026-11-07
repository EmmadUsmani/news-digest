// Read-only measurement of the real edition with third-party embeds enabled.
import assert from 'node:assert/strict';

import { chromium } from 'playwright';

async function smoke() {
  const browser = await chromium.launch();
  try {
    for (const theme of ['light', 'dark'] as const) {
      const page = await browser.newPage({
        viewport: { width: 1440, height: 1100 },
        colorScheme: theme,
        reducedMotion: 'reduce',
      });
      await page.route('**/*', (route) =>
        ['GET', 'HEAD'].includes(route.request().method())
          ? route.continue()
          : route.abort(),
      );
      await page.goto('http://127.0.0.1:8000');
      await page.locator('.digest-topic').first().waitFor();
      const count = await page.locator('.post-card').count();
      for (const card of await page.locator('.post-card').all()) {
        await card.scrollIntoViewIfNeeded();
        await page.waitForTimeout(1800);
      }
      await page.waitForTimeout(16000);
      const measurements = [];
      for (const topic of await page.locator('.digest-topic').all()) {
        const name = await topic.locator('h2').innerText();
        const height = await topic.evaluate(
          (node) => node.getBoundingClientRect().height,
        );
        assert.ok(height <= 3300, `${name}: ${height}px exceeds three screens`);
        const grid = topic.locator('.post-grid');
        await grid.focus();
        await grid.evaluate((node) => {
          node.scrollTop = 0;
        });
        await page.keyboard.press('End');
        await page.waitForTimeout(300);
        assert.ok(
          await grid.evaluate(
            (node) =>
              node.scrollHeight <= node.clientHeight || node.scrollTop > 0,
          ),
          `${name}: keyboard scrolling`,
        );
        await grid.locator('.post-card').last().scrollIntoViewIfNeeded();
        assert.ok(await grid.locator('.post-card').last().isVisible());
        await grid.evaluate((node) => {
          node.scrollTop = 0;
        });
        await grid.evaluate((node) => {
          window.scrollTo(
            0,
            window.scrollY + node.getBoundingClientRect().top - 120,
          );
        });
        await page.waitForTimeout(200);
        await page.screenshot({
          path: `docs/screenshots/ui/loaded-${name.split(' ')[0].toLowerCase()}-desktop-${theme}.png`,
        });
        measurements.push({
          name,
          height,
          frames: await topic.locator('iframe').count(),
        });
      }
      assert.equal(await page.locator('.post-card').count(), count);
      assert.ok(
        (await page.locator('iframe').count()) > 0,
        'Requires actual loaded embeds',
      );
      assert.equal(
        await page.evaluate(
          () => document.documentElement.scrollWidth > innerWidth,
        ),
        false,
      );
      console.log(JSON.stringify({ theme, measurements, posts: count }));
      await page.setViewportSize({ width: 390, height: 844 });
      for (const grid of await page.locator('.post-grid').all()) {
        assert.equal(
          await grid.evaluate((node) => getComputedStyle(node).maxHeight),
          'none',
          'Mobile keeps continuous posts',
        );
      }
      await page.close();
    }
  } finally {
    await browser.close();
  }
}
void smoke();
