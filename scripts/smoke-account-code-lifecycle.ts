/* eslint-disable @typescript-eslint/require-await -- In-memory fixture ports implement asynchronous production contracts. */
// Isolated browser + real account composition; fixture repositories, no live services.
import assert from 'node:assert/strict';
import { execFile } from 'node:child_process';
import { mkdtemp, readFile, rm } from 'node:fs/promises';
import type { Server } from 'node:http';
import { createServer } from 'node:https';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { promisify } from 'node:util';

import { chromium, expect } from 'playwright/test';

import { accountHttp } from '../apps/api/src/modules/accounts/adapters/account-http';
import { prepareAccountHandlers } from '../apps/api/src/modules/accounts/adapters/account-runtime';
import { FileLoginCodeDelivery } from '../apps/api/src/modules/accounts/adapters/file-login-code-delivery';
import type { LoginCodeChallenge } from '../apps/api/src/modules/accounts/domain/login-code';
import type { ReaderSession } from '../apps/api/src/modules/accounts/domain/session';

async function main() {
  const directory = await mkdtemp(join(tmpdir(), 'account-browser-lifecycle-'));
  const browser = await chromium.launch();
  const servers: Server[] = [];
  try {
    const keyPath = join(directory, 'fixture-key.pem');
    const certPath = join(directory, 'fixture-cert.pem');
    await promisify(execFile)('openssl', [
      'req',
      '-x509',
      '-newkey',
      'rsa:2048',
      '-nodes',
      '-days',
      '1',
      '-subj',
      '/CN=localhost',
      '-keyout',
      keyPath,
      '-out',
      certPath,
    ]);
    const tls = {
      key: await readFile(keyPath),
      cert: await readFile(certPath),
    };
    for (const width of [1280, 390]) {
      let now = new Date('2026-11-09T01:00:00Z');
      let challenge: LoginCodeChallenge | null = null;
      let session: ReaderSession | null = null;
      let attempts = 0;
      const email = 'fixture@example.com';
      const server = createServer(tls, (request, response) =>
        transport(request, response, () => {
          response.setHeader('Content-Type', 'text/html');
          response.end('<h1>Fixture reader</h1>');
        }),
      );
      servers.push(server);
      await new Promise<void>((resolve) =>
        server.listen(0, '127.0.0.1', resolve),
      );
      const address = server.address();
      assert.ok(address && typeof address !== 'string');
      const origin = `https://127.0.0.1:${address.port}`;
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
        ignoreHTTPSErrors: true,
      });
      const page = await context.newPage();
      const errors: string[] = [];
      page.on('pageerror', (error) => errors.push(error.message));
      const requestWithClock = handlers.requestCode.bind(handlers);
      const redeemWithClock = handlers.redeemCode.bind(handlers);
      const currentWithClock = handlers.current.bind(handlers);
      handlers.requestCode = (input, client) =>
        requestWithClock(input, client, now);
      handlers.redeemCode = (input, client) =>
        redeemWithClock(input, client, now);
      handlers.current = (cookie) => currentWithClock(cookie, now);
      const transport = accountHttp({
        enabled: true,
        handlers,
        client: () => 'fixture-client',
      });
      // No browser interception: CSP, Origin, JSON and cookies cross real HTTPS.
      page.on('request', (request) => {
        assert.equal(new URL(request.url()).origin, origin);
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
      const refused = await context.request.post(`${origin}/api/account/code`, {
        headers: { Origin: 'https://other.fixture' },
        data: { email },
      });
      assert.equal(refused.status(), 400);
      assert.equal(challenge, null);
      const expired = await requestCode();
      now = new Date(now.getTime() + 600_000);
      await redeem(expired);
      await expect(page.getByRole('status')).toContainText('Check the code');
      assert.equal(session, null);
      assert.equal((await context.cookies()).length, 0);
      const exhausted = await requestCode();
      const wrong = exhausted === '000000' ? '000001' : '000000';
      for (let guess = 0; guess < 5; guess++) {
        await redeem(wrong);
        await expect(page.getByRole('status')).toContainText('Check the code');
        await expect(page.getByLabel('Six-digit code')).toHaveValue('');
        assert.equal(attempts, guess + 1);
        assert.equal(session, null);
        assert.equal((await context.cookies()).length, 0);
      }
      await redeem(exhausted);
      await expect(page.getByRole('status')).toContainText('Check the code');
      assert.equal(attempts, 5);
      assert.equal(session, null);
      assert.equal((await context.cookies()).length, 0);
      await page.screenshot({
        path: `docs/screenshots/accounts/code-exhausted-${width}.png`,
        fullPage: true,
      });
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
      const current = await context.request.get(
        `${origin}/api/account/session`,
      );
      assert.equal(current.status(), 200);
      assert.equal((await current.json()).signedIn, true);
      assert.equal(current.headers()['cache-control'], 'no-store');
      const logout = await context.request.post(
        `${origin}/api/account/logout`,
        {
          headers: { Origin: origin },
          data: {},
        },
      );
      assert.equal(logout.status(), 204);
      assert.equal(session, null);
      assert.equal((await context.cookies()).length, 0);
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
      const anonymous = await context.request.get(
        `${origin}/api/account/session`,
      );
      assert.equal((await anonymous.json()).signedIn, false);
      await context.close();
      await new Promise<void>((resolve, reject) =>
        server.close((error) => (error ? reject(error) : resolve())),
      );
    }
    console.log(
      'Desktop/mobile real HTTPS composed login: exact expiry and five-guess exhaustion refused, replacement code restores secure authentication, HTTP session lookup/logout and consumed code replay verified. Fixture storage/admission only; no live writes.',
    );
  } finally {
    await browser.close();
    for (const server of servers) {
      server.closeAllConnections();
      if (server.listening)
        await new Promise<void>((resolve) => server.close(() => resolve()));
    }
    await rm(directory, { recursive: true, force: true });
  }
}
void main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
