import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';

import { evaluateCallConcurrency } from '../scripts/evaluate-call-concurrency';

void test('Nov 3 recorded calls rule out a 60-second eight-slot lower bound', () => {
  const [all, triage] = evaluateCallConcurrency(
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
  assert.equal(
    all.concurrency.find((row) => row.slots === 8)!.lowerBoundMs,
    101421,
  );
});

void test('concurrency bounds retain failed work and isolate article triage', () => {
  const input = [9, 8, 7, 6, 5].map((durationMs, index) => ({
    durationMs,
    purpose: index < 4 ? 'candidate-triage-v1' : 'story-editor',
    outcome: index === 0 ? 'error' : 'success',
  }));
  const [all, triage] = evaluateCallConcurrency(input);
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
  ]);
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
