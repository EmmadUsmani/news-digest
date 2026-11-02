import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { test } from 'node:test';

import { operationsStatusSchema } from '@digest/contracts';
import { Worker } from 'bullmq';

import { OperationsStatus } from '../src/modules/operations/adapters/operations.status';

void test('operations preserves healthy telemetry when one queue is unavailable and reports pause and schedule state', async (t) => {
  assert.equal(process.env.NEWS_DIGEST_ISOLATED_TEST, '1');
  const status = new OperationsStatus();
  const unavailable = status.queues.find(
    (queue) => queue.name === 'ingestion',
  )!;
  const scheduled = status.queues.find(
    (queue) => queue.name === 'digest-generation',
  )!;
  const schedulerId = `status-${randomUUID()}`;
  try {
    await scheduled.pause();
    await scheduled.upsertJobScheduler(
      schedulerId,
      { pattern: '0 7 * * *', tz: 'America/Los_Angeles' },
      { name: 'scheduled', data: { secret: 'must-not-expose' } },
    );
    const scheduler = await scheduled.getJobScheduler(schedulerId);
    assert.ok(scheduler?.next);
    // Queues share Redis, so closing a Queue does not model a failed command.
    t.mock.method(unavailable, 'getJobCounts', async () => {
      throw new Error('fixture queue command failure');
    });
    const result = operationsStatusSchema.parse(
      JSON.parse(JSON.stringify(await status.read())),
    );
    assert.deepEqual(
      result.queues.find((queue) => queue.name === unavailable.name),
      {
        name: 'ingestion',
        available: false,
        workers: 0,
        paused: false,
        counts: {},
        runs: [],
        nextRun: null,
      },
    );
    const healthy = result.queues.filter(
      (queue) => queue.name !== unavailable.name,
    );
    assert.equal(healthy.length, 3);
    assert.ok(healthy.every((queue) => queue.available));
    const digest = healthy.find((queue) => queue.name === scheduled.name)!;
    assert.equal(digest.paused, true);
    assert.equal(digest.nextRun, new Date(scheduler.next).toISOString());
    assert.ok(result.sources.length >= 7);
    assert.ok(result.coverage && result.coverage.topics.length > 0);
    assert.equal(JSON.stringify(result).includes('must-not-expose'), false);
    await scheduled.resume();
    await scheduled.removeJobScheduler(schedulerId);
    const recovered = operationsStatusSchema
      .parse(JSON.parse(JSON.stringify(await status.read())))
      .queues.find((queue) => queue.name === scheduled.name)!;
    assert.equal(recovered.paused, false);
    assert.equal(recovered.nextRun, null);
  } finally {
    await scheduled.removeJobScheduler(schedulerId);
    await scheduled.resume();
    await scheduled.obliterate({ force: true });
    await status.onModuleDestroy();
  }
});

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

void test('edition run duration excludes queue wait and is null before processing finishes', async () => {
  const status = new OperationsStatus();
  const queue = status.queues.find(
    (queue) => queue.name === 'digest-generation',
  )!;
  const connection = status.connection.duplicate({
    maxRetriesPerRequest: null,
  });
  const worker = new Worker(
    queue.name,
    async () => ({ editionId: 'saved-edition' }),
    {
      connection,
      autorun: false,
    },
  );
  try {
    const job = await queue.add('on-demand', {}, { delay: 60000 });
    const readRuns = async () =>
      operationsStatusSchema
        .parse(JSON.parse(JSON.stringify(await status.read())))
        .queues.find((queue) => queue.name === 'digest-generation')!.runs;
    const waiting = (await readRuns()).find((run) => run.id === job.id)!;
    assert.equal(waiting.startedAt, null);
    assert.equal(waiting.durationMs, null);
    const completed = new Promise<void>((resolve, reject) => {
      worker.once('completed', () => resolve());
      worker.once('failed', (_job, error) => reject(error));
    });
    await job.promote();
    void worker.run();
    await completed;
    const stored = (await queue.getJob(job.id!))!;
    const finished = (await readRuns()).find((run) => run.id === job.id)!;
    assert.equal(
      finished.startedAt,
      new Date(stored.processedOn!).toISOString(),
    );
    assert.equal(finished.durationMs, stored.finishedOn! - stored.processedOn!);
    assert.equal(finished.editionId, 'saved-edition');
    assert.equal(finished.scheduledAt, null);
    assert.equal(finished.state, 'completed');
  } finally {
    await worker.close();
    await connection.quit();
    await queue.obliterate({ force: true });
    await status.onModuleDestroy();
  }
});

void test('operations source telemetry follows current connections and retains persisted observations and errors', async () => {
  const status = new OperationsStatus();
  const topic = randomUUID();
  const other = randomUUID();
  const prefix = `operations-${topic}`;
  const source = `${prefix}-a`;
  const empty = `${prefix}-z`;
  const url = `https://example.org/${prefix}`;
  const read = async () => {
    const result = operationsStatusSchema.parse(
      JSON.parse(JSON.stringify(await status.read())),
    );
    const rows = result.sources.filter((row) => row.id.startsWith(prefix));
    assert.deepEqual(
      rows.map((row) => row.id),
      [source, empty],
    );
    return rows;
  };
  try {
    for (const id of [topic, other]) {
      await status.db.query(
        `INSERT INTO topics(id,profile_id,name,description,include_guidance,position)
        SELECT $1,id,'Operations fixture','','',100 FROM profiles LIMIT 1`,
        [id],
      );
    }
    for (const [id, name] of [
      [source, 'Operations A'],
      [empty, 'Operations Z'],
    ]) {
      await status.db.query(
        `INSERT INTO content_sources(id,topic_id,name,kind,url)
        VALUES($1,$2,$3,'feed',$4)`,
        [id, topic, name, `${url}/${id}`],
      );
    }
    let rows = await read();
    assert.equal(rows[0].active, false);
    assert.equal(rows[0].storedItems, 0);
    assert.equal(rows[0].lastAttempt, null);
    assert.equal(rows[0].lastSuccess, null);
    assert.equal(rows[0].error, null);
    await status.db.query(
      `INSERT INTO topic_source_connections(topic_id,source_id) VALUES($1,$3),($2,$3)`,
      [topic, other, source],
    );
    await status.db.query(
      `INSERT INTO content_items(canonical_url,title,excerpt,published_at)
      VALUES($1,'Shared fixture','','2035-01-01T12:00:00Z'),($2,'Second fixture','','2035-01-01T13:00:00Z')`,
      [url, `${url}/2`],
    );
    await status.db.query(
      `INSERT INTO content_observations(source_id,item_id)
      SELECT $1,id FROM content_items WHERE canonical_url IN ($2,$3)`,
      [source, url, `${url}/2`],
    );
    await status.db.query(
      `UPDATE content_sources SET last_attempt='2035-01-02T12:00:00+05:30',
      last_success='2035-01-01T12:00:00+05:30',last_error='fixture fetch failure',last_item_count=7 WHERE id=$1`,
      [source],
    );
    rows = await read();
    assert.equal(rows[0].active, true);
    assert.equal(rows[0].storedItems, 2);
    assert.equal(rows[0].lastItemCount, 7);
    assert.equal(rows[0].lastAttempt, '2035-01-02T06:30:00.000Z');
    assert.equal(rows[0].lastSuccess, '2035-01-01T06:30:00.000Z');
    assert.equal(rows[0].error, 'fixture fetch failure');
    assert.equal(rows[1].storedItems, 0);
    await status.db.query('UPDATE topics SET enabled=false WHERE id=$1', [
      topic,
    ]);
    assert.equal((await read())[0].active, true);
    await status.db.query(
      'DELETE FROM topic_source_connections WHERE topic_id=$1',
      [other],
    );
    rows = await read();
    assert.equal(rows[0].active, false);
    assert.equal(rows[0].storedItems, 2);
    await status.db.query('UPDATE topics SET enabled=true WHERE id=$1', [
      topic,
    ]);
    assert.equal((await read())[0].active, true);
    await status.db.query(
      'DELETE FROM topic_source_connections WHERE topic_id=$1',
      [topic],
    );
    rows = await read();
    assert.equal(rows[0].active, false);
    assert.equal(rows[0].storedItems, 2);
    assert.equal(rows[0].error, 'fixture fetch failure');
  } finally {
    await status.db.query(
      'DELETE FROM content_observations WHERE source_id IN ($1,$2)',
      [source, empty],
    );
    await status.db.query('DELETE FROM content_sources WHERE id IN ($1,$2)', [
      source,
      empty,
    ]);
    await status.db.query(
      'DELETE FROM content_items WHERE canonical_url IN ($1,$2)',
      [url, `${url}/2`],
    );
    await status.db.query('DELETE FROM topics WHERE id IN ($1,$2)', [
      topic,
      other,
    ]);
    await status.onModuleDestroy();
  }
});
