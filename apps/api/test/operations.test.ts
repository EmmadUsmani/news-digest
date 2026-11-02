import assert from 'node:assert/strict';
import { test } from 'node:test';

import { operationsStatusSchema } from '@digest/contracts';
import { Worker } from 'bullmq';

import { OperationsStatus } from '../src/modules/operations/adapters/operations.status';

void test('operations reports persisted sources and bounded queue telemetry without job payloads', async () => {
  const status = new OperationsStatus();
  try {
    const result = operationsStatusSchema.parse(
      JSON.parse(JSON.stringify(await status.read())),
    );
    assert.ok(result.sources.length >= 7);
    assert.deepEqual(result.xDiscovery, {
      todayMicros: 0,
      monthMicros: 0,
      reservedMicros: 0,
      dailyMicros: 400000,
      monthlyMicros: 12000000,
      availableMicros: 400000,
      blocked: false,
    });
    assert.equal(result.queues.length, 4);
    for (const queue of result.queues) {
      assert.equal(queue.available, true);
      assert.ok(queue.runs.length <= 20);
      assert.ok(queue.counts.failed >= 0);
    }
    for (const source of result.sources) assert.ok(source.storedItems >= 0);
    const raw = JSON.stringify(await status.read());
    assert.equal(raw.includes('stacktrace'), false);
    assert.equal(raw.includes('failedReason'), false);
    assert.equal(raw.includes('DATABASE_URL'), false);
  } finally {
    await status.onModuleDestroy();
  }
});

void test('social run telemetry exposes validated counters, isolates digest runs and strips payloads', async () => {
  const status = new OperationsStatus();
  const queue = status.queues.find(
    (queue) => queue.name === 'social-collection',
  )!;
  const counters = {
    sources: 2,
    citations: 3,
    discoveryErrors: 1,
    verified: 4,
    verificationErrors: 1,
    articleDiscovery: { checked: 5, citations: 2, errors: 1 },
  };
  const workerConnection = status.connection.duplicate({
    maxRetriesPerRequest: null,
  });
  const worker = new Worker(
    queue.name,
    async (job) =>
      job.name === 'valid'
        ? { ...counters, secretPayload: 'must-not-expose' }
        : { ...counters, verified: -1 },
    { connection: workerConnection },
  );
  try {
    for (const name of ['valid', 'invalid']) {
      const completed = new Promise<void>((resolve, reject) => {
        worker.once('completed', () => resolve());
        worker.once('failed', (_job, error) => reject(error));
      });
      await queue.add(name, { secret: 'must-not-expose' });
      await completed;
    }
    const result = operationsStatusSchema.parse(
      JSON.parse(JSON.stringify(await status.read())),
    );
    const runs = result.queues.find(
      (queue) => queue.name === 'social-collection',
    )!.runs;
    assert.equal(runs.length, 2);
    assert.equal(runs.filter((run) => run.socialCollection === null).length, 1);
    assert.deepEqual(
      runs.find((run) => run.socialCollection)?.socialCollection,
      counters,
    );
    assert.ok(runs.every((run) => run.finishedAt && !run.editionId));
    assert.equal(JSON.stringify(result).includes('must-not-expose'), false);
    assert.equal(
      result.queues.find((queue) => queue.name === 'digest-generation')!.runs
        .length,
      0,
    );
  } finally {
    await worker.close();
    await workerConnection.quit();
    await queue.obliterate({ force: true });
    await status.onModuleDestroy();
  }
});
