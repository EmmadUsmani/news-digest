import assert from 'node:assert/strict';
import test from 'node:test';

import type { Job } from 'bullmq';
import { Registry } from 'prom-client';

import {
  jobTrigger,
  startJobMetrics,
} from '../src/libs/observability/job-metrics';
import { createLogger, logJob } from '../src/libs/observability/logging';

void test('job metrics preserve results/errors and count attempts with bounded private labels', async () => {
  const registry = new Registry();
  startJobMetrics(registry);
  const log = createLogger('test', { write() {} }, []);
  const job = {
    id: 'private-id',
    name: 'collect',
    attemptsMade: 0,
    data: { secret: 'private-payload' },
  } as Job;
  const result = { ok: true };
  assert.equal(await logJob('ingestion', async () => result, log)(job), result);
  const failure = new Error('private-error');
  const fail = logJob(
    'ingestion',
    async () => {
      throw failure;
    },
    log,
  );
  await assert.rejects(fail(job), (err) => err === failure);
  await assert.rejects(
    fail({ ...job, attemptsMade: 1 } as Job),
    (err) => err === failure,
  );
  await logJob(
    'private-queue',
    async () => undefined,
    log,
  )({ ...job, name: 'private-name' } as Job);
  const metric = (await registry.getMetricsAsJSON())[0];
  const counts = metric.values.filter((value) =>
    value.metricName?.endsWith('_count'),
  );
  assert.deepEqual(
    counts.map(({ labels, value }) => ({ labels, value })),
    [
      {
        labels: {
          queue: 'ingestion',
          name: 'collect',
          outcome: 'completed',
          trigger: 'unknown',
        },
        value: 1,
      },
      {
        labels: {
          queue: 'ingestion',
          name: 'collect',
          outcome: 'failed',
          trigger: 'unknown',
        },
        value: 2,
      },
      {
        labels: {
          queue: 'other',
          name: 'other',
          outcome: 'completed',
          trigger: 'unknown',
        },
        value: 1,
      },
    ],
  );
  for (const value of metric.values.filter((value) =>
    value.metricName?.endsWith('_sum'),
  ))
    assert.ok(value.value >= 0);
  assert.doesNotMatch(await registry.metrics(), /private-|secret|payload/);
});

void test('trigger attribution follows worker branches and rejects missing or unsafe scheduler metadata', () => {
  assert.equal(
    jobTrigger('digest-generation', 'on-demand', undefined),
    'manual',
  );
  assert.equal(
    jobTrigger('digest-generation', 'on-demand', 123, 'private-key'),
    'manual',
  );
  assert.equal(
    jobTrigger('operations', 'heartbeat', undefined, 'private-key'),
    'scheduled',
  );
  for (const invalid of [undefined, null, '', ' ', 123, {}])
    assert.equal(
      jobTrigger('operations', 'heartbeat', undefined, invalid),
      'unknown',
    );
  for (const queue of [
    'digest-generation',
    'social-collection',
    'ingestion',
    'operations',
  ]) {
    const name =
      queue === 'digest-generation'
        ? 'generate'
        : queue === 'operations'
          ? 'heartbeat'
          : 'collect';
    assert.equal(jobTrigger(queue, name, 123), 'scheduled');
    for (const invalid of [undefined, null, 0, -1, NaN, Infinity, '123', {}])
      assert.equal(jobTrigger(queue, name, invalid), 'unknown');
  }
  assert.equal(jobTrigger('private-queue', 'collect', 123), 'unknown');
  assert.equal(jobTrigger('digest-generation', 'private-name', 123), 'unknown');
});

void test('scheduled retries and manual attempts retain separate timing series without changing worker behavior', async () => {
  const registry = new Registry();
  startJobMetrics(registry);
  const log = createLogger('test', { write() {} }, []);
  const job = {
    name: 'generate',
    opts: {},
    repeatJobKey: 'private-scheduler',
    attemptsMade: 0,
  } as Job;
  const failure = new Error('private-error');
  const fail = logJob(
    'digest-generation',
    async () => {
      throw failure;
    },
    log,
  );
  await assert.rejects(fail(job), (err) => err === failure);
  await assert.rejects(
    fail({ ...job, attemptsMade: 1 } as Job),
    (err) => err === failure,
  );
  const result = { editionId: 'private-edition' };
  const finish = logJob('digest-generation', async () => result, log);
  assert.equal(await finish(job), result);
  assert.equal(
    await finish({ ...job, name: 'on-demand', opts: {} } as Job),
    result,
  );
  await finish({ ...job, opts: {}, repeatJobKey: undefined } as Job);
  const metric = (await registry.getMetricsAsJSON())[0];
  const counts = metric.values.filter((v) => v.metricName?.endsWith('_count'));
  assert.deepEqual(
    counts.map(({ labels, value }) => ({
      trigger: labels.trigger,
      outcome: labels.outcome,
      value,
    })),
    [
      { trigger: 'scheduled', outcome: 'failed', value: 2 },
      { trigger: 'scheduled', outcome: 'completed', value: 1 },
      { trigger: 'manual', outcome: 'completed', value: 1 },
      { trigger: 'unknown', outcome: 'completed', value: 1 },
    ],
  );
  assert.doesNotMatch(await registry.metrics(), /private-|prevMillis/);
});
