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
import type { SignInLink } from '../apps/api/src/modules/accounts/domain/sign-in-link';

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
      const sessions = new Map<string, ReaderSession>();
      let sessionSequence = 0;
      const links = new Map<string, SignInLink>();
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
          ADMIN_EMAILS: email,
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
              const session = {
                ...input,
                id: `fixture-session-${++sessionSequence}`,
                email,
                createdAt: input.now,
                cookieRenewedAt: input.now,
              };
              sessions.set(input.tokenHash, session);
              return session;
            },
            findByTokenHash: async (hash) => sessions.get(hash) ?? null,
            claimCookieRenewal: async (id, cutoff, time) => {
              const session = [...sessions.values()].find(
                (row) => row.id === id,
              );
              if (!session || session.cookieRenewedAt > cutoff) return false;
              sessions.set(session.tokenHash, {
                ...session,
                cookieRenewedAt: time,
              });
              return true;
            },
            deleteByTokenHash: async (hash) => {
              sessions.delete(hash);
            },
            deleteByUserId: async (userId) => {
              for (const [hash, session] of sessions) {
                if (session.userId === userId) sessions.delete(hash);
              }
            },
          },
          links: {
            issueWithAudit: async (link, issuer) => {
              assert.equal(issuer, 'fixture-user');
              links.set(link.tokenHash, link);
            },
            findRecipient: async (hash, time) => {
              const link = links.get(hash);
              return link && time >= link.createdAt && time < link.expiresAt
                ? link.email
                : null;
            },
            consume: async (hash, time) => {
              const link = links.get(hash);
              if (!link || time < link.createdAt || time >= link.expiresAt)
                return null;
              links.delete(hash);
              return link.email;
            },
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
      const signOutWithClock = handlers.signOut.bind(handlers);
      const issueLinkWithClock = handlers.issueLink.bind(handlers);
      const redeemLinkWithClock = handlers.redeemLink.bind(handlers);
      handlers.issueLink = (input) => issueLinkWithClock(input, now);
      handlers.redeemLink = (input) => redeemLinkWithClock(input, now);
      handlers.requestCode = (input, client) =>
        requestWithClock(input, client, now);
      handlers.redeemCode = (input, client) =>
        redeemWithClock(input, client, now);
      handlers.current = (cookie) => currentWithClock(cookie, now);
      handlers.signOut = (input, all) => signOutWithClock(input, all, now);
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
      assert.equal(sessions.size, 0);
      assert.equal((await context.cookies()).length, 0);
      const exhausted = await requestCode();
      const wrong = exhausted === '000000' ? '000001' : '000000';
      for (let guess = 0; guess < 5; guess++) {
        await redeem(wrong);
        await expect(page.getByRole('status')).toContainText('Check the code');
        await expect(page.getByLabel('Six-digit code')).toHaveValue('');
        assert.equal(attempts, guess + 1);
        assert.equal(sessions.size, 0);
        assert.equal((await context.cookies()).length, 0);
      }
      await redeem(exhausted);
      await expect(page.getByRole('status')).toContainText('Check the code');
      assert.equal(attempts, 5);
      assert.equal(sessions.size, 0);
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
      assert.equal((await current.json()).isAdmin, true);
      assert.equal(current.headers()['set-cookie'], undefined);
      const issuedAt = now.getTime();
      now = new Date(issuedAt + 86_400_000 - 1);
      const beforeRenewal = await context.request.get(
        `${origin}/api/account/session`,
      );
      assert.equal(beforeRenewal.headers()['set-cookie'], undefined);
      now = new Date(issuedAt + 86_400_000);
      const renewal = await context.request.get(
        `${origin}/api/account/session`,
      );
      assert.equal((await renewal.json()).isAdmin, true);
      assert.match(renewal.headers()['set-cookie'], /Max-Age=34560000/);
      assert.equal((await context.cookies())[0].value, cookies[0].value);
      const repeated = await context.request.get(
        `${origin}/api/account/session`,
      );
      assert.equal(repeated.headers()['set-cookie'], undefined);
      now = new Date(issuedAt + 7 * 86_400_000 - 1);
      const fresh = await context.request.get(`${origin}/api/account/session`);
      assert.deepEqual(await fresh.json(), { signedIn: true, isAdmin: true });
      now = new Date(issuedAt + 7 * 86_400_000);
      const stale = await context.request.get(`${origin}/api/account/session`);
      assert.deepEqual(await stale.json(), { signedIn: true, isAdmin: false });
      // Server sessions survive the browser cookie lifetime; visits renew it.
      now = new Date(issuedAt + 401 * 86_400_000);
      const persistent = await context.request.get(
        `${origin}/api/account/session`,
      );
      assert.deepEqual(await persistent.json(), {
        signedIn: true,
        isAdmin: false,
      });
      assert.match(persistent.headers()['set-cookie'], /Max-Age=34560000/);
      // A second device signs in independently through the same HTTPS boundary.
      const other = await browser.newContext({ ignoreHTTPSErrors: true });
      const loginOther = async () => {
        const requested = await other.request.post(
          `${origin}/api/account/code`,
          {
            headers: { Origin: origin },
            data: { email },
          },
        );
        assert.equal(requested.status(), 202);
        const code = await mailbox.latest(email, now);
        assert.ok(code);
        const redeemed = await other.request.post(
          `${origin}/api/account/redeem`,
          {
            headers: { Origin: origin },
            data: { email, code },
          },
        );
        assert.equal(redeemed.status(), 204);
      };
      await loginOther();
      assert.equal(sessions.size, 2);
      assert.notEqual(
        (await other.cookies())[0].value,
        (await context.cookies())[0].value,
      );
      const logout = await context.request.post(
        `${origin}/api/account/logout`,
        {
          headers: { Origin: origin },
          data: {},
        },
      );
      assert.equal(logout.status(), 204);
      assert.equal(sessions.size, 1);
      assert.equal((await context.cookies()).length, 0);
      assert.equal(
        (
          await (
            await other.request.get(`${origin}/api/account/session`)
          ).json()
        ).signedIn,
        true,
      );
      const replayCookie = `${cookies[0].name}=${cookies[0].value}`;
      assert.equal(
        (
          await (
            await context.request.get(`${origin}/api/account/session`, {
              headers: { Cookie: replayCookie },
            })
          ).json()
        ).signedIn,
        false,
      );
      // Sign in again, then revoke both independently issued device sessions.
      const replacement = await requestCode();
      await redeem(replacement);
      await page.waitForURL(`${origin}/`);
      assert.equal(sessions.size, 2);
      const otherCookie = (await other.cookies())[0];
      const replacementCookie = (await context.cookies())[0];
      const logoutAll = await context.request.post(
        `${origin}/api/account/logout-all`,
        {
          headers: { Origin: origin },
          data: {},
        },
      );
      assert.equal(logoutAll.status(), 204);
      assert.equal(sessions.size, 0);
      assert.equal((await context.cookies()).length, 0);
      const replacementReplay = await context.request.get(
        `${origin}/api/account/session`,
        {
          headers: {
            Cookie: `${replacementCookie.name}=${replacementCookie.value}`,
          },
        },
      );
      assert.equal((await replacementReplay.json()).signedIn, false);
      const revoked = await other.request.get(`${origin}/api/account/session`);
      assert.equal((await revoked.json()).signedIn, false);
      // The other browser retains an inert cookie; the server refuses it.
      assert.equal((await other.cookies())[0].value, otherCookie.value);
      assert.equal(revoked.headers()['set-cookie'], undefined);
      assert.equal(
        (
          await (
            await other.request.get(`${origin}/api/account/session`, {
              headers: { Cookie: `${otherCookie.name}=${otherCookie.value}` },
            })
          ).json()
        ).signedIn,
        false,
      );
      await other.close();
      // A fresh admin issues real composed links; browser previews never redeem.
      const adminCode = await requestCode();
      await redeem(adminCode);
      await page.waitForURL(`${origin}/`);
      const issueLink = async () => {
        const response = await context.request.post(
          `${origin}/api/account/links`,
          {
            headers: { Origin: origin },
            data: { email },
          },
        );
        assert.equal(response.status(), 201);
        return (await response.json()) as { token: string; url: string };
      };
      const expiredLink = await issueLink();
      now = new Date(now.getTime() + 86_400_000);
      const linkContext = await browser.newContext({
        viewport: { width, height: 900 },
        ignoreHTTPSErrors: true,
      });
      const linkPage = await linkContext.newPage();
      linkPage.on('pageerror', (error) => errors.push(error.message));
      const linkRequests: string[] = [];
      linkPage.on('request', (request) => linkRequests.push(request.url()));
      await linkPage.goto(expiredLink.url);
      await linkPage
        .getByRole('button', { name: 'Sign in', exact: true })
        .click();
      await expect(linkPage.getByRole('status')).toContainText(
        'Ask for a new link',
      );
      assert.equal((await linkContext.cookies()).length, 0);
      assert.equal(sessions.size, 1);
      const link = await issueLink();
      await linkPage.goto(`${origin}/`);
      await linkPage.goto(link.url);
      const confirm = linkPage.getByRole('button', {
        name: 'Sign in',
        exact: true,
      });
      await expect(confirm).toBeEnabled();
      assert.equal(linkPage.url(), `${origin}/account/sign-in`);
      assert.equal(sessions.size, 1);
      assert.equal((await linkContext.cookies()).length, 0);
      assert.equal(await linkPage.evaluate(() => localStorage.length), 0);
      assert.equal(
        linkRequests.some((url) => url.includes(link.token)),
        false,
      );
      const rejectedLink = await linkContext.request.post(
        `${origin}/api/account/link-redeem`,
        {
          headers: { Origin: 'https://other.fixture' },
          data: { token: link.token },
        },
      );
      assert.equal(rejectedLink.status(), 400);
      assert.equal(sessions.size, 1);
      await confirm.click();
      await linkPage.waitForURL(`${origin}/`);
      assert.equal(sessions.size, 2);
      const linkCookie = (await linkContext.cookies())[0];
      assert.equal(linkCookie.httpOnly, true);
      assert.equal(linkCookie.secure, true);
      assert.equal(linkCookie.sameSite, 'Lax');
      assert.equal(
        (
          await (
            await linkContext.request.get(`${origin}/api/account/session`)
          ).json()
        ).signedIn,
        true,
      );
      await linkContext.request.post(`${origin}/api/account/logout`, {
        headers: { Origin: origin },
        data: {},
      });
      assert.equal((await linkContext.cookies()).length, 0);
      await linkPage.goto(`${origin}/`);
      await linkPage.goto(link.url);
      await confirm.click();
      await expect(linkPage.getByRole('status')).toContainText(
        'Ask for a new link',
      );
      assert.equal(sessions.size, 1);
      assert.equal((await linkContext.cookies()).length, 0);
      await linkPage.screenshot({
        path: `docs/screenshots/accounts/link-composed-replay-${width}.png`,
        fullPage: true,
      });
      await linkPage.reload();
      await expect(linkPage.getByRole('status')).toContainText(
        'missing or invalid',
      );
      await expect(confirm).toBeDisabled();
      await linkContext.close();
      await context.request.post(`${origin}/api/account/logout`, {
        headers: { Origin: origin },
        data: {},
      });
      assert.equal(sessions.size, 0);
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
      'Desktop/mobile real HTTPS composed login: exact expiry and five-guess exhaustion refused, replacement code restores secure authentication, daily cookie renewal, seven-day admin freshness, persistent reader session, device-scoped logout, all-device revocation and revoked-cookie/consumed-code replay, admin-issued link preview, exact link expiry, cross-origin refusal, secure exchange and replay/reload refusal verified. Fixture storage/admission only; no live writes.',
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
