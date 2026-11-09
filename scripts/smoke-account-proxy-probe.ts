// Simulated forwarding, never a live exe.dev proxy acceptance receipt.
import assert from 'node:assert/strict';

import { chromium, expect } from 'playwright/test';

import { proxyProof } from './lib/proxy-proof';

async function main() {
  const receipts: unknown[] = [];
  const { server, path } = proxyProof((receipt) => receipts.push(receipt));
  await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', resolve));
  const bound = server.address();
  assert.ok(bound && typeof bound !== 'string');
  const origin = `http://127.0.0.1:${bound.port}`;
  const browser = await chromium.launch();
  try {
    const page = await browser.newPage({
      viewport: { width: 900, height: 600 },
    });
    const errors: string[] = [];
    page.on('pageerror', (error) => errors.push(error.message));
    await page.route(`${origin}/**`, async (route) => {
      const headers = route.request().headers();
      const prefix = headers['x-forwarded-for'];
      headers['x-forwarded-for'] = prefix
        ? `${prefix}, 192.0.2.55`
        : '192.0.2.55';
      await route.continue({ headers });
    });
    await page.goto(`${origin}${path}`);
    await page.getByRole('button', { name: 'Run check once' }).click();
    await expect(page.locator('#result')).toContainText(
      'Forwarding checks passed',
    );
    await expect(page.getByRole('button')).toBeDisabled();
    assert.equal(receipts.length, 1);
    assert.deepEqual(errors, []);
    await page.screenshot({
      path: 'docs/screenshots/accounts/proxy-probe-fixture.png',
    });
    console.log('Simulated proxy browser check passed; no live proxy proof.');
  } finally {
    await browser.close();
    server.closeAllConnections();
    await new Promise<void>((resolve) => server.close(() => resolve()));
  }
}
void main();
