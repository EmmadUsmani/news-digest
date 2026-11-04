import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';

import { evaluateCallOutput } from '../scripts/evaluate-call-output';

void test('Nov 3 output evidence preserves usage and unknown reservation metadata', () => {
  const rows = evaluateCallOutput(
    JSON.parse(
      readFileSync(
        new URL(
          './fixtures/edition-call-output-2026-11-03.json',
          import.meta.url,
        ),
        'utf8',
      ),
    ),
  );
  assert.deepEqual(
    rows.map((row) => [row.purpose, row.calls, row.outputTokens]),
    [
      ['candidate-triage-v1', 17, 133175],
      ['shortlist-editor-v4', 10, 24917],
      ['social-editor-v2', 10, 10908],
      ['social-triage-v1', 6, 21663],
    ],
  );
  assert.equal(
    rows.reduce((sum, row) => sum + row.totalMs, 0),
    811368,
  );
  for (const row of rows) {
    assert.equal(row.callsWithUsage, row.calls);
    assert.equal(row.failedCalls, 0);
    assert.equal(row.outputLimitUtilization, null);
    assert.equal(row.pairedOutputLimit, null);
    assert.equal(row.callsWithoutCompletionReason, row.calls);
  }
});

void test('partial metadata uses paired limits only and retains failed work', () => {
  const [row] = evaluateCallOutput([
    { purpose: 'unknown', durationMs: 8, outcome: 'failure' },
    { purpose: 'unknown', durationMs: 2, outcome: 'success', outputLimit: 500 },
    {
      purpose: 'unknown',
      durationMs: 4,
      outcome: 'success',
      usage: { output: 20 },
    },
    {
      purpose: 'unknown',
      durationMs: 6,
      outcome: 'error',
      usage: { output: 40 },
      outputLimit: 100,
      completionReason: 'max_tokens',
    },
    {
      purpose: 'unknown',
      durationMs: 0,
      outcome: 'success',
      usage: { output: 0 },
      outputLimit: 100,
      completionReason: 'end_turn',
    },
  ]);
  assert.deepEqual(row, {
    purpose: 'unknown',
    calls: 5,
    failedCalls: 2,
    totalMs: 20,
    callsWithUsage: 3,
    outputTokens: 60,
    callsWithUsageAndLimit: 2,
    pairedOutputTokens: 40,
    pairedOutputLimit: 200,
    outputLimitUtilization: 0.2,
    reportedMaxTokenStops: 1,
    callsWithoutCompletionReason: 3,
  });
});

void test('missing usage differs from observed zero output and empty evidence', () => {
  assert.deepEqual(evaluateCallOutput([]), []);
  const rows = evaluateCallOutput([
    { purpose: 'missing', durationMs: 1, outcome: 'failure' },
    {
      purpose: 'zero',
      durationMs: 0,
      outcome: 'success',
      usage: { output: 0 },
    },
  ]);
  assert.equal(rows[0].outputTokens, null);
  assert.equal(rows[1].outputTokens, 0);
});

void test('invalid metadata and unsafe aggregates fail closed', () => {
  const base = { purpose: 'test', durationMs: 1, outcome: 'success' };
  for (const patch of [
    { usage: { output: -1 } },
    { outputLimit: 0 },
    { durationMs: 1.5 },
    { outcome: 'unexpected' },
    { purpose: '' },
  ])
    assert.throws(() => evaluateCallOutput([{ ...base, ...patch }]));
  for (const patch of [
    { durationMs: Number.MAX_SAFE_INTEGER },
    { usage: { output: Number.MAX_SAFE_INTEGER } },
    { outputLimit: Number.MAX_SAFE_INTEGER, usage: { output: 1 } },
  ])
    assert.throws(
      () =>
        evaluateCallOutput([
          { ...base, ...patch },
          { ...base, ...patch },
        ]),
      /overflow/,
    );
});
