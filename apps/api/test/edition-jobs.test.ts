import assert from 'node:assert/strict';
import { test } from 'node:test';

import { type DigestPreview } from '@digest/contracts';
import { Worker } from 'bullmq';

import { BullEditionJobs } from '../src/modules/digests/adapters/edition-jobs';
import { generateOnDemandEdition } from '../src/modules/digests/application/on-demand-edition';
import { PreviewController } from '../src/modules/digests/digests.module';
import {
  type PreviewRepository,
  type ReportEditionProgress,
} from '../src/modules/digests/domain/preview.repository';

void test('async edition requests dedupe while active, publish once and allow later regeneration', async () => {
  const jobs = new BullEditionJobs({
    async findByGenerationKey() {
      return null;
    },
  } as PreviewRepository);
  const connection = jobs.connection.duplicate({ maxRetriesPerRequest: null });
  let release!: () => void;
  const blocked = new Promise<void>((resolve) => {
    release = resolve;
  });
  let calls = 0;
  const keys: string[] = [];
  const snapshot: DigestPreview = {
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
    windowStart: '2026-11-01T00:00:00.000Z',
    windowEnd: '2026-11-02T00:00:00.000Z',
    method: 'signals-v6',
    topics: [],
  };
  const repository = {
    async generate(
      start: Date,
      end: Date,
      key?: string,
      report?: ReportEditionProgress,
    ) {
      calls++;
      keys.push(key!);
      assert.equal(start.toISOString(), snapshot.windowStart);
      assert.equal(end.toISOString(), snapshot.windowEnd);
      await report?.({
        stage: 'topics',
        topics: [{ id: 'fixture', name: 'Fixture', stage: 'editing' }],
      });
      await blocked;
      return snapshot;
    },
  } as PreviewRepository;
  const controller = new PreviewController(repository, jobs);
  const request = {
    windowStart: snapshot.windowStart,
    windowEnd: snapshot.windowEnd,
  };
  const worker = new Worker(
    jobs.queue.name,
    (job) =>
      generateOnDemandEdition(repository, job.id!, job.data, (progress) =>
        job.updateProgress(progress),
      ),
    { connection },
  );
  const waitFor = async (id: string, state: string) => {
    for (let attempt = 0; attempt < 200; attempt++) {
      const status = await jobs.find(id);
      if (status?.state === state) return status;
      await new Promise((resolve) => setTimeout(resolve, 10));
    }
    throw new Error(`Job did not reach ${state}`);
  };
  try {
    assert.throws(() => controller.enqueue({ windowStart: 'bad' }));
    assert.throws(() =>
      controller.enqueue({
        windowStart: snapshot.windowEnd,
        windowEnd: snapshot.windowStart,
      }),
    );
    assert.throws(() =>
      controller.enqueue({
        windowStart: '2026-01-01T00:00:00Z',
        windowEnd: snapshot.windowEnd,
      }),
    );
    assert.throws(() =>
      controller.enqueue({
        windowStart: snapshot.windowStart,
        windowEnd: '2099-01-01T00:00:00Z',
      }),
    );
    const requests = await Promise.all(
      Array.from({ length: 10 }, () => controller.enqueue(request)),
    );
    assert.equal(new Set(requests.map((job) => job.id)).size, 1);
    const id = requests[0].id;
    await waitFor(id, 'active');
    for (
      let attempt = 0;
      attempt < 100 && !(await jobs.find(id))?.progress;
      attempt++
    )
      await new Promise((resolve) => setTimeout(resolve, 10));
    assert.equal((await jobs.find(id))?.progress?.topics[0].stage, 'editing');
    assert.equal(calls, 1);
    assert.equal((await controller.enqueue(request)).id, id);
    release();
    const completed = await waitFor(id, 'completed');
    assert.equal(completed.editionId, snapshot.id);
    assert.ok(completed.durationMs! >= 0);
    assert.equal(completed.error, null);
    assert.equal(keys[0], `on-demand:${id}`);
    const regenerated = await controller.enqueue(request);
    assert.notEqual(regenerated.id, id);
    await waitFor(regenerated.id, 'completed');
    assert.equal(calls, 2);
    assert.equal(await jobs.find('999999999999'), null);
    await assert.rejects(controller.job('invalid'));
    await assert.rejects(controller.job('999999999999'));
    await worker.close();
    const failing = new Worker(
      jobs.queue.name,
      async () => {
        throw new Error('private provider response');
      },
      { connection },
    );
    try {
      const failed = await controller.enqueue(request);
      const status = await waitFor(failed.id, 'failed');
      assert.equal(status.editionId, null);
      assert.equal(status.error, 'Edition generation failed. Try again later.');
      assert.equal(JSON.stringify(status).includes('private'), false);
      const retried = await controller.enqueue(request);
      assert.notEqual(retried.id, failed.id);
      await waitFor(retried.id, 'failed');
    } finally {
      await failing.close();
    }
  } finally {
    release();
    await worker.close();
    await jobs.queue.drain();
    for (const job of await jobs.queue.getJobs(['completed', 'failed']))
      if (job.name === 'on-demand') await job.remove();
    await connection.quit();
    await jobs.onModuleDestroy();
  }
});
