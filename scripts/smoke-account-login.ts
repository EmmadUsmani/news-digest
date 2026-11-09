import assert from 'node:assert/strict';
import { mkdir } from 'node:fs/promises';
import { createServer } from 'node:http';

import { chromium } from 'playwright';

import { accountHttp } from '../apps/api/src/modules/accounts/adapters/account-http';

// Isolated page and recorded HTTP outcomes; no live mailbox, identity or provider.
async function smoke() {
  let enabled = false;
  const server = createServer((request, response) =>
    accountHttp({
      enabled,
      handlers: {} as Parameters<typeof accountHttp>[0]['handlers'],
      client: () => null,
    })(request, response, () => response.end('Digest fixture')),
  );
  await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', resolve));
  const address = server.address();
  assert.ok(address && typeof address !== 'string');
  const base = `http://127.0.0.1:${address.port}`;
  const browser = await chromium.launch();
  try {
    assert.equal((await fetch(`${base}/account/login`)).status, 404);
    enabled = true;
    const head = await fetch(`${base}/account/login`, { method: 'HEAD' });
    assert.equal(head.status, 200);
    assert.equal(await head.text(), '');
    assert.equal(head.headers.get('cache-control'), 'no-store');
    assert.match(
      head.headers.get('content-security-policy') ?? '',
      /form-action 'none'/,
    );
    assert.equal(
      (await fetch(`${base}/account/login`, { method: 'POST' })).status,
      404,
    );
    await mkdir('docs/screenshots/accounts', { recursive: true });
    for (const [device, width, height] of [
      ['desktop', 1280, 900],
      ['mobile', 390, 844],
    ] as const) {
      const page = await browser.newPage({ viewport: { width, height } });
      const errors: string[] = [];
      const requests: string[] = [];
      const payloads: unknown[] = [];
      let codeStatus = 202;
      let redeemStatus = 401;
      page.on('pageerror', (error) => errors.push(error.message));
      page.on('request', (request) => requests.push(request.url()));
      await page.route('**/api/account/*', async (route) => {
        assert.equal(route.request().method(), 'POST');
        payloads.push(route.request().postDataJSON());
        await route.fulfill({
          status: route.request().url().endsWith('/code')
            ? codeStatus
            : redeemStatus,
        });
      });
      await page.goto(`${base}/account/login`);
      assert.equal(payloads.length, 0);
      await page
        .getByLabel('Email', { exact: true })
        .fill('fixture@example.com');
      const request = page.getByRole('button', { name: 'Request code' });
      const code = page.getByLabel('Six-digit code');
      await request.click();
      await page
        .getByRole('status')
        .filter({ hasText: 'If this address' })
        .waitFor();
      assert.equal(
        await code.evaluate((input) => input === document.activeElement),
        true,
      );
      assert.deepEqual(payloads, [{ email: 'fixture@example.com' }]);
      await page.screenshot({
        path: `docs/screenshots/accounts/code-login-${device}.png`,
        fullPage: true,
      });
      await code.fill('123456');
      await code.press('Enter');
      await page
        .getByRole('status')
        .filter({ hasText: 'Check the code' })
        .waitFor();
      assert.equal(await code.inputValue(), '');
      assert.deepEqual(payloads[1], {
        email: 'fixture@example.com',
        code: '123456',
      });
      codeStatus = 503;
      await request.click();
      await page
        .getByRole('status')
        .filter({ hasText: 'Try again later' })
        .waitFor();
      assert.equal(await request.isEnabled(), true);
      redeemStatus = 204;
      await code.fill('654321');
      await page.getByRole('button', { name: 'Sign in', exact: true }).click();
      await page.waitForURL(`${base}/`);
      assert.deepEqual(payloads[3], {
        email: 'fixture@example.com',
        code: '654321',
      });
      assert.equal(
        requests.some((url) => /fixture@|123456|654321/.test(url)),
        false,
      );
      assert.deepEqual(
        await page.evaluate(() => [localStorage.length, sessionStorage.length]),
        [0, 0],
      );
      assert.deepEqual(errors, []);
      await page.close();
    }
    console.log(
      'Prepared code login: disabled gate, CSP, no preview writes, request, refusal, retry, keyboard redemption and redirect pass on desktop/mobile; fixture responses only.',
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
