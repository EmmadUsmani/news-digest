import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';

import { evaluateCallConcurrency } from '../scripts/evaluate-call-concurrency';

void test('Nov 3 recorded calls rule out a 60-second eight-slot lower bound', () => {
  const [all, triage, remainder] = evaluateCallConcurrency(
    JSON.parse(
      readFileSync(
        new URL(
          './fixtures/edition-call-durations-2026-11-03.json',
          import.meta.url,
        ),
        'utf8',
      ),
    ),
  );
  assert.equal(all.calls, 43);
  assert.equal(all.totalMs, 811368);
  assert.equal(triage.calls, 17);
  assert.equal(triage.totalMs, 517143);
  assert.equal(remainder.calls, 26);
  assert.equal(remainder.totalMs, 294225);
  assert.deepEqual(remainder.targets[0], {
    targetMs: 60000,
    minimumSlotsByCapacity: 5,
    longestCallExcessMs: 0,
    fourSlotAggregateReductionMs: 54225,
  });
  assert.equal(all.targets[0].minimumSlotsByCapacity, 14);
  assert.equal(all.targets[1].minimumSlotsByCapacity, 7);
  assert.deepEqual(remainder.purposes, [
    {
      purpose: 'shortlist-editor-v4',
      calls: 10,
      failedCalls: 0,
      totalMs: 144055,
      longestMs: 19935,
    },
    {
      purpose: 'social-triage-v1',
      calls: 6,
      failedCalls: 0,
      totalMs: 83770,
      longestMs: 23679,
    },
    {
      purpose: 'social-editor-v2',
      calls: 10,
      failedCalls: 0,
      totalMs: 66400,
      longestMs: 10122,
    },
  ]);
  assert.equal(remainder.totalMs + triage.totalMs, all.totalMs);
  assert.equal(
    remainder.concurrency.find((row) => row.slots === 4)!.lowerBoundMs,
    73557,
  );
  assert.equal(
    all.concurrency.find((row) => row.slots === 8)!.lowerBoundMs,
    101421,
  );
});

void test('target capacity distinguishes long calls, aggregate pressure and empty work', () => {
  const [long] = evaluateCallConcurrency([
    { purpose: 'editor', durationMs: 60001, outcome: 'error' },
  ]);
  assert.deepEqual(long.targets[0], {
    targetMs: 60000,
    minimumSlotsByCapacity: null,
    longestCallExcessMs: 1,
    fourSlotAggregateReductionMs: 0,
  });
  assert.equal(long.targets[1].minimumSlotsByCapacity, 1);
  const [full] = evaluateCallConcurrency(
    Array.from({ length: 4 }, () => ({
      purpose: 'editor',
      durationMs: 60000,
      outcome: 'success',
    })),
  );
  assert.equal(full.targets[0].minimumSlotsByCapacity, 4);
  assert.equal(full.targets[0].fourSlotAggregateReductionMs, 0);
  for (const empty of evaluateCallConcurrency([])) {
    assert.ok(empty.targets.every((row) => row.minimumSlotsByCapacity === 0));
    assert.ok(
      empty.targets.every((row) => row.fourSlotAggregateReductionMs === 0),
    );
  }
});

void test('concurrency bounds retain failed work and isolate article triage', () => {
  const input = [9, 8, 7, 6, 5].map((durationMs, index) => ({
    durationMs,
    purpose: index < 4 ? 'candidate-triage-v1' : 'story-editor',
    outcome: index === 0 ? 'error' : 'success',
  }));
  const [all, triage, remainder] = evaluateCallConcurrency(input);
  assert.equal(all.totalMs, 35);
  assert.equal(all.failedCalls, 1);
  assert.equal(triage.totalMs, 30);
  assert.equal(triage.calls, 4);
  assert.deepEqual(all.concurrency[1], {
    slots: 2,
    lowerBoundMs: 18,
    independentLongestFirstMs: 20,
  });
  for (const result of [all, triage]) {
    assert.equal(
      result.concurrency[0].independentLongestFirstMs,
      result.totalMs,
    );
    for (const row of result.concurrency) {
      assert.ok(row.independentLongestFirstMs >= row.lowerBoundMs);
      assert.ok(row.lowerBoundMs >= result.longestMs);
    }
  }
  assert.equal(all.concurrency.at(-1)!.independentLongestFirstMs, 9);
  assert.deepEqual(evaluateCallConcurrency([...input].reverse()), [
    all,
    triage,
    remainder,
  ]);
});

void test('ideal article cache retains social triage, editing and unknown failed work', () => {
  const [all, triage, remainder] = evaluateCallConcurrency([
    { purpose: 'candidate-triage-v1', durationMs: 100, outcome: 'success' },
    { purpose: 'social-triage-v1', durationMs: 20, outcome: 'success' },
    { purpose: 'story-editor', durationMs: 30, outcome: 'success' },
    { purpose: 'future-purpose', durationMs: 40, outcome: 'error' },
  ]);
  assert.equal(remainder.calls, 3);
  assert.equal(remainder.failedCalls, 1);
  assert.equal(remainder.totalMs, 90);
  assert.equal(remainder.longestMs, 40);
  assert.equal(remainder.calls + triage.calls, all.calls);
  assert.equal(remainder.totalMs + triage.totalMs, all.totalMs);
  assert.deepEqual(remainder.concurrency[1], {
    slots: 2,
    lowerBoundMs: 45,
    independentLongestFirstMs: 50,
  });
});

void test('empty evidence stays zero and invalid or overflowing durations fail', () => {
  for (const result of evaluateCallConcurrency([])) {
    assert.equal(result.calls, 0);
    assert.ok(result.concurrency.every((row) => row.lowerBoundMs === 0));
  }
  for (const durationMs of [-1, NaN, Infinity, 0.5])
    assert.throws(() =>
      evaluateCallConcurrency([
        { purpose: 'x', durationMs, outcome: 'success' },
      ]),
    );
  assert.throws(() => evaluateCallConcurrency([{ durationMs: 1 }]));
  assert.throws(() =>
    evaluateCallConcurrency(
      Array.from({ length: 2 }, () => ({
        purpose: 'x',
        durationMs: Number.MAX_SAFE_INTEGER,
        outcome: 'success',
      })),
    ),
  );
});

void test('purpose totals partition elapsed work without dropping failures or unknown purposes', () => {
  const [all] = evaluateCallConcurrency([
    { purpose: 'social', durationMs: 10, outcome: 'success' },
    { purpose: 'social', durationMs: 20, outcome: 'error' },
    { purpose: 'unknown', durationMs: 30, outcome: 'error' },
    { purpose: 'zero', durationMs: 0, outcome: 'success' },
  ]);
  assert.deepEqual(all.purposes, [
    { purpose: 'social', calls: 2, failedCalls: 1, totalMs: 30, longestMs: 20 },
    {
      purpose: 'unknown',
      calls: 1,
      failedCalls: 1,
      totalMs: 30,
      longestMs: 30,
    },
    { purpose: 'zero', calls: 1, failedCalls: 0, totalMs: 0, longestMs: 0 },
  ]);
  for (const field of ['calls', 'failedCalls', 'totalMs'] as const) {
    assert.equal(
      all.purposes.reduce((sum, row) => sum + row[field], 0),
      all[field],
    );
  }
  assert.deepEqual(evaluateCallConcurrency([])[0].purposes, []);
});
