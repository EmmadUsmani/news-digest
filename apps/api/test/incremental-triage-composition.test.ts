import assert from 'node:assert/strict';
import { test } from 'node:test';

import { prepareIncrementalTriageWorker } from '../src/incremental-triage-worker';
import { database } from '../src/libs/db/connections';
import {
  composeIncrementalTriageScheduler,
  incrementalTriageScheduler,
} from '../src/modules/curation/public/incremental-triage-scheduler';

void test('composed schedulers share admission, bound work and recover after scoring failure', async () => {
  const firstDb = database();
  const secondDb = database();
  let finish!: () => void;
  let entered!: () => void;
  const started = new Promise<void>((resolve) => {
    entered = resolve;
  });
  let fail = false;
  let loads = 0;
  const scores: number[] = [];
  const triage = {
    pending: async (
      _topic: unknown,
      candidates: {
        id: string;
        title: string;
        excerpt: null;
        sources: string[];
      }[],
    ) => candidates,
    score: async (_topic: unknown, candidates: { id: string }[]) => {
      scores.push(candidates.length);
      entered();
      if (scores.length === 1)
        await new Promise<void>((resolve) => {
          finish = resolve;
        });
      if (fail) throw new Error('recorded scoring failure');
      return { scores: [], unscoredIds: candidates.map((c) => c.id) };
    },
  };
  const schedule = () => ({ nextEditionAt: 1000, cutoffMs: 100 });
  const first = composeIncrementalTriageScheduler(
    firstDb,
    triage,
    schedule,
    () => 0,
  );
  const second = composeIncrementalTriageScheduler(
    secondDb,
    triage,
    schedule,
    () => 0,
  );
  const topics = [
    {
      id: 'topic',
      load: async () => {
        loads++;
        return {
          topic: { id: 'topic', name: 'Topic', description: '', guidance: '' },
          candidates: Array.from({ length: 40 }, (_, i) => ({
            id: String(i),
            title: 'Title',
            excerpt: null,
            sources: [] as string[],
          })),
          runId: 'fake-background',
        };
      },
    },
  ];
  try {
    assert.equal(
      incrementalTriageScheduler(
        firstDb,
        () => {
          throw new Error('disabled schedule read');
        },
        {},
      ),
      null,
    );
    const running = first.tick(topics);
    await started;
    try {
      assert.equal((await second.tick(topics)).status, 'busy');
      assert.equal(loads, 1);
    } finally {
      finish();
      await running;
    }
    fail = true;
    await assert.rejects(second.tick(topics), /recorded scoring failure/);
    fail = false;
    assert.equal((await first.tick(topics)).status, 'completed');
    assert.deepEqual(scores, [25, 25, 25]);
    const cutoff = composeIncrementalTriageScheduler(
      secondDb,
      triage,
      schedule,
      () => 900,
    );
    assert.equal((await cutoff.tick(topics)).status, 'cutoff');
    assert.equal(loads, 3);
  } finally {
    await Promise.all([firstDb.end(), secondDb.end()]);
  }
});

void test('prepared worker reads current persisted schedule and only enabled topics without scoring', async () => {
  const db = database();
  let stop: (() => Promise<void>) | undefined;
  try {
    stop = await prepareIncrementalTriageWorker(
      () => assert.fail('unexpected runtime error'),
      { LLM_INCREMENTAL_TRIAGE_ENABLED: '1' },
      undefined,
      (deps) => async () => {
        const actual = await deps.settings();
        const schedule = await db.query(
          `SELECT cadence,timezone,coverage_window AS "coverageWindow",story_budget AS "storyBudget",post_budget AS "postBudget" FROM digest_schedules WHERE profile_id=$1`,
          ['00000000-0000-4000-8000-000000000001'],
        );
        const topics = await db.query(
          'SELECT id FROM topics WHERE profile_id=$1 AND enabled ORDER BY position,id',
          ['00000000-0000-4000-8000-000000000001'],
        );
        assert.deepEqual(actual.schedule, schedule.rows[0]);
        assert.deepEqual(
          actual.topicIds,
          topics.rows.map((row: { id: string }) => row.id),
        );
        assert.ok(actual.topicIds.length > 0);
      },
    );
    await stop();
    await stop();
  } finally {
    await db.end();
  }
});
