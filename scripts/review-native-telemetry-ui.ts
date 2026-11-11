// Explicit installed-asset review. Operational requests are intercepted fixtures;
// only native UI documents/assets reach loopback. Never print queries or bodies.
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { createServer } from 'node:http';
import type { AddressInfo } from 'node:net';

import { chromium } from 'playwright';

import {
  proxyInternalTools,
  selectInternalTools,
} from '../apps/api/src/internal-tools';
import {
  boundedTelemetryExport,
  proxyBoundedTelemetryExport,
  telemetryExportPath,
} from '../apps/api/src/telemetry-export';
import {
  isAdminTelemetryRead,
  telemetryContentSecurityPolicy,
} from '../apps/api/src/telemetry-query-policy';

async function main() {
  const proxyAssets = process.argv[2] === '--proxy-assets';
  assert.deepEqual(process.argv.slice(2), [
    proxyAssets ? '--proxy-assets' : '--live-assets',
  ]);
  // Synthetic export upstream only; no browser export reaches the live store.
  let fixtureExports = 0;
  const fixture = createServer((req, res) => {
    const url = new URL(req.url!, 'http://localhost');
    assert.equal(url.pathname, telemetryExportPath);
    assert.equal(url.searchParams.get('timeout'), '2s');
    assert.equal(url.searchParams.get('max_rows_per_line'), '1');
    assert.equal(url.searchParams.get('reduce_mem_usage'), '1');
    assert.equal(req.headers.cookie, undefined);
    assert.equal(req.headers.authorization, undefined);
    fixtureExports++;
    res.writeHead(200, { 'content-type': 'application/stream+json' }).end(
      JSON.stringify({
        metric: { __name__: 'up', job: 'browser-fixture' },
        values: [1],
        timestamps: [Number(url.searchParams.get('end')) * 1000],
      }) + '\n',
    );
  });
  await new Promise<void>((resolve) => fixture.listen(0, '127.0.0.1', resolve));
  const fixtureOrigin = new URL(
    `http://127.0.0.1:${(fixture.address() as AddressInfo).port}`,
  );
  const proxy = proxyInternalTools(selectInternalTools(true));
  const server = createServer((req, res) => {
    // Explicit rehearsal composition, without changing production admission.
    if (req.url?.split('?')[0] === telemetryExportPath) {
      void proxyBoundedTelemetryExport(req, res, fixtureOrigin);
      return;
    }
    proxy(req, res, () => res.writeHead(404).end());
  });
  await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', resolve));
  const proxyOrigin = `http://127.0.0.1:${(server.address() as AddressInfo).port}`;
  const browser = await chromium.launch({ headless: true });
  try {
    for (const [name, upstreamOrigin, root] of [
      ['metrics', 'http://127.0.0.1:8428', '/metrics/vmui/'],
      ['logs', 'http://127.0.0.1:9428', '/logs/select/vmui/'],
    ]) {
      const origin = proxyAssets ? proxyOrigin : upstreamOrigin;
      const context = await browser.newContext({ serviceWorkers: 'block' });
      const policy = telemetryContentSecurityPolicy;
      const violations = new Set<string>();
      await context.exposeBinding(
        'recordPolicyViolation',
        (_source, directive: string) => {
          violations.add(directive);
        },
      );
      await context.addInitScript(() => {
        document.addEventListener('securitypolicyviolation', (event) => {
          void (
            window as unknown as {
              recordPolicyViolation: (directive: string) => Promise<void>;
            }
          ).recordPolicyViolation(event.effectiveDirective);
        });
      });
      const assets = new Set<string>();
      const failedAssets = new Set<string>();
      const inventory = new Map<
        string,
        { bytes: number; sha256: string; contentType: string }
      >();
      const intercepted = new Set<string>();
      const refused = new Set<string>();
      const exportParameters = new Set<string>();
      const exportShapes: {
        bounded: boolean;
        numericTimes: boolean;
        seconds: number | null;
        selectorUp: boolean;
      }[] = [];
      const page = await context.newPage();
      const navigationErrors: string[] = [];
      page.on('pageerror', (error) => navigationErrors.push(error.name));
      page.on('response', (response) => {
        const path = new URL(response.url()).pathname;
        if (assets.has(path) && !response.ok()) failedAssets.add(path);
      });
      await context.route('**/*', async (route) => {
        const request = route.request();
        const url = new URL(request.url());
        const asset =
          url.pathname === root ||
          (url.pathname.startsWith(`${root}assets/`) &&
            /^[-a-zA-Z0-9_.]+$/.test(
              url.pathname.slice(`${root}assets/`.length),
            )) ||
          url.pathname === `${root}dashboards/index.js`;
        if (url.origin === origin && request.method() === 'GET' && asset) {
          assets.add(url.pathname);
          const response = await route.fetch({ timeout: 10000 });
          if (proxyAssets) {
            assert.equal(response.headers()['content-security-policy'], policy);
            assert.equal(
              response.headers()['x-content-type-options'],
              'nosniff',
            );
          }
          const body = await response.body();
          assert.ok(
            body.length <= 4 * 1024 * 1024,
            'Asset exceeds review limit',
          );
          assert.equal(response.headers()['set-cookie'], undefined);
          const contentType = response.headers()['content-type'] ?? '';
          assert.match(
            contentType,
            url.pathname === root
              ? /text\/html/
              : url.pathname.endsWith('.css')
                ? /text\/css/
                : /javascript/,
          );
          inventory.set(url.pathname, {
            bytes: body.length,
            sha256: createHash('sha256').update(body).digest('hex'),
            contentType,
          });
          await route.fulfill({
            response,
            body,
            headers: {
              ...response.headers(),
              ...(!proxyAssets &&
                url.pathname === root && {
                  'content-security-policy': policy,
                }),
            },
          });
          return;
        }
        if (
          url.origin === origin &&
          !isAdminTelemetryRead(request.method(), url.pathname + url.search)
        ) {
          if (url.pathname === '/metrics/prometheus/api/v1/export') {
            const start = url.searchParams.get('start') ?? '';
            const end = url.searchParams.get('end') ?? '';
            const numericTimes = [start, end].every((value) =>
              /^\d+(\.\d+)?$/.test(value),
            );
            exportShapes.push({
              bounded:
                boundedTelemetryExport(url.pathname + url.search) !== null,
              numericTimes,
              seconds: numericTimes ? Number(end) - Number(start) : null,
              selectorUp: url.searchParams.get('match[]') === 'up',
            });
            for (const key of url.searchParams.keys())
              exportParameters.add(key);
            if (proxyAssets) {
              const bounded =
                boundedTelemetryExport(url.pathname + url.search) !== null;
              const response = await route.fetch();
              assert.equal(response.status(), bounded ? 200 : 404);
              if (!bounded) refused.add(`${request.method()} ${url.pathname}`);
              assert.equal(response.headers()['cache-control'], 'no-store');
              if (bounded)
                assert.equal(
                  response.headers()['x-content-type-options'],
                  'nosniff',
                );
              assert.equal(response.headers()['set-cookie'], undefined);
              await route.fulfill({ response });
              return;
            }
          }
          refused.add(`${request.method()} ${url.pathname}`);
          await route.fulfill({ status: 403, body: 'Forbidden' });
          return;
        }
        // Exclude queries, bodies, headers and external hostnames from the report.
        intercepted.add(
          `${request.method()} ${url.origin === origin ? url.pathname : '[external]'}`,
        );
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body:
            url.pathname === '/logs/select/logsql/query'
              ? ''
              : url.pathname === '/metrics/vmui/dashboards/perJobUsage.json'
                ? JSON.stringify({
                    title: 'Fixture dashboard',
                    rows: [
                      {
                        title: 'Fixture row',
                        panels: [
                          { title: 'Fixture panel', width: 12, expr: ['up'] },
                        ],
                      },
                    ],
                  })
                : JSON.stringify({
                    hits: [],
                    status: 'success',
                    data: { resultType: 'matrix', result: [] },
                    values: [],
                    fields: [],
                  }),
        });
      });
      await page.goto(
        origin + root + (name === 'metrics' ? '#/?g0.expr=up' : ''),
        { waitUntil: 'networkidle' },
      );
      assert.ok(await page.locator('button').count(), `${name}: UI mounted`);
      if (proxyAssets)
        await page.screenshot({
          path: `docs/screenshots/native-${name}-prepared-proxy.png`,
          fullPage: true,
        });
      // Execute only the query control; every non-asset request remains intercepted.
      const execute = page.getByRole('button', { name: /execute( query)?/i });
      if (await execute.count()) {
        await execute.first().click();
        await page.waitForLoadState('networkidle');
      }
      // Exercise installed hash routes without forwarding operational requests.
      const navigation =
        name === 'metrics'
          ? ['/raw-query', '/dashboards', '/query-analyzer']
          : ['/overview'];
      for (const hashRoute of navigation) {
        await page.goto(
          origin +
            root +
            '#' +
            hashRoute +
            (hashRoute === '/raw-query' ? '?g0.expr=up&g0.range_input=1m' : ''),
          {
            waitUntil: 'networkidle',
          },
        );
        if (hashRoute === '/raw-query')
          await page.reload({ waitUntil: 'networkidle' });
        // Native panels debounce their initial fixture query after navigation.
        await page.waitForTimeout(750);
        await page.waitForLoadState('networkidle');
        assert.ok(
          await page.locator('button').count(),
          `${name}: ${hashRoute} mounted`,
        );
        assert.equal(new URL(page.url()).hash.split('?')[0], '#' + hashRoute);
        if (proxyAssets && hashRoute === '/raw-query')
          assert.ok(
            await page.getByText('browser-fixture', { exact: false }).count(),
            'Native Raw Query renders synthetic export',
          );
        assert.equal(
          await page.getByText(/Missing dashboard (rows|panels)/).count(),
          0,
        );
        if (proxyAssets)
          await page.screenshot({
            path: `docs/screenshots/native-${name}-${hashRoute.slice(1)}-prepared-proxy.png`,
            fullPage: true,
          });
      }
      if (name === 'metrics' && proxyAssets) {
        assert.ok(
          exportShapes.some(
            (shape) =>
              shape.bounded && shape.seconds === 60 && shape.selectorUp,
          ),
        );
        assert.ok(
          fixtureExports > 0,
          'Native Raw Query reached bounded fixture transport',
        );
        // Broad default-sized requests must still fail without upstream work.
        const before = fixtureExports;
        const status = await page.evaluate(
          async (path) => (await fetch(path)).status,
          telemetryExportPath + '?match%5B%5D=up&start=100&end=1900',
        );
        assert.equal(status, 404);
        assert.equal(fixtureExports, before);
      }
      assert.deepEqual(
        navigationErrors,
        [],
        `${name}: navigation has no uncaught errors`,
      );
      assert.deepEqual(
        [...refused].sort(),
        name === 'metrics' ? ['GET /metrics/prometheus/api/v1/export'] : [],
        `${name}: only the reviewed export limitation is refused`,
      );
      const links = await page.locator('a[href]').evaluateAll((elements) =>
        elements.map((element) => {
          const url = new URL((element as HTMLAnchorElement).href);
          return url.origin === location.origin ? url.pathname : '[external]';
        }),
      );
      assert.equal(
        violations.size,
        0,
        `${name}: normal UI has no CSP violations`,
      );
      const externalBefore = intercepted.has('GET [external]');
      const blocked = await page.evaluate(async () => {
        const marker = 'data-inline-script-executed';
        const script = document.createElement('script');
        script.textContent = `document.documentElement.setAttribute('${marker}', '1')`;
        document.head.append(script);
        let connectionBlocked = false;
        try {
          await fetch('https://csp-probe.example.invalid/');
        } catch {
          connectionBlocked = true;
        }
        return {
          connectionBlocked,
          inlineBlocked: !document.documentElement.hasAttribute(marker),
        };
      });
      assert.deepEqual(blocked, {
        connectionBlocked: true,
        inlineBlocked: true,
      });
      await page.waitForFunction(() => document.readyState === 'complete');
      // Binding callbacks arrive asynchronously after the violation event.
      await assert.doesNotReject(async () => {
        for (let attempt = 0; attempt < 20; attempt++) {
          if (
            violations.has('connect-src') &&
            violations.has('script-src-elem')
          )
            return;
          await page.waitForTimeout(25);
        }
        assert.fail(`${name}: missing deliberate CSP refusal events`);
      });
      assert.equal(
        intercepted.has('GET [external]'),
        externalBefore,
        `${name}: external probe never reaches request routing`,
      );
      assert.deepEqual(
        [...exportParameters].sort(),
        name === 'metrics' ? ['end', 'match[]', 'start'] : [],
        'Native export parameter inventory changed',
      );
      console.log(
        JSON.stringify({
          name,
          assets: Object.fromEntries(
            [...inventory].sort(([a], [b]) => a.localeCompare(b)),
          ),
          intercepted: [...intercepted].sort(),
          links: [...new Set(links)].sort(),
          navigation,
          refused: [...refused].sort(),
          exportParameters: [...exportParameters].sort(),
          exportShapes,
          fixtureData: true,
          policy,
          deliberateRefusals: [...violations].sort(),
        }),
      );

      assert.ok(assets.size >= 5, `${name}: installed asset graph loaded`);
      assert.equal(
        failedAssets.size,
        0,
        `${name}: assets returned successfully`,
      );
      const expected =
        name === 'metrics'
          ? ['POST /metrics/prometheus/api/v1/query_range']
          : [
              'POST /logs/select/logsql/query',
              'POST /logs/select/logsql/hits',
              'POST /logs/select/logsql/stream_field_names',
            ];
      for (const request of expected)
        assert.ok(
          intercepted.has(request),
          `${name}: native query transport observed`,
        );
      await context.close();
    }
  } finally {
    await browser.close();
    await new Promise<void>((resolve) => server.close(() => resolve()));
    await new Promise<void>((resolve) => fixture.close(() => resolve()));
  }
}
main().catch(() => {
  console.error(
    'Native telemetry UI review failed; operational bodies withheld.',
  );
  process.exitCode = 1;
});
