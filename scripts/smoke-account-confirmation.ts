import assert from 'node:assert/strict';
import { mkdir } from 'node:fs/promises';
import { createServer } from 'node:http';

import { chromium } from 'playwright';

import { accountHttp } from '../apps/api/src/modules/accounts/adapters/account-http';

// Isolated prepared transport and browser only; no live accounts or providers.
async function smoke() {
  let enabled = false;
  const server = createServer((request, response) =>
    accountHttp({
      enabled,
      // Page rendering never accesses account handlers or client admission.
      handlers: {} as Parameters<typeof accountHttp>[0]['handlers'],
      client: () => {
        throw new Error('Unexpected client admission');
      },
    })(request, response, () => response.end('Digest fixture')),
  );
  await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', resolve));
  const address = server.address();
  assert.ok(address && typeof address !== 'string');
  const base = `http://127.0.0.1:${address.port}`;
  const token = 'b'.repeat(43);
  const browser = await chromium.launch();
  try {
    assert.equal((await fetch(`${base}/account/sign-in`)).status, 404);
    enabled = true;
    assert.equal(
      (await fetch(`${base}/account/sign-in`, { method: 'HEAD' })).status,
      200,
    );
    assert.equal(
      (await fetch(`${base}/account/sign-in`, { method: 'POST' })).status,
      404,
    );
    await mkdir('docs/screenshots/accounts', { recursive: true });
    for (const [device, width, height] of [
      ['desktop', 1280, 900],
      ['mobile', 390, 844],
    ] as const) {
      const page = await browser.newPage({ viewport: { width, height } });
      const requests: string[] = [];
      const errors: string[] = [];
      let posts = 0;
      let result = 204;
      page.on('request', (request) => requests.push(request.url()));
      page.on('pageerror', (error) => errors.push(error.message));
      await page.route('**/api/account/link-redeem', async (route) => {
        posts++;
        assert.equal(route.request().method(), 'POST');
        assert.deepEqual(route.request().postDataJSON(), { token });
        await route.fulfill({ status: result });
      });
      await page.goto(`${base}/account/sign-in#${token}`);
      const button = page.getByRole('button', { name: 'Sign in', exact: true });
      await button.waitFor();
      assert.equal(await button.isEnabled(), true);
      assert.equal(page.url(), `${base}/account/sign-in`);
      assert.equal(posts, 0);
      assert.equal(
        requests.some((url) => url.includes(token)),
        false,
      );
      assert.equal(await page.evaluate(() => localStorage.length), 0);
      await page.screenshot({
        path: `docs/screenshots/accounts/link-confirmation-${device}.png`,
        fullPage: true,
      });
      await button.click();
      await page.waitForURL(`${base}/`);
      assert.equal(posts, 1);
      result = 401;
      await page.goto(`${base}/account/sign-in#${token}`);
      await button.click();
      await page
        .getByRole('status')
        .filter({ hasText: 'Ask for a new link' })
        .waitFor();
      assert.equal(await button.isDisabled(), true);
      assert.equal(posts, 2);
      await page.reload();
      await page
        .getByRole('status')
        .filter({ hasText: 'missing or invalid' })
        .waitFor();
      assert.equal(await button.isDisabled(), true);
      assert.equal(posts, 2);
      assert.deepEqual(errors, []);
      await page.close();
    }
    console.log(
      'Prepared confirmation: disabled gate, previews, fragment privacy, explicit POST, success, replay and reload pass on desktop/mobile.',
    );
  } finally {
    await browser.close();
    await new Promise<void>((resolve, reject) =>
      server.close((error) => (error ? reject(error) : resolve())),
    );
  }
}
void smoke().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
