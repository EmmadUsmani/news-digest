import assert from 'node:assert/strict';
import { test } from 'node:test';

import { IncrementalTriageRunner } from '../src/modules/curation/application/incremental-triage-runner';
import { IncrementalTriageScheduler } from '../src/modules/curation/application/incremental-triage-scheduler';

const options = { minimumPending: 1, maximumItems: 25 };
function topic(id: string) {
  return {
    id,
    load: async () => ({
      topic: { id, name: id, description: '', guidance: '' },
      candidates: Array.from({ length: 40 }, (_, i) => ({
        id: `${id}-${i}`,
        title: 'Title',
        excerpt: null,
        sources: [],
      })),
      runId: 'background',
    }),
  };
}

void test('ticks bound total work and rotate topics, including membership changes', async () => {
  const attempts: string[] = [];
  const runner = new IncrementalTriageRunner(
    {
      pending: async (_topic, candidates) => candidates,
      score: async (topic, candidates) => {
        attempts.push(topic.id);
        assert.equal(candidates.length, 25);
        return { scores: [], unscoredIds: candidates.map((c) => c.id) };
      },
    },
    () => ({ nextEditionAt: 1000, cutoffMs: 100 }),
    () => 0,
  );
  const scheduler = new IncrementalTriageScheduler(runner, options);
  const topics = ['a', 'b', 'c'].map(topic);
  for (let i = 0; i < 4; i++) await scheduler.tick(topics);
  await scheduler.tick([topics[0], topics[2]]);
  await scheduler.tick([topic('d')]);
  assert.deepEqual(attempts, ['a', 'b', 'c', 'a', 'c', 'd']);
});

void test('overlap skips loading; failures advance while cutoff and contention preserve turn', async () => {
  let finish!: () => void;
  let status: 'completed' | 'cutoff' | 'busy' = 'completed';
  let fail = false;
  let block = true;
  const scheduler = new IncrementalTriageScheduler(
    {
      run: async (load) => {
        if (status !== 'completed') return { status };
        await load();
        if (block)
          await new Promise<void>((resolve) => {
            finish = resolve;
          });
        if (fail) throw new Error('provider failure');
        return {
          status: 'completed',
          result: {
            pendingItems: 0,
            attemptedIds: [],
            scoredIds: [],
            unscoredIds: [],
            deferredItems: 0,
          },
        };
      },
    },
    options,
  );
  const topics = ['a', 'b', 'c'].map(topic);
  const first = scheduler.tick(topics);
  await new Promise<void>((resolve) => setImmediate(resolve));
  assert.deepEqual(await scheduler.tick(topics), { status: 'busy' });
  finish();
  await first;
  block = false;
  for (const next of ['cutoff', 'busy'] as const) {
    status = next;
    assert.equal((await scheduler.tick(topics)).topicId, 'b');
  }
  status = 'completed';
  fail = true;
  await assert.rejects(scheduler.tick(topics), /provider failure/);
  fail = false;
  assert.equal((await scheduler.tick(topics)).topicId, 'c');
});

void test('empty, duplicate and mismatched topic lists fail safely', async () => {
  let loads = 0;
  const scheduler = new IncrementalTriageScheduler(
    {
      run: async (load) => {
        loads++;
        await load();
        return { status: 'cutoff' };
      },
    },
    options,
  );
  assert.deepEqual(await scheduler.tick([]), { status: 'empty' });
  await assert.rejects(scheduler.tick([topic('a'), topic('a')]), /unique/);
  await assert.rejects(scheduler.tick([topic(' ')]), /nonempty/);
  assert.equal(loads, 0);
  await assert.rejects(
    scheduler.tick([{ id: 'a', load: topic('b').load }]),
    /identity/,
  );
  assert.equal((await scheduler.tick([topic('a')])).status, 'cutoff');
});
