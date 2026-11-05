import assert from 'node:assert/strict';
import { test } from 'node:test';

import { type DigestPreview } from '@digest/contracts';
import { Worker } from 'bullmq';

import { BullEditionJobs } from '../src/modules/digests/adapters/edition-jobs';
import {
  reconcileFailedOnDemandJob,
  watchFailedOnDemandJobs,
} from '../src/modules/digests/adapters/failed-edition-job';
import { generateOnDemandEdition } from '../src/modules/digests/application/on-demand-edition';
import { PostgresEditionJobFailures } from '../src/modules/digests/database/edition-job-failures';
import { PreviewController } from '../src/modules/digests/digests.module';
import {
  type PreviewRepository,
  type ReportEditionProgress,
} from '../src/modules/digests/domain/preview.repository';

void test('async edition requests dedupe while active, publish once and allow later regeneration', async () => {
  const publications = new Map<string, DigestPreview>();
  const failures = new PostgresEditionJobFailures();
  const jobs = new BullEditionJobs(
    {
      async findByGenerationKey(key: string) {
        return publications.get(key) ?? null;
      },
    } as PreviewRepository,
    failures,
  );
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
      const edition = {
        ...snapshot,
        id: calls === 1 ? snapshot.id : crypto.randomUUID(),
      };
      publications.set(key!, edition);
      return edition;
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
    assert.match(id, /^[0-9a-f-]{36}$/);
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
    // Publication can precede queue acknowledgement. Wait before removing it.
    for (let attempt = 0; attempt < 200; attempt++) {
      if ((await jobs.queue.getJob(id))?.finishedOn) break;
      await new Promise((resolve) => setTimeout(resolve, 10));
    }
    const acknowledged = await jobs.find(id);
    assert.equal(typeof acknowledged?.durationMs, 'number');
    assert.ok(acknowledged!.durationMs! >= 0);
    assert.equal(completed.error, null);
    assert.equal(keys[0], `on-demand:${id}`);
    // Model loss of completed Redis history and a reset job counter. The
    // publication key must remain unique and the old link must still recover.
    await (await jobs.queue.getJob(id))!.remove();
    await jobs.connection.set(jobs.queue.toKey('id'), '0');
    assert.equal((await jobs.find(id))?.editionId, snapshot.id);
    // A Redis read outage must not hide durable publications or failures.
    const failedId = crypto.randomUUID();
    await failures.record(failedId, 73);
    const getJob = jobs.queue.getJob.bind(jobs.queue);
    const outage = new Error('Redis unavailable fixture');
    jobs.queue.getJob = () => Promise.reject(outage);
    try {
      assert.equal((await jobs.find(id))?.editionId, snapshot.id);
      assert.deepEqual(await jobs.find(failedId), {
        id: failedId,
        state: 'failed',
        editionId: null,
        progress: null,
        durationMs: 73,
        error: 'Edition generation failed. Try again later.',
      });
      await assert.rejects(
        jobs.find(crypto.randomUUID()),
        (error) => error === outage,
      );
      assert.equal(calls, 1);
    } finally {
      jobs.queue.getJob = getJob;
    }
    // Redis can disappear after lookup, either during state inspection or
    // the terminal-field refresh. Both paths must retain the same recovery.
    for (const stage of ['state', 'refresh'] as const) {
      let reads = 0;
      jobs.queue.getJob = async (jobId) => {
        if (++reads > 1) throw outage;
        return {
          id: jobId,
          name: 'on-demand',
          getState: async () => {
            if (stage === 'state') throw outage;
            return 'completed';
          },
        } as NonNullable<Awaited<ReturnType<typeof getJob>>>;
      };
      try {
        assert.equal((await jobs.find(id))?.editionId, snapshot.id);
        reads = 0;
        assert.equal((await jobs.find(failedId))?.state, 'failed');
        reads = 0;
        await assert.rejects(
          jobs.find(crypto.randomUUID()),
          (error) => error === outage,
        );
        assert.equal(calls, 1);
      } finally {
        jobs.queue.getJob = getJob;
      }
    }
    // Pruning is a successful empty Redis read, not an outage. It can happen
    // before state inspection or before terminal fields are refreshed.
    for (const state of ['unknown', 'completed', 'failed'] as const) {
      let reads = 0;
      jobs.queue.getJob = async (jobId) => {
        if (++reads > 1) return undefined;
        return {
          id: jobId,
          name: 'on-demand',
          progress: 0,
          getState: async () => state,
        } as NonNullable<Awaited<ReturnType<typeof getJob>>>;
      };
      try {
        assert.equal((await jobs.find(id))?.editionId, snapshot.id);
        reads = 0;
        const recoveredFailure = await jobs.find(failedId);
        assert.equal(recoveredFailure?.state, 'failed');
        assert.equal(recoveredFailure?.durationMs, 73);
        reads = 0;
        // Without durable history, preserve the observed queue status.
        assert.equal((await jobs.find(crypto.randomUUID()))?.state, state);
        assert.equal(calls, 1);
      } finally {
        jobs.queue.getJob = getJob;
      }
    }
    // Numeric links issued before UUID IDs were introduced remain readable.
    publications.set('on-demand:123456789', snapshot);
    assert.equal((await jobs.find('123456789'))?.editionId, snapshot.id);
    const regenerated = await controller.enqueue(request);
    assert.notEqual(regenerated.id, id);
    const second = await waitFor(regenerated.id, 'completed');
    assert.notEqual(second.editionId, snapshot.id);
    assert.notEqual(keys[1], keys[0]);
    assert.equal((await jobs.find(id))?.editionId, snapshot.id);
    assert.equal(calls, 2);
    assert.equal(await jobs.find('999999999999'), null);
    await assert.rejects(controller.job('invalid'));
    await assert.rejects(controller.job('999999999999'));
    await worker.close();
    let publishBeforeFailure = false;
    let releaseAcknowledgement!: () => void;
    const acknowledgement = new Promise<void>((resolve) => {
      releaseAcknowledgement = resolve;
    });
    const failing = new Worker(
      jobs.queue.name,
      async (job) => {
        if (publishBeforeFailure) {
          publications.set(`on-demand:${job.id}`, snapshot);
          await acknowledgement;
        }
        throw new Error('private provider response');
      },
      { connection },
    );
    const reconciliationErrors: unknown[] = [];
    watchFailedOnDemandJobs(failing, failures, (error) =>
      reconciliationErrors.push(error),
    );
    try {
      const failed = await controller.enqueue(request);
      const status = await waitFor(failed.id, 'failed');
      assert.equal(status.editionId, null);
      assert.equal(status.error, 'Edition generation failed. Try again later.');
      assert.equal(JSON.stringify(status).includes('private'), false);
      // This worker bypasses the application catch, as a terminal stall does.
      // Wait for event persistence, without invoking the periodic scanner.
      for (
        let attempt = 0;
        !(await failures.find(failed.id)) && attempt < 100;
        attempt++
      )
        await new Promise((resolve) => setTimeout(resolve, 20));
      assert.deepEqual(await failures.find(failed.id), {
        durationMs: status.durationMs,
      });
      assert.deepEqual(reconciliationErrors, []);
      const failedJob = (await jobs.queue.getJob(failed.id))!;
      await reconcileFailedOnDemandJob(failures, failedJob);
      await reconcileFailedOnDemandJob(failures, failedJob);
      await failedJob.remove();
      const recovered = await controller.job(failed.id);
      assert.equal(recovered.state, 'failed');
      assert.equal(recovered.durationMs, status.durationMs);
      assert.equal(recovered.error, status.error);
      const retried = await controller.enqueue(request);
      assert.notEqual(retried.id, failed.id);
      await waitFor(retried.id, 'failed');
      // The queue can fail after publication commits but before completion is
      // acknowledged. The retained failure must still link to the saved edition.
      publishBeforeFailure = true;
      const published = await controller.enqueue(request);
      // Hold the real worker after publication, before either completion or
      // failure. The reader can open the edition while Redis still says active.
      const available = await waitFor(published.id, 'completed');
      assert.equal(
        await (await jobs.queue.getJob(published.id))!.getState(),
        'active',
      );
      assert.equal(available.editionId, snapshot.id);
      assert.equal(available.progress, null);
      assert.equal(available.durationMs, null);
      assert.equal(available.error, null);
      releaseAcknowledgement();
      for (let attempt = 0; attempt < 200; attempt++) {
        if ((await jobs.queue.getJob(published.id))?.finishedOn) break;
        await new Promise((resolve) => setTimeout(resolve, 10));
      }
      const publishedJob = (await jobs.queue.getJob(published.id))!;
      assert.equal(await publishedJob.getState(), 'failed');
      await reconcileFailedOnDemandJob(failures, publishedJob);
      assert.ok(await failures.find(published.id));
      const saved = await controller.job(published.id);
      assert.equal(saved.state, 'completed');
      assert.equal(saved.editionId, snapshot.id);
      assert.equal(saved.error, null);
      assert.ok(saved.durationMs! >= 0);
      await publishedJob.remove();
      assert.equal((await controller.job(published.id)).editionId, snapshot.id);
      assert.equal(calls, 2);
    } finally {
      releaseAcknowledgement();
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
    await failures.onModuleDestroy();
  }
});

void test('durable failures are idempotent, profile-scoped and preserve the original generation error', async () => {
  const failures = new PostgresEditionJobFailures();
  const { database } = await import('../src/libs/db/connections');
  const pool = database();
  const id = crypto.randomUUID();
  const foreignId = crypto.randomUUID();
  const foreignProfile = crypto.randomUUID();
  try {
    assert.equal(await failures.find(id), null);
    await failures.record(id, 42.4);
    await failures.record(id, 999);
    assert.deepEqual(await failures.find(id), { durationMs: 42 });
    await pool.query('INSERT INTO profiles(id,name) VALUES($1,$2)', [
      foreignProfile,
      'Failure isolation fixture',
    ]);
    await pool.query(
      'INSERT INTO edition_job_failures(job_id,profile_id,duration_ms) VALUES($1,$2,17)',
      [foreignId, foreignProfile],
    );
    assert.equal(await failures.find(foreignId), null);
    const original = new Error('generation fixture failed');
    await assert.rejects(
      generateOnDemandEdition(
        { generate: () => Promise.reject(original) },
        crypto.randomUUID(),
        {
          windowStart: '2000-01-01T00:00:00Z',
          windowEnd: '2000-01-02T00:00:00Z',
        },
        undefined,
        {
          record: () =>
            Promise.reject(new Error('database unavailable fixture')),
          find: () => Promise.resolve(null),
        },
      ),
      (error) => error === original,
    );
  } finally {
    await pool.query(
      'DELETE FROM edition_job_failures WHERE job_id = ANY($1::text[])',
      [[id, foreignId]],
    );
    await pool.query('DELETE FROM profiles WHERE id=$1', [foreignProfile]);
    await pool.end();
    await failures.onModuleDestroy();
  }
});
