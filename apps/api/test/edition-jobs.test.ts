import assert from 'node:assert/strict';
import { fork } from 'node:child_process';
import { once } from 'node:events';
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
import { PostgresEditionJobRequests } from '../src/modules/digests/database/edition-job-requests';
import { PreviewController } from '../src/modules/digests/digests.module';
import {
  type PreviewRepository,
  type ReportEditionProgress,
} from '../src/modules/digests/domain/preview.repository';

void test('async edition requests dedupe while active, publish once and allow later regeneration', async () => {
  const requestsHistory = new PostgresEditionJobRequests();
  const publications = new Map<string, DigestPreview>();
  const failures = new PostgresEditionJobFailures();
  const jobs = new BullEditionJobs(
    {
      async findByGenerationKey(key: string) {
        return publications.get(key) ?? null;
      },
    } as PreviewRepository,
    failures,
    requestsHistory,
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
    // A stalled worker can return to the queue after committing publication.
    // Simulate each nonterminal state without disrupting a live worker lock.
    for (const state of ['waiting', 'delayed', 'paused', 'waiting-children']) {
      const progress = { stage: 'triage', completed: 1, total: 2 };
      jobs.queue.getJob = async (jobId) =>
        ({
          id: jobId,
          name: 'on-demand',
          progress,
          getState: async () => state,
        }) as NonNullable<Awaited<ReturnType<typeof getJob>>>;
      try {
        const published = await jobs.find(id);
        assert.equal(published?.state, 'completed');
        assert.equal(published?.editionId, snapshot.id);
        assert.equal(published?.progress, null);
        assert.equal(published?.error, null);
        assert.equal(published?.durationMs, null);
        const pending = await jobs.find(crypto.randomUUID());
        assert.equal(pending?.state, state);
        assert.deepEqual(pending?.progress, progress);
        assert.equal(pending?.editionId, null);
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
    await requestsHistory.onModuleDestroy();
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

void test('accepted jobs lost before publication fail clearly, while Redis outages remain retryable', async () => {
  const requests = new PostgresEditionJobRequests();
  const failures = new PostgresEditionJobFailures();
  const jobs = new BullEditionJobs(
    {
      async findByGenerationKey() {
        return null;
      },
    } as unknown as PreviewRepository,
    failures,
    requests,
  );
  const getJob = jobs.queue.getJob.bind(jobs.queue);
  try {
    await jobs.queue.pause();
    const start = new Date('2026-10-01T00:00:00Z');
    const end = new Date('2026-10-02T00:00:00Z');
    const accepted = await jobs.enqueue(start, end);
    assert.ok(await requests.exists(accepted.id));
    // An acceptance-write failure must not return a link. A retry attaches to
    // the retained deduplicated job instead of creating another generation.
    const record = requests.record.bind(requests);
    requests.record = () =>
      Promise.reject(new Error('acceptance storage fixture'));
    await assert.rejects(
      jobs.enqueue(start, end),
      /acceptance storage fixture/,
    );
    requests.record = record;
    assert.equal((await jobs.enqueue(start, end)).id, accepted.id);
    assert.notEqual((await jobs.find(accepted.id))?.state, 'failed');
    const outage = new Error('Redis unavailable fixture');
    jobs.queue.getJob = () => Promise.reject(outage);
    await assert.rejects(jobs.find(accepted.id), (error) => error === outage);
    jobs.queue.getJob = getJob;
    const retained = (await jobs.queue.getJob(accepted.id))!;
    // A successful lookup can race removal before state inspection.
    jobs.queue.getJob = async () =>
      ({ ...retained, getState: async () => 'unknown' }) as typeof retained;
    assert.equal((await jobs.find(accepted.id))?.state, 'failed');
    jobs.queue.getJob = getJob;
    await retained.remove();
    assert.deepEqual(await jobs.find(accepted.id), {
      id: accepted.id,
      state: 'failed',
      editionId: null,
      progress: null,
      durationMs: null,
      error:
        'Edition job is no longer available. Create a new edition to try again.',
    });
    assert.equal(await jobs.find(crypto.randomUUID()), null);
    assert.equal(
      await jobs.queue.getJobCounts('wait').then((counts) => counts.wait),
      0,
    );
  } finally {
    jobs.queue.getJob = getJob;
    await jobs.queue.resume();
    await jobs.onModuleDestroy();
    await failures.onModuleDestroy();
    await requests.onModuleDestroy();
  }
});

void test('accepted job history is idempotent and profile-scoped', async () => {
  const requests = new PostgresEditionJobRequests();
  const { database } = await import('../src/libs/db/connections');
  const pool = database();
  const id = crypto.randomUUID();
  const foreignId = crypto.randomUUID();
  const foreignProfile = crypto.randomUUID();
  try {
    assert.equal(await requests.exists(id), false);
    await requests.record(id);
    await requests.record(id);
    assert.equal(await requests.exists(id), true);
    await pool.query('INSERT INTO profiles(id,name) VALUES($1,$2)', [
      foreignProfile,
      'Request isolation fixture',
    ]);
    await pool.query(
      'INSERT INTO edition_job_requests(job_id,profile_id) VALUES($1,$2)',
      [foreignId, foreignProfile],
    );
    assert.equal(await requests.exists(foreignId), false);
  } finally {
    await pool.query(
      'DELETE FROM edition_job_requests WHERE job_id = ANY($1::text[])',
      [[id, foreignId]],
    );
    await pool.query('DELETE FROM profiles WHERE id=$1', [foreignProfile]);
    await pool.end();
    await requests.onModuleDestroy();
  }
});

void test(
  'a killed worker is recovered by a replacement without losing the accepted edition link',
  { timeout: 60000 },
  async () => {
    const requests = new PostgresEditionJobRequests();
    const failures = new PostgresEditionJobFailures();
    const publications = new Map<string, DigestPreview>();
    const jobs = new BullEditionJobs(
      {
        async findByGenerationKey(key: string) {
          return publications.get(key) ?? null;
        },
      } as PreviewRepository,
      failures,
      requests,
    );
    const child = fork(
      new URL('./fixtures/workers/stalled-edition.mjs', import.meta.url),
      [],
      {
        execArgv: [],
        stdio: ['ignore', 'ignore', 'inherit', 'ipc'],
      },
    );
    const exited = once(child, 'exit');
    const started = once(child, 'message', {
      signal: AbortSignal.timeout(8000),
    });
    const connection = jobs.connection.duplicate({
      maxRetriesPerRequest: null,
    });
    let replacement: Worker | undefined;
    let acceptedId: string | undefined;
    let calls = 0;
    const snapshot: DigestPreview = {
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      windowStart: '2026-09-01T00:00:00.000Z',
      windowEnd: '2026-09-02T00:00:00.000Z',
      method: 'signals-v6',
      topics: [],
    };
    try {
      const accepted = await jobs.enqueue(
        new Date(snapshot.windowStart),
        new Date(snapshot.windowEnd),
      );
      acceptedId = accepted.id;
      const [message] = await started;
      assert.deepEqual(message, { id: accepted.id });
      assert.equal((await jobs.find(accepted.id))?.state, 'active');
      assert.ok(await requests.exists(accepted.id));
      child.kill('SIGKILL');
      const [, signal] = await exited;
      assert.equal(signal, 'SIGKILL');
      replacement = new Worker(
        jobs.queue.name,
        (job) =>
          generateOnDemandEdition(
            {
              async generate(_start: Date, _end: Date, key?: string) {
                calls++;
                publications.set(key!, snapshot);
                return snapshot;
              },
            },
            job.id!,
            job.data,
          ),
        {
          connection,
          lockDuration: 500,
          stalledInterval: 100,
        },
      );
      let completed = false;
      // Earlier workers may leave BullMQ's default 30-second stalled-check lease.
      const deadline = Date.now() + 45000;
      while (Date.now() < deadline) {
        const job = await jobs.queue.getJob(accepted.id);
        if ((await job?.getState()) === 'completed') {
          completed = true;
          break;
        }
        await new Promise((resolve) => setTimeout(resolve, 10));
      }
      assert.ok(completed, 'replacement worker must recover the expired lock');
      assert.equal(calls, 1);
      assert.equal((await jobs.find(accepted.id))?.editionId, snapshot.id);
      await (await jobs.queue.getJob(accepted.id))!.remove();
      const recovered = await jobs.find(accepted.id);
      assert.equal(recovered?.state, 'completed');
      assert.equal(recovered?.editionId, snapshot.id);
      assert.equal(calls, 1);
    } finally {
      child.kill('SIGKILL');
      await exited;
      await replacement?.close();
      if (acceptedId) await (await jobs.queue.getJob(acceptedId))?.remove();
      await connection.quit();
      await jobs.onModuleDestroy();
      await failures.onModuleDestroy();
      await requests.onModuleDestroy();
    }
  },
);

void test('system job history reads all ownership and retains rollback-compatible writes', async () => {
  assert.equal(process.env.NEWS_DIGEST_ISOLATED_TEST, '1');
  const { database } = await import('../src/libs/db/connections');
  const pool = database();
  const requests = new PostgresEditionJobRequests();
  const failures = new PostgresEditionJobFailures();
  const originalFlag = process.env.SYSTEM_OWNERSHIP;
  const owner = '00000000-0000-4000-8000-000000000001';
  const foreignProfile = crypto.randomUUID();
  const ids = [crypto.randomUUID(), crypto.randomUUID(), crypto.randomUUID()];
  try {
    await pool.query('INSERT INTO profiles(id,name) VALUES($1,$2)', [
      foreignProfile,
      'System job fixture',
    ]);
    for (const [index, profile] of [null, foreignProfile].entries()) {
      await pool.query(
        'INSERT INTO edition_job_requests(job_id,profile_id) VALUES($1,$2)',
        [ids[index], profile],
      );
      await pool.query(
        'INSERT INTO edition_job_failures(job_id,profile_id,duration_ms) VALUES($1,$2,$3)',
        [ids[index], profile, 10 + index],
      );
    }
    delete process.env.SYSTEM_OWNERSHIP;
    for (const id of ids) {
      assert.equal(await requests.exists(id), false);
      assert.equal(await failures.find(id), null);
    }
    process.env.SYSTEM_OWNERSHIP = '1';
    for (const [index, id] of ids.slice(0, 2).entries()) {
      assert.equal(await requests.exists(id), true);
      assert.deepEqual(await failures.find(id), { durationMs: 10 + index });
      await requests.record(id);
      await failures.record(id, 999);
      assert.deepEqual(await failures.find(id), { durationMs: 10 + index });
    }
    assert.equal(await requests.exists(ids[2]), false);
    assert.equal(await failures.find(ids[2]), null);
    await requests.record(ids[2]);
    await failures.record(ids[2], 42.4);
    const ownership = await pool.query(
      'SELECT profile_id FROM edition_job_requests WHERE job_id=$1 UNION ALL SELECT profile_id FROM edition_job_failures WHERE job_id=$1',
      [ids[2]],
    );
    assert.deepEqual(ownership.rows, [
      { profile_id: owner },
      { profile_id: owner },
    ]);
    delete process.env.SYSTEM_OWNERSHIP;
    assert.equal(await requests.exists(ids[2]), true);
    assert.deepEqual(await failures.find(ids[2]), { durationMs: 42 });
    for (const id of ids.slice(0, 2)) {
      assert.equal(await requests.exists(id), false);
      assert.equal(await failures.find(id), null);
    }
    const preserved = await pool.query(
      'SELECT profile_id FROM edition_job_requests WHERE job_id=$1 UNION ALL SELECT profile_id FROM edition_job_failures WHERE job_id=$1',
      [ids[1]],
    );
    assert.deepEqual(preserved.rows, [
      { profile_id: foreignProfile },
      { profile_id: foreignProfile },
    ]);
  } finally {
    if (originalFlag === undefined) delete process.env.SYSTEM_OWNERSHIP;
    else process.env.SYSTEM_OWNERSHIP = originalFlag;
    await pool.query(
      'DELETE FROM edition_job_failures WHERE job_id = ANY($1::text[])',
      [ids],
    );
    await pool.query(
      'DELETE FROM edition_job_requests WHERE job_id = ANY($1::text[])',
      [ids],
    );
    await pool.query('DELETE FROM profiles WHERE id=$1', [foreignProfile]);
    await Promise.all([
      pool.end(),
      requests.onModuleDestroy(),
      failures.onModuleDestroy(),
    ]);
  }
});
