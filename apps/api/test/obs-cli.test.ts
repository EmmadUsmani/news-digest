import assert from 'node:assert/strict';
import { test } from 'node:test';

import {
  obsRequest,
  runObs,
  targetSummary,
} from '../../../scripts/lib/obs-query';

void test('obs log filters escape query operators and bound results', () => {
  const request = obsRequest([
    'logs',
    '--service',
    'worker',
    '--grep',
    '" | limit 9999',
    '--limit',
    '7',
  ]);
  const query = (request.init?.body as URLSearchParams).get('query')!;
  assert.equal(
    query,
    '_time:1h service:"worker" _msg:"\\" | limit 9999" | sort by (_time) desc | limit 7',
  );
  assert.equal(request.url, 'http://127.0.0.1:9428/logs/select/logsql/query');
  assert.match(
    (obsRequest(['errors']).init?.body as URLSearchParams).get('query')!,
    /level:in/,
  );
});

void test('obs rejects malformed inputs before any network access', async () => {
  for (const args of [
    ['alerts'],
    ['targets', '--url', 'https://example.com'],
    ['jobs', '--limit', '21'],
    ['jobs', '--limit', '0'],
    ['jobs', '--queue', 'unknown'],
    ['jobs', '--state', 'invalid'],
    ['jobs', '--state'],
    ['jobs', '--state', 'failed', '--state', 'active'],
    ['metric'],
    ['metric', 'up', '--step', '60s'],
    ['metric', 'up', '--since', '8d'],
    ['metric', 'up', '--since', '1h', '--step', '1s'],
    ['metric', 'up', '--since', '1h', '--step', '2h'],
    ['metric', 'up', '--since', '1d'],
    ['metric', 'up', '--since', '1h', '--since', '2h'],
    ['metric', 'up', '--since', '1h | delete'],
    ['metric', 'up', '--since'],
    ['metric', 'up', '--url', 'https://example.com'],
    ['logs', '--since', '1h | delete'],
    ['logs', '--service', 'other'],
    ['logs', '--edition', 'invalid'],
    ['logs', '--queue', 'unknown'],
    ['logs', '--job', ''],
    ['logs', '--job', '   '],
    ['logs', '--job', 'a'.repeat(201)],
    ['logs', '--job', 'line\nbreak'],
    ['logs', '--job'],
    ['errors', '--job', '1', '--job', '2'],
    ['logs', '--limit', '201'],
    ['logs', '--limit', '0'],
    ['logs', '--since'],
    ['logs', '--grep', ''],
    ['logs', '--since', '1h', '--since', '2h'],
  ]) {
    await assert.rejects(
      runObs(args, async () => {
        assert.fail('Unexpected network request');
      }),
    );
  }
});

void test('obs reads only local endpoints, preserves metrics and reports backend errors', async () => {
  const calls: string[] = [];
  const read: typeof fetch = async (url, init) => {
    assert.equal(typeof url, 'string');
    calls.push(url as string);
    assert.ok(init?.signal);
    return Response.json({
      checkedAt: 'now',
      queues: [],
      privateOtherField: true,
    });
  };
  assert.deepEqual(JSON.parse(await runObs(['jobs'], read)), {
    checkedAt: 'now',
    queues: [],
  });
  const expression = 'sum(rate(a[5m]))';
  await runObs(['metric', expression], read);
  assert.equal(new URL(calls[1]).searchParams.get('query'), expression);
  assert.ok(calls.every((url) => new URL(url).hostname === '127.0.0.1'));
  await assert.rejects(
    runObs(['logs'], async () => new Response('private body', { status: 503 })),
    /^Error: Local query failed: HTTP 503$/,
  );
  const id = '12345678-1234-1234-1234-123456789abc';
  assert.match(
    (
      obsRequest(['logs', '--edition', id]).init?.body as URLSearchParams
    ).toString(),
    /editionId/,
  );
});

void test('obs bounds retained job output after filtering while preserving queue health and counts', async () => {
  const runs = Array.from({ length: 12 }, (_, i) => ({
    id: String(i),
    state: i % 2 ? 'failed' : 'completed',
  }));
  let calls = 0;
  const read: typeof fetch = async (url, init) => {
    calls++;
    assert.equal(url, 'http://127.0.0.1:8000/api/status');
    assert.equal(init?.method, undefined);
    return Response.json({
      checkedAt: 'now',
      queues: [
        {
          name: 'digest-generation',
          available: true,
          counts: { failed: 99 },
          nextRun: 'later',
          runs,
        },
        {
          name: 'ingestion',
          available: false,
          counts: { failed: 2 },
          runs: [],
        },
      ],
    });
  };
  const defaults = JSON.parse(await runObs(['jobs'], read));
  assert.equal(defaults.queues.length, 2);
  assert.equal(defaults.queues[0].runs.length, 5);
  assert.equal(defaults.queues[0].omittedRuns, 7);
  assert.equal(defaults.queues[1].available, false);
  const filtered = JSON.parse(
    await runObs(
      [
        'jobs',
        '--queue',
        'digest-generation',
        '--state',
        'failed',
        '--limit',
        '2',
      ],
      read,
    ),
  );
  assert.equal(filtered.queues.length, 1);
  assert.deepEqual(
    filtered.queues[0].runs.map((run: { id: string }) => run.id),
    ['1', '3'],
  );
  assert.equal(filtered.queues[0].retainedRuns, 12);
  assert.equal(filtered.queues[0].matchingRuns, 6);
  assert.equal(filtered.queues[0].omittedRuns, 4);
  assert.deepEqual(filtered.queues[0].counts, { failed: 99 });
  assert.equal(filtered.queues[0].nextRun, 'later');
  const empty = JSON.parse(
    await runObs(['jobs', '--queue', 'ingestion', '--state', 'failed'], read),
  );
  assert.equal(empty.queues[0].matchingRuns, 0);
  assert.equal(empty.queues[0].counts.failed, 2);
  assert.equal(calls, 3);
});

void test('obs correlates job logs with an exact queue and escaped job identity', () => {
  for (const job of [
    '42',
    'repeat:heartbeat:1793700000000',
    '" | limit 9999',
    'a\\b',
  ]) {
    const request = obsRequest([
      'logs',
      '--queue',
      'operations',
      '--job',
      job,
      '--limit',
      '3',
    ]);
    const query = (request.init?.body as URLSearchParams).get('query');
    assert.equal(
      query,
      `_time:1h queue:="operations" jobId:=${JSON.stringify(job)} | sort by (_time) desc | limit 3`,
    );
  }
  const request = obsRequest(['errors', '--job', '42']);
  const query = (request.init?.body as URLSearchParams).get('query')!;
  assert.match(query, /level:in/);
  assert.ok(query.includes('jobId:="42"'));
});

void test('obs metric history preserves expressions and bounds evaluation timestamps', async () => {
  const query = 'sum(rate(a{label="a&b"}[5m]))';
  const now = Date.parse('2026-11-03T12:00:00.999Z');
  const url = new URL(obsRequest(['metric', query, '--since', '1h'], now).url);
  assert.equal(url.origin, 'http://127.0.0.1:8428');
  assert.equal(url.pathname, '/metrics/api/v1/query_range');
  assert.equal(url.searchParams.get('query'), query);
  assert.equal(url.searchParams.get('end'), String(Math.floor(now / 1000)));
  assert.equal(
    url.searchParams.get('start'),
    String(Math.floor(now / 1000) - 3600),
  );
  assert.equal(url.searchParams.get('step'), '60');
  const bounded = new URL(
    obsRequest(['metric', 'up', '--since', '7d', '--step', '1h'], now).url,
  );
  assert.equal(bounded.searchParams.get('step'), '3600');
  assert.doesNotThrow(() => obsRequest(['metric', 'up', '--since', '999m']));
  assert.throws(() => obsRequest(['metric', 'up', '--since', '1000m']));
  const body = {
    status: 'success',
    data: { resultType: 'matrix', result: [] },
  };
  assert.deepEqual(
    JSON.parse(
      await runObs(['metric', 'up', '--since', '1h'], async (input) => {
        assert.equal(typeof input, 'string');
        assert.equal(
          new URL(input as string).pathname,
          '/metrics/api/v1/query_range',
        );
        return Response.json(body);
      }),
    ),
    body,
  );
});

void test('obs target health distinguishes failed, stale, absent and future scrapes', async () => {
  const now = Date.parse('2026-11-03T12:00:00Z');
  const summary = targetSummary(
    {
      status: 'success',
      data: {
        activeTargets: [
          {
            health: 'up',
            lastScrape: '2026-11-03T11:58:00Z',
            labels: { job: 'healthy' },
          },
          {
            health: 'up',
            lastScrape: '2026-11-03T11:57:59Z',
            labels: { job: 'stale' },
          },
          {
            health: 'down',
            lastScrape: '2026-11-03T11:59:59Z',
            lastError: 'private error',
          },
          { health: 'up' },
          { health: 'up', lastScrape: '2026-11-03T12:00:01Z' },
        ],
      },
    },
    now,
  );
  assert.equal(summary.healthy, false);
  assert.equal(summary.unhealthy, 4);
  assert.deepEqual(summary.targets.map((target) => target.state).sort(), [
    'down',
    'stale',
    'unknown',
    'unknown',
    'up',
  ]);
  assert.equal(summary.targets.at(-1)?.job, 'healthy');
  assert.ok(!JSON.stringify(summary).includes('private error'));
  assert.equal(
    targetSummary({ status: 'success', data: { activeTargets: [] } }, now)
      .healthy,
    false,
  );
  for (const body of [
    null,
    {},
    { status: 'error' },
    { status: 'success', data: {} },
  ])
    assert.throws(
      () => targetSummary(body, now),
      /Invalid local target response/,
    );
  const bounded = targetSummary(
    {
      status: 'success',
      data: {
        activeTargets: Array.from({ length: 60 }, () => ({ health: 'down' })),
      },
    },
    now,
  );
  assert.equal(bounded.total, 60);
  assert.equal(bounded.unhealthy, 60);
  assert.equal(bounded.targets.length, 50);
  assert.equal(bounded.omitted, 10);
  const output = JSON.parse(
    await runObs(['targets'], async (url) => {
      assert.equal(url, 'http://127.0.0.1:8428/metrics/api/v1/targets');
      return Response.json({ status: 'success', data: { activeTargets: [] } });
    }),
  );
  assert.equal(output.total, 0);
});
