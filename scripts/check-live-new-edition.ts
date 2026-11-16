// Explicit acceptance: local file-mailbox login, public HTTPS browser, no edition writes.
import assert from 'node:assert/strict';
import { Resolver } from 'node:dns/promises';
import { readFileSync } from 'node:fs';
import { mkdir } from 'node:fs/promises';
import { homedir } from 'node:os';
import { parseEnv } from 'node:util';

import { chromium, expect } from 'playwright/test';

import { FileLoginCodeDelivery } from '../apps/api/src/modules/accounts/adapters/file-login-code-delivery';

async function main() {
  assert.equal(process.argv[2], '--live');
  const env = parseEnv(
    readFileSync(`${homedir()}/.config/news-digest/env`, 'utf8'),
  );
  assert.equal(env.PUBLIC_MODE, '1');
  assert.equal(env.ACCOUNTS_ENABLED, '1');
  const email = env.ADMIN_EMAILS?.split(',')[0]?.trim().toLowerCase();
  assert.ok(email && env.ACCOUNT_MAILBOX_PATH);
  const origin = 'https://news-digest.exe.xyz';
  const resolver = new Resolver();
  resolver.setServers(['1.1.1.1']);
  const [address] = await resolver.resolve4('news-digest.exe.xyz');
  const browser = await chromium.launch({
    args: [`--host-resolver-rules=MAP news-digest.exe.xyz ${address}`],
  });
  const context = await browser.newContext();
  let cookie = '';
  const probe = await context.newPage();
  await probe.goto(origin);
  const probeRequest = (path: string, method = 'GET') =>
    probe.evaluate(
      async ({ path, method }) => {
        const response = await fetch(path, { method });
        return {
          status: response.status,
          body: method === 'HEAD' ? null : await response.text(),
        };
      },
      { path, method },
    );
  async function account(path: string, body: unknown, status: number) {
    const response = await fetch(`http://127.0.0.1:8000/api/account/${path}`, {
      method: 'POST',
      headers: {
        Origin: origin,
        'X-Forwarded-For': '192.0.2.194',
        'Content-Type': 'application/json',
        ...(cookie ? { Cookie: cookie } : {}),
      },
      body: JSON.stringify(body),
    });
    assert.equal(response.status, status, `Account ${path}`);
    return response;
  }
  try {
    for (const method of ['GET', 'HEAD']) {
      const response = await probeRequest('/admin/editions/new', method);
      assert.equal(response.status, 404);
    }
    await account('code', { email }, 202);
    const code = await new FileLoginCodeDelivery(
      env.ACCOUNT_MAILBOX_PATH,
    ).latest(email, new Date());
    assert.ok(code, 'Local mailbox code available');
    const response = await account('redeem', { email, code }, 204);
    cookie = response.headers.get('set-cookie')?.split(';')[0] ?? '';
    assert.ok(cookie.startsWith('__Host-reader_session='));
    await context.addCookies([
      {
        name: '__Host-reader_session',
        value: cookie.slice(cookie.indexOf('=') + 1),
        url: origin,
        secure: true,
        httpOnly: true,
        sameSite: 'Lax',
      },
    ]);
    const session = await probeRequest('/api/account/session');
    assert.deepEqual(JSON.parse(session.body!), {
      signedIn: true,
      isAdmin: true,
    });
    assert.equal(
      (await probeRequest('/admin/editions/new', 'HEAD')).status,
      200,
    );
    await mkdir('docs/screenshots/new-edition', { recursive: true });
    for (const width of [1440, 390]) {
      const page = await context.newPage();
      await page.setViewportSize({ width, height: 900 });
      const errors: string[] = [];
      page.on('pageerror', () => errors.push('Page error'));
      page.on('console', (message) => {
        if (message.type() === 'error') errors.push('Console error');
      });
      page.on('response', (reply) => {
        if (reply.status() >= 400) errors.push(`HTTP ${reply.status()}`);
      });
      await page.route('**/api/**', async (route) => {
        assert.equal(
          route.request().method(),
          'GET',
          'Form acceptance must remain read-only',
        );
        await route.continue();
      });
      for (const reload of [false, true]) {
        const navigation = reload
          ? await page.reload()
          : await page.goto(`${origin}/admin/editions/new`);
        assert.equal(navigation?.status(), 200);
        await expect(
          page.getByRole('region', { name: 'Create an edition' }),
        ).toBeVisible();
        await expect(page.getByLabel('Period', { exact: true })).toBeVisible();
        assert.equal(
          await page.evaluate(
            () => document.documentElement.scrollWidth > innerWidth,
          ),
          false,
        );
      }
      await page.screenshot({
        path: `docs/screenshots/new-edition/direct-admin-${width}.png`,
        fullPage: true,
      });
      assert.deepEqual(errors, []);
      await page.close();
    }
    console.log(
      'Public HTTPS: signed-out GET/HEAD 404; fresh admin GET/HEAD 200, typed URL and reload show form at desktop/mobile; no edition writes or browser errors.',
    );
  } finally {
    if (cookie) await account('logout', {}, 204);
    await browser.close();
  }
}
void main();
