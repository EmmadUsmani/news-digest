// GET-only acceptance of the saved public reader's mobile header and preferences.
import assert from 'node:assert/strict';
import { Resolver } from 'node:dns/promises';

import { chromium } from 'playwright';

async function main() {
  const host = 'news-digest.exe.xyz';
  const resolver = new Resolver();
  resolver.setServers(['1.1.1.1']);
  const [address] = await resolver.resolve4(host);
  const browser = await chromium.launch({
    args: [`--host-resolver-rules=MAP ${host} ${address}`],
  });
  try {
    for (const width of [320, 390, 1440]) {
      const page = await browser.newPage({ viewport: { width, height: 900 } });
      const errors: string[] = [];
      page.on('pageerror', (error) => errors.push(error.message));
      await page.route('**/*', (route) => {
        assert.equal(route.request().method(), 'GET');
        return new URL(route.request().url()).hostname === host
          ? route.continue()
          : route.abort();
      });
      await page.goto(
        `https://${host}/editions/a0fa3916-f1dc-4fbd-8d76-2884d5e01c06`,
      );
      const preferences = page.getByRole('navigation', {
        name: 'Reader preferences',
        exact: true,
      });
      const topics = preferences.getByRole('button', {
        name: 'Topics',
        exact: true,
      });
      await topics.waitFor();
      await page.evaluate(() => document.fonts.ready);
      const brand = page
        .locator('header')
        .getByRole('link', { name: 'News Digest', exact: true });
      assert.ok(
        await brand.evaluate((node) => node.scrollWidth <= node.clientWidth),
        `brand clipped at ${width}px`,
      );
      for (const control of [
        brand,
        topics,
        page.getByRole('navigation', { name: 'Edition dates', exact: true }),
        preferences,
      ]) {
        const box = await control.boundingBox();
        assert.ok(
          box && box.x >= 0 && box.x + box.width <= width,
          `control outside ${width}px viewport`,
        );
      }
      await topics.click();
      await page.getByRole('dialog').waitFor();
      assert.equal(
        await page.getByRole('dialog').getByRole('checkbox').count(),
        5,
      );
      await page.keyboard.press('Escape');
      await page.getByRole('dialog').waitFor({ state: 'hidden' });
      await page.screenshot({
        path: `docs/screenshots/ui/reader-header-${width}.png`,
      });
      assert.deepEqual(errors, []);
      await page.close();
    }
    console.log(
      'Public saved reader: full title, visible controls and Topics dialog at 320/390/1440px; GET-only, no browser errors.',
    );
  } finally {
    await browser.close();
  }
}
void main();
