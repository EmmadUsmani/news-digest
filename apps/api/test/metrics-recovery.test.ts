import assert from 'node:assert/strict';
import { test } from 'node:test';

import {
  evaluationInterval,
  memoryInterval,
  mergeInterval,
} from '../../../scripts/lib/metrics-recovery';

void test('compaction evidence uses interval rows rather than cumulative totals', () => {
  const before = { processStart: 100, rows: 9_000_000, merges: 20 };
  assert.equal(
    mergeInterval(before, { ...before, rows: 9_100_000, merges: 21 })
      .comparableMergeCandidate,
    false,
  );
  const large = mergeInterval(before, {
    ...before,
    rows: 14_000_000,
    merges: 23,
  });
  assert.equal(large.rows, 5_000_000);
  assert.equal(large.merges, 3);
  assert.equal(large.comparableMergeCandidate, true);
  assert.equal(large.requiresJournalConfirmation, true);
});

void test('compaction evidence rejects process changes, resets and missing counters', () => {
  const before = { processStart: 100, rows: 9_000_000, merges: 20 };
  for (const after of [
    { ...before, processStart: 101 },
    { ...before, rows: 0 },
    { ...before, merges: 0 },
    { ...before, rows: NaN },
  ])
    assert.throws(() => mergeInterval(before, after), /discard interval/);
  assert.throws(
    () => mergeInterval({ ...before, rows: NaN }, before),
    /discard interval/,
  );
});

void test('recovery sees evaluator failures that have cleared before the next probe', () => {
  const before = { processStart: 100, errors: 14, missed: 12 };
  assert.deepEqual(evaluationInterval(before, before), {
    errors: 0,
    missed: 0,
    noNewFailures: true,
  });
  assert.deepEqual(
    evaluationInterval(before, { ...before, errors: 15, missed: 14 }),
    {
      errors: 1,
      missed: 2,
      noNewFailures: false,
    },
  );
  for (const after of [
    { ...before, processStart: 101 },
    { ...before, errors: 0 },
    { ...before, missed: 0 },
    { ...before, errors: NaN },
  ])
    assert.throws(() => evaluationInterval(before, after), /discard interval/);
});

void test('memory pressure is measured since the baseline, rejecting restarts and resets', () => {
  const before = { processStart: 100, high: 13677, max: 0, oom: 0, oomKill: 0 };
  assert.deepEqual(memoryInterval(before, before), {
    high: 0,
    max: 0,
    oom: 0,
    oomKill: 0,
  });
  assert.deepEqual(memoryInterval(before, { ...before, high: 13820 }), {
    high: 143,
    max: 0,
    oom: 0,
    oomKill: 0,
  });
  assert.deepEqual(
    memoryInterval(before, { ...before, max: 3, oom: 2, oomKill: 1 }),
    {
      high: 0,
      max: 3,
      oom: 2,
      oomKill: 1,
    },
  );
  for (const after of [
    { ...before, processStart: 101 },
    { ...before, high: 0 },
    { ...before, oom: NaN },
    { ...before, max: -1 },
  ])
    assert.throws(() => memoryInterval(before, after), /discard interval/);
});
