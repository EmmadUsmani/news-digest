import assert from 'node:assert/strict';
import { test } from 'node:test';

import {
  collectTimingEvidence,
  scheduledTiming,
  timingEvidence,
} from '../../../scripts/lib/scheduled-timing';

void test('scheduled offsets include pre-worker delay and preserve early starts', () => {
  assert.deepEqual(
    scheduledTiming({
      scheduledAt: '2026-11-03T15:00:00Z',
      startedAt: '2026-11-03T15:00:05Z',
      finishedAt: '2026-11-03T15:00:45Z',
    }),
    { scheduledStartDelayMs: 5000, scheduledCompletionDelayMs: 45000 },
  );
  assert.deepEqual(
    scheduledTiming({
      scheduledAt: '2026-11-03T15:00:00Z',
      startedAt: '2026-11-03T14:59:59Z',
      finishedAt: '2026-11-03T15:00:01Z',
    }),
    { scheduledStartDelayMs: -1000, scheduledCompletionDelayMs: 1000 },
  );
});

void test('manual runs and missing or invalid timestamps have unknown offsets', () => {
  for (const scheduledAt of [null, 'invalid']) {
    assert.deepEqual(
      scheduledTiming({
        scheduledAt,
        startedAt: '2026-11-03T15:00:05Z',
        finishedAt: '2026-11-03T15:00:45Z',
      }),
      { scheduledStartDelayMs: null, scheduledCompletionDelayMs: null },
    );
  }
  assert.deepEqual(
    scheduledTiming({
      scheduledAt: '2026-11-03T15:00:00Z',
      startedAt: null,
      finishedAt: null,
    }),
    { scheduledStartDelayMs: null, scheduledCompletionDelayMs: null },
  );
});

void test('schedule offsets handle UTC day boundaries and equivalent timezone offsets', () => {
  assert.deepEqual(
    scheduledTiming({
      scheduledAt: '2026-11-03T23:59:59Z',
      startedAt: '2026-11-03T16:00:00-08:00',
      finishedAt: '2026-11-04T00:00:02Z',
    }),
    { scheduledStartDelayMs: 1000, scheduledCompletionDelayMs: 3000 },
  );
});

void test('scheduled evidence survives newer manual completions and unordered input', () => {
  const run = (
    id: string,
    day: number,
    scheduled = false,
    state = 'completed',
  ) => ({
    id,
    state,
    attempts: 1,
    scheduledAt: scheduled ? `2026-11-0${day}T15:00:00Z` : null,
    startedAt: `2026-11-0${day}T15:00:01Z`,
    finishedAt: `2026-11-0${day}T15:00:10Z`,
    durationMs: 9000,
    editionId: state === 'completed' ? id : null,
    skipped: null,
  });
  const scheduled = run('scheduled', 2, true);
  const manuals = [run('m1', 3), run('m2', 4), run('m3', 5)];
  const input = [manuals[0], scheduled, manuals[2], manuals[1]];
  const evidence = timingEvidence(input);
  assert.deepEqual(
    evidence.completed.map((item) => item.id),
    ['m3', 'm2', 'm1', 'scheduled'],
  );
  assert.equal(evidence.latestScheduled?.id, 'scheduled');
  assert.equal(input[0]?.id, 'm1');
  for (const state of ['failed', 'active', 'waiting', 'delayed']) {
    const next = timingEvidence([...input, run('next', 6, true, state)]);
    assert.equal(next.latestScheduled?.state, state);
    assert.deepEqual(
      next.completed.map((item) => item.id),
      state === 'failed' ? ['m3', 'm2', 'm1'] : ['m3', 'm2', 'm1', 'scheduled'],
    );
    assert.equal(
      next.latestScheduledOutcome?.id,
      state === 'failed' ? 'next' : 'scheduled',
    );
    assert.equal(next.failed.length, state === 'failed' ? 1 : 0);
  }
  assert.equal(timingEvidence([scheduled]).completed.length, 1);
  assert.equal(timingEvidence(manuals).latestScheduled, null);
  assert.deepEqual(timingEvidence([]), {
    completed: [],
    latestScheduled: null,
    latestScheduledOutcome: null,
    failed: [],
  });
});

void test('partial timing reads retain other editions and unavailable job timing without exception content', async () => {
  const runs = ['first', 'missing', 'last'].map((id) => ({
    id,
    state: 'completed',
    attempts: 1,
    scheduledAt: '2026-11-03T15:00:00Z',
    startedAt: '2026-11-03T15:00:01Z',
    finishedAt: '2026-11-03T15:00:10Z',
    durationMs: 9000,
    editionId: id,
    skipped: null,
  }));
  const reads: string[] = [];
  const result = await collectTimingEvidence(runs, async (run) => {
    reads.push(run.id);
    if (run.id === 'missing') throw new Error('secret SQL/HTTP detail');
    return { editionId: run.editionId, cost: 10 };
  });
  assert.deepEqual(reads, ['first', 'missing', 'last']);
  assert.equal(result.complete, false);
  assert.deepEqual(
    result.runs.map((run) => run.editionId),
    ['first', 'last'],
  );
  assert.deepEqual(result.unavailable, [runs[1]]);
  assert.equal(JSON.stringify(result).includes('secret'), false);
  assert.equal(
    scheduledTiming(result.unavailable[0]).scheduledCompletionDelayMs,
    10000,
  );
  const allUnavailable = await collectTimingEvidence(runs, async () => {
    throw new Error('unavailable');
  });
  assert.equal(allUnavailable.complete, false);
  assert.equal(allUnavailable.unavailable.length, 3);
  assert.deepEqual(allUnavailable.runs, []);
  const complete = await collectTimingEvidence(runs, async (run) => run.id);
  assert.equal(complete.complete, true);
  assert.deepEqual(complete.runs, reads);
  assert.deepEqual(complete.unavailable, []);
  assert.deepEqual(await collectTimingEvidence([], async () => assert.fail()), {
    runs: [],
    unavailable: [],
    complete: true,
  });
});
