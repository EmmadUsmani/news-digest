import assert from 'node:assert/strict';
import { test } from 'node:test';

import { obsRequest, runObs } from '../../../scripts/lib/obs-query';

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
    ['jobs', '--limit', '21'],
    ['jobs', '--limit', '0'],
    ['jobs', '--queue', 'unknown'],
    ['jobs', '--state', 'invalid'],
    ['jobs', '--state'],
    ['jobs', '--state', 'failed', '--state', 'active'],
    ['metric'],
    ['logs', '--since', '1h | delete'],
    ['logs', '--service', 'other'],
    ['logs', '--edition', 'invalid'],
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
