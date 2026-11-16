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
    for (const [device, width, height, theme, textSize] of (
      [
        ['desktop', 1280, 900],
        ['mobile', 390, 844],
        ['narrow', 320, 900],
      ] as const
    ).flatMap(([device, width, height]) =>
      (['light', 'dark'] as const).flatMap((theme) =>
        [100, 200].map(
          (textSize) => [device, width, height, theme, textSize] as const,
        ),
      ),
    )) {
      const page = await browser.newPage({
        viewport: { width, height },
        colorScheme: theme,
      });
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
      await page.evaluate((size) => {
        document.documentElement.style.fontSize = `${size}%`;
      }, textSize);
      assert.ok(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth,
        ),
        `${device}/${theme}/${textSize}: sign-in page fits at enlarged and normal text`,
      );
      for (const button of await page.getByRole('button').all()) {
        const box = await button.boundingBox();
        const text = await button.evaluate((node) => {
          const range = document.createRange();
          range.selectNodeContents(node);
          return range.getBoundingClientRect().toJSON();
        });
        assert.ok(
          box && box.height >= 44 && text.right <= box.x + box.width,
          `${device}/${theme}/${textSize}: enlarged action text stays inside its touch target`,
        );
      }
      const back = page.getByRole('link', { name: 'Back to the digest' });
      const backBox = await back.boundingBox();
      assert.ok(
        backBox && backBox.height >= 44,
        `${device}/${theme}/${textSize}: digest return link has a 44px touch target`,
      );
      await back.focus();
      assert.equal(
        await back.evaluate((node) => node === document.activeElement),
        true,
      );
      assert.equal(
        await back.evaluate((node) => getComputedStyle(node).outlineStyle),
        'solid',
      );
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
      if (
        (theme === 'light' && textSize === 100 && device !== 'narrow') ||
        (device === 'narrow' && textSize === 200)
      )
        await page.screenshot({
          path: `docs/screenshots/accounts/code-login-${device}${device === 'narrow' ? `-${theme}-200` : ''}.png`,
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
      'Prepared code login: disabled gate, CSP, no preview writes, request, refusal, retry, keyboard redemption and redirect pass at 320/390/1280px, both themes and 100/200% text; fixture responses only.',
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
