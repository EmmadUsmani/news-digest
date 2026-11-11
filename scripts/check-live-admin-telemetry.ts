// Explicit live upstream reads through an isolated prepared-public proxy.
// Principals are simulated; deployed session authentication is checked separately.
import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import type { AddressInfo } from 'node:net';

import {
  proxyInternalTools,
  selectInternalTools,
} from '../apps/api/src/internal-tools';
import { publicAccess } from '../apps/api/src/public-access';

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
    console.log(
      'Live telemetry: instant/range metrics and one recent log row pass through prepared proxy; simulated principal isolation and pre-upstream write/UI refusals pass. No log content printed; live public mode unchanged.',
    );
  } finally {
    server.closeAllConnections();
    await new Promise<void>((done) => server.close(() => done()));
  }
}
main().catch(() => {
  // Avoid printing assertion payloads containing operational log data.
  console.error(
    'Live admin telemetry check failed; operational response bodies withheld.',
  );
  process.exitCode = 1;
});
