import assert from 'node:assert/strict';
import test from 'node:test';

import type { Job } from 'bullmq';
import { Registry } from 'prom-client';

import { startJobMetrics } from '../src/libs/observability/job-metrics';
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
        labels: { queue: 'ingestion', name: 'collect', outcome: 'completed' },
        value: 1,
      },
      {
        labels: { queue: 'ingestion', name: 'collect', outcome: 'failed' },
        value: 2,
      },
      {
        labels: { queue: 'other', name: 'other', outcome: 'completed' },
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
