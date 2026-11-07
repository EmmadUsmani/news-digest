import assert from 'node:assert/strict';
import { test } from 'node:test';

import { mergeInterval } from '../../../scripts/lib/metrics-recovery';

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
