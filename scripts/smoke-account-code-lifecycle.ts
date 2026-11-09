/* eslint-disable @typescript-eslint/require-await -- In-memory fixture ports implement asynchronous production contracts. */
// Isolated browser + real account composition; fixture repositories, no live services.
import assert from 'node:assert/strict';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import { chromium, expect } from 'playwright/test';

import { prepareAccountHandlers } from '../apps/api/src/modules/accounts/adapters/account-runtime';
import { FileLoginCodeDelivery } from '../apps/api/src/modules/accounts/adapters/file-login-code-delivery';
import {
  loginPage,
  loginPagePolicy,
} from '../apps/api/src/modules/accounts/adapters/login-page';
import type { LoginCodeChallenge } from '../apps/api/src/modules/accounts/domain/login-code';
import type { ReaderSession } from '../apps/api/src/modules/accounts/domain/session';

async function main() {
  const directory = await mkdtemp(join(tmpdir(), 'account-browser-lifecycle-'));
  const browser = await chromium.launch();
  try {
    for (const width of [1280, 390]) {
      let now = new Date('2026-11-09T01:00:00Z');
      let challenge: LoginCodeChallenge | null = null;
      let session: ReaderSession | null = null;
      let attempts = 0;
      const email = 'fixture@example.com';
      const origin = 'https://account.fixture';
      const handlers = prepareAccountHandlers(
        {
          ACCOUNTS_ENABLED: '1',
          ACCOUNT_ORIGIN: origin,
          ACCOUNT_SECRET_KEY: 'ab'.repeat(32),
          ACCOUNT_MAILBOX_PATH: directory,
          SIGNUP_MODE: 'off',
        },
        () => ({
          existingIdentity: async () => true,
          identities: { findOrCreateVerified: async () => 'fixture-user' },
          recipients: { run: async (_email, work) => work() },
          cache: { eval: async () => 1 },
          codes: {
            replace: async (value) => {
              challenge = value;
              attempts = 0;
            },
            consume: async (recipient, time, matches) => {
              if (
                !challenge ||
                recipient !== challenge.email ||
                time < challenge.createdAt ||
                time >= challenge.expiresAt ||
                attempts >= 5
              )
                return false;
              attempts++;
              if (!matches(challenge.codeHash)) return false;
              challenge = null;
              return true;
            },
          },
          sessions: {
            create: async (input) => {
              session = {
                ...input,
                id: 'fixture-session',
                email,
                createdAt: input.now,
                cookieRenewedAt: input.now,
              };
              return session;
            },
            findByTokenHash: async (hash) =>
              session?.tokenHash === hash ? session : null,
            claimCookieRenewal: async () => false,
            deleteByTokenHash: async () => {
              session = null;
            },
            deleteByUserId: async () => {
              session = null;
            },
          },
          links: {
            issueWithAudit: async () => {
              throw new Error('Unexpected link issuance');
            },
            findRecipient: async () => null,
            consume: async () => null,
          },
          revocation: { revokeWithAudit: async () => null },
          deletion: { deleteForSession: async () => false },
          sync: { merge: async (_id, changes) => changes },
        }),
      );
      assert.ok(handlers);
      const context = await browser.newContext({
        viewport: { width, height: 900 },
      });
      const page = await context.newPage();
      const errors: string[] = [];
      page.on('pageerror', (error) => errors.push(error.message));
      await context.route('**/*', async (route) => {
        const request = route.request();
        const url = new URL(request.url());
        assert.equal(url.origin, origin);
        if (url.pathname === '/account/login')
          return route.fulfill({
            contentType: 'text/html',
            headers: { 'content-security-policy': loginPagePolicy },
            body: loginPage,
          });
        if (url.pathname === '/')
          return route.fulfill({
            contentType: 'text/html',
            body: '<h1>Fixture reader</h1>',
          });
        const input = {
          origin: request.headers().origin,
          contentType: request.headers()['content-type'],
          body: request.postDataJSON(),
          cookie: undefined,
        };
        assert.equal(request.method(), 'POST');
        const result = url.pathname.endsWith('/code')
          ? await handlers.requestCode(input, 'fixture-client', now)
          : await handlers.redeemCode(input, 'fixture-client', now);
        await route.fulfill({
          status: result.status,
          headers:
            'cookie' in result && result.cookie
              ? { 'set-cookie': result.cookie }
              : {},
          body: '',
        });
      });
      const mailbox = new FileLoginCodeDelivery(directory);
      const requestCode = async () => {
        await page.goto(`${origin}/account/login`);
        await page.getByLabel('Email', { exact: true }).fill(email);
        await page.getByRole('button', { name: 'Request code' }).click();
        await expect(page.getByRole('status')).toContainText('If this address');
        const code = await mailbox.latest(email, now);
        assert.ok(code);
        return code;
      };
      const redeem = async (code: string) => {
        await page.getByLabel('Six-digit code').fill(code);
        await page
          .getByRole('button', { name: 'Sign in', exact: true })
          .click();
      };
      const expired = await requestCode();
      now = new Date(now.getTime() + 600_000);
      await redeem(expired);
      await expect(page.getByRole('status')).toContainText('Check the code');
      assert.equal(session, null);
      assert.equal((await context.cookies()).length, 0);
      const valid = await requestCode();
      await redeem(valid);
      await page.waitForURL(`${origin}/`);
      const cookies = await context.cookies();
      assert.equal(cookies.length, 1);
      assert.equal(cookies[0].name, '__Host-reader_session');
      assert.equal(cookies[0].httpOnly, true);
      assert.equal(cookies[0].secure, true);
      assert.equal(cookies[0].sameSite, 'Lax');
      assert.equal(
        (await handlers.current(`${cookies[0].name}=${cookies[0].value}`, now))
          .body.signedIn,
        true,
      );
      await context.clearCookies();
      await page.goto(`${origin}/account/login`);
      await page.getByLabel('Email', { exact: true }).fill(email);
      await redeem(valid);
      await expect(page.getByRole('status')).toContainText('Check the code');
      assert.equal((await context.cookies()).length, 0);
      await page.screenshot({
        path: `docs/screenshots/accounts/code-replay-${width}.png`,
        fullPage: true,
      });
      assert.deepEqual(errors, []);
      await context.close();
    }
    console.log(
      'Desktop/mobile composed login: exact expiry refused, fresh code sets secure authenticated cookie, consumed code replay refused. Fixture storage/admission only; no live writes.',
    );
  } finally {
    await browser.close();
    await rm(directory, { recursive: true, force: true });
  }
}
void main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
