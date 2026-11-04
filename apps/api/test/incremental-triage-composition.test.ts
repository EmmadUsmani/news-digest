import assert from 'node:assert/strict';
import { test } from 'node:test';

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
