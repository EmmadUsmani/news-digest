import assert from 'node:assert/strict';

import { chromium } from 'playwright';

// Real read-only responses, plus explicitly malformed responses for error checks.
async function smoke() {
  const browser = await chromium.launch();
  try {
    const page = await browser.newPage();
    const counts = new Map<string, number>();
    const resources = [
      '/api/content',
      '/api/topics',
      '/api/profile',
      '/healthz',
    ];
    const errors: string[] = [];
    page.on('pageerror', (error) => errors.push(error.message));
    page.on('request', (request) => {
      const path = new URL(request.url()).pathname;
      if (resources.includes(path))
        counts.set(path, (counts.get(path) ?? 0) + 1);
    });
    await page.goto('http://localhost:8000/');
    await page
      .getByText('System online · Database and queue connected')
      .waitFor();
    await page.locator('.topic-grid article').first().waitFor();
    for (const resource of resources)
      assert.equal(counts.get(resource), 1, resource);
    // Leaving and re-entering the page must reuse fresh shared resources.
    await page.evaluate(() => {
      history.pushState({}, '', '/unknown-query-check');
      dispatchEvent(new PopStateEvent('popstate'));
    });
    await page.getByRole('heading', { name: 'Page not found' }).waitFor();
    await page.getByRole('link', { name: 'Back to News Digest' }).click();
    await page.locator('.topic-grid article').first().waitFor();
    for (const resource of resources)
      assert.equal(counts.get(resource), 1, resource);
    await page.screenshot({
      path: 'docs/screenshots/ui/foundations-query-desktop.png',
    });
    await page.setViewportSize({ width: 390, height: 844 });
    await page.screenshot({
      path: 'docs/screenshots/ui/foundations-query-mobile.png',
    });
    await page.route('**/api/content', (route) =>
      route.fulfill({ json: { invalid: true } }),
    );
    await page.route('**/healthz', (route) =>
      route.fulfill({ json: { status: 'ok' } }),
    );
    await page.reload();
    await page.getByText('System needs attention', { exact: true }).waitFor();
    await page
      .getByText('Recent articles could not be loaded.')
      .first()
      .waitFor();
    await page.locator('.digest-preview').waitFor();
    await page.locator('.topic-grid article').first().waitFor();
    assert.deepEqual(errors, []);
    console.log(
      'Shared resource requests deduplicated and cached across navigation; malformed content/health rejected without hiding edition or topics. No writes.',
    );
  } finally {
    await browser.close();
  }
}
void smoke();
