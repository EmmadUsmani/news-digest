import 'reflect-metadata';

import assert from 'node:assert/strict';
import { randomBytes, randomUUID } from 'node:crypto';
import { mkdtemp, readFile, rm } from 'node:fs/promises';
import { createServer } from 'node:http';
import { createRequire } from 'node:module';
import type { AddressInfo } from 'node:net';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import test from 'node:test';

import {
  publicOperationsStatusSchema,
  readerEditionHistorySchema,
  readerEditionSchema,
} from '@digest/contracts';
import { NestFactory } from '@nestjs/core';
import { chromium } from 'playwright';

import { database } from '../src/libs/db/connections';
import { prepareStoredAccountHttp } from '../src/modules/accounts/adapters/account-storage';
import { FileLoginCodeDelivery } from '../src/modules/accounts/adapters/file-login-code-delivery';
import { PostgresReaderIdentityRepository } from '../src/modules/accounts/database/identity.repository';
import { PublicArticlesReader } from '../src/modules/ingestion/database/public-articles.reader';
import { PublicSourceHealthReader } from '../src/modules/ingestion/database/public-source-health.reader';
import { PublicSourcesReader } from '../src/modules/topics/database/public-sources.reader';
import { PublicTopicsReader } from '../src/modules/topics/database/public-topics.reader';
import { publicAccountAuthenticator } from '../src/public-account-access';
import { readPublicArticleResponse } from '../src/public-read/articles';
import { readPublicSourceCatalog } from '../src/public-read/settings';
import { readPublicSourceHealth } from '../src/public-read/source-health';
import { prepareAuthenticatedTelemetryExport } from '../src/telemetry-export';
import { telemetryContentSecurityPolicy } from '../src/telemetry-query-policy';

void test('configured full public application serves published fixtures and enforces anonymous and authenticated account boundaries', async () => {
  assert.equal(process.env.NEWS_DIGEST_ISOLATED_TEST, '1');
  const directory = await mkdtemp(join(tmpdir(), 'public-application-'));
  const configuration = {
    PUBLIC_MODE: '1',
    SYSTEM_OWNERSHIP: '1',
    READER_PUBLISHED_ONLY: '1',
    ACCOUNTS_ENABLED: '1',
    ACCOUNT_ORIGIN: 'https://reader.example',
    ACCOUNT_SECRET_KEY: randomBytes(32).toString('hex'),
    ACCOUNT_MAILBOX_PATH: directory,
    ACCOUNT_TRUSTED_PROXY_PEERS: '127.0.0.1',
    SIGNUP_MODE: 'invite',
    ADMIN_EMAILS: 'isolated-owner@example.test',
  };
  const previous = Object.fromEntries(
    Object.keys(configuration).map((key) => [key, process.env[key]]),
  );
  Object.assign(process.env, configuration);
  // Emitted metadata and the exact production provider token must come from
  // the same compiled module graph. Load only after configuring this process.
  const require = createRequire(import.meta.url);
  const { AppModule } =
    require('../dist/app.js') as typeof import('../src/app');
  const { ACCESS_HTTP } =
    require('../dist/public-write/access-provider.js') as typeof import('../src/public-write/access-provider');
  const { PublicErrorFilter } =
    require('../dist/public-write/public-error-filter.js') as typeof import('../src/public-write/public-error-filter');
  const { OperationsStatus } =
    require('../dist/modules/operations/adapters/operations.status.js') as typeof import('../src/modules/operations/adapters/operations.status');
  const { mountQueueTools } =
    require('../dist/modules/operations/adapters/public-jobs-browser.js') as typeof import('../src/modules/operations/adapters/public-jobs-browser');
  const { proxyInternalTools, selectInternalTools } =
    require('../dist/internal-tools.js') as typeof import('../src/internal-tools');
  const { createLogger, requestLogging } =
    require('../dist/libs/observability/logging.js') as typeof import('../src/libs/observability/logging');
  const requestLogs: string[] = [];
  // Use the production request middleware without environment-value redaction:
  // sensitive inputs must be omitted, rather than hidden by this test's config.
  const requestLogger = createLogger(
    'public-rehearsal',
    { write: (line: string) => requestLogs.push(line) },
    [],
  );
  // An isolated upstream records forwarding; no test reaches live telemetry.
  const installedAssets: Record<string, { body: string; contentType: string }> =
    process.env.TELEMETRY_INSTALLED_ASSET_FIXTURE
      ? JSON.parse(
          await readFile(process.env.TELEMETRY_INSTALLED_ASSET_FIXTURE, 'utf8'),
        )
      : {};
  const telemetryRequests: string[] = [];
  let nativeBrowser = false;
  const telemetry = createServer((req, res) => {
    const asset = nativeBrowser && installedAssets[req.url!];
    if (asset) {
      assert.equal(req.headers.cookie, undefined);
      telemetryRequests.push(req.url!);
      res
        .writeHead(200, { 'content-type': asset.contentType })
        .end(Buffer.from(asset.body, 'base64'));
      return;
    }
    if (req.url?.startsWith('/metrics/prometheus/api/v1/export?')) {
      assert.equal(req.headers.cookie, undefined);
      assert.equal(req.headers.authorization, undefined);
      assert.equal(req.headers['x-exedev-email'], undefined);
      assert.equal(req.headers.admin_local_token, undefined);
      telemetryRequests.push(req.url);
      res
        .writeHead(200, {
          'content-type': 'application/stream+json',
          'x-private': 'fixture-only',
        })
        .end(
          nativeBrowser
            ? JSON.stringify({
                metric: { __name__: 'up', job: 'installed-session-fixture' },
                values: [1],
                timestamps: [
                  Number(
                    new URL(req.url, 'http://fixture').searchParams.get('end'),
                  ) * 1000,
                ],
              }) + '\n'
            : '{"metric":{"__name__":"up"},"values":[1],"timestamps":[1000]}\n',
        );
      return;
    }
    assert.deepEqual(
      Object.keys(req.headers).sort(),
      req.method === 'POST'
        ? ['connection', 'content-length', 'content-type', 'host']
        : ['connection', 'host'],
    );
    telemetryRequests.push(req.url!);
    res
      .writeHead(200, {
        'content-type': 'application/json',
        'set-cookie': 'upstream=private',
        'x-private': 'fixture-only',
      })
      .end(
        nativeBrowser && req.url?.startsWith('/logs/select/logsql/query')
          ? ''
          : nativeBrowser
            ? JSON.stringify(
                req.url === '/metrics/vmui/dashboards/perJobUsage.json'
                  ? {
                      title: 'Synthetic session dashboard',
                      rows: [
                        {
                          title: 'Synthetic row',
                          panels: [
                            {
                              title: 'Synthetic panel',
                              width: 12,
                              expr: ['up'],
                            },
                          ],
                        },
                      ],
                    }
                  : {
                      status: 'success',
                      data: { resultType: 'matrix', result: [] },
                      values: [],
                      fields: [],
                      hits: [],
                    },
              )
            : '{"fixture":true}',
      );
  });
  await new Promise<void>((done) => telemetry.listen(0, '127.0.0.1', done));
  const telemetryPort = (telemetry.address() as AddressInfo).port;
  const exportAccounts = prepareStoredAccountHttp(configuration);
  assert.ok(exportAccounts.handlers);
  const authenticateExport = publicAccountAuthenticator(
    exportAccounts.handlers,
  );
  const db = database();
  const ids = [randomUUID(), randomUUID()];
  const app = await NestFactory.create(AppModule, { logger: false });
  try {
    app.useGlobalFilters(new PublicErrorFilter());
    app.use(requestLogging(requestLogger));
    app.use(
      prepareAuthenticatedTelemetryExport(
        (request) => authenticateExport(request, new Date()),
        new URL(`http://127.0.0.1:${telemetryPort}`),
      ),
    );
    app.use(
      app.get<import('../src/public-write/access-provider').AccessHttpRuntime>(
        ACCESS_HTTP,
      ).middleware,
    );
    app.use(
      proxyInternalTools(
        selectInternalTools(true)
          .filter(({ adminTelemetry }) => adminTelemetry)
          .map((tool) => ({ ...tool, port: telemetryPort })),
      ),
    );
    mountQueueTools(app, app.get(OperationsStatus).queues, true);
    for (const [index, id] of ids.entries()) {
      const snapshot = {
        id,
        createdAt: '9998-01-02T00:00:00.000Z',
        windowStart: '9998-01-01T00:00:00.000Z',
        windowEnd: '9998-01-02T00:00:00.000Z',
        method: 'signals-v6',
        topics: [],
      };
      await db.query(
        'INSERT INTO digest_previews(id,profile_id,created_at,window_start,window_end,snapshot,kind,published_at) VALUES($1,NULL,$2,$3,$4,$5,$6,$7)',
        [
          id,
          index ? '9999-01-02T00:00:00Z' : snapshot.createdAt,
          snapshot.windowStart,
          snapshot.windowEnd,
          snapshot,
          index ? 'test' : 'scheduled',
          index ? null : snapshot.createdAt,
        ],
      );
    }
    await app.listen(0, '127.0.0.1');
    const base = await app.getUrl();
    const headers = {
      'X-Forwarded-For': '192.0.2.1, 203.0.113.91, 203.0.113.91',
    };
    const get = (path: string, init: RequestInit = {}) =>
      fetch(base + path, { ...init, headers: { ...headers, ...init.headers } });
    const health = await fetch(base + '/healthz');
    assert.equal(health.status, 200);
    assert.deepEqual(await health.json(), {
      status: 'ok',
      database: true,
      redis: true,
    });
    // Use a separate visitor so these checks preserve the existing reader
    // allowance exhaustion scenario below, including admission for refusals.
    const scheduleGet = (path: string, init: RequestInit = {}) =>
      get(path, {
        ...init,
        headers: {
          'X-Forwarded-For': '192.0.2.1, 203.0.113.95, 203.0.113.95',
          ...init.headers,
        },
      });
    // Rehearse the newly admitted page documents against the compiled app,
    // rather than only the route classifier or the fixture-intercepted SPA.
    // This checks HTTP composition; public rendering has separate browser checks.
    const pageGet = (path: string, init: RequestInit = {}) =>
      get(path, {
        ...init,
        headers: {
          'X-Forwarded-For': '192.0.2.1, 203.0.113.94, 203.0.113.94',
          'X-ExeDev-Email': configuration.ADMIN_EMAILS,
          ...init.headers,
        },
      });
    const shell = await (await pageGet('/')).text();
    assert.match(shell, /<div id="root"><\/div>/);
    for (const path of ['/admin/tools', '/admin/spend', '/admin/queues']) {
      const document = await pageGet(path);
      assert.equal(document.status, 200, path);
      assert.match(document.headers.get('content-type') ?? '', /text\/html/);
      assert.equal(document.headers.get('set-cookie'), null);
      assert.ok(document.headers.get('content-security-policy'));
      assert.equal(await document.text(), shell, path);
      const head = await pageGet(path, { method: 'HEAD' });
      assert.equal(head.status, 200, path);
      assert.equal(await head.text(), '');
      for (const method of ['POST', 'PUT', 'PATCH', 'DELETE']) {
        const refused = await pageGet(path, { method });
        assert.equal(refused.status, 404, `${method} ${path}`);
        assert.equal(await refused.text(), '');
      }
      for (const suffix of ['/', '/api', '/jobs']) {
        const refused = await pageGet(path + suffix);
        assert.equal(refused.status, 404, path + suffix);
        assert.equal(await refused.text(), '');
      }
    }
    // Privacy is an exact anonymous document, including without visitor headers.
    // Check headers on both success and access refusal through the real stack.
    for (const method of ['GET', 'HEAD', 'POST']) {
      const response = await fetch(base + '/privacy', { method });
      assert.equal(response.status, method === 'POST' ? 404 : 200);
      assert.equal(response.headers.get('set-cookie'), null);
      assert.equal(
        response.headers.get('strict-transport-security'),
        'max-age=31536000',
      );
      assert.equal(response.headers.get('x-content-type-options'), 'nosniff');
      assert.equal(response.headers.get('referrer-policy'), 'no-referrer');
      assert.equal(response.headers.get('x-frame-options'), 'SAMEORIGIN');
      assert.match(
        response.headers.get('content-security-policy') ?? '',
        /frame-ancestors 'self'/,
      );
      assert.equal(await response.text(), method === 'GET' ? shell : '');
    }
    const expectedSchedule = await db.query(
      'SELECT cadence,timezone,coverage_window AS "coverageWindow",story_budget AS "storyBudget",post_budget AS "postBudget" FROM edition_settings WHERE id=1',
    );
    assert.equal(expectedSchedule.rowCount, 1);
    const queueStatus = await scheduleGet('/api/queues');
    assert.equal(queueStatus.status, 200);
    assert.equal(queueStatus.headers.get('cache-control'), 'no-store');
    const { queues } = await queueStatus.json();
    assert.deepEqual(
      queues.map(({ name }: { name: string }) => name),
      ['operations', 'ingestion', 'digest-generation', 'social-collection'],
    );
    for (const queue of queues) {
      assert.deepEqual(Object.keys(queue).sort(), [
        'counts',
        'name',
        'nextRunAt',
      ]);
      assert.deepEqual(Object.keys(queue.counts).sort(), [
        'active',
        'completed',
        'delayed',
        'failed',
        'waiting',
      ]);
    }
    for (const [path, method] of [
      ['/api/queues', 'POST'],
      ['/api/queues/', 'GET'],
      ['/api/queues?include=jobs', 'GET'],
    ]) {
      const refused = await scheduleGet(path, { method });
      assert.equal(refused.status, 404);
      assert.equal(await refused.text(), '');
    }
    const schedule = await scheduleGet('/api/settings/schedule');
    assert.equal(schedule.status, 200);
    assert.equal(schedule.headers.get('cache-control'), 'no-store');
    assert.deepEqual(await schedule.json(), expectedSchedule.rows[0]);
    const scheduleHead = await scheduleGet('/api/settings/schedule', {
      method: 'HEAD',
    });
    assert.equal(scheduleHead.status, 200);
    assert.equal(await scheduleHead.text(), '');
    for (const method of ['POST', 'PUT', 'PATCH', 'DELETE']) {
      const refused = await scheduleGet('/api/settings/schedule', { method });
      assert.equal(refused.status, 404);
      assert.equal(await refused.text(), '');
    }
    assert.equal((await scheduleGet('/api/admin/profile')).status, 404);
    const latest = await get('/api/editions/latest');
    assert.equal(latest.status, 200);
    assert.equal(readerEditionSchema.parse(await latest.json()).id, ids[0]);
    assert.equal(latest.headers.get('cache-control'), 'no-store');
    const direct = await get('/api/editions/' + ids[0]);
    assert.equal(direct.status, 200);
    assert.equal(readerEditionSchema.parse(await direct.json()).id, ids[0]);
    const topics = await get('/api/admin/topics');
    assert.equal(topics.status, 200);
    assert.equal(topics.headers.get('cache-control'), 'no-store');
    const publicTopics = await new PublicTopicsReader(db).read();
    assert.ok(publicTopics.length > 0);
    assert.deepEqual(await topics.json(), publicTopics);
    const topicsHead = await scheduleGet('/api/admin/topics', {
      method: 'HEAD',
    });
    assert.equal(topicsHead.status, 200);
    assert.equal(await topicsHead.text(), '');
    const sources = await scheduleGet('/api/admin/topics/sources');
    assert.equal(sources.status, 200);
    assert.equal(sources.headers.get('cache-control'), 'no-store');
    assert.deepEqual(
      await sources.json(),
      await readPublicSourceCatalog(() => new PublicSourcesReader(db).read()),
    );
    const sourcesHead = await scheduleGet('/api/admin/topics/sources', {
      method: 'HEAD',
    });
    assert.equal(sourcesHead.status, 200);
    assert.equal(await sourcesHead.text(), '');
    for (const method of ['POST', 'PUT', 'PATCH', 'DELETE'])
      assert.equal(
        (await scheduleGet('/api/admin/topics/sources', { method })).status,
        404,
      );
    const contentGet = (path: string, init: RequestInit = {}) =>
      get(path, {
        ...init,
        headers: {
          'X-Forwarded-For': '192.0.2.1, 203.0.113.96, 203.0.113.96',
          ...init.headers,
        },
      });
    for (const [path, expected] of [
      [
        '/api/admin/content',
        await readPublicArticleResponse(() =>
          new PublicArticlesReader(db).read(),
        ),
      ],
      [
        '/api/admin/content/sources',
        await readPublicSourceHealth(() =>
          new PublicSourceHealthReader(db).read(),
        ),
      ],
    ] as const) {
      const response = await contentGet(path);
      assert.equal(response.status, 200, path);
      assert.equal(response.headers.get('cache-control'), 'no-store');
      assert.deepEqual(await response.json(), expected);
      const head = await contentGet(path, { method: 'HEAD' });
      assert.equal(head.status, 200);
      assert.equal(await head.text(), '');
      for (const method of ['POST', 'PUT', 'PATCH', 'DELETE']) {
        const refused = await contentGet(path, { method });
        assert.equal(refused.status, 404);
        assert.equal(await refused.text(), '');
      }
    }
    const privateWindow = await contentGet('/api/admin/content/window');
    assert.equal(privateWindow.status, 404);
    assert.equal(await privateWindow.text(), '');
    // The installed status controller exposes only the audited public contract.
    const statusResponse = await contentGet('/api/admin/status', {
      headers: { 'X-ExeDev-Email': configuration.ADMIN_EMAILS },
    });
    assert.equal(statusResponse.status, 200);
    assert.equal(statusResponse.headers.get('cache-control'), 'no-store');
    const statusBody = await statusResponse.json();
    assert.deepEqual(
      publicOperationsStatusSchema.parse(statusBody),
      statusBody,
    );
    const statusHead = await get('/api/admin/status', { method: 'HEAD' });
    assert.equal(statusHead.status, 200);
    assert.equal(await statusHead.text(), '');
    // Exercise actual public policy, compiled controllers and disposable storage.
    // A distinct visitor keeps the existing rate-limit exhaustion proof intact.
    const previewGet = (path: string, init: RequestInit = {}) =>
      get(path, {
        ...init,
        headers: {
          'X-Forwarded-For': '192.0.2.1, 203.0.113.97, 203.0.113.97',
          'X-ExeDev-Email': configuration.ADMIN_EMAILS,
          ...init.headers,
        },
      });
    for (const suffix of ['', '/latest', '/' + ids[0]]) {
      const path = '/api/admin/digest-previews' + suffix;
      const response = await previewGet(path);
      assert.equal(response.status, 200, path);
      assert.equal(response.headers.get('cache-control'), 'no-store');
      const body = await response.json();
      if (suffix) {
        assert.deepEqual(readerEditionSchema.parse(body), body);
        assert.equal(body.id, ids[0]);
      } else {
        assert.deepEqual(readerEditionHistorySchema.parse(body), body);
        assert.ok(
          body.entries.some((entry: { id: string }) => entry.id === ids[0]),
        );
        assert.ok(
          !body.entries.some((entry: { id: string }) => entry.id === ids[1]),
        );
      }
      const head = await previewGet(path, { method: 'HEAD' });
      assert.equal(head.status, 200);
      assert.equal(await head.text(), '');
    }
    for (const suffix of ['/' + ids[1], '/' + ids[0] + '/cost', '/jobs/123']) {
      const response = await previewGet('/api/admin/digest-previews' + suffix);
      assert.equal(response.status, 404, suffix);
    }
    const invalidPreview = await previewGet(
      '/api/admin/digest-previews?offset=invalid',
    );
    assert.equal(invalidPreview.status, 400);
    const session = await get('/api/account/session');
    assert.equal(session.status, 200);
    assert.deepEqual(await session.json(), { signedIn: false, isAdmin: false });
    for (const [path, method, status] of [
      ['/api/editions/' + ids[1], 'GET', 404],
      ['/api/editions?offset=invalid', 'GET', 400],
      ['/api/admin/topics', 'POST', 403],
      ['/api/admin/digest-previews/jobs', 'POST', 403],
      ['/api/unknown', 'GET', 404],
    ] as const) {
      const response = await get(path, {
        method,
        headers: { 'X-ExeDev-Email': configuration.ADMIN_EMAILS },
      });
      assert.equal(response.status, status, `${method} ${path}`);
      assert.equal(await response.text(), '');
      assert.equal(response.headers.get('cache-control'), 'no-store');
    }
    // A separate verified visitor exercises real account transport and the
    // authenticated controller/write paths without changing the reader budget.
    const account = (path: string, init: RequestInit = {}) =>
      get(path, {
        ...init,
        headers: {
          'X-Forwarded-For': '192.0.2.1, 203.0.113.92, 203.0.113.92',
          ...init.headers,
        },
      });
    const write = (path: string, body: unknown, cookie = '') =>
      account(path, {
        method: 'POST',
        headers: {
          Origin: configuration.ACCOUNT_ORIGIN,
          'Content-Type': 'application/json',
          Cookie: cookie,
        },
        body: JSON.stringify(body),
      });
    const requestedCode = await write('/api/account/code', {
      email: configuration.ADMIN_EMAILS,
    });
    assert.equal(requestedCode.status, 202);
    const code = await new FileLoginCodeDelivery(directory).latest(
      configuration.ADMIN_EMAILS,
      new Date(),
    );
    assert.ok(code);
    const login = await write('/api/account/redeem', {
      email: configuration.ADMIN_EMAILS,
      code,
    });
    assert.equal(login.status, 204);
    const cookie = login.headers.get('set-cookie')!.split(';')[0];
    assert.match(login.headers.get('set-cookie')!, /Secure/);
    // Exercise query/header inputs as well as the real code/redeem JSON bodies.
    const sensitiveProbe = 'public-rehearsal-private-query-marker';
    const probe = await account(
      `/api/account/session?token=${sensitiveProbe}&email=${configuration.ADMIN_EMAILS}`,
      {
        headers: { Cookie: cookie, Authorization: `Bearer ${sensitiveProbe}` },
      },
    );
    assert.equal(probe.status, 200);
    assert.equal((await probe.json()).signedIn, true);
    const loginRecords = requestLogs.map(
      (line) => JSON.parse(line) as Record<string, unknown>,
    );
    for (const response of [requestedCode, login, probe]) {
      assert.ok(
        loginRecords.some(
          (record) =>
            record.requestId === response.headers.get('x-request-id') &&
            record.status === response.status,
        ),
      );
    }
    const logOutput = requestLogs.join('');
    for (const value of [
      configuration.ADMIN_EMAILS,
      code,
      cookie,
      cookie.split('=')[1],
      sensitiveProbe,
      '203.0.113.92',
    ]) {
      assert.equal(
        logOutput.includes(value),
        false,
        'Request logs retained a sensitive input',
      );
    }
    for (const record of loginRecords) {
      assert.deepEqual(
        Object.keys(record).sort(),
        [
          'level',
          'time',
          'service',
          'requestId',
          'event',
          'method',
          'route',
          'status',
          'outcome',
          'durationMs',
          'msg',
        ].sort(),
      );
      assert.equal(record.event, 'http.request');
      assert.equal(record.outcome, 'finished');
      assert.match(String(record.requestId), /^[a-f0-9-]{36}$/);
    }
    const telemetryMetadata = [
      '/metrics/prometheus/vmui/config.json',
      '/metrics/prometheus/vmui/custom-dashboards',
      '/metrics/prometheus/vmui/timezone',
      '/metrics/vmui/dashboards/perJobUsage.json',
      '/logs/select/buildinfo',
      '/logs/select/tenant_ids',
    ];
    // Keep this acceptance inventory independent of the policy allowlist.
    const telemetryAssets = [
      '/metrics/vmui/',
      '/metrics/vmui/assets/index-BIgfk_tx.css',
      '/metrics/vmui/assets/index-DqVYYV1R.js',
      '/metrics/vmui/assets/rolldown-runtime-B0Z9INg1.js',
      '/metrics/vmui/assets/vendor-CnsZ1jie.css',
      '/metrics/vmui/assets/vendor-U2Dx9M-W.js',
      '/metrics/vmui/dashboards/index.js',
      '/logs/select/vmui/',
      '/logs/select/vmui/assets/index-lFbxh1s7.js',
      '/logs/select/vmui/assets/index-TSMEX6Db.css',
      '/logs/select/vmui/assets/rolldown-runtime-CNC7AqOf.js',
      '/logs/select/vmui/assets/vendor-Bl8Hxami.js',
      '/logs/select/vmui/assets/vendor-CnsZ1jie.css',
    ];
    const telemetryQueries = [
      '/metrics/api/v1/query?query=up',
      '/metrics/prometheus/api/v1/query?query=up',
      '/metrics/api/v1/query_range?query=up&start=1&end=2&step=1',
      '/logs/select/logsql/query?query=_time:1m&limit=1',
      '/logs/select/logsql/hits?query=_time:1m&limit=1',
      '/logs/select/logsql/stats_query?query=_time:1m&limit=1',
      '/logs/select/logsql/stats_query_range?query=_time:1m&limit=1',
      '/logs/select/logsql/field_names?query=_time:1m&limit=1',
      '/logs/select/logsql/field_values?query=_time:1m&limit=1',
      '/logs/select/logsql/stream_field_names?query=_time:1m&limit=1',
      '/logs/select/logsql/stream_field_values?query=_time:1m&limit=1',
      '/logs/select/logsql/query_time_range?query=_time:1m&limit=1',
    ];
    const checkTelemetry = async (actorCookie: string, allowed: boolean) => {
      const exportPath =
        '/metrics/prometheus/api/v1/export?match%5B%5D=up&start=1000&end=1060';
      for (const [method, path] of [
        ['GET', exportPath],
        ['HEAD', exportPath],
        ['POST', exportPath],
        ['GET', exportPath.replace('end=1060', 'end=2800')],
        ['GET', exportPath + '&timeout=30s'],
        ['GET', exportPath.replace('=up', '=secret')],
      ]) {
        const before = telemetryRequests.length;
        const admitted = allowed && method === 'GET' && path === exportPath;
        const response = await account(path, {
          method,
          headers: {
            Cookie: actorCookie,
            Authorization: 'Bearer forged',
            'X-ExeDev-Email': configuration.ADMIN_EMAILS,
            admin_local_token: 'forged-local-token',
          },
        });
        assert.equal(response.status, admitted ? 200 : 404);
        assert.equal(response.headers.get('cache-control'), 'no-store');
        assert.equal(response.headers.get('set-cookie'), null);
        assert.equal(response.headers.get('x-private'), null);
        const body = await response.text();
        assert.equal(Boolean(body), admitted);
        assert.equal(telemetryRequests.length, before + Number(admitted));
        if (admitted) {
          assert.equal(
            response.headers.get('x-content-type-options'),
            'nosniff',
          );
          const upstream = new URL(telemetryRequests.at(-1)!, 'http://fixture');
          assert.equal(upstream.searchParams.get('timeout'), '2s');
          assert.equal(upstream.searchParams.get('max_rows_per_line'), '1');
          assert.equal(upstream.searchParams.get('reduce_mem_usage'), '1');
          assert.equal(JSON.parse(body).metric.__name__, 'up');
        }
      }

      for (const method of ['GET', 'POST', 'HEAD']) {
        for (const path of [
          ...telemetryQueries,
          ...telemetryMetadata,
          ...telemetryAssets,
          '/metrics/vmui/assets/unreviewed.js',
          '/logs/select/vmui/assets/unreviewed.js',
          '/metrics/vmui/?alias=1',
          '/logs/select/vmui/?alias=1',
        ]) {
          const admitted =
            allowed &&
            ((method === 'GET' &&
              [
                ...telemetryQueries,
                ...telemetryMetadata,
                ...telemetryAssets,
              ].includes(path)) ||
              (method === 'POST' && telemetryQueries.includes(path)));
          const before = telemetryRequests.length;
          const response = await account(path, {
            method,
            ...(method === 'POST' && { body: 'query=up' }),
            headers: {
              Cookie: actorCookie,
              ...(method === 'POST' && {
                Origin: configuration.ACCOUNT_ORIGIN,
                'Content-Type': 'application/x-www-form-urlencoded',
              }),
              'X-Forwarded-For': '203.0.113.98, 203.0.113.98',
              'X-ExeDev-Email': configuration.ADMIN_EMAILS,
              Authorization: 'Bearer forged',
              admin_local_token: 'forged-local-token',
            },
          });
          assert.equal(response.status, admitted ? 200 : 404, path);
          assert.equal(response.headers.get('cache-control'), 'no-store');
          assert.equal(response.headers.get('set-cookie'), null);
          assert.equal(response.headers.get('x-private'), null);
          assert.equal(
            await response.text(),
            admitted && method !== 'HEAD' ? '{"fixture":true}' : '',
          );
          assert.equal(telemetryRequests.length, before + Number(admitted));
          if (admitted) {
            assert.equal(telemetryRequests.at(-1), path);
            if (telemetryAssets.includes(path)) {
              assert.equal(
                response.headers.get('content-security-policy'),
                telemetryContentSecurityPolicy,
              );
              assert.equal(
                response.headers.get('x-content-type-options'),
                'nosniff',
              );
            }
          }
        }
      }
    };
    // HTTPS browser transport is virtual: every request is fulfilled locally.
    // Synthetic series only. An optional explicit capture adds installed assets;
    // the isolated test never contacts live telemetry or asset services.
    const checkBrowserExport = async (
      actorCookie: string,
      allowed: boolean,
    ) => {
      const browser = await chromium.launch({ headless: true });
      try {
        const context = await browser.newContext({ serviceWorkers: 'block' });
        if (actorCookie) {
          const separator = actorCookie.indexOf('=');
          await context.addCookies([
            {
              name: actorCookie.slice(0, separator),
              value: actorCookie.slice(separator + 1),
              url: configuration.ACCOUNT_ORIGIN,
              secure: true,
              httpOnly: true,
              sameSite: 'Strict',
            },
          ]);
        }
        let forwarded = 0;
        await context.route('**/*', async (route) => {
          const url = new URL(route.request().url());
          assert.equal(url.origin, configuration.ACCOUNT_ORIGIN);
          if (url.pathname === '/') {
            await route.fulfill({
              contentType: 'text/html',
              body: '<title>Synthetic export session rehearsal</title><pre id="result"></pre>',
            });
            return;
          }
          assert.equal(url.pathname, '/metrics/prometheus/api/v1/export');
          const requestHeaders = await route.request().allHeaders();
          assert.equal(requestHeaders.cookie ?? '', actorCookie);
          const response = await route.fetch({
            url: base + url.pathname + url.search,
            headers: requestHeaders,
          });
          forwarded++;
          assert.equal(response.headers()['cache-control'], 'no-store');
          assert.equal(response.headers()['set-cookie'], undefined);
          await route.fulfill({ response });
        });
        const page = await context.newPage();
        await page.goto(configuration.ACCOUNT_ORIGIN);
        assert.equal(await page.evaluate(() => document.cookie), '');
        const before = telemetryRequests.length;
        // Repeat in the same context to ensure a cached success cannot bypass
        // the stored-session decision on subsequent browser requests.
        for (let index = 0; index < 2; index++) {
          const status = await page.evaluate(async () => {
            const response = await fetch(
              '/metrics/prometheus/api/v1/export?match%5B%5D=up&start=1000&end=1060',
            );
            document.querySelector('#result')!.textContent =
              await response.text();
            return response.status;
          });
          assert.equal(status, allowed ? 200 : 404);
          assert.equal(
            await page.locator('#result').textContent(),
            allowed
              ? '{"metric":{"__name__":"up"},"values":[1],"timestamps":[1000]}\n'
              : '',
          );
        }
        assert.equal(forwarded, 2);
        assert.equal(telemetryRequests.length, before + (allowed ? 2 : 0));
        if (Object.keys(installedAssets).length) {
          nativeBrowser = true;
          try {
            await context.unroute('**/*');
            const errors: string[] = [];
            page.on('pageerror', (error) => errors.push(error.name));
            await page.addInitScript(() => {
              const violations: string[] = [];
              Object.assign(window, { nativePolicyViolations: violations });
              document.addEventListener('securitypolicyviolation', (event) => {
                violations.push(event.effectiveDirective);
              });
            });
            let nativeAllowed = allowed;
            let refusedExport = false;
            let exports = 0;
            await context.route('**/*', async (route) => {
              const url = new URL(route.request().url());
              assert.equal(url.origin, configuration.ACCOUNT_ORIGIN);
              const headers = await route.request().allHeaders();
              assert.equal(headers.cookie ?? '', actorCookie);
              const response = await route.fetch({
                url: base + url.pathname + url.search,
                headers,
              });
              assert.equal(
                response.status(),
                nativeAllowed &&
                  !(
                    refusedExport &&
                    url.pathname === '/metrics/prometheus/api/v1/export'
                  )
                  ? 200
                  : 404,
              );
              assert.equal(response.headers()['cache-control'], 'no-store');
              assert.equal(response.headers()['set-cookie'], undefined);
              if (url.pathname === '/metrics/prometheus/api/v1/export') {
                exports++;
              }
              if (installedAssets[url.pathname] && allowed) {
                assert.equal(
                  response.headers()['content-security-policy'],
                  telemetryContentSecurityPolicy,
                );
                assert.equal(
                  response.headers()['x-content-type-options'],
                  'nosniff',
                );
              }
              await route.fulfill({ response });
            });
            const checkMountedLogout = async (
              endpoint: string,
              execute: () => Promise<void>,
              screen: string,
            ) => {
              // Keep the browser cookie and mounted document: server-side
              // logout must invalidate the next request even with that cookie.
              const saved = await db.query<{ snapshot: unknown }>(
                `SELECT row_to_json(s) AS snapshot FROM sessions s WHERE admin_eligible AND user_id = (SELECT id FROM users WHERE email = $1)`,
                [configuration.ADMIN_EMAILS],
              );
              assert.equal(saved.rowCount, 1);
              try {
                assert.equal(
                  (await write('/api/account/logout', {}, actorCookie)).status,
                  204,
                );
                nativeAllowed = false;
                const before = telemetryRequests.length;
                const refused = page.waitForResponse(
                  (response) => new URL(response.url()).pathname === endpoint,
                );
                await execute();
                assert.equal((await refused).status(), 404);
                await page.waitForLoadState('networkidle');
                assert.equal(telemetryRequests.length, before);
                await page.screenshot({
                  path: `docs/screenshots/native-${screen}-mounted-logout.png`,
                  fullPage: true,
                });
                assert.deepEqual(errors, []);
              } finally {
                // Test-only cleanup preserves the surrounding actor matrix.
                // Production logout never restores a deleted session.
                await db.query(
                  'INSERT INTO sessions SELECT * FROM json_populate_record(NULL::sessions, $1::json)',
                  [JSON.stringify(saved.rows[0].snapshot)],
                );
                nativeAllowed = allowed;
              }
            };
            const nativeBefore = telemetryRequests.length;
            const navigationResponse = await page.goto(
              configuration.ACCOUNT_ORIGIN +
                '/metrics/vmui/#/raw-query?g0.expr=up&g0.range_input=1m',
              { waitUntil: 'networkidle' },
            );
            assert.equal(navigationResponse!.status(), allowed ? 200 : 404);
            if (allowed) {
              await page.waitForTimeout(750);
              await page.waitForLoadState('networkidle');
              assert.ok(
                exports > 0,
                'Installed Raw Query requests authenticated export',
              );
              assert.ok(
                await page
                  .getByText('installed-session-fixture', { exact: false })
                  .count(),
                'Installed Raw Query renders synthetic series',
              );
              assert.deepEqual(errors, []);
              assert.deepEqual(
                await page.evaluate(
                  () =>
                    (window as unknown as { nativePolicyViolations: string[] })
                      .nativePolicyViolations,
                ),
                [],
              );
              await page.screenshot({
                path: 'docs/screenshots/native-metrics-stored-session.png',
              });
              // Keep the installed export screen mounted while its stored
              // session crosses the admin freshness boundary.
              const session = await db.query<{
                id: string;
                created_at: Date;
              }>(
                `SELECT id, created_at FROM sessions WHERE admin_eligible AND user_id = (SELECT id FROM users WHERE email = $1)`,
                [configuration.ADMIN_EMAILS],
              );
              assert.equal(session.rowCount, 1);
              const execute = page.getByRole('button', { name: /^execute$/i });
              const exportResponse = () =>
                page.waitForResponse(
                  (response) =>
                    new URL(response.url()).pathname ===
                    '/metrics/prometheus/api/v1/export',
                );
              try {
                await db.query(
                  `UPDATE sessions SET created_at = now() - interval '8 days' WHERE id = $1`,
                  [session.rows[0].id],
                );
                nativeAllowed = false;
                const beforeExpiry = telemetryRequests.length;
                const refused = exportResponse();
                await execute.click();
                assert.equal((await refused).status(), 404);
                await page.waitForLoadState('networkidle');
                assert.equal(telemetryRequests.length, beforeExpiry);
                await page.screenshot({
                  path: 'docs/screenshots/native-metrics-open-session-expired.png',
                  fullPage: true,
                });
              } finally {
                await db.query(
                  'UPDATE sessions SET created_at = $1 WHERE id = $2',
                  [session.rows[0].created_at, session.rows[0].id],
                );
                nativeAllowed = allowed;
              }
              const beforeResume = telemetryRequests.length;
              const resumed = exportResponse();
              await execute.click();
              assert.equal((await resumed).status(), 200);
              await page.waitForLoadState('networkidle');
              assert.ok(telemetryRequests.length > beforeResume);
              await page
                .getByText('installed-session-fixture', { exact: false })
                .first()
                .waitFor({ state: 'visible' });
              // Change the native time-window navigation on the mounted screen.
              // A fresh session must not bypass the export work bounds.
              const beforeBroad = telemetryRequests.length;
              refusedExport = true;
              const broadResponse = exportResponse();
              await page.evaluate(() => {
                location.hash = '/raw-query?g0.expr=up&g0.range_input=30m';
              });
              assert.equal((await broadResponse).status(), 404);
              await page.waitForLoadState('networkidle');
              assert.equal(telemetryRequests.length, beforeBroad);
              await page.screenshot({
                path: 'docs/screenshots/native-metrics-broad-window-refused.png',
                fullPage: true,
              });
              refusedExport = false;
              const narrowedResponse = exportResponse();
              await page.evaluate(() => {
                location.hash = '/raw-query?g0.expr=up&g0.range_input=1m';
              });
              assert.equal((await narrowedResponse).status(), 200);
              await page.waitForLoadState('networkidle');
              assert.ok(telemetryRequests.length > beforeBroad);
              await page
                .getByText('installed-session-fixture', { exact: false })
                .first()
                .waitFor({ state: 'visible' });
              // A supported time window must not admit a broader selector.
              const beforeSelector = telemetryRequests.length;
              refusedExport = true;
              const selectorResponse = exportResponse();
              await page.evaluate(() => {
                location.hash =
                  '/raw-query?g0.expr=count(up)&g0.range_input=1m';
              });
              assert.equal((await selectorResponse).status(), 404);
              await page.waitForLoadState('networkidle');
              assert.equal(telemetryRequests.length, beforeSelector);
              await page.screenshot({
                path: 'docs/screenshots/native-metrics-selector-refused.png',
                fullPage: true,
              });
              refusedExport = false;
              const restoredSelectorResponse = exportResponse();
              await page.evaluate(() => {
                location.hash = '/raw-query?g0.expr=up&g0.range_input=1m';
              });
              assert.equal((await restoredSelectorResponse).status(), 200);
              await page.waitForLoadState('networkidle');
              assert.ok(telemetryRequests.length > beforeSelector);
              await page
                .getByText('installed-session-fixture', { exact: false })
                .first()
                .waitFor({ state: 'visible' });
              await checkMountedLogout(
                '/metrics/prometheus/api/v1/export',
                () => execute.click(),
                'metrics',
              );
              assert.deepEqual(errors, []);
            } else {
              assert.equal(telemetryRequests.length, nativeBefore);
              assert.equal(exports, 0);
            }
            for (const screen of ['dashboards', 'query-analyzer']) {
              await page.goto('about:blank');
              const screenBefore = telemetryRequests.length;
              const response = await page.goto(
                configuration.ACCOUNT_ORIGIN + '/metrics/vmui/#/' + screen,
                { waitUntil: 'networkidle' },
              );
              assert.equal(response!.status(), allowed ? 200 : 404);
              if (allowed) {
                await page.waitForTimeout(750);
                await page.waitForLoadState('networkidle');
                assert.equal(
                  new URL(page.url()).hash.split('?')[0],
                  '#/' + screen,
                );
                assert.ok(
                  await page.locator('button').count(),
                  screen + ' mounted',
                );
                assert.equal(
                  await page
                    .getByText(/Missing dashboard (rows|panels)/)
                    .count(),
                  0,
                );
                assert.deepEqual(errors, []);
                assert.deepEqual(
                  await page.evaluate(
                    () =>
                      (
                        window as unknown as {
                          nativePolicyViolations: string[];
                        }
                      ).nativePolicyViolations,
                  ),
                  [],
                );
                await page.screenshot({
                  path: `docs/screenshots/native-metrics-${screen}-stored-session.png`,
                  fullPage: true,
                });
              } else {
                assert.equal(telemetryRequests.length, screenBefore);
              }
            }
            for (const screen of ['', '/overview']) {
              await page.goto('about:blank');
              const before = telemetryRequests.length;
              const response = await page.goto(
                configuration.ACCOUNT_ORIGIN +
                  '/logs/select/vmui/' +
                  (screen ? '#' + screen : ''),
                { waitUntil: 'networkidle' },
              );
              assert.equal(response!.status(), allowed ? 200 : 404);
              if (allowed) {
                const execute = page.getByRole('button', {
                  name: /execute( query)?/i,
                });
                if (await execute.count()) await execute.first().click();
                await page.waitForTimeout(750);
                await page.waitForLoadState('networkidle');
                assert.ok(
                  await page.locator('button').count(),
                  'Logs screen mounted',
                );
                if (screen)
                  assert.equal(
                    new URL(page.url()).hash.split('?')[0],
                    '#' + screen,
                  );
                const requests = telemetryRequests.slice(before);
                if (!screen) {
                  for (const endpoint of [
                    'query',
                    'hits',
                    'stream_field_names',
                  ]) {
                    assert.ok(
                      requests.some((path) =>
                        path.startsWith('/logs/select/logsql/' + endpoint),
                      ),
                      'Logs requested ' + endpoint,
                    );
                  }
                }
                assert.deepEqual(errors, []);
                assert.deepEqual(
                  await page.evaluate(
                    () =>
                      (
                        window as unknown as {
                          nativePolicyViolations: string[];
                        }
                      ).nativePolicyViolations,
                  ),
                  [],
                );
                await page.screenshot({
                  path: `docs/screenshots/native-logs-${screen ? 'overview' : 'query'}-stored-session.png`,
                  fullPage: true,
                });
                if (!screen) {
                  // An already-mounted native UI must recheck stored-session
                  // freshness on every action, without reloading the document.
                  const session = await db.query<{
                    id: string;
                    created_at: Date;
                  }>(
                    `SELECT id, created_at FROM sessions WHERE admin_eligible AND user_id = (SELECT id FROM users WHERE email = $1)`,
                    [configuration.ADMIN_EMAILS],
                  );
                  assert.equal(session.rowCount, 1);
                  try {
                    await db.query(
                      `UPDATE sessions SET created_at = now() - interval '8 days' WHERE id = $1`,
                      [session.rows[0].id],
                    );
                    nativeAllowed = false;
                    const beforeExpiry = telemetryRequests.length;
                    const refused = page.waitForResponse(
                      (response) =>
                        new URL(response.url()).pathname ===
                        '/logs/select/logsql/query',
                    );
                    await execute.first().click();
                    assert.equal((await refused).status(), 404);
                    await page.waitForLoadState('networkidle');
                    assert.equal(telemetryRequests.length, beforeExpiry);
                    await page.screenshot({
                      path: 'docs/screenshots/native-logs-open-session-expired.png',
                      fullPage: true,
                    });
                  } finally {
                    await db.query(
                      'UPDATE sessions SET created_at = $1 WHERE id = $2',
                      [session.rows[0].created_at, session.rows[0].id],
                    );
                    nativeAllowed = allowed;
                  }
                  const resumed = page.waitForResponse(
                    (response) =>
                      new URL(response.url()).pathname ===
                      '/logs/select/logsql/query',
                  );
                  await execute.first().click();
                  assert.equal((await resumed).status(), 200);
                  await page.waitForLoadState('networkidle');
                  await checkMountedLogout(
                    '/logs/select/logsql/query',
                    () => execute.first().click(),
                    'logs',
                  );
                  assert.deepEqual(errors, []);
                }
              } else {
                assert.equal(telemetryRequests.length, before);
              }
            }
          } finally {
            nativeBrowser = false;
          }
        }
      } finally {
        await browser.close();
      }
    };
    await checkTelemetry('', false);
    await checkBrowserExport('', false);
    await checkTelemetry(cookie, true);
    await checkBrowserExport(cookie, true);
    // Age the real stored session past seven days without changing its token.
    // It remains a reader session, but must lose operational-data access.
    const aged = await db.query<{ id: string; created_at: Date }>(
      `SELECT id, created_at FROM sessions WHERE admin_eligible AND user_id = (SELECT id FROM users WHERE email = $1)`,
      [configuration.ADMIN_EMAILS],
    );
    assert.equal(aged.rowCount, 1);
    try {
      await db.query(
        `UPDATE sessions SET created_at = now() - interval '8 days' WHERE id = $1`,
        [aged.rows[0].id],
      );
      assert.deepEqual(
        await (
          await account('/api/account/session', {
            headers: { Cookie: cookie },
          })
        ).json(),
        { signedIn: true, isAdmin: false },
      );
      await checkTelemetry(cookie, false);
      await checkBrowserExport(cookie, false);
    } finally {
      await db.query('UPDATE sessions SET created_at = $1 WHERE id = $2', [
        aged.rows[0].created_at,
        aged.rows[0].id,
      ]);
    }
    await checkTelemetry(cookie, true);
    await checkBrowserExport(cookie, true);

    assert.match(login.headers.get('set-cookie')!, /HttpOnly/);
    const signedIn = await account('/api/account/session', {
      headers: { Cookie: cookie },
    });
    const identity = (await signedIn.json()) as {
      signedIn: boolean;
      isAdmin: boolean;
    };
    assert.equal(identity.signedIn, true);
    assert.equal(identity.isAdmin, true);
    // Real compiled controllers and a valid admin cookie must not expose
    // operational tools through public mode, even with forged proxy identity.
    for (const actorCookie of ['', cookie]) {
      for (const path of [
        '/logs',
        '/logs/',
        '/metrics',
        '/metrics/api/v1/admin/tsdb/delete_series?match[]=up',
        '/grafana/',
        '/docs/api/tree',
        '/db/',
        '/queues/',
        '/queues/api/queues',
        '/queues/api/job-schedulers',
        '/%6detrics',
      ]) {
        for (const method of ['GET', 'HEAD', 'POST']) {
          const response = await account(path, {
            method,
            headers: {
              Cookie: actorCookie,
              Origin: configuration.ACCOUNT_ORIGIN,
              'X-ExeDev-Email': configuration.ADMIN_EMAILS,
              admin_local_token: 'forged-local-token',
            },
          });
          assert.equal(response.status, 404, `${method} ${path}`);
          assert.equal(await response.text(), '');
          assert.equal(response.headers.get('cache-control'), 'no-store');
        }
      }
    }
    assert.deepEqual(
      await (
        await account('/api/account/session', {
          headers: { Cookie: cookie },
        })
      ).json(),
      { signedIn: true, isAdmin: true },
    );
    const adminTopics = await account('/api/admin/topics', {
      headers: { Cookie: cookie },
    });
    assert.equal(adminTopics.status, 200);
    const catalog = (await adminTopics.json()) as {
      id: string;
      enabled: boolean;
    }[];
    assert.ok(catalog.length > 0);
    const topic = catalog[0];
    const toggle = await account('/api/admin/topics/' + topic.id, {
      method: 'PUT',
      headers: {
        Cookie: cookie,
        Origin: configuration.ACCOUNT_ORIGIN,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ enabled: topic.enabled }),
    });
    assert.equal(toggle.status, 200);
    assert.deepEqual(await toggle.json(), {
      outcome: 'unchanged',
      id: topic.id,
      enabled: topic.enabled,
    });
    // Exercise a real mutation and its durable audit through the compiled app,
    // then restore the catalog before the account-boundary rehearsals below.
    const topicTarget = '/api/admin/topics/' + topic.id;
    const beforeAdmissions = await db.query(
      'SELECT id FROM admin_write_admissions WHERE target = $1',
      [topicTarget],
    );
    for (const enabled of [!topic.enabled, topic.enabled]) {
      const changed = await account(topicTarget, {
        method: 'PUT',
        headers: {
          Cookie: cookie,
          Origin: configuration.ACCOUNT_ORIGIN,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ enabled }),
      });
      assert.equal(changed.status, 200);
      assert.deepEqual(await changed.json(), {
        outcome: 'changed',
        id: topic.id,
        enabled,
      });
      const readback = await account('/api/admin/topics', {
        headers: { Cookie: cookie },
      });
      assert.equal(readback.status, 200);
      const expected = catalog.map((entry) =>
        entry.id === topic.id ? { ...entry, enabled } : entry,
      );
      assert.deepEqual(await readback.json(), expected);
    }
    const admissions = await db.query(
      'SELECT outcome FROM admin_write_admissions WHERE target = $1 AND NOT (id = ANY($2::uuid[]))',
      [topicTarget, beforeAdmissions.rows.map((row: { id: string }) => row.id)],
    );
    assert.deepEqual(admissions.rows, [
      { outcome: 'changed' },
      { outcome: 'changed' },
    ]);
    const empty = { version: 1, hiddenTopics: {}, bookmarks: {} };
    const sync = await write('/api/account/sync', empty, cookie);
    assert.equal(sync.status, 200);
    assert.deepEqual(await sync.json(), empty);
    // Valid cookies cannot authorize cross-site writes. Exercise destructive
    // payloads through the complete middleware graph, then read back state.
    for (const [origin, contentType] of [
      [undefined, 'application/json'],
      ['null', 'application/json'],
      ['https://attacker.example', 'application/json'],
      [configuration.ACCOUNT_ORIGIN + '.attacker.example', 'application/json'],
      [configuration.ACCOUNT_ORIGIN, 'text/plain'],
    ]) {
      for (const [path, method, body] of [
        ['/api/account/logout', 'POST', {}],
        ['/api/account/logout-all', 'POST', {}],
        ['/api/account/delete', 'POST', { confirmation: 'DELETE' }],
        [
          '/api/account/sync',
          'POST',
          {
            ...empty,
            hiddenTopics: { tech: { hidden: true, updatedAt: 100 } },
          },
        ],
        ['/api/admin/topics/' + topic.id, 'PUT', { enabled: !topic.enabled }],
      ] as const) {
        const response = await account(path, {
          method,
          headers: {
            Cookie: cookie,
            ...(origin === undefined ? {} : { Origin: origin }),
            'Content-Type': contentType!,
            'X-ExeDev-Email': configuration.ADMIN_EMAILS,
            admin_local_token: 'forged-local-token',
          },
          body: JSON.stringify(body),
        });
        assert.equal(response.status, 400, `${method} ${path}: ${origin}`);
        assert.equal(await response.text(), '');
        assert.equal(response.headers.get('cache-control'), 'no-store');
        assert.equal(response.headers.get('access-control-allow-origin'), null);
      }
    }
    // Ambiguous cookie headers must not recover a valid token from either
    // position and authorize writes through the compiled application.
    for (const invalidCookie of [
      `${cookie}; ${cookie}`,
      `${cookie}; __Host-reader_session=malformed`,
      `__Host-reader_session=malformed; ${cookie}`,
      '__Host-reader_session=malformed',
    ]) {
      for (const [path, method, body] of [
        ['/api/account/delete', 'POST', { confirmation: 'DELETE' }],
        ['/api/account/logout-all', 'POST', {}],
        ['/api/admin/topics/' + topic.id, 'PUT', { enabled: !topic.enabled }],
      ] as const) {
        const response = await account(path, {
          method,
          headers: {
            Cookie: invalidCookie,
            Origin: configuration.ACCOUNT_ORIGIN,
            'Content-Type': 'application/json',
            'X-Forwarded-For': '203.0.113.97, 203.0.113.97',
            'X-ExeDev-Email': configuration.ADMIN_EMAILS,
          },
          body: JSON.stringify(body),
        });
        assert.equal(
          response.status,
          path.startsWith('/api/admin/') ? 404 : 401,
          `${method} ${path}: invalid cookie`,
        );
        assert.equal(await response.text(), '');
        assert.equal(response.headers.get('cache-control'), 'no-store');
        assert.equal(response.headers.get('set-cookie'), null);
      }
    }
    // Body refusal must happen before real account and topic mutations, even
    // when same-origin requests carry a valid admin session.
    for (const [path, method] of [
      ['/api/account/logout', 'POST'],
      ['/api/account/logout-all', 'POST'],
      ['/api/account/delete', 'POST'],
      ['/api/account/sync', 'POST'],
      ['/api/admin/topics/' + topic.id, 'PUT'],
    ] as const) {
      for (const [body, status] of [
        ['{"confirmation":"DELETE",', 400],
        [
          ' '.repeat(
            path === '/api/account/sync' ? 16 * 1024 * 1024 + 1 : 2049,
          ),
          413,
        ],
      ] as const) {
        const response = await account(path, {
          method,
          headers: {
            Cookie: cookie,
            Origin: configuration.ACCOUNT_ORIGIN,
            'Content-Type': 'application/json',
            'X-Forwarded-For': '203.0.113.96, 203.0.113.96',
          },
          body,
        });
        assert.equal(
          response.status,
          status,
          `${method} ${path}: body refusal`,
        );
        assert.equal(await response.text(), '');
        assert.equal(response.headers.get('cache-control'), 'no-store');
      }
    }
    assert.deepEqual(
      await (
        await account('/api/account/session', { headers: { Cookie: cookie } })
      ).json(),
      { signedIn: true, isAdmin: true },
    );
    assert.deepEqual(
      await (await write('/api/account/sync', empty, cookie)).json(),
      empty,
    );
    const preservedTopics = await account('/api/admin/topics', {
      headers: { Cookie: cookie },
    });
    assert.equal(preservedTopics.status, 200);
    assert.deepEqual(await preservedTopics.json(), catalog);
    // Invited readers use the same production middleware and controller graph.
    const devices: string[] = [];
    for (let index = 0; index < 2; index++) {
      const invitation = await write(
        '/api/account/links',
        {
          email: 'isolated-reader@example.test',
        },
        cookie,
      );
      assert.equal(invitation.status, 201);
      const redemption = await write('/api/account/link-redeem', {
        token: (await invitation.json()).token,
      });
      assert.equal(redemption.status, 204);
      devices.push(redemption.headers.get('set-cookie')!.split(';')[0]);
    }
    assert.notEqual(devices[0], devices[1]);
    await checkTelemetry(devices[0], false);
    await checkBrowserExport(devices[0], false);
    assert.deepEqual(
      await (
        await account('/api/account/session', {
          headers: { Cookie: devices[0] },
        })
      ).json(),
      { signedIn: true, isAdmin: false },
    );
    const saved = {
      ...empty,
      hiddenTopics: { tech: { hidden: true, updatedAt: 100 } },
      bookmarks: {
        'story:fixture': {
          updatedAt: 100,
          copy: {
            title: 'Isolated fixture story',
            url: 'https://example.test/story',
            attribution: 'Fixture publisher',
            excerpt: 'Fixture reporting',
            platform: 'web',
            editionId: ids[0],
          },
        },
      },
    };
    const syncReader = async (body: unknown, device: string) => {
      const response = await write('/api/account/sync', body, device);
      assert.equal(response.status, 200);
      assert.equal(response.headers.get('cache-control'), 'no-store');
      return response.json();
    };
    assert.deepEqual(await syncReader(saved, devices[0]), saved);
    assert.deepEqual(await syncReader(empty, devices[1]), saved);
    const removed = {
      ...saved,
      bookmarks: {
        'story:fixture': { copy: null, updatedAt: 101 },
      },
    };
    assert.deepEqual(await syncReader(removed, devices[1]), removed);
    assert.deepEqual(await syncReader(saved, devices[0]), removed);
    assert.deepEqual(await syncReader(empty, cookie), empty);
    const forbidden = await account('/api/admin/topics/' + topic.id, {
      method: 'PUT',
      headers: {
        Cookie: devices[0],
        Origin: configuration.ACCOUNT_ORIGIN,
        'Content-Type': 'application/json',
        'X-ExeDev-Email': configuration.ADMIN_EMAILS,
      },
      body: JSON.stringify({ enabled: !topic.enabled }),
    });
    assert.equal(forbidden.status, 404);
    assert.equal(await forbidden.text(), '');
    assert.equal(
      (
        await write(
          '/api/account/links',
          {
            email: 'uninvited@example.test',
          },
          devices[0],
        )
      ).status,
      403,
    );
    const unchanged = await account('/api/admin/topics', {
      headers: { Cookie: cookie },
    });
    assert.deepEqual(await unchanged.json(), catalog);
    assert.equal(
      (await write('/api/account/logout-all', {}, devices[0])).status,
      204,
    );
    for (const device of devices)
      assert.equal(
        (await write('/api/account/sync', empty, device)).status,
        401,
      );
    // Reauthenticate both devices, then delete through the composed public
    // transport. Deletion must revoke every device and outstanding invitation.
    for (let index = 0; index < 2; index++) {
      const invitation = await write(
        '/api/account/links',
        {
          email: 'isolated-reader@example.test',
        },
        cookie,
      );
      assert.equal(invitation.status, 201);
      const redemption = await write('/api/account/link-redeem', {
        token: (await invitation.json()).token,
      });
      assert.equal(redemption.status, 204);
      devices[index] = redemption.headers.get('set-cookie')!.split(';')[0];
    }
    assert.deepEqual(await syncReader(empty, devices[0]), removed);
    const pending = await write(
      '/api/account/links',
      {
        email: 'isolated-reader@example.test',
      },
      cookie,
    );
    assert.equal(pending.status, 201);
    const pendingToken = (await pending.json()).token;
    const refusedDeletion = await write(
      '/api/account/delete',
      {
        confirmation: 'wrong',
      },
      devices[0],
    );
    assert.equal(refusedDeletion.status, 400);
    assert.deepEqual(await syncReader(empty, devices[1]), removed);
    const deletion = await write(
      '/api/account/delete',
      {
        confirmation: 'DELETE',
      },
      devices[0],
    );
    assert.equal(deletion.status, 204);
    assert.match(deletion.headers.get('set-cookie')!, /Max-Age=0/);
    assert.equal(deletion.headers.get('cache-control'), 'no-store');
    for (const device of devices) {
      assert.deepEqual(
        await (
          await account('/api/account/session', {
            headers: { Cookie: device },
          })
        ).json(),
        { signedIn: false, isAdmin: false },
      );
      assert.equal(
        (await write('/api/account/sync', saved, device)).status,
        401,
      );
    }
    assert.equal(
      (
        await write('/api/account/link-redeem', {
          token: pendingToken,
        })
      ).status,
      401,
    );
    assert.equal(
      (
        await write(
          '/api/account/delete',
          {
            confirmation: 'DELETE',
          },
          devices[0],
        )
      ).status,
      401,
    );
    const freshInvitation = await write(
      '/api/account/links',
      {
        email: 'isolated-reader@example.test',
      },
      cookie,
    );
    assert.equal(freshInvitation.status, 201);
    const freshLogin = await write('/api/account/link-redeem', {
      token: (await freshInvitation.json()).token,
    });
    assert.equal(freshLogin.status, 204);
    const freshCookie = freshLogin.headers.get('set-cookie')!.split(';')[0];
    assert.deepEqual(await syncReader(empty, freshCookie), empty);
    assert.deepEqual(await syncReader(empty, cookie), empty);
    const retainedEdition = await account('/api/editions/' + ids[0]);
    assert.equal(retainedEdition.status, 200);
    assert.equal(
      readerEditionSchema.parse(await retainedEdition.json()).id,
      ids[0],
    );
    // Administrative revocation must reach the same session storage used by
    // account middleware, without deleting preferences or the issuer session.
    const secondInvitation = await write(
      '/api/account/links',
      { email: 'isolated-reader@example.test' },
      cookie,
    );
    assert.equal(secondInvitation.status, 201);
    const secondLogin = await write('/api/account/link-redeem', {
      token: (await secondInvitation.json()).token,
    });
    assert.equal(secondLogin.status, 204);
    const secondCookie = secondLogin.headers.get('set-cookie')!.split(';')[0];
    assert.notEqual(secondCookie, freshCookie);
    const identities = new PostgresReaderIdentityRepository();
    const target = await identities
      .findOrCreateVerified('isolated-reader@example.test', new Date())
      .finally(() => identities.onModuleDestroy());
    assert.deepEqual(await syncReader(saved, freshCookie), saved);
    const revoke = (issuer: string) =>
      write('/api/account/sessions/revoke', { userId: target }, issuer);
    assert.equal((await revoke(freshCookie)).status, 403);
    for (const device of [freshCookie, secondCookie])
      assert.deepEqual(await syncReader(empty, device), saved);
    const revocation = await revoke(cookie);
    assert.equal(revocation.status, 200);
    assert.equal(revocation.headers.get('cache-control'), 'no-store');
    assert.equal(revocation.headers.get('set-cookie'), null);
    assert.deepEqual(await revocation.json(), { revoked: 2 });
    for (const device of [freshCookie, secondCookie]) {
      assert.equal(
        (await write('/api/account/sync', saved, device)).status,
        401,
      );
      assert.deepEqual(
        await (
          await account('/api/account/session', {
            headers: { Cookie: device },
          })
        ).json(),
        { signedIn: false, isAdmin: false },
      );
    }
    const repeatedRevocation = await revoke(cookie);
    assert.equal(repeatedRevocation.status, 200);
    assert.deepEqual(await repeatedRevocation.json(), { revoked: 0 });
    assert.deepEqual(await syncReader(empty, cookie), empty);
    const returnInvitation = await write(
      '/api/account/links',
      { email: 'isolated-reader@example.test' },
      cookie,
    );
    assert.equal(returnInvitation.status, 201);
    const returnLogin = await write('/api/account/link-redeem', {
      token: (await returnInvitation.json()).token,
    });
    assert.equal(returnLogin.status, 204);
    assert.deepEqual(
      await syncReader(
        empty,
        returnLogin.headers.get('set-cookie')!.split(';')[0],
      ),
      saved,
    );
    assert.equal((await write('/api/account/logout', {}, cookie)).status, 204);
    await checkTelemetry(cookie, false);
    await checkBrowserExport(cookie, false);
    const revoked = await account('/api/admin/profile', {
      headers: { Cookie: cookie },
    });
    assert.equal(revoked.status, 404);
    assert.equal(await revoked.text(), '');
    assert.deepEqual(
      await (
        await account('/api/account/session', { headers: { Cookie: cookie } })
      ).json(),
      { signedIn: false, isAdmin: false },
    );
    for (const path of ['/api/editions/latest', '/api/queues']) {
      const missingClient = await fetch(base + path);
      assert.equal(missingClient.status, 429);
      assert.equal(await missingClient.text(), '');
    }
    // Ten admitted calls above: exhaust the remaining allowance through real
    // reader controllers, then prove account dispatch shares the same limit.
    for (let index = 0; index < 110; index++) {
      const path = index === 0 ? '/api/queues' : '/api/editions/latest';
      const response = await get(path, { method: 'HEAD' });
      assert.equal(response.status, 200);
      assert.equal(await response.text(), '');
    }
    for (const path of ['/api/account/session', '/api/queues']) {
      const limited = await get(path);
      assert.equal(limited.status, 429);
      assert.equal(await limited.text(), '');
    }
    assert.equal((await fetch(base + '/healthz')).status, 200);
    const rows = await db.query(
      'SELECT id FROM digest_previews WHERE id = ANY($1::uuid[])',
      [ids],
    );
    assert.equal(rows.rowCount, 2);
  } finally {
    await app.close();
    await exportAccounts.close();
    await new Promise<void>((done, reject) =>
      telemetry.close((error) => (error ? reject(error) : done())),
    );
    try {
      await db.query('BEGIN');
      await db.query(
        'ALTER TABLE digest_previews DISABLE TRIGGER immutable_digest_preview',
      );
      await db.query('DELETE FROM digest_previews WHERE id = ANY($1::uuid[])', [
        ids,
      ]);
      await db.query(
        'ALTER TABLE digest_previews ENABLE TRIGGER immutable_digest_preview',
      );
      await db.query('COMMIT');
    } catch (error) {
      await db.query('ROLLBACK');
      throw error;
    } finally {
      await db.end();
    }
    for (const [key, value] of Object.entries(previous)) {
      if (value === undefined) delete process.env[key];
      else process.env[key] = value;
    }
    await rm(directory, { recursive: true, force: true });
  }
});
