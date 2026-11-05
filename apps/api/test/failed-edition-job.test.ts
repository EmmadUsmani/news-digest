import assert from 'node:assert/strict';
import { EventEmitter } from 'node:events';
import { test } from 'node:test';

import type { Worker } from 'bullmq';

import {
  reconcileFailedOnDemandJob,
  watchFailedOnDemandJobs,
} from '../src/modules/digests/adapters/failed-edition-job';

void test('failure reconciliation ignores unrelated, retried and incomplete jobs', async () => {
  const records: unknown[] = [];
  const failures = {
    record: async (id: string, duration: number) => {
      records.push([id, duration]);
    },
    find: async () => null,
  };
  const job = {
    id: 'job',
    name: 'on-demand',
    processedOn: 100,
    finishedOn: 150,
    getState: async () => 'failed' as const,
  };
  await reconcileFailedOnDemandJob(failures, { ...job, name: 'generate' });
  await reconcileFailedOnDemandJob(failures, { ...job, id: undefined });
  await reconcileFailedOnDemandJob(failures, {
    ...job,
    getState: async () => 'waiting',
  });
  await reconcileFailedOnDemandJob(failures, {
    ...job,
    processedOn: undefined,
  });
  await reconcileFailedOnDemandJob(failures, { ...job, finishedOn: undefined });
  assert.deepEqual(records, []);
  await reconcileFailedOnDemandJob(failures, job);
  await reconcileFailedOnDemandJob(failures, { ...job, finishedOn: 90 });
  assert.deepEqual(records, [
    ['job', 50],
    ['job', 0],
  ]);
  await assert.rejects(
    reconcileFailedOnDemandJob(
      {
        ...failures,
        record: async () => {
          throw new Error('DB unavailable');
        },
      },
      job,
    ),
    /DB unavailable/,
  );
});

void test('failure event listener reports persistence errors without throwing', async () => {
  const worker = new EventEmitter();
  const failure = new Error('DB unavailable');
  const reported = new Promise<unknown>((resolve) => {
    watchFailedOnDemandJobs(
      worker as unknown as Pick<Worker, 'on'>,
      {
        record: async () => {
          throw failure;
        },
        find: async () => null,
      },
      resolve,
    );
  });
  worker.emit('failed', undefined);
  worker.emit('failed', {
    id: 'job',
    name: 'on-demand',
    processedOn: 100,
    finishedOn: 150,
    getState: async () => 'failed',
  });
  assert.equal(await reported, failure);
});
