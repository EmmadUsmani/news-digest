import assert from 'node:assert/strict';
import { test } from 'node:test';

import { Registry } from 'prom-client';

import { startQueueMetrics } from '../src/libs/observability/queue-metrics';

void test('queue scrapes refresh retained state, reject failed scrapes and recover without private labels', async () => {
  const registry = new Registry();
  let fail = false;
  let active = 2;
  const queue = {
    name: 'ingestion',
    async getJobCounts(...states: string[]) {
      assert.deepEqual(states, [
        'waiting',
        'active',
        'delayed',
        'failed',
        'completed',
        'paused',
      ]);
      if (fail) throw new Error('private-redis-error');
      return { active, failed: 3, completed: 100 };
    },
    async getJobSchedulersCount() {
      return 32;
    },
    async isPaused() {
      return true;
    },
  };
  startQueueMetrics(registry, [queue, { ...queue, name: 'private-queue' }]);
  let metrics = await registry.metrics();
  assert.match(
    metrics,
    /news_digest_queue_jobs\{queue="ingestion",state="active"\} 2/,
  );
  assert.match(
    metrics,
    /news_digest_queue_jobs\{queue="ingestion",state="waiting"\} 0/,
  );
  assert.match(metrics, /news_digest_queue_schedulers\{queue="ingestion"\} 32/);
  assert.match(metrics, /news_digest_queue_paused\{queue="ingestion"\} 1/);
  fail = true;
  await assert.rejects(registry.metrics(), /private-redis-error/);
  fail = false;
  active = 0;
  metrics = await registry.metrics();
  assert.match(
    metrics,
    /news_digest_queue_jobs\{queue="ingestion",state="active"\} 0/,
  );
  assert.doesNotMatch(metrics, /private/);
});
