import assert from 'node:assert/strict';
import { test } from 'node:test';

import {
  obsRequest,
  runObs,
  runObsCli,
  serviceSummary,
  sourceSummary,
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
    ['services', '--limit', '5'],
    ['sources', '--limit', '5'],
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
      checkedAt: '2026-11-03T12:00:00Z',
      queues: [],
      privateOtherField: true,
    });
  };
  assert.deepEqual(JSON.parse(await runObs(['jobs'], read)), {
    checkedAt: '2026-11-03T12:00:00Z',
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
    attempts: 1,
    scheduledAt: null,
    startedAt: null,
    durationMs: null,
    finishedAt: null,
    editionId: null,
    skipped: null,
    state: i % 2 ? 'failed' : 'completed',
  }));
  let calls = 0;
  const read: typeof fetch = async (url, init) => {
    calls++;
    assert.equal(url, 'http://127.0.0.1:8000/api/admin/status');
    assert.equal(init?.method, undefined);
    return Response.json({
      checkedAt: '2026-11-03T12:00:00Z',
      queues: [
        {
          name: 'digest-generation',
          available: true,
          workers: 1,
          paused: false,
          counts: { failed: 99 },
          nextRun: '2026-11-03T15:00:00Z',
          runs,
        },
        {
          name: 'ingestion',
          available: false,
          workers: 0,
          paused: false,
          nextRun: null,
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
  assert.equal(filtered.queues[0].nextRun, '2026-11-03T15:00:00Z');
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

void test('source health distinguishes errors, stale success, unknown and inactive without exposing errors', () => {
  const checkedAt = '2026-11-03T12:00:00.000Z';
  const source = {
    id: 'ok',
    name: 'source',
    active: true,
    enabled: true,
    error: null,
    lastAttempt: checkedAt,
    lastSuccess: '2026-11-03T10:00:00.000Z',
    lastItemCount: 0,
    storedItems: 100,
    items24h: 4,
    items7d: 20,
  };
  const summary = sourceSummary({
    checkedAt,
    sources: [
      source,
      { ...source, id: 'stale', lastSuccess: '2026-11-03T09:59:59.000Z' },
      { ...source, id: 'unknown', lastSuccess: null },
      { ...source, id: 'future', lastSuccess: '2026-11-04T12:00:00.000Z' },
      { ...source, id: 'error', error: 'sensitive provider response' },
      {
        ...source,
        id: 'parked',
        active: false,
        error: 'old failure',
        lastSuccess: null,
      },
    ],
  });
  assert.equal(summary.healthy, false);
  assert.equal(summary.unhealthy, 4);
  assert.deepEqual(
    summary.sources.map(({ id, state }) => [id, state]),
    [
      ['error', 'error'],
      ['future', 'unknown'],
      ['unknown', 'unknown'],
      ['stale', 'stale'],
      ['ok', 'ok'],
      ['parked', 'inactive'],
    ],
  );
  assert.equal(JSON.stringify(summary).includes('sensitive'), false);
  assert.equal(summary.sources.find((s) => s.id === 'ok')?.ageSeconds, 7200);
  assert.equal(sourceSummary({ checkedAt, sources: [] }).healthy, false);
  const bounded = sourceSummary({
    checkedAt,
    sources: Array.from({ length: 55 }, (_, i) => ({
      ...source,
      id: String(i),
    })),
  });
  assert.equal(bounded.sources.length, 50);
  assert.equal(bounded.omitted, 5);
});

void test('sources reads and validates only the local status snapshot', async () => {
  assert.equal(
    obsRequest(['sources']).url,
    'http://127.0.0.1:8000/api/admin/status',
  );
  const read = (async () =>
    new Response(
      JSON.stringify({ checkedAt: 'invalid', sources: [] }),
    )) as typeof fetch;
  await assert.rejects(runObs(['sources'], read));
});

void test('service health requires every scoped unit and a fresh collector snapshot', async () => {
  const now = 1_800_000_000_000;
  const row = (name: string, value: string, unit = '', scope = '') => ({
    metric: { __name__: name, unit, scope },
    value: [now / 1000, value],
  });
  const active = row(
    'news_digest_unit_active',
    '1',
    'news-digest-api.service',
    'user',
  );
  const snapshot = row(
    'news_digest_unit_snapshot_timestamp_seconds',
    String(now / 1000 - 120),
  );
  const body = (rows: unknown[]) => ({
    status: 'success',
    data: { resultType: 'vector', result: rows },
  });
  const summary = serviceSummary(body([active, snapshot]), now);
  assert.equal(summary.healthy, false);
  assert.equal(summary.total, 14);
  assert.equal(summary.unhealthy, 13);
  const complete = summary.services.map((unit) =>
    row('news_digest_unit_active', '1', unit.unit, unit.scope),
  );
  assert.equal(
    serviceSummary(body([...complete, snapshot]), now).healthy,
    true,
  );
  assert.equal(summary.services.at(-1)?.state, 'active');
  assert.equal(
    serviceSummary(
      body([
        active,
        { ...snapshot, value: [now / 1000, String(now / 1000 - 121)] },
      ]),
      now,
    ).services.every((unit) => unit.state !== 'active'),
    true,
  );
  for (const value of ['NaN', '', String(now / 1000 + 1)]) {
    assert.equal(
      serviceSummary(
        body([active, { ...snapshot, value: [now / 1000, value] }]),
        now,
      ).snapshotAgeSeconds,
      null,
    );
  }
  for (const rows of [
    [],
    [active],
    [active, snapshot, snapshot],
    [active, active, snapshot],
    [{ ...active, metric: { ...active.metric, scope: 'system' } }, snapshot],
  ]) {
    assert.equal(serviceSummary(body(rows), now).unhealthy, 14);
  }
  const inactive = serviceSummary(
    body([{ ...active, value: [now / 1000, '0'] }, snapshot]),
    now,
  );
  assert.equal(
    inactive.services.find((unit) => unit.unit === active.metric.unit)?.state,
    'inactive',
  );
  assert.throws(() => serviceSummary({}, now), /Invalid local/);
  const request = obsRequest(['services'], now);
  assert.equal(
    new URL(request.url).searchParams.get('query'),
    'news_digest_unit_active or news_digest_unit_snapshot_timestamp_seconds',
  );
  const output = JSON.parse(
    await runObs(['services'], async () => Response.json(body([]))),
  );
  assert.equal(output.unhealthy, 14);
});

void test('CLI check preserves health JSON and fails unhealthy summaries only when opted in', async () => {
  for (const command of ['sources', 'targets', 'services']) {
    const payload =
      command === 'sources'
        ? { checkedAt: new Date().toISOString(), sources: [] }
        : command === 'targets'
          ? { status: 'success', data: { activeTargets: [] } }
          : { status: 'success', data: { resultType: 'vector', result: [] } };
    const read = (async () => Response.json(payload)) as typeof fetch;
    const normal = await runObsCli([command], read);
    const checked = await runObsCli([command, '--check'], read);
    assert.equal(normal.exitCode, 0);
    assert.equal(checked.exitCode, 1);
    assert.equal(JSON.parse(checked.output).healthy, false);
    const { checkedAt: _normalTime, ...normalBody } = JSON.parse(normal.output);
    const { checkedAt: _checkedTime, ...checkedBody } = JSON.parse(
      checked.output,
    );
    assert.deepEqual(normalBody, checkedBody);
  }
  const read = (async () =>
    Response.json({
      status: 'success',
      data: {
        activeTargets: [
          {
            labels: { job: 'api' },
            health: 'up',
            lastScrape: new Date().toISOString(),
          },
        ],
      },
    })) as typeof fetch;
  assert.equal((await runObsCli(['targets', '--check'], read)).exitCode, 0);
});

void test('CLI check rejects invalid options before network access and propagates query failures', async () => {
  let reads = 0;
  const read = (async () => {
    reads++;
    return new Response('', { status: 503 });
  }) as typeof fetch;
  for (const args of [
    ['jobs', '--check', '--check'],
    ['metric', '--check'],
    ['--check', 'services'],
    ['sources', '--check', '--check'],
    ['services', '--check', '--limit', '1'],
  ])
    await assert.rejects(runObsCli(args, read), /--check/);
  assert.equal(reads, 0);
  await assert.rejects(runObsCli(['sources', '--check'], read), /HTTP 503/);
  await assert.rejects(
    runObsCli(['sources', '--check'], async () => Response.json({})),
  );
});

void test('health probes dependencies directly and preserves valid degraded responses', async () => {
  assert.equal(obsRequest(['health']).url, 'http://127.0.0.1:8000/healthz');
  for (const database of [true, false]) {
    for (const redis of [true, false]) {
      const healthy = database && redis;
      const body = { status: healthy ? 'ok' : 'degraded', database, redis };
      const read = (async (url, init) => {
        assert.equal(url, 'http://127.0.0.1:8000/healthz');
        assert.ok(init?.signal instanceof AbortSignal);
        return Response.json(
          { ...body, privateExtra: 'omitted' },
          { status: healthy ? 200 : 503 },
        );
      }) as typeof fetch;
      for (const checking of [false, true]) {
        const result = await runObsCli(
          checking ? ['health', '--check'] : ['health'],
          read,
        );
        assert.equal(result.exitCode, checking && !healthy ? 1 : 0);
        const { checkedAt, ...output } = JSON.parse(result.output);
        assert.ok(Number.isFinite(Date.parse(checkedAt)));
        assert.deepEqual(output, { healthy, ...body });
      }
    }
  }
});

void test('health rejects invalid options, HTTP failures and inconsistent or malformed bodies', async () => {
  let reads = 0;
  const read = (async () => {
    reads++;
    return Response.json({});
  }) as typeof fetch;
  for (const args of [
    ['health', '--limit', '1'],
    ['health', '--check', '--check'],
  ])
    await assert.rejects(runObsCli(args, read));
  assert.equal(reads, 0);
  const valid = { status: 'ok', database: true, redis: true };
  for (const [body, status] of [
    [null, 200],
    [{}, 200],
    [{ ...valid, database: 'true' }, 200],
    [{ ...valid, status: 'degraded' }, 503],
    [valid, 503],
    [{ status: 'degraded', database: false, redis: true }, 200],
    [valid, 500],
    [valid, 201],
  ] as const)
    await assert.rejects(
      runObsCli(['health', '--check'], async () =>
        Response.json(body, { status }),
      ),
    );
  await assert.rejects(
    runObsCli(['health'], async () => new Response('not JSON')),
  );
  await assert.rejects(
    runObsCli(['health'], async () => {
      throw new Error('connection refused');
    }),
    /connection refused/,
  );
});

void test('jobs validates the complete queue snapshot before applying filters', async () => {
  const queue = {
    name: 'ingestion',
    available: true,
    workers: 1,
    paused: false,
    counts: { failed: 0 },
    nextRun: null,
    runs: [],
  };
  for (const body of [
    null,
    {},
    { checkedAt: 'invalid', queues: [] },
    {
      checkedAt: '2026-11-03T12:00:00Z',
      queues: [{ ...queue, available: 'true' }],
    },
    { checkedAt: '2026-11-03T12:00:00Z', queues: [{ ...queue, runs: [{}] }] },
    {
      checkedAt: '2026-11-03T12:00:00Z',
      queues: [{ ...queue, counts: { failed: '0' } }],
    },
  ]) {
    await assert.rejects(
      runObs(['jobs', '--queue', 'digest-generation'], async () =>
        Response.json(body),
      ),
    );
  }
  const result = JSON.parse(
    await runObs(['jobs'], async () =>
      Response.json({
        checkedAt: '2026-11-03T12:00:00Z',
        privateField: 'hidden',
        queues: [{ ...queue, privateField: 'hidden' }],
      }),
    ),
  );
  assert.equal(result.privateField, undefined);
  assert.equal(result.queues[0].privateField, undefined);
  assert.equal(result.queues[0].available, true);
});

void test('queue checks require every worker queue ready and ignore retained failures', async () => {
  const queues = [
    'operations',
    'ingestion',
    'digest-generation',
    'social-collection',
  ].map((name) => ({
    name,
    available: true,
    workers: 1,
    paused: false,
    counts: { failed: 2 },
    nextRun: null,
    runs: [],
  }));
  const probe = async (rows: typeof queues) => {
    const read = (async () =>
      Response.json({
        checkedAt: '2026-11-03T12:00:00Z',
        queues: rows,
      })) as typeof fetch;
    const normal = await runObsCli(['jobs'], read);
    const checked = await runObsCli(['jobs', '--check'], read);
    assert.equal(normal.exitCode, 0);
    assert.equal(checked.output, normal.output);
    return checked.exitCode;
  };
  assert.equal(await probe(queues), 0);
  for (const change of [
    { available: false },
    { paused: true },
    { workers: 0 },
  ]) {
    assert.equal(
      await probe(
        queues.map((queue, index) =>
          index === 0 ? { ...queue, ...change } : queue,
        ),
      ),
      1,
    );
  }
  assert.equal(await probe([]), 1);
  assert.equal(await probe(queues.slice(1)), 1);
  assert.equal(await probe([...queues, queues[0]]), 1);
  await assert.rejects(
    runObsCli(['jobs', '--check'], async () => Response.json({ queues: [] })),
  );
});

void test('filtered queue checks accept job options and fail for an absent or unhealthy selected queue', async () => {
  const selected = {
    name: 'digest-generation',
    available: true,
    workers: 1,
    paused: false,
    counts: { failed: 2 },
    nextRun: null,
    runs: [],
  };
  const probe = async (queues: (typeof selected)[], args: string[]) =>
    runObsCli(args, async () =>
      Response.json({ checkedAt: '2026-11-03T12:00:00Z', queues }),
    );
  for (const args of [
    ['jobs', '--check', '--queue', 'digest-generation', '--limit', '1'],
    ['jobs', '--queue', 'digest-generation', '--state', 'failed', '--check'],
  ]) {
    const result = await probe(
      [selected, { ...selected, name: 'ingestion', workers: 0 }],
      args,
    );
    assert.equal(result.exitCode, 0);
    assert.deepEqual(
      JSON.parse(result.output).queues.map((q: { name: string }) => q.name),
      ['digest-generation'],
    );
    for (const change of [
      { workers: 0 },
      { paused: true },
      { available: false },
    ])
      assert.equal(
        (await probe([{ ...selected, ...change }], args)).exitCode,
        1,
      );
    assert.equal((await probe([], args)).exitCode, 1);
    assert.equal((await probe([selected, selected], args)).exitCode, 1);
  }
  let reads = 0;
  await assert.rejects(
    runObsCli(['jobs', '--check', '--queue', 'unknown'], async () => {
      reads++;
      return Response.json({});
    }),
    /Unknown queue/,
  );
  assert.equal(reads, 0);
});

void test('alerts queries local evaluator and bounds active results with firing first', async () => {
  assert.equal(
    obsRequest(['alerts']).url,
    'http://127.0.0.1:8880/api/v1/alerts',
  );
  assert.throws(() => obsRequest(['alerts', '--since', '1h']));
  const alerts = Array.from({ length: 55 }, (_, i) => ({
    state: i === 54 ? 'firing' : 'pending',
    activeAt: '2026-11-03T13:00:00Z',
    labels: {
      alertname: 'SyntheticTest',
      severity: 'warning',
      private: 'omit',
    },
    annotations: { summary: 'Synthetic only', private: 'omit' },
  }));
  const read = (async () =>
    Response.json({ status: 'success', data: { alerts } })) as typeof fetch;
  const recent = [
    {
      time: '2026-11-07T01:00:00Z',
      state: 'resolved' as const,
      name: 'SyntheticTest',
      severity: 'warning',
      summary: 'Synthetic only',
    },
  ];
  const output = JSON.parse(await runObs(['alerts'], read, async () => recent));
  assert.deepEqual(output.recentEvents, recent);
  assert.equal(output.total, 55);
  assert.equal(output.firing, 1);
  assert.equal(output.pending, 54);
  assert.equal(output.omitted, 5);
  assert.equal(output.alerts.length, 50);
  assert.equal(output.alerts[0].state, 'firing');
  assert.equal(output.alerts[0].labels.private, undefined);
  for (const body of [
    null,
    {},
    { status: 'error' },
    { status: 'success', data: { alerts: [{}] } },
    {
      status: 'success',
      data: { alerts: [{ ...alerts[0], state: 'inactive' }] },
    },
  ]) {
    await assert.rejects(runObs(['alerts'], async () => Response.json(body)));
  }
  await assert.rejects(
    runObs(['alerts'], async () => new Response('', { status: 503 })),
  );
});
