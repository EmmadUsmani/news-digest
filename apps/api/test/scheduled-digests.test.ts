import assert from 'node:assert/strict';
import { fork } from 'node:child_process';
import { once } from 'node:events';
import { test } from 'node:test';

import { Queue, QueueEvents, Worker } from 'bullmq';

import { redis } from '../src/libs/db/connections';
import { llmConfig } from '../src/modules/curation/adapters/config';
import { BudgetedLlm } from '../src/modules/curation/application/budgeted-llm';
import { ShortlistEditor } from '../src/modules/curation/application/editor';
import { CandidateTriage } from '../src/modules/curation/application/triage';
import { PostgresLlmLedger } from '../src/modules/curation/database/llm.ledger';
import { PostgresScheduledBudgetRepository } from '../src/modules/curation/database/scheduled-budget.repository';
import { PostgresPreviewRepository } from '../src/modules/digests/database/preview.repository';
import type { DigestPublished } from '../src/modules/digests/domain/digest-published';
import { ReaderEditionController } from '../src/modules/digests/reader-edition.controller';
import { PostgresProfileRepository } from '../src/modules/profiles/database/profile.repository';
import { coverageWindow } from '../src/modules/profiles/domain/schedule';
import { scheduledSlot } from '../src/modules/profiles/domain/scheduled-slot';
import { PostgresXDiscoveryLedger } from '../src/modules/social/database/x-discovery.ledger';
import { PostgresXSearchRepository } from '../src/modules/social/database/x-search.repository';
import { XSearchError } from '../src/modules/social/domain/x-search.port';
import { runScheduledBudgetAttempt } from '../src/scheduled-budget-attempt';
import { runScheduledXRuntime } from '../src/scheduled-x-runtime';

void test('concurrent scheduled retries return one immutable snapshot; manual regeneration stays versioned', async () => {
  const events: DigestPublished[] = [];
  const repository = new PostgresPreviewRepository({
    async published(event) {
      // Read through another connection: notification must follow COMMIT.
      assert.ok(await repository.find(event.editionId));
      events.push(event);
    },
  });
  // This isolated characterization must never make paid external calls,
  // including when the developer has loaded the configured service environment.
  Object.defineProperty(repository, 'editorial', { value: null });
  const end = new Date(),
    start = new Date(end.getTime() - 86400000);
  const key = `integration:${crypto.randomUUID()}`;
  try {
    // Synthetic content exists only in the disposable test database.
    const itemId = crypto.randomUUID();
    await repository.db.query(
      `INSERT INTO content_items(id,canonical_url,title,excerpt,published_at,image_url)
       VALUES($1,$2,'New AI developer tool released','Synthetic test excerpt',$3,'https://example.org/image.jpg')`,
      [itemId, `https://example.org/${itemId}`, new Date(end.getTime() - 1000)],
    );
    await repository.db.query(
      "INSERT INTO content_observations(item_id,source_id) VALUES($1,'hn')",
      [itemId],
    );
    const [first, retry] = await Promise.all([
      repository.generate(start, end, key),
      repository.generate(start, end, key),
    ]);
    assert.deepEqual(first, retry);
    assert.ok(
      first.topics.some((topic) =>
        topic.stories.some((story) => story.id === itemId),
      ),
    );
    for (const story of first.topics.flatMap((topic) => topic.stories)) {
      const stored = (
        await repository.db.query(
          'SELECT image_url FROM content_items WHERE id=$1',
          [story.id],
        )
      ).rows[0].image_url;
      assert.equal(
        story.imageUrl,
        stored?.startsWith('https:') ? stored : null,
      );
    }
    const laterRetry = await repository.generate(
      new Date(start.getTime() - 3600000),
      end,
      key,
    );
    assert.deepEqual(laterRetry, first);
    const manual = await repository.generate(start, end);
    assert.notEqual(manual.id, first.id);
    assert.deepEqual(
      events,
      [first, manual].map((edition) => ({
        type: 'DigestPublished',
        editionId: edition.id,
        profileId: '00000000-0000-4000-8000-000000000001',
        publishedAt: edition.createdAt,
        windowStart: edition.windowStart,
        windowEnd: edition.windowEnd,
      })),
    );
    assert.deepEqual(await repository.find(first.id), first);
    assert.equal(
      (
        await repository.db.query(
          'SELECT count(*)::int AS count FROM digest_previews WHERE scheduled_key=$1',
          [key],
        )
      ).rows[0].count,
      1,
    );
  } finally {
    await repository.onModuleDestroy();
  }
});

void test(
  'failed scheduled publication rolls back and releases its lock for an independent retry',
  { timeout: 15000 },
  async () => {
    assert.equal(process.env.NEWS_DIGEST_ISOLATED_TEST, '1');
    const events: DigestPublished[] = [];
    const notifications = {
      async published(event: DigestPublished) {
        events.push(event);
      },
    };
    const failed = new PostgresPreviewRepository(notifications);
    const retry = new PostgresPreviewRepository(notifications);
    for (const repository of [failed, retry]) {
      Object.defineProperty(repository, 'editorial', { value: null });
    }
    const end = new Date('2026-11-02T00:00:00Z');
    const start = new Date('2026-11-01T00:00:00Z');
    const key = `integration:failed-publication:${crypto.randomUUID()}`;
    const failure = new Error('Synthetic publication progress failure');
    const before = await retry.history(0);
    let reachedPublication = false;
    try {
      await assert.rejects(
        failed.generate(start, end, key, async (progress) => {
          if (progress.stage === 'publishing') {
            reachedPublication = true;
            throw failure;
          }
        }),
        (error) => error === failure,
      );
      assert.equal(reachedPublication, true);
      assert.equal(events.length, 0);
      assert.deepEqual(await retry.history(0), before);
      assert.equal(
        (
          await retry.db.query(
            'SELECT count(*)::int AS count FROM digest_previews WHERE scheduled_key=$1',
            [key],
          )
        ).rows[0].count,
        0,
      );

      // A separate pool must acquire the released session lock. Concurrent retries
      // then converge on the same immutable publication rather than duplicate it.
      const [published, duplicate] = await Promise.all([
        retry.generate(start, end, key),
        failed.generate(start, end, key),
      ]);
      assert.deepEqual(duplicate, published);
      assert.equal(events.length, 1);
      assert.equal(events[0].editionId, published.id);
      assert.deepEqual(await retry.find(published.id), published);
      assert.equal(
        (
          await retry.db.query(
            'SELECT count(*)::int AS count FROM digest_previews WHERE scheduled_key=$1',
            [key],
          )
        ).rows[0].count,
        1,
      );
    } finally {
      await Promise.all([failed.onModuleDestroy(), retry.onModuleDestroy()]);
    }
  },
);

void test(
  'morning rehearsal: worker absent across scheduled time publishes once on return',
  { timeout: 20000, skip: process.env.MORNING_REHEARSAL_CASE !== 'absent' },
  async () => {
    assert.equal(process.env.NEWS_DIGEST_ISOLATED_TEST, '1');
    assert.equal(process.env.ANTHROPIC_API_KEY, '');
    assert.equal(process.env.XAI_API_KEY, '');
    const connection = redis();
    const workerConnection = connection.duplicate({
      maxRetriesPerRequest: null,
    });
    const eventConnection = connection.duplicate({
      maxRetriesPerRequest: null,
    });
    const name = `morning-rehearsal-${crypto.randomUUID()}`;
    const queue = new Queue(name, { connection });
    const events = new QueueEvents(name, { connection: eventConnection });
    const publications: DigestPublished[] = [];
    const repository = new PostgresPreviewRepository({
      async published(event) {
        publications.push(event);
      },
    });
    // The existing non-AI adapter path makes no provider calls.
    Object.defineProperty(repository, 'editorial', { value: null });
    const budgets = new PostgresScheduledBudgetRepository(repository.db);
    let worker: Worker | undefined;
    let runId: string | undefined;
    let itemId: string | undefined;
    try {
      await events.waitUntilReady();
      itemId = crypto.randomUUID();
      await repository.db.query(
        `INSERT INTO content_items(id,canonical_url,title,excerpt,published_at)
      VALUES($1,$2,'New AI developer tool released','Synthetic recovery report with readable source text',$3)`,
        [itemId, `https://example.org/${itemId}`, new Date(Date.now() - 10000)],
      );
      await repository.db.query(
        "INSERT INTO content_observations(item_id,source_id) VALUES($1,'hn')",
        [itemId],
      );
      const scheduled = await queue.upsertJobScheduler(
        'morning',
        { pattern: '* * * * * *', limit: 1, startDate: Date.now() + 1000 },
        { name: 'generate', data: {}, opts: { attempts: 3 } },
      );
      assert.ok(scheduled);
      const timestamp = scheduled.opts.prevMillis;
      assert.ok(timestamp);
      runId = `00000000-0000-4000-8000-000000000001:${timestamp}`;
      await budgets.register(new Date(timestamp), runId);
      // No worker exists until after the due time; Redis retains the scheduled job.
      await new Promise((resolve) =>
        setTimeout(resolve, Math.max(0, timestamp - Date.now()) + 100),
      );
      assert.equal(await queue.getActiveCount(), 0);
      assert.equal(publications.length, 0);
      assert.equal(
        (await budgets.read(new Date(timestamp).toISOString().slice(0, 10)))
          ?.state,
        'pending',
      );
      worker = new Worker(
        name,
        async (job) => {
          const slot = scheduledSlot(job.opts.prevMillis, Date.now());
          assert.ok(slot.ok);
          assert.equal(slot.value.skip, undefined);
          const window = coverageWindow(new Date(slot.value.timestamp), 'P1D');
          assert.ok(window.ok);
          const edition = await runScheduledBudgetAttempt(
            budgets,
            new Date(timestamp),
            runId!,
            job.attemptsStarted,
            job.attemptsMade,
            job.opts.attempts ?? 1,
            () =>
              repository.generate(
                window.value.windowStart,
                window.value.windowEnd,
                runId,
              ),
          );
          return { editionId: edition.id };
        },
        { connection: workerConnection },
      );
      const result = await scheduled.waitUntilFinished(events, 10000);
      assert.equal(publications.length, 1);
      const page = await new ReaderEditionController(repository).find(
        result.editionId,
      );
      assert.ok(
        page.topics.some((topic) =>
          topic.stories.some(
            (story) =>
              story.id === itemId &&
              story.summary.includes('Synthetic recovery report'),
          ),
        ),
      );
      assert.equal(page.windowEnd, new Date(timestamp).toISOString());
      assert.equal(
        (
          await repository.db.query(
            'SELECT count(*)::int AS count FROM digest_previews WHERE scheduled_key=$1',
            [runId],
          )
        ).rows[0].count,
        1,
      );
      assert.equal(
        (
          await repository.db.query(
            'SELECT count(*)::int AS count FROM llm_calls WHERE run_id=$1',
            [result.editionId],
          )
        ).rows[0].count,
        0,
      );
      assert.equal(
        (await budgets.read(new Date(timestamp).toISOString().slice(0, 10)))
          ?.state,
        'succeeded',
      );
      assert.equal(await queue.getCompletedCount(), 1);
    } finally {
      await worker?.close();
      await events.close();
      await queue.obliterate({ force: true });
      await queue.close();
      await Promise.all([
        connection.quit(),
        workerConnection.quit(),
        eventConnection.quit(),
      ]);
      // The disposable database owns fixture rows, including immutable editions.
      await repository.onModuleDestroy();
    }
  },
);

void test(
  'morning rehearsal: SIGKILL during publication recovers one readable edition',
  { timeout: 25000, skip: process.env.MORNING_REHEARSAL_CASE !== 'dies' },
  async () => {
    assert.equal(process.env.NEWS_DIGEST_ISOLATED_TEST, '1');
    assert.equal(process.env.ANTHROPIC_API_KEY, '');
    assert.equal(process.env.XAI_API_KEY, '');
    const connection = redis();
    const workerConnection = connection.duplicate({
      maxRetriesPerRequest: null,
    });
    const eventConnection = connection.duplicate({
      maxRetriesPerRequest: null,
    });
    const name = `dying-worker-${crypto.randomUUID()}`;
    const queue = new Queue(name, { connection });
    const events = new QueueEvents(name, { connection: eventConnection });
    const publications: DigestPublished[] = [];
    const repository = new PostgresPreviewRepository({
      async published(event) {
        publications.push(event);
      },
    });
    Object.defineProperty(repository, 'editorial', { value: null });
    const budgets = new PostgresScheduledBudgetRepository(repository.db);
    const end = new Date('2026-10-29T15:00:00Z');
    const runId = `00000000-0000-4000-8000-000000000001:${end.getTime()}`;
    let replacement: Worker | undefined;
    const child = fork('apps/api/test/fixtures/rehearsal/dying-worker.ts', [], {
      execArgv: ['--import', 'tsx'],
      env: { ...process.env, REHEARSAL_QUEUE: name },
      stdio: ['ignore', 'ignore', 'pipe', 'ipc'],
    });
    let childErrors = '';
    child.stderr?.on('data', (chunk) => {
      childErrors += String(chunk).slice(0, 1000);
    });
    const exited = once(child, 'exit');
    try {
      await events.waitUntilReady();
      const itemId = crypto.randomUUID();
      await repository.db.query(
        `INSERT INTO content_items(id,canonical_url,title,excerpt,published_at)
         VALUES($1,$2,'New AI developer tool released','Synthetic mid-run recovery source text',$3)`,
        [
          itemId,
          `https://example.org/${itemId}`,
          new Date(end.getTime() - 1000),
        ],
      );
      await repository.db.query(
        "INSERT INTO content_observations(item_id,source_id) VALUES($1,'hn')",
        [itemId],
      );
      await budgets.register(end, runId);
      const reached = once(child, 'message');
      const job = await queue.add(
        'generate',
        { timestamp: end.getTime(), runId },
        { attempts: 3 },
      );
      const message = await Promise.race([
        reached,
        exited.then(() => {
          throw new Error(`Worker exited before publication: ${childErrors}`);
        }),
      ]);
      assert.equal(message[0], 'publishing');
      assert.equal((await budgets.read('2026-10-29'))?.state, 'running');
      assert.equal(publications.length, 0);
      child.kill('SIGKILL');
      assert.equal((await exited)[1], 'SIGKILL');
      replacement = new Worker(
        name,
        async (retry) => {
          const edition = await runScheduledBudgetAttempt(
            budgets,
            end,
            runId,
            retry.attemptsStarted,
            retry.attemptsMade,
            retry.opts.attempts ?? 1,
            () =>
              repository.generate(
                new Date(end.getTime() - 86400000),
                end,
                runId,
              ),
          );
          return { editionId: edition.id };
        },
        {
          connection: workerConnection,
          lockDuration: 1000,
          stalledInterval: 1000,
        },
      );
      const result = await job.waitUntilFinished(events, 15000);
      assert.equal(publications.length, 1);
      const page = await new ReaderEditionController(repository).find(
        result.editionId,
      );
      assert.equal(page.windowEnd, end.toISOString());
      assert.ok(
        page.topics.some((topic) =>
          topic.stories.some(
            (story) =>
              story.id === itemId &&
              story.summary.includes('Synthetic mid-run recovery'),
          ),
        ),
      );
      assert.equal((await budgets.read('2026-10-29'))?.state, 'succeeded');
      assert.equal((await budgets.read('2026-10-29'))?.attempt, 2);
      assert.equal(
        (
          await repository.db.query(
            'SELECT count(*)::int AS count FROM digest_previews WHERE scheduled_key=$1',
            [runId],
          )
        ).rows[0].count,
        1,
      );
      assert.equal(
        (
          await repository.db.query(
            'SELECT count(*)::int AS count FROM llm_calls WHERE run_id=$1',
            [result.editionId],
          )
        ).rows[0].count,
        0,
      );
      assert.equal((await queue.getJob(job.id!))?.attemptsStarted, 2);
      assert.equal(await queue.getCompletedCount(), 1);
    } finally {
      if (child.exitCode === null && child.signalCode === null)
        child.kill('SIGKILL');
      await exited;
      await replacement?.close();
      await events.close();
      await queue.obliterate({ force: true });
      await queue.close();
      await Promise.all([
        connection.quit(),
        workerConnection.quit(),
        eventConnection.quit(),
      ]);
      await repository.onModuleDestroy();
    }
  },
);

for (const failure of ['anthropic', 'x'] as const)
  void test(
    `morning rehearsal: ${failure === 'anthropic' ? 'Anthropic outage' : 'all X searches fail'} publishes one readable non-AI edition`,
    { timeout: 20000, skip: process.env.MORNING_REHEARSAL_CASE !== failure },
    async () => {
      assert.equal(process.env.NEWS_DIGEST_ISOLATED_TEST, '1');
      assert.equal(process.env.ANTHROPIC_API_KEY, '');
      assert.equal(process.env.XAI_API_KEY, '');
      const connection = redis();
      const workerConnection = connection.duplicate({
        maxRetriesPerRequest: null,
      });
      const eventConnection = connection.duplicate({
        maxRetriesPerRequest: null,
      });
      const name = `morning-rehearsal-${crypto.randomUUID()}`;
      const queue = new Queue(name, { connection });
      const events = new QueueEvents(name, { connection: eventConnection });
      const publications: DigestPublished[] = [];
      const repository = new PostgresPreviewRepository({
        async published(event) {
          publications.push(event);
        },
      });
      const config = llmConfig({});
      const ledger = new PostgresLlmLedger(repository.db, config.caps);
      let providerAttempts = 0;
      const llm = new BudgetedLlm(
        {
          async complete() {
            providerAttempts++;
            throw new Error('Synthetic Anthropic transport outage');
          },
        },
        ledger,
      );
      Object.defineProperty(repository, 'editorial', {
        value: {
          triage: new CandidateTriage(llm, ledger, config.haiku),
          editor: new ShortlistEditor(llm, config.sonnet, config.haiku),
          socialTriage: new CandidateTriage(
            llm,
            ledger,
            config.haiku,
            'social',
          ),
          grouping: null,
          validationDiagnostics: () => llm.validationDiagnostics(),
        },
      });
      if (failure === 'x')
        Object.defineProperty(repository, 'editorial', { value: null });
      const budgets = new PostgresScheduledBudgetRepository(repository.db);
      let worker: Worker | undefined;
      let runId: string | undefined;
      let itemId: string | undefined;
      let xCalls: unknown[] = [];
      try {
        if (failure === 'x') {
          const profiles = new PostgresProfileRepository();
          try {
            const profile = await profiles.getDefault();
            const xLedger = new PostgresXDiscoveryLedger(repository.db);
            const searches = new PostgresXSearchRepository(repository.db);
            const day = new Date().toISOString().slice(0, 10);
            const instant = new Date(`${day}T14:30:00Z`);
            const topics = await searches.scheduledTopics(instant);
            assert.equal(topics.length, 5);
            const attempts: string[] = [];
            const execute = () =>
              runScheduledXRuntime(
                {
                  profile: async () => ({
                    ...profile,
                    schedule: {
                      ...profile.schedule,
                      cadence: '0 15 * * *',
                      timezone: 'UTC',
                    },
                  }),
                  searches,
                  ledger: xLedger,
                  search: {
                    async search(request) {
                      attempts.push(request.topic);
                      throw new XSearchError('rejected');
                    },
                  },
                  verify: async () => {
                    throw new Error('Failed searches must not verify posts');
                  },
                  fixed: {
                    enabled: () => true,
                    settings: async () => ({
                      reactionMinFaves: 100,
                      trendingMinFaves: 1000,
                      exclusions: [],
                    }),
                    availableMicros: async () =>
                      (await xLedger.status()).availableMicros,
                  },
                },
                () => instant,
              );
            await execute();
            assert.deepEqual(
              [...attempts].sort(),
              topics.map((topic) => topic.name).sort(),
            );
            xCalls = (
              await repository.db.query(
                'SELECT id,status,cost_micros,reserved_micros FROM x_discovery_calls WHERE run_id=$1 ORDER BY id',
                [
                  `scheduled-fixed-x:${profile.id}:${new Date(`${day}T15:00:00Z`).getTime()}`,
                ],
              )
            ).rows;
            assert.equal(xCalls.length, 5);
            assert.ok(
              xCalls.every((call) => {
                const row = call as { status: string; cost_micros: number };
                return row.status === 'failed' && Number(row.cost_micros) === 0;
              }),
            );
            assert.equal((await xLedger.status()).reservedMicros, 0);
            await execute();
            assert.equal(
              attempts.length,
              4,
              'duplicate scheduler delivery must not call the provider again',
            );
            assert.deepEqual(
              (
                await repository.db.query(
                  'SELECT id,status,cost_micros,reserved_micros FROM x_discovery_calls WHERE id=ANY($1::uuid[]) ORDER BY id',
                  [xCalls.map((call) => (call as { id: string }).id)],
                )
              ).rows,
              xCalls,
            );
          } finally {
            await profiles.onModuleDestroy();
          }
        }
        await events.waitUntilReady();
        itemId = crypto.randomUUID();
        await repository.db.query(
          `INSERT INTO content_items(id,canonical_url,title,excerpt,published_at)
      VALUES($1,$2,'New AI developer tool released','Synthetic recovery report with readable source text',$3)`,
          [
            itemId,
            `https://example.org/${itemId}`,
            new Date(Date.now() - 10000),
          ],
        );
        await repository.db.query(
          "INSERT INTO content_observations(item_id,source_id) VALUES($1,'hn')",
          [itemId],
        );
        const scheduled = await queue.upsertJobScheduler(
          'morning',
          { pattern: '* * * * * *', limit: 1, startDate: Date.now() + 1000 },
          { name: 'generate', data: {}, opts: { attempts: 3 } },
        );
        assert.ok(scheduled);
        const timestamp = scheduled.opts.prevMillis;
        assert.ok(timestamp);
        runId = `00000000-0000-4000-8000-000000000001:${timestamp}`;
        await budgets.register(new Date(timestamp), runId);
        worker = new Worker(
          name,
          async (job) => {
            const slot = scheduledSlot(job.opts.prevMillis, Date.now());
            assert.ok(slot.ok);
            assert.equal(slot.value.skip, undefined);
            const window = coverageWindow(
              new Date(slot.value.timestamp),
              'P1D',
            );
            assert.ok(window.ok);
            const edition = await runScheduledBudgetAttempt(
              budgets,
              new Date(timestamp),
              runId!,
              job.attemptsStarted,
              job.attemptsMade,
              job.opts.attempts ?? 1,
              () =>
                repository.generate(
                  window.value.windowStart,
                  window.value.windowEnd,
                  runId,
                ),
            );
            return { editionId: edition.id };
          },
          { connection: workerConnection },
        );
        const result = await scheduled.waitUntilFinished(events, 10000);
        assert.equal(publications.length, 1);
        const page = await new ReaderEditionController(repository).find(
          result.editionId,
        );
        assert.ok(
          page.topics.some((topic) =>
            topic.stories.some(
              (story) =>
                story.id === itemId &&
                story.summary.includes('Synthetic recovery report'),
            ),
          ),
        );
        assert.equal(page.windowEnd, new Date(timestamp).toISOString());
        assert.equal(
          (
            await repository.db.query(
              'SELECT count(*)::int AS count FROM digest_previews WHERE scheduled_key=$1',
              [runId],
            )
          ).rows[0].count,
          1,
        );
        assert.ok(
          failure === 'anthropic'
            ? providerAttempts > 0
            : providerAttempts === 0,
          'only the Anthropic outage case attempts the fake LLM',
        );
        const calls = (
          await repository.db.query(
            'SELECT status,cost_micros,reserved_micros FROM llm_calls WHERE run_id=$1',
            [result.editionId],
          )
        ).rows;
        assert.equal(calls.length, providerAttempts);
        assert.ok(
          calls.every(
            (call) =>
              call.status === 'uncertain' &&
              call.cost_micros === null &&
              Number(call.reserved_micros) > 0,
          ),
        );
        const snapshot = await repository.find(result.editionId);
        assert.ok(snapshot);
        const fallback = snapshot.topics.find((topic) =>
          topic.stories.some((story) => story.id === itemId),
        );
        assert.equal(fallback?.editorial?.mode, 'non-ai');
        assert.match(fallback?.editorial?.reason ?? '', /Non-AI ranking/);
        if (failure === 'x') {
          assert.equal(
            page.topics.flatMap((topic) => topic.posts).length,
            0,
            'no fabricated X posts after failed discovery',
          );
          assert.equal(
            (
              await repository.db.query(
                'SELECT count(*)::int AS count FROM x_discovery_calls',
              )
            ).rows[0].count,
            xCalls.length,
          );
        }
        // A duplicate delivery returns the immutable edition, without more calls or holds.
        const duplicate = await repository.generate(
          new Date(timestamp - 86400000),
          new Date(timestamp),
          runId,
        );
        assert.equal(duplicate.id, result.editionId);
        assert.equal(publications.length, 1);
        assert.equal(providerAttempts, calls.length);
        assert.deepEqual(
          (
            await repository.db.query(
              'SELECT status,cost_micros,reserved_micros FROM llm_calls WHERE run_id=$1',
              [result.editionId],
            )
          ).rows,
          calls,
        );
        assert.equal(
          (await budgets.read(new Date(timestamp).toISOString().slice(0, 10)))
            ?.state,
          'succeeded',
        );
        assert.equal(await queue.getCompletedCount(), 1);
      } finally {
        await worker?.close();
        await events.close();
        await queue.obliterate({ force: true });
        await queue.close();
        await Promise.all([
          connection.quit(),
          workerConnection.quit(),
          eventConnection.quit(),
        ]);
        // Scheduled X admission is shared by later ledger tests in this database.
        if (xCalls.length) {
          await repository.db.query(
            'DELETE FROM x_discovery_calls WHERE id=ANY($1::uuid[])',
            [xCalls.map((call) => (call as { id: string }).id)],
          );
        }
        // The disposable database owns fixture rows, including immutable editions.
        await repository.onModuleDestroy();
      }
    },
  );
