import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';

import { evaluateCallTokens } from '../scripts/evaluate-call-tokens';

void test('Nov 4 recorded usage partitions all 43 HTTP calls without truncation', () => {
  const input: unknown = JSON.parse(
    readFileSync(
      new URL('./fixtures/edition-call-usage-2026-11-04.json', import.meta.url),
      'utf8',
    ),
  );
  const rows = evaluateCallTokens(input);
  const total = (key: 'calls' | 'durationMs' | 'outputTokens') =>
    rows.reduce((sum, row) => sum + row[key], 0);
  assert.equal(total('calls'), 43);
  assert.equal(total('durationMs'), 506615);
  assert.equal(total('outputTokens'), 115032);
  assert.ok(rows.every((row) => row.unknownUsageCalls === 0));
  assert.ok(rows.every((row) => row.outputLimitStops === 0));
  assert.equal(rows[0].purpose, 'candidate-triage-v1');
  assert.equal(rows[0].totalInputTokens, 133969);
  assert.equal(rows[0].outputTokens, 68220);
  assert.equal(
    rows.filter((row) => row.purpose === 'shortlist-editor-v4').length,
    2,
  );
  assert.deepEqual(
    evaluateCallTokens([...(input as unknown[])].reverse()),
    rows,
  );
});

void test('missing usage remains unknown and HTTP ratios use matching durations only', () => {
  const base = { purpose: 'editor', model: 'model', outcome: 'success' };
  const [row] = evaluateCallTokens([
    {
      ...base,
      durationMs: 1000,
      usage: { input: 2, cacheWrite: 3, cacheRead: 4, output: 10 },
      completionReason: 'max_tokens',
    },
    { ...base, outcome: 'error', durationMs: 2000 },
  ]);
  assert.equal(row.calls, 2);
  assert.equal(row.failedCalls, 1);
  assert.equal(row.unknownUsageCalls, 1);
  assert.equal(row.durationMs, 3000);
  assert.equal(row.knownUsageDurationMs, 1000);
  assert.equal(row.totalInputTokens, 9);
  assert.equal(row.outputTokensPerHttpSecond, 10);
  assert.equal(row.outputLimitStops, 1);
  const [unknown] = evaluateCallTokens([{ ...base, durationMs: 1000 }]);
  assert.equal(unknown.largestOutputTokens, null);
  assert.equal(unknown.outputTokensPerHttpSecond, null);
  const [zero] = evaluateCallTokens([
    {
      ...base,
      durationMs: 0,
      usage: { input: 0, cacheWrite: 0, cacheRead: 0, output: 0 },
    },
  ]);
  assert.equal(zero.largestOutputTokens, 0);
  assert.equal(zero.outputTokensPerHttpSecond, null);
});

void test('invalid usage and overflowing totals fail instead of producing estimates', () => {
  assert.deepEqual(evaluateCallTokens([]), []);
  const base = {
    purpose: 'editor',
    model: 'model',
    durationMs: 1,
    outcome: 'success',
  };
  for (const output of [-1, 0.5, Infinity, NaN])
    assert.throws(() =>
      evaluateCallTokens([
        { ...base, usage: { input: 0, cacheWrite: 0, cacheRead: 0, output } },
      ]),
    );
  assert.throws(() => evaluateCallTokens([{ ...base, usage: { output: 1 } }]));
  assert.throws(() =>
    evaluateCallTokens([
      {
        ...base,
        usage: {
          input: Number.MAX_SAFE_INTEGER,
          cacheWrite: 1,
          cacheRead: 0,
          output: 0,
        },
      },
    ]),
  );
});
