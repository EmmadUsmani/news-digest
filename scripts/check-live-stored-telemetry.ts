// Explicit live read rehearsal. All account writes use disposable containers.
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { randomBytes } from 'node:crypto';
import { mkdtemp, readFile, rm } from 'node:fs/promises';
import { createServer } from 'node:http';
import { createServer as createHttpsServer } from 'node:https';
import type { AddressInfo } from 'node:net';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import { type Browser, chromium } from 'playwright';
import {
  GenericContainer,
  type StartedTestContainer,
  Wait,
} from 'testcontainers';

import {
  proxyInternalTools,
  selectInternalTools,
} from '../apps/api/src/internal-tools';
import { database } from '../apps/api/src/libs/db/connections';
import { prepareStoredAccountHttp } from '../apps/api/src/modules/accounts/adapters/account-storage';
import { FileLoginCodeDelivery } from '../apps/api/src/modules/accounts/adapters/file-login-code-delivery';
import { PostgresReaderIdentityRepository } from '../apps/api/src/modules/accounts/database/identity.repository';
import { publicAccess } from '../apps/api/src/public-access';
import { publicAccountAuthenticator } from '../apps/api/src/public-account-access';
import {
  prepareAuthenticatedTelemetryExport,
  readBoundedTelemetryExport,
  telemetryExportPath,
} from '../apps/api/src/telemetry-export';
import { testEnvironment } from './test-suites';

async function main() {
  assert.deepEqual(process.argv.slice(2), ['--live'], 'Requires --live');
  const containers: StartedTestContainer[] = [];
  const directory = await mkdtemp(join(tmpdir(), 'live-stored-telemetry-'));
  assert.equal(
    spawnSync(
      'openssl',
      [
        'req',
        '-x509',
        '-newkey',
        'rsa:2048',
        '-nodes',
        '-keyout',
        join(directory, 'key.pem'),
        '-out',
        join(directory, 'cert.pem'),
        '-days',
        '1',
        '-subj',
        '/CN=localhost',
      ],
      { stdio: 'pipe' },
    ).status,
    0,
  );
  let accounts: ReturnType<typeof prepareStoredAccountHttp> | undefined;
  let db: ReturnType<typeof database> | undefined;
  let identities: PostgresReaderIdentityRepository | undefined;
  let browser: Browser | undefined;
  let forwarded = 0;
  let upstreamFailure = false;
  // Recording relay permits only the handler's exact bounded live export.
  const relay = createServer((req, res) => {
    void (async () => {
      assert.equal(req.method, 'GET');
      assert.deepEqual(
        Object.keys(req.headers).sort(),
        [
          'accept',
          'accept-encoding',
          'accept-language',
          'connection',
          'host',
          'sec-fetch-mode',
          'user-agent',
        ].sort(),
      );
      const url = new URL(req.url!, 'http://127.0.0.1:8428');
      assert.equal(url.pathname, telemetryExportPath);
      assert.equal(url.searchParams.get('match[]'), 'up');
      assert.equal(url.searchParams.get('timeout'), '2s');
      assert.equal(url.searchParams.get('max_rows_per_line'), '1');
      assert.equal(url.searchParams.get('reduce_mem_usage'), '1');
      assert.ok(
        Number(url.searchParams.get('end')) -
          Number(url.searchParams.get('start')) <=
          60,
      );
      forwarded++;
      const body = await readBoundedTelemetryExport(
        url,
        AbortSignal.timeout(5000),
      );
      res
        .writeHead(200, {
          'content-type': 'application/stream+json',
        })
        .end(body);
    })().catch((error: unknown) => {
      if (error instanceof Error)
        console.error(
          error.stack
            ?.split('\n')
            .filter((line) => line.includes('check-live-stored-telemetry.ts'))
            .join('\n'),
        );
      upstreamFailure = true;
      res.writeHead(502).end();
    });
  });
  const server = createServer((req, res) => {
    if (req.url === '/browser-rehearsal') {
      res
        .writeHead(200, {
          'content-type': 'text/html',
          'cache-control': 'no-store',
        })
        .end('<!doctype html><title>Disposable session rehearsal</title>');
      return;
    }
    accounts!.middleware!(req, res, () => {
      void exportHandler!(req, res, () => {
        void nativeGuard!(req, res, () =>
          nativeProxy(req, res, () => res.writeHead(404).end()),
        );
      });
    });
  });
  const browserServer = createHttpsServer(
    {
      key: await readFile(join(directory, 'key.pem')),
      cert: await readFile(join(directory, 'cert.pem')),
    },
    (req, res) => {
      // Disposable TLS ingress supplies the configured trusted proxy's visitor entry.
      req.headers['x-forwarded-for'] = '203.0.113.92';
      req.rawHeaders.push('X-Forwarded-For', '203.0.113.92');
      server.emit('request', req, res);
    },
  );
  const nativeProxy = proxyInternalTools(
    selectInternalTools(true).filter(({ adminTelemetry }) => adminTelemetry),
  );
  let nativeGuard: ReturnType<typeof publicAccess> | undefined;
  let exportHandler:
    ReturnType<typeof prepareAuthenticatedTelemetryExport> | undefined;
  try {
    const postgres = await new GenericContainer('postgres:17-alpine')
      .withEnvironment({ POSTGRES_HOST_AUTH_METHOD: 'trust' })
      .withTmpFs({ '/var/lib/postgresql/data': 'rw' })
      .withExposedPorts(5432)
      .withWaitStrategy(
        Wait.forLogMessage('database system is ready to accept connections', 2),
      )
      .start();
    containers.push(postgres);
    const redis = await new GenericContainer('redis:7-alpine')
      .withTmpFs({ '/data': 'rw' })
      .withExposedPorts(6379)
      .withWaitStrategy(Wait.forLogMessage('Ready to accept connections'))
      .start();
    containers.push(redis);
    const isolated = {
      ...testEnvironment(),
      DATABASE_URL: `postgres://postgres@${postgres.getHost()}:${postgres.getMappedPort(5432)}/postgres`,
      REDIS_URL: `redis://${redis.getHost()}:${redis.getMappedPort(6379)}`,
      NEWS_DIGEST_ISOLATED_TEST: '1',
    };
    Object.assign(process.env, isolated);
    const migration = spawnSync(
      'pnpm',
      ['exec', 'tsx', 'apps/api/src/libs/db/migrate.ts'],
      { env: isolated, stdio: 'pipe' },
    );
    assert.equal(
      migration.status,
      0,
      'Disposable migration failed; output withheld',
    );
    await new Promise<void>((done) => server.listen(0, '127.0.0.1', done));
    const base = `http://127.0.0.1:${(server.address() as AddressInfo).port}`;
    await new Promise<void>((done) =>
      browserServer.listen(0, '127.0.0.1', done),
    );
    const browserBase = `https://localhost:${(browserServer.address() as AddressInfo).port}`;
    const configuration = {
      ACCOUNTS_ENABLED: '1',
      ACCOUNT_ORIGIN: browserBase,
      ACCOUNT_SECRET_KEY: randomBytes(32).toString('hex'),
      ACCOUNT_MAILBOX_PATH: directory,
      ACCOUNT_TRUSTED_PROXY_PEERS: '127.0.0.1',
      SIGNUP_MODE: 'invite',
      ADMIN_EMAILS: 'owner@example.test,browser@example.test',
    };
    accounts = prepareStoredAccountHttp(configuration);
    assert.ok(accounts.handlers && accounts.middleware);
    db = database();
    identities = new PostgresReaderIdentityRepository();
    await identities.findOrCreateVerified('reader@example.test', new Date());
    await new Promise<void>((done) => relay.listen(0, '127.0.0.1', done));
    const authenticate = publicAccountAuthenticator(accounts.handlers);
    nativeGuard = publicAccess(true, (req) => authenticate(req, new Date()));
    exportHandler = prepareAuthenticatedTelemetryExport(
      (req) => authenticate(req, new Date()),
      new URL(`http://127.0.0.1:${(relay.address() as AddressInfo).port}`),
    );
    const write = (path: string, body: unknown, cookie = '') =>
      fetch(base + path, {
        method: 'POST',
        headers: {
          Origin: configuration.ACCOUNT_ORIGIN,
          'Content-Type': 'application/json',
          Cookie: cookie,
          'X-Forwarded-For': '203.0.113.91',
        },
        body: JSON.stringify(body),
        signal: AbortSignal.timeout(10000),
      });
    const login = async (email: string) => {
      assert.equal((await write('/api/account/code', { email })).status, 202);
      const code = await new FileLoginCodeDelivery(directory).latest(
        email,
        new Date(),
      );
      assert.ok(code);
      const response = await write('/api/account/redeem', { email, code });
      assert.equal(response.status, 204);
      const cookie = response.headers.get('set-cookie')!;
      for (const flag of ['Secure', 'HttpOnly', 'SameSite=Lax'])
        assert.ok(cookie.includes(flag));
      return cookie.split(';')[0];
    };
    const admin = await login('owner@example.test');
    const reader = await login('reader@example.test');
    const check = async (
      cookie: string,
      allowed: boolean,
      suffix = '',
      method = 'GET',
    ) => {
      const end = Math.floor(Date.now() / 1000);
      const path = `${telemetryExportPath}?match[]=up&start=${end - 60}&end=${end}${suffix}`;
      const before = forwarded;
      const response = await fetch(base + path, {
        method,
        headers: {
          Cookie: cookie,
          Authorization: 'Bearer synthetic-must-not-forward',
          'X-Exedev-Email': configuration.ADMIN_EMAILS,
        },
        signal: AbortSignal.timeout(10000),
      });
      assert.equal(response.status, allowed ? 200 : 404);
      assert.equal(response.headers.get('cache-control'), 'no-store');
      assert.equal(response.headers.get('set-cookie'), null);
      assert.equal(forwarded, before + (allowed ? 1 : 0));
      const body = await response.text();
      assert.ok(Buffer.byteLength(body) <= 65536);
      if (!allowed) {
        assert.equal(body, '');
        return;
      }
      const rows = body
        .trim()
        .split('\n')
        .map(
          (line) =>
            JSON.parse(line) as {
              metric: { __name__: string };
              values: number[];
              timestamps: number[];
            },
        );
      assert.ok(rows.length > 0 && rows.length <= 32);
      for (const row of rows) {
        assert.equal(row.metric.__name__, 'up');
        assert.equal(row.values.length, 1);
        assert.equal(row.timestamps.length, 1);
        assert.ok(
          row.timestamps[0] >= (end - 60) * 1000 &&
            row.timestamps[0] <= end * 1000,
        );
      }
    };
    await check('', false);
    await check(reader, false);
    await check(admin, true);
    const session = await db.query<{ id: string; created_at: Date }>(
      'SELECT id, created_at FROM sessions WHERE admin_eligible',
    );
    assert.equal(session.rowCount, 1);
    await db.query(
      "UPDATE sessions SET created_at = now() - interval '8 days' WHERE id = $1",
      [session.rows[0].id],
    );
    await check(admin, false);
    await db.query('UPDATE sessions SET created_at = $1 WHERE id = $2', [
      session.rows[0].created_at,
      session.rows[0].id,
    ]);
    await check(admin, true);
    await check(admin, false, '&timeout=10s');
    await check(admin, false, '', 'POST');
    // Let Chromium receive and store the real redeem response cookie itself.
    browser = await chromium.launch({ headless: true });
    const context = await browser.newContext({
      serviceWorkers: 'block',
      ignoreHTTPSErrors: true,
    });
    const page = await context.newPage();
    await page.goto(browserBase + '/browser-rehearsal');
    const browserWrite = (path: string, body: unknown) =>
      page.evaluate(
        async ({ path, body }) => {
          const response = await fetch(path, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body),
            signal: AbortSignal.timeout(10000),
          });
          return response.status;
        },
        { path, body },
      );
    const email = 'browser@example.test';
    assert.equal(await browserWrite('/api/account/code', { email }), 202);
    const code = await new FileLoginCodeDelivery(directory).latest(
      email,
      new Date(),
    );
    assert.ok(code);
    assert.equal(
      await browserWrite('/api/account/redeem', { email, code }),
      204,
    );
    const cookies = await context.cookies();
    assert.equal(cookies.length, 1);
    assert.equal(cookies[0].secure, true);
    assert.equal(cookies[0].httpOnly, true);
    assert.equal(cookies[0].sameSite, 'Lax');
    const browserSession = await db.query<{ id: string; created_at: Date }>(
      'SELECT id, created_at FROM sessions WHERE id <> $1 AND admin_eligible',
      [session.rows[0].id],
    );
    assert.equal(browserSession.rows.length, 1);
    assert.equal(await page.evaluate(() => document.cookie), '');
    const browserCheck = async (allowed: boolean) => {
      const end = Math.floor(Date.now() / 1000);
      const before = forwarded;
      const result = await page.evaluate(
        async (path) => {
          const response = await fetch(path, {
            signal: AbortSignal.timeout(10000),
          });
          const body = await response.text();
          return {
            status: response.status,
            cache: response.headers.get('cache-control'),
            cookie: response.headers.get('set-cookie'),
            bytes: new TextEncoder().encode(body).byteLength,
            rows: body.trim() ? body.trim().split('\n').length : 0,
          };
        },
        `${telemetryExportPath}?match[]=up&start=${end - 60}&end=${end}`,
      );
      assert.equal(result.status, allowed ? 200 : 404);
      assert.equal(result.cache, 'no-store');
      assert.equal(result.cookie, null);
      assert.ok(result.bytes <= 65536);
      assert.ok(
        allowed ? result.rows > 0 && result.rows <= 32 : result.bytes === 0,
      );
      assert.equal(forwarded, before + (allowed ? 1 : 0));
    };
    await browserCheck(true);
    const errors: string[] = [];
    page.on('pageerror', (error) => errors.push(error.name));
    await page.addInitScript(() => {
      Object.assign(window, { policyViolations: [] });
      document.addEventListener('securitypolicyviolation', (event) => {
        (
          window as unknown as { policyViolations: string[] }
        ).policyViolations.push(event.effectiveDirective);
      });
    });
    let nativeExports = 0;
    let renderedLabel = '';
    let expectedNativeStatus: 200 | 404 = 200;
    let allowNativeExport = true;
    await context.route('**/*', async (route) => {
      const url = new URL(route.request().url());
      assert.equal(url.origin, browserBase);
      if (url.pathname.includes('/api/v1/')) {
        if (url.pathname === telemetryExportPath && allowNativeExport) {
          allowNativeExport = false;
          nativeExports++;
          const response = await route.fetch();
          assert.equal(response.status(), expectedNativeStatus);
          assert.equal(response.headers()['cache-control'], 'no-store');
          if (expectedNativeStatus === 404) {
            assert.equal(await response.text(), '');
            await route.fulfill({ response });
            return;
          }
          const body = await response.text();
          assert.ok(Buffer.byteLength(body) <= 65536);
          const rows = body
            .trim()
            .split('\n')
            .map(
              (line) => JSON.parse(line) as { metric: Record<string, string> },
            );
          assert.ok(rows.length > 0 && rows.length <= 32);
          renderedLabel =
            Object.values(rows[0].metric).find((value) => value !== 'up') ??
            'up';
          await route.fulfill({ response, body });
          return;
        }
        await route.fulfill({
          status: 404,
          body: '',
          headers: { 'cache-control': 'no-store' },
        });
        return;
      }
      await route.continue();
    });
    // Exercise installed documents beyond Raw Query with the actual login cookie.
    const beforeScreens = forwarded;
    for (const [document, screen] of [
      ['/metrics/vmui/', '/dashboards'],
      ['/metrics/vmui/', '/query-analyzer'],
      ['/logs/select/vmui/', ''],
      ['/logs/select/vmui/', '/overview'],
    ]) {
      const target = browserBase + document + (screen ? '#' + screen : '');
      const mount = async () => {
        await page.goto('about:blank');
        const response = await page.goto(target, { waitUntil: 'networkidle' });
        assert.equal(response!.status(), 200);
        assert.equal(response!.headers()['cache-control'], 'no-store');
        assert.ok(await page.locator('button').count());
        if (screen)
          assert.equal(new URL(page.url()).hash.split('?')[0], '#' + screen);
        assert.deepEqual(
          await page.evaluate(
            () =>
              (window as unknown as { policyViolations: string[] })
                .policyViolations,
          ),
          [],
        );
        assert.deepEqual(errors, []);
      };
      await mount();
      await db.query(
        "UPDATE sessions SET created_at = now() - interval '8 days' WHERE id = $1",
        [browserSession.rows[0].id],
      );
      await page.goto('about:blank');
      const refused = await page.goto(target, { waitUntil: 'networkidle' });
      assert.equal(refused!.status(), 404);
      assert.equal(await refused!.text(), '');
      assert.equal(refused!.headers()['cache-control'], 'no-store');
      await db.query('UPDATE sessions SET created_at = $1 WHERE id = $2', [
        browserSession.rows[0].created_at,
        browserSession.rows[0].id,
      ]);
      await mount();
    }
    assert.equal(forwarded, beforeScreens);
    const beforeNative = forwarded;
    await page.goto(
      browserBase + '/metrics/vmui/#/raw-query?g0.expr=up&g0.range_input=1m',
      { waitUntil: 'networkidle' },
    );
    await page
      .getByText(renderedLabel || 'up', { exact: false })
      .first()
      .waitFor({ timeout: 10000 });
    assert.equal(nativeExports, 1);
    assert.equal(forwarded, beforeNative + 1);
    assert.ok(renderedLabel);
    assert.deepEqual(errors, []);
    const executeNative = async (status: 200 | 404) => {
      expectedNativeStatus = status;
      allowNativeExport = true;
      const before = forwarded;
      const beforeExports = nativeExports;
      const response = page.waitForResponse(
        (response) => new URL(response.url()).pathname === telemetryExportPath,
      );
      await page.getByRole('button', { name: /execute( query)?/i }).click();
      assert.equal((await response).status(), status);
      assert.equal(nativeExports, beforeExports + 1);
      assert.equal(forwarded, before + (status === 200 ? 1 : 0));
      if (status === 200) {
        await page.getByText(renderedLabel, { exact: false }).first().waitFor();
      }
      assert.deepEqual(errors, []);
    };
    await db.query(
      "UPDATE sessions SET created_at = now() - interval '8 days' WHERE id = $1",
      [browserSession.rows[0].id],
    );
    await executeNative(404);
    const staleDocument = await context.request.get(
      browserBase + '/metrics/vmui/',
    );
    assert.equal(staleDocument.status(), 404);
    await db.query('UPDATE sessions SET created_at = $1 WHERE id = $2', [
      browserSession.rows[0].created_at,
      browserSession.rows[0].id,
    ]);
    await executeNative(200);
    // Native hash navigation must preserve the bounds even with a fresh session.
    const navigateNative = async (
      expression: string,
      range: string,
      status: 200 | 404,
    ) => {
      expectedNativeStatus = status;
      allowNativeExport = true;
      const before = forwarded;
      const beforeExports = nativeExports;
      const response = page.waitForResponse(
        (response) => new URL(response.url()).pathname === telemetryExportPath,
      );
      await page.evaluate(
        ({ expression, range }) => {
          location.hash = `/raw-query?g0.expr=${encodeURIComponent(expression)}&g0.range_input=${range}`;
        },
        { expression, range },
      );
      const received = await response;
      assert.equal(received.status(), status);
      const requested = new URL(received.url()).searchParams;
      assert.equal(requested.get('match[]'), expression);
      const seconds =
        Number(requested.get('end')) - Number(requested.get('start'));
      assert.ok(Math.abs(seconds - (range === '30m' ? 1800 : 60)) < 1);
      await page.waitForLoadState('networkidle');
      assert.equal(nativeExports, beforeExports + 1);
      assert.equal(forwarded, before + (status === 200 ? 1 : 0));
      if (status === 200) {
        await page.getByText(renderedLabel, { exact: false }).first().waitFor();
      }
      assert.deepEqual(errors, []);
    };
    await navigateNative('up', '30m', 404);
    await navigateNative('up', '1m', 200);
    await navigateNative('count(up)', '1m', 404);
    await navigateNative('up', '1m', 200);
    const violations = () =>
      page.evaluate(
        () =>
          (window as unknown as { policyViolations: string[] })
            .policyViolations,
      );
    assert.deepEqual(await violations(), []);
    const beforeProbes = forwarded;
    const probes = await page.evaluate(async () => {
      const script = document.createElement('script');
      script.textContent = 'window.inlineProbeExecuted = true';
      document.head.append(script);
      script.remove();
      let externalRefused = false;
      try {
        await fetch('https://telemetry-csp-probe.invalid/', {
          signal: AbortSignal.timeout(5000),
        });
      } catch {
        externalRefused = true;
      }
      return {
        inlineExecuted: Boolean(
          (
            window as unknown as {
              inlineProbeExecuted?: boolean;
            }
          ).inlineProbeExecuted,
        ),
        externalRefused,
      };
    });
    assert.deepEqual(probes, { inlineExecuted: false, externalRefused: true });
    await page.waitForFunction(() => {
      const events = (window as unknown as { policyViolations: string[] })
        .policyViolations;
      return (
        events.includes('script-src-elem') && events.includes('connect-src')
      );
    });
    assert.deepEqual((await violations()).sort(), [
      'connect-src',
      'script-src-elem',
    ]);
    assert.equal(forwarded, beforeProbes);
    assert.equal(await browserWrite('/api/account/logout', {}), 204);
    assert.equal((await context.cookies()).length, 0);
    // Restore the cookie to prove server-side revocation independently of deletion.
    await context.addCookies(cookies);
    await executeNative(404);
    await context.unroute('**/*');
    // Keep the browser cookie: storage revocation must reject it without relay work.
    await browserCheck(false);
    assert.equal((await context.cookies()).length, 1);
    await context.clearCookies();
    await browserCheck(false);
    await context.close();
    assert.equal((await write('/api/account/logout', {}, admin)).status, 204);
    await check(admin, false);
    assert.equal(upstreamFailure, false);
    assert.equal(forwarded, 7);
    console.log(
      'Stored-session/live export: fresh and restored admins pass; anonymous, reader, aged, logged-out and invalid requests refuse without upstream work. Installed metrics Dashboards/Query Analyzer and logs Query/Overview mount with the real session, refuse aged documents and remount after restoration without export work. Seven bounded live reads, including installed native Raw Query rendering and open-screen aging/restoration/logout controls and broad-window/selector navigation refusals, enforced inline-script/external-fetch CSP refusals with a Chromium HTTPS code-login and HttpOnly/Secure cookie read and post-logout browser refusal; disposable account storage only. Bodies and credentials withheld; production flags unchanged.',
    );
  } finally {
    await browser?.close();
    browserServer.closeAllConnections();
    server.closeAllConnections();
    relay.closeAllConnections();
    await Promise.all([
      new Promise<void>((done) => browserServer.close(() => done())),
      new Promise<void>((done) => server.close(() => done())),
      new Promise<void>((done) => relay.close(() => done())),
    ]);
    await accounts?.close();
    await identities?.onModuleDestroy();
    await db?.end();
    await Promise.allSettled(
      containers.reverse().map((container) => container.stop()),
    );
    await rm(directory, { recursive: true, force: true });
  }
}
main().catch((error: unknown) => {
  if (error instanceof Error)
    console.error(
      error.stack
        ?.split('\n')
        .filter((line) => line.includes('check-live-stored-telemetry.ts'))
        .join('\n'),
    );
  console.error(
    'Stored-session/live telemetry check failed; credentials and operational bodies withheld.',
  );
  process.exitCode = 1;
});
