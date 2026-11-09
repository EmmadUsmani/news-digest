// Simulated forwarding, never a live exe.dev proxy acceptance receipt.
import assert from 'node:assert/strict';

import { chromium, expect } from 'playwright/test';

import { proxyProof, type ProxyReceipt } from './lib/proxy-proof';

async function main(failed = false) {
  const receipts: ProxyReceipt[] = [];
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
      if (!failed) delete headers['x-exedev-email'];
      headers['x-forwarded-for'] = prefix
        ? `${prefix}, 192.0.2.55`
        : '192.0.2.55';
      if (failed && route.request().url().endsWith('/0'))
        delete headers['x-forwarded-for'];
      await route.continue({ headers });
    });
    await page.goto(`${origin}${path}`);
    await page.getByRole('button', { name: 'Run check once' }).click();
    await expect(page.locator('#result')).toContainText('Checks complete');
    await expect(page.getByRole('button')).toBeDisabled();
    assert.equal(receipts.length, 5);
    assert.equal(receipts.at(-1)?.status, failed ? 'failed' : 'observed');
    assert.equal(receipts.at(-1)?.steps[4].email, failed ? 'forged' : 'absent');
    assert.deepEqual(errors, []);
    await page.screenshot({
      path: `docs/screenshots/accounts/proxy-probe-${failed ? 'failed-' : ''}fixture.png`,
      fullPage: true,
    });
    console.log('Simulated proxy browser check passed; no live proxy proof.');
  } finally {
    await browser.close();
    server.closeAllConnections();
    await new Promise<void>((resolve) => server.close(() => resolve()));
  }
}
void main().then(() => main(true));
