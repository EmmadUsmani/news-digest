import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { EventEmitter } from 'node:events';
import { test } from 'node:test';

import type { Job } from 'bullmq';

import {
  createLogger,
  logJob,
  requestLogging,
} from '../src/libs/observability/logging';

function capture(secrets: string[] = []) {
  const lines: string[] = [];
  const log = createLogger(
    'test',
    {
      write: (line: string) => {
        lines.push(line);
      },
    },
    secrets,
  );
  return { log, lines, records: () => lines.map((line) => JSON.parse(line)) };
}
const job = (id: string) => ({ id, name: 'collect', attemptsMade: 1 }) as Job;

void test('logging redacts nested credentials and secret values in messages, stacks and causes', () => {
  const { log, lines, records } = capture(['fixture-secret-value']);
  const circular: Record<string, unknown> = {};
  circular.self = circular;
  log.error(
    {
      err: new Error('fixture-secret-value', {
        cause: new Error('Bearer invented-credential'),
      }),
      headers: { authorization: 'hidden', Cookie: 'hidden' },
      apiKey: 'hidden',
      circular,
    },
    'failure fixture-secret-value https://name:password@example.test/',
  );
  const output = lines.join('');
  for (const secret of [
    'fixture-secret-value',
    'invented-credential',
    'hidden',
    'name:password',
  ])
    assert.ok(!output.includes(secret));
  assert.match(records()[0].err.stack, /Error: \[REDACTED\]/);
  assert.equal(records()[0].headers.authorization, '[REDACTED]');
  assert.equal(records()[0].circular.self, '[Circular]');
});

void test('job logging isolates overlapping contexts and preserves results and thrown errors', async () => {
  const { log, records } = capture();
  let release!: () => void;
  const held = new Promise<void>((resolve) => {
    release = resolve;
  });
  const first = logJob(
    'ingestion',
    async () => {
      await held;
      log.info('inside first');
      return 17;
    },
    log,
  )(job('first'));
  const second = logJob(
    'social',
    async () => {
      log.info('inside second');
      return 23;
    },
    log,
  )(job('second'));
  assert.equal(await second, 23);
  release();
  assert.equal(await first, 17);
  const error = new Error('temporary failure');
  await assert.rejects(
    logJob(
      'ingestion',
      async () => {
        throw error;
      },
      log,
    )(job('failed')),
    (thrown) => thrown === error,
  );
  for (const record of records().filter((record) =>
    record.msg.includes('first'),
  ))
    assert.equal(record.jobId, 'first');
  for (const record of records().filter((record) =>
    record.msg.includes('second'),
  ))
    assert.equal(record.jobId, 'second');
  assert.equal(
    records().find((record) => record.event === 'job.start').attempt,
    2,
  );
  assert.match(
    records().find((record) => record.event === 'job.failure').err.stack,
    /temporary failure/,
  );
});

void test('request logs use generated IDs and route templates, log once on finish or disconnect', () => {
  const { log, records } = capture();
  const ids: string[] = [];
  for (const outcome of ['finish', 'close']) {
    const response = Object.assign(new EventEmitter(), {
      statusCode: 200,
      setHeader: (_key: string, value: string) => {
        ids.push(value);
      },
    });
    requestLogging(log)(
      { method: 'GET', route: { path: '/api/topics/:id' } },
      response,
      () => {
        log.info('request context');
      },
    );
    response.emit(outcome);
    response.emit('close');
  }
  assert.notEqual(ids[0], ids[1]);
  const requests = records().filter(
    (record) => record.event === 'http.request',
  );
  assert.equal(requests.length, 2);
  assert.deepEqual(
    requests.map((record) => record.requestId),
    ids,
  );
  assert.deepEqual(
    records()
      .filter((record) => record.msg === 'request context')
      .map((record) => record.requestId),
    ids,
  );
  assert.ok(
    requests.every(
      (record) => record.route === '/api/topics/:id' && record.durationMs >= 0,
    ),
  );
  assert.equal(requests[1].outcome, 'closed');
});

void test('fatal handlers log redacted stacks and exit unsuccessfully for exceptions and rejections', () => {
  for (const trigger of [
    "setImmediate(() => { throw new Error('fixture-fatal-secret'); })",
    "Promise.reject(new Error('fixture-fatal-secret'))",
  ]) {
    const result = spawnSync(
      process.execPath,
      [
        '--import',
        'tsx',
        '--eval',
        `const { installFatalLogging } = require('./apps/api/src/libs/observability/logging.ts'); installFatalLogging(); ${trigger}`,
      ],
      {
        env: { ...process.env, TEST_API_KEY: 'fixture-fatal-secret' },
        encoding: 'utf8',
      },
    );
    assert.equal(result.status, 1, result.stderr);
    assert.ok(!result.stdout.includes('fixture-fatal-secret'));
    const record = JSON.parse(result.stdout.trim());
    assert.equal(record.level, 60);
    assert.match(record.err.stack, /Error: \[REDACTED\]/);
  }
});

void test('request logs normalize multi-path router templates', () => {
  const { log, records } = capture();
  const response = Object.assign(new EventEmitter(), {
    statusCode: 200,
    setHeader: () => {},
  });
  requestLogging(log)(
    { method: 'GET', route: { path: ['/', '/queue/:name'] } },
    response,
    () => {},
  );
  response.emit('finish');
  assert.equal(records()[0].route, '/ | /queue/:name');
});

void test('digest completion links only a valid returned edition and retains attempt attribution', async () => {
  const { log, records, lines } = capture();
  const editionId = '12345678-1234-4234-8234-123456789abc';
  const scheduled = {
    ...job('scheduled'),
    name: 'generate',
    opts: { prevMillis: 123 },
    data: { editionId: 'untrusted-payload', secret: 'never-log-payload' },
  } as Job;
  const result = { editionId, privateField: 'never-log-result' };
  assert.equal(
    await logJob('digest-generation', async () => result, log)(scheduled),
    result,
  );
  const [start, finish] = records();
  assert.equal(start.editionId, undefined);
  assert.equal(finish.editionId, editionId);
  for (const entry of [start, finish]) {
    assert.equal(entry.trigger, 'scheduled');
    assert.equal(entry.attempt, 2);
    assert.equal(entry.jobName, 'generate');
    assert.equal(entry.jobId, 'scheduled');
  }
  for (const value of [
    { skipped: 'not due' },
    undefined,
    editionId,
    { editionId: 'private-invalid-id' },
  ]) {
    await logJob('digest-generation', async () => value, log)(scheduled);
    assert.equal(records().at(-1).editionId, undefined);
  }
  await logJob('ingestion', async () => result, log)(scheduled);
  assert.equal(records().at(-1).editionId, undefined);
  const error = new Error('synthetic failure');
  await assert.rejects(
    logJob(
      'digest-generation',
      async () => {
        throw error;
      },
      log,
    )({ ...scheduled, name: 'on-demand' } as Job),
    (err) => err === error,
  );
  assert.equal(records().at(-1).trigger, 'manual');
  assert.equal(records().at(-1).attempt, 2);
  assert.equal(records().at(-1).editionId, undefined);
  assert.doesNotMatch(
    lines.join(''),
    /never-log|private-invalid|untrusted-payload/,
  );
});
