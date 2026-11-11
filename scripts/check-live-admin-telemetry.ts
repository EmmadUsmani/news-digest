// Explicit live upstream reads through an isolated prepared-public proxy.
// Principals are simulated; deployed session authentication is checked separately.
import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import type { AddressInfo } from 'node:net';

import { chromium } from 'playwright';

import {
  proxyInternalTools,
  selectInternalTools,
} from '../apps/api/src/internal-tools';
import { publicAccess } from '../apps/api/src/public-access';
import {
  boundedTelemetryExport,
  proxyBoundedTelemetryExport,
  telemetryExportPath,
} from '../apps/api/src/telemetry-export';

async function main() {
  assert.deepEqual(process.argv.slice(2), ['--live'], 'Requires --live');
  let actor: 'anonymous' | 'reader' | 'stale-admin' | 'admin' = 'anonymous';
  let forwarded = 0;
  const proxy = proxyInternalTools(
    selectInternalTools(true).filter(({ adminTelemetry }) => adminTelemetry),
  );
  const guard = publicAccess(true, () =>
    Promise.resolve(
      actor === 'anonymous' ? null : { freshAdmin: actor === 'admin' },
    ),
  );
  const server = createServer((req, res) => {
    // Explicit isolated export composition; production admission stays closed.
    if (req.url?.split('?')[0] === telemetryExportPath) {
      if (actor !== 'admin') {
        res.writeHead(404, { 'cache-control': 'no-store' }).end();
        return;
      }
      if (req.method === 'GET' && boundedTelemetryExport(req.url)) forwarded++;
      void proxyBoundedTelemetryExport(
        req,
        res,
        new URL('http://127.0.0.1:8428'),
      );
      return;
    }
    void guard(req, res, () => {
      forwarded++;
      proxy(req, res, () => res.writeHead(404).end());
    });
  });
  await new Promise<void>((done) => server.listen(0, '127.0.0.1', done));
  const base = `http://127.0.0.1:${(server.address() as AddressInfo).port}`;
  const end = Math.floor(Date.now() / 1000);
  const queries = [
    `/metrics/api/v1/query?query=count(up)&time=${end}`,
    `/metrics/api/v1/query_range?query=count(up)&start=${end - 60}&end=${end}&step=30`,
    '/logs/select/logsql/query?query=_time:1m&limit=1',
  ];
  try {
    for (const principal of [
      'anonymous',
      'reader',
      'stale-admin',
      'admin',
    ] as const) {
      actor = principal;
      for (const path of [
        '/metrics/prometheus/vmui/config.json',
        '/metrics/prometheus/vmui/custom-dashboards',
        '/metrics/prometheus/vmui/timezone',
        '/metrics/vmui/dashboards/perJobUsage.json',
        '/logs/select/buildinfo',
        '/logs/select/tenant_ids',
      ]) {
        for (const method of ['GET', 'POST', 'HEAD']) {
          const before = forwarded;
          const allowed = actor === 'admin' && method === 'GET';
          const response = await fetch(base + path, {
            method,
            signal: AbortSignal.timeout(5000),
          });
          assert.equal(response.status, allowed ? 200 : 404);
          assert.equal(response.headers.get('cache-control'), 'no-store');
          assert.equal(response.headers.get('set-cookie'), null);
          assert.equal(forwarded, before + (allowed ? 1 : 0));
          const body = await response.text();
          assert.ok(Buffer.byteLength(body) <= 16384);
          if (allowed) assert.ok(JSON.parse(body) !== null);
          else assert.equal(body, '');
        }
      }
      for (const method of ['GET', 'POST']) {
        for (const path of queries) {
          const before = forwarded;
          const response = await fetch(
            base + (method === 'POST' ? path.split('?')[0] : path),
            {
              method,
              ...(method === 'POST' && { body: path.split('?')[1] }),
              headers: {
                ...(method === 'POST' && {
                  'Content-Type': 'application/x-www-form-urlencoded',
                }),
                Cookie: 'rehearsal=invalid',
                Authorization: 'Bearer invalid',
                'X-ExeDev-Email': 'rehearsal@example.invalid',
              },
              signal: AbortSignal.timeout(10000),
            },
          );
          assert.equal(response.status, actor === 'admin' ? 200 : 404);
          assert.equal(response.headers.get('cache-control'), 'no-store');
          assert.equal(response.headers.get('set-cookie'), null);
          assert.equal(forwarded, before + (actor === 'admin' ? 1 : 0));
          const body = await response.text();
          if (actor !== 'admin') assert.equal(body, '');
          else if (path.startsWith('/metrics/')) {
            const data = JSON.parse(body) as {
              status: string;
              data: {
                result: {
                  value?: [number, string];
                  values?: [number, string][];
                }[];
              };
            };
            assert.equal(data.status, 'success');
            assert.equal(
              data.data.result.length,
              1,
              'Expected live scrape count',
            );
            const result = data.data.result[0];
            const samples = result.values ?? [result.value!];
            assert.ok(
              samples.length > 0 &&
                samples.every((sample) => Number(sample[1]) > 0),
            );
          } else {
            const rows = body.trim().split('\n').filter(Boolean);
            assert.equal(rows.length, 1, 'Expected one recent live log row');
            const row = JSON.parse(rows[0]) as Record<string, unknown>;
            assert.ok(typeof row._time === 'string');
            assert.ok(Date.parse(row._time) >= (end - 70) * 1000);
          }
        }
      }
    }
    const exportPath = `${telemetryExportPath}?match[]=up&start=${end - 60}&end=${end}`;
    for (const principal of ['anonymous', 'reader', 'stale-admin'] as const) {
      actor = principal;
      const before = forwarded;
      const response = await fetch(base + exportPath);
      assert.equal(response.status, 404);
      assert.equal(response.headers.get('cache-control'), 'no-store');
      assert.equal(await response.text(), '');
      assert.equal(forwarded, before);
    }
    actor = 'admin';
    for (const [method, path] of [
      ['POST', exportPath],
      ['GET', exportPath.replace('match[]=up', 'match[]=count(up)')],
      ['GET', exportPath.replace(`start=${end - 60}`, `start=${end - 1800}`)],
      ['GET', exportPath + '&timeout=30s'],
    ]) {
      const before = forwarded;
      const response = await fetch(base + path, { method });
      assert.equal(response.status, 404);
      assert.equal(await response.text(), '');
      assert.equal(forwarded, before);
    }
    // Refused at admission, before any real upstream sees a mutation.
    for (const [method, path] of [
      ['GET', '/metrics/internal/force_merge'],
      ['GET', '/metrics/api/v1/admin/tsdb/delete_series?match[]=up'],
      ['POST', '/logs/insert/jsonline'],
      ['GET', '/metrics/'],
      ['GET', '/logs/'],
    ]) {
      const before = forwarded;
      assert.equal((await fetch(base + path, { method })).status, 404);
      assert.equal(forwarded, before);
    }
    // Installed screens, real assets and metadata through the prepared proxy.
    // Refuse automatic data queries; admit one explicit bounded chart below.
    actor = 'admin';
    const browser = await chromium.launch({ headless: true });
    try {
      const context = await browser.newContext({ serviceWorkers: 'block' });
      const page = await context.newPage();
      const errors: string[] = [];
      const metadata = new Set<string>();
      const refusedQueries = new Set<string>();
      let exportReview = false;
      let exportQueries = 0;
      let exportSeries = 0;
      let exportLabel = '';
      let chartReview = false;
      let chartQueries = 0;
      let logReview = false;
      let logQueries = 0;
      let logMessage = '';
      page.on('pageerror', (error) => errors.push(error.name));
      await page.addInitScript(() => {
        Object.assign(window, { policyViolations: [] });
        document.addEventListener('securitypolicyviolation', (event) => {
          (
            window as unknown as { policyViolations: string[] }
          ).policyViolations.push(event.effectiveDirective);
        });
      });
      await context.route('**/*', async (route) => {
        const request = route.request();
        const url = new URL(request.url());
        assert.equal(url.origin, base);
        // Refuse automatic data queries locally. The explicit chart review
        // admits exactly one aggregate query with a one-minute window.
        if (
          url.pathname.includes('/api/v1/') ||
          url.pathname.includes('/logsql/')
        ) {
          const params = new URLSearchParams(
            request.method() === 'POST'
              ? (request.postData() ?? '')
              : url.search,
          );
          const start = Number(params.get('start'));
          const finish = Number(params.get('end'));
          const stepText = params.get('step') ?? '';
          const step = /^\d+(s)?$/.test(stepText)
            ? Number(stepText.replace(/s$/, ''))
            : 0;
          if (
            exportReview &&
            exportQueries === 0 &&
            request.method() === 'GET' &&
            url.pathname === telemetryExportPath &&
            params.get('match[]') === 'up' &&
            [...params.keys()].sort().join(',') === 'end,match[],start' &&
            start > end - 120 &&
            finish <= Date.now() / 1000 + 5 &&
            finish > start &&
            finish - start <= 60
          ) {
            exportQueries++;
            const response = await route.fetch({ timeout: 10000 });
            assert.equal(response.status(), 200);
            assert.equal(response.headers()['cache-control'], 'no-store');
            assert.equal(response.headers()['set-cookie'], undefined);
            const body = await response.text();
            assert.ok(Buffer.byteLength(body) <= 65536);
            const rows = body.trim().split('\n').filter(Boolean);
            assert.ok(rows.length > 0);
            const series = new Set<string>();
            for (const line of rows) {
              const row = JSON.parse(line) as {
                metric: Record<string, string>;
                values: number[];
                timestamps: number[];
              };
              assert.equal(row.metric.__name__, 'up');
              series.add(JSON.stringify(row.metric));
              exportLabel ||= row.metric.job ?? '';
              assert.equal(row.values.length, 1);
              assert.equal(row.timestamps.length, 1);
              assert.ok(
                row.timestamps[0] >= start * 1000 &&
                  row.timestamps[0] <= finish * 1000,
              );
            }
            exportSeries = series.size;
            assert.ok(exportSeries <= 32);
            await route.fulfill({ response });
            return;
          }
          if (
            chartReview &&
            chartQueries === 0 &&
            url.pathname === '/metrics/prometheus/api/v1/query_range' &&
            params.get('query') === 'count(up)' &&
            [...params.keys()].sort().join(',') === 'end,query,start,step' &&
            start > end - 120 &&
            finish <= Date.now() / 1000 + 5 &&
            finish > start &&
            finish - start <= 65 &&
            step >= 15 &&
            (finish - start) / step <= 5
          ) {
            chartQueries++;
            const response = await route.fetch({ timeout: 10000 });
            assert.equal(response.status(), 200);
            assert.equal(response.headers()['cache-control'], 'no-store');
            assert.equal(response.headers()['set-cookie'], undefined);
            const body = await response.json();
            assert.equal(body.status, 'success');
            assert.equal(body.data.result.length, 1);
            const samples = body.data.result[0].values as [number, string][];
            assert.ok(samples.length > 0 && samples.length <= 6);
            assert.ok(
              samples.every(
                ([time, value]) =>
                  time >= start && time <= finish && Number(value) > 0,
              ),
            );
            await route.fulfill({ response });
            return;
          }
          if (
            logReview &&
            logQueries === 0 &&
            request.method() === 'POST' &&
            url.pathname === '/logs/select/logsql/query' &&
            params.get('query') === '_time:1m' &&
            params.get('limit') === '1' &&
            [...params.keys()].sort().join(',') === 'end,limit,query,start'
          ) {
            const timestamp = (value: string) =>
              /^\d+(\.\d+)?$/.test(value)
                ? Number(value) * 1000
                : Date.parse(value);
            const from = timestamp(params.get('start')!);
            const until = timestamp(params.get('end')!);
            assert.ok(from >= Date.now() - 125000);
            assert.ok(until <= Date.now() + 5000 && until > from);
            assert.ok(until - from <= 65000);
            logQueries++;
            const response = await route.fetch({ timeout: 10000 });
            assert.equal(response.status(), 200);
            assert.equal(response.headers()['cache-control'], 'no-store');
            assert.equal(response.headers()['set-cookie'], undefined);
            const body = await response.text();
            assert.ok(Buffer.byteLength(body) <= 16384);
            const rows = body.trim().split('\n').filter(Boolean);
            assert.equal(rows.length, 1);
            const row = JSON.parse(rows[0]) as Record<string, unknown>;
            assert.ok(typeof row._time === 'string');
            assert.ok(
              Date.parse(row._time) >= from && Date.parse(row._time) <= until,
            );
            assert.ok(typeof row._msg === 'string' && row._msg.length > 0);
            logMessage = row._msg;
            await route.fulfill({ response });
            return;
          }
          refusedQueries.add(url.pathname);
          await route.fulfill({ status: 403, body: '' });
          return;
        }
        assert.equal(request.method(), 'GET');
        const response = await route.fetch({ timeout: 10000 });
        assert.equal(response.status(), 200);
        assert.equal(response.headers()['cache-control'], 'no-store');
        assert.equal(response.headers()['set-cookie'], undefined);
        if (
          url.pathname.startsWith('/metrics/prometheus/vmui/') ||
          ['/logs/select/buildinfo', '/logs/select/tenant_ids'].includes(
            url.pathname,
          )
        )
          metadata.add(url.pathname);
        await route.fulfill({ response });
      });
      for (const [document, screen] of [
        ['/metrics/vmui/', '/dashboards'],
        ['/metrics/vmui/', '/query-analyzer'],
        ['/logs/select/vmui/', ''],
        ['/logs/select/vmui/', '/overview'],
      ]) {
        await page.goto('about:blank');
        const response = await page.goto(
          base + document + (screen ? '#' + screen : ''),
          {
            waitUntil: 'networkidle',
          },
        );
        assert.equal(response!.status(), 200);
        assert.ok(await page.locator('button').count());
        if (screen)
          assert.equal(new URL(page.url()).hash.split('?')[0], '#' + screen);
        else
          await page
            .getByRole('button', { name: /execute( query)?/i })
            .first()
            .waitFor();
        assert.deepEqual(errors, []);
        assert.deepEqual(
          await page.evaluate(
            () =>
              (window as unknown as { policyViolations: string[] })
                .policyViolations,
          ),
          [],
        );
      }
      chartReview = true;
      await page.goto('about:blank');
      await page.goto(
        base +
          '/metrics/vmui/#/?g0.expr=count(up)&g0.range_input=1m&g0.step_input=15s',
        {
          waitUntil: 'networkidle',
        },
      );
      assert.equal(chartQueries, 1, 'Exactly one bounded live chart query');
      await page.locator('.u-over').waitFor();
      assert.ok(
        await page.locator('canvas').count(),
        'Live chart canvas mounted',
      );
      assert.deepEqual(errors, []);
      assert.deepEqual(
        await page.evaluate(
          () =>
            (window as unknown as { policyViolations: string[] })
              .policyViolations,
        ),
        [],
      );
      await page.screenshot({
        path: 'docs/screenshots/native-metrics-live-count.png',
      });
      chartReview = false;
      exportReview = true;
      await page.goto('about:blank');
      await page.goto(
        base + '/metrics/vmui/#/raw-query?g0.expr=up&g0.range_input=1m',
        { waitUntil: 'networkidle' },
      );
      await page.waitForTimeout(750);
      await page.waitForLoadState('networkidle');
      assert.equal(exportQueries, 1, 'Exactly one bounded live export');
      assert.ok(exportSeries > 0);
      assert.ok(exportLabel.length > 0);
      await page
        .getByText(exportLabel, { exact: false })
        .first()
        .waitFor({ timeout: 5000 });
      assert.deepEqual(errors, []);
      assert.deepEqual(
        await page.evaluate(
          () =>
            (window as unknown as { policyViolations: string[] })
              .policyViolations,
        ),
        [],
      );
      // Operational series labels are neither printed nor saved as screenshots.
      exportReview = false;
      logReview = true;
      await page.goto('about:blank');
      await page.goto(
        base +
          '/logs/select/vmui/#/?' +
          new URLSearchParams({
            query: '_time:1m',
            limit: '1',
            'g0.range_input': '1m',
            'g0.end_input': new Date().toISOString(),
            'g0.relative_time': 'none',
          }).toString(),
        { waitUntil: 'networkidle' },
      );
      assert.equal(logQueries, 1, 'Exactly one bounded live log query');
      assert.ok(logMessage.length > 0);
      await page.getByText(logMessage, { exact: true }).first().waitFor();
      assert.deepEqual(errors, []);
      assert.deepEqual(
        await page.evaluate(
          () =>
            (window as unknown as { policyViolations: string[] })
              .policyViolations,
        ),
        [],
      );
      logReview = false;
      assert.ok(metadata.has('/metrics/prometheus/vmui/config.json'));
      assert.ok(metadata.has('/metrics/prometheus/vmui/custom-dashboards'));
      assert.ok(refusedQueries.has('/logs/select/logsql/query'));
      assert.ok(refusedQueries.has('/logs/select/logsql/hits'));
      assert.ok(metadata.has('/logs/select/buildinfo'));
      assert.ok(metadata.has('/logs/select/tenant_ids'));
      // Same live documents are refused before upstream work for every other actor.
      for (const principal of ['anonymous', 'reader', 'stale-admin'] as const) {
        actor = principal;
        for (const document of ['/metrics/vmui/', '/logs/select/vmui/']) {
          const before = forwarded;
          const response = await fetch(base + document);
          assert.equal(response.status, 404);
          assert.equal(await response.text(), '');
          assert.equal(forwarded, before);
        }
      }
    } finally {
      await browser.close();
    }
    console.log(
      'Live telemetry: instant/range metrics and one recent log row pass through prepared proxy; six GET-only metadata responses, simulated principal isolation and pre-upstream write/UI refusals pass. Installed metrics Dashboards/Query Analyzer and logs Query/Overview live asset/metadata navigation and CSP checks pass; one bounded live count(up) chart, one bounded live up Raw Query export and one recent live log message render; non-admin documents refuse before upstream work. Principals remain simulated. No operational content printed; live public mode unchanged.',
    );
  } finally {
    server.closeAllConnections();
    await new Promise<void>((done) => server.close(() => done()));
  }
}
main().catch((error: unknown) => {
  if (error instanceof Error)
    console.error(
      error.stack
        ?.split('\n')
        .filter((line) => line.trim().startsWith('at '))
        .slice(0, 2)
        .join('\n'),
    );
  // Avoid printing assertion payloads containing operational log data.
  console.error(
    'Live admin telemetry check failed; operational response bodies withheld.',
  );
  process.exitCode = 1;
});
