import assert from 'node:assert/strict';
import test from 'node:test';

import { prepareIncrementalTriageTick } from '../src/incremental-triage-tick';
import { IncrementalTriageRunner } from '../src/modules/curation/application/incremental-triage-runner';
import { IncrementalTriageScheduler } from '../src/modules/curation/application/incremental-triage-scheduler';

const schedule = {
  cadence: '0 7 * * *',
  timezone: 'America/Los_Angeles',
  coverageWindow: 'P1D',
  storyBudget: 5,
  postBudget: 5,
};

void test('disabled tick never reads settings, clock or pools', async () => {
  const unexpected = () => {
    throw new Error('unexpected read');
  };
  const tick = prepareIncrementalTriageTick({
    settings: unexpected,
    pool: unexpected,
    now: unexpected,
    scheduler: () => null,
  });
  assert.deepEqual(await tick(), { status: 'disabled' });
});

void test('prepared ticks refresh schedule, rotate topics, bound scores and stop at cutoff', async () => {
  let time = Date.parse('2026-11-04T02:00:00Z');
  const loads: string[] = [];
  const scores: number[] = [];
  let settingsReads = 0;
  let currentSchedule = schedule;
  const tick = prepareIncrementalTriageTick({
    now: () => time,
    settings: async () => {
      settingsReads++;
      return { schedule: currentSchedule, topicIds: ['a', 'b'] };
    },
    pool: async (id, start, end) => {
      loads.push(id);
      assert.equal(start.toISOString(), '2026-11-03T15:00:00.000Z');
      assert.equal(end.toISOString(), '2026-11-04T15:00:00.000Z');
      if (id === 'b') return null;
      return {
        topic: { id, name: 'Topic', description: '', guidance: '' },
        candidates: Array.from({ length: 40 }, (_, i) => ({
          id: String(i),
          title: 'Title',
          excerpt: null,
          sources: [],
        })),
      };
    },
    scheduler: (cutoff) =>
      new IncrementalTriageScheduler(
        new IncrementalTriageRunner(
          {
            pending: async (_topic, candidates) => candidates,
            score: async (_topic, candidates, runId) => {
              assert.match(runId, /^incremental:/);
              scores.push(candidates.length);
              return { scores: [], unscoredIds: candidates.map((c) => c.id) };
            },
          },
          cutoff,
          () => time,
        ),
        { minimumPending: 1, maximumItems: 25 },
      ),
  });
  assert.equal((await tick()).status, 'completed');
  assert.equal((await tick()).status, 'completed');
  assert.deepEqual(loads, ['a', 'b']);
  assert.deepEqual(scores, [25]);
  time = Date.parse('2026-11-04T10:00:00Z');
  currentSchedule = { ...schedule, cadence: '0 4 * * *' };
  assert.equal((await tick()).status, 'cutoff');
  time = Date.parse('2026-11-04T12:00:00Z');
  assert.equal((await tick()).status, 'cutoff');
  assert.equal(settingsReads, 4);
  assert.deepEqual(loads, ['a', 'b']);
});

void test('overlapping settings reads skip and failure permits a fresh tick', async () => {
  let release!: () => void;
  const waiting = new Promise<void>((resolve) => {
    release = resolve;
  });
  let reads = 0;
  const tick = prepareIncrementalTriageTick({
    now: () => Date.parse('2026-11-04T02:00:00Z'),
    settings: async () => {
      reads++;
      if (reads === 1) {
        await waiting;
        throw new Error('settings unavailable');
      }
      return { schedule, topicIds: [] };
    },
    pool: async () => {
      throw new Error('unexpected pool');
    },
    scheduler: () => ({ tick: async () => ({ status: 'empty' as const }) }),
  });
  const first = tick();
  assert.equal((await tick()).status, 'busy');
  assert.equal(reads, 1);
  release();
  await assert.rejects(first, /settings unavailable/);
  assert.equal((await tick()).status, 'empty');
});

void test('pool load crossing publication cannot roll cutoff into tomorrow', async () => {
  let time = Date.parse('2026-11-04T02:00:00Z');
  const tick = prepareIncrementalTriageTick({
    now: () => time,
    settings: async () => ({ schedule, topicIds: ['a'] }),
    pool: async () => {
      time = Date.parse('2026-11-04T15:00:01Z');
      return {
        topic: { id: 'a', name: '', description: '', guidance: '' },
        candidates: [],
      };
    },
    scheduler: (cutoff) =>
      new IncrementalTriageScheduler(
        new IncrementalTriageRunner(
          {
            pending: async () => {
              throw new Error('unexpected cache read');
            },
            score: async () => {
              throw new Error('unexpected scoring');
            },
          },
          cutoff,
          () => time,
        ),
        { minimumPending: 1, maximumItems: 25 },
      ),
  });
  assert.equal((await tick()).status, 'cutoff');
});
