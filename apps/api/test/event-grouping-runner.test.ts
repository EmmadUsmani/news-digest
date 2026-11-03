import assert from 'node:assert/strict';
import test from 'node:test';

import {
  eventGroupingEvaluationPlan,
  runEventGroupingEvaluation,
} from '../scripts/run-event-grouping-evaluation';
import { llmConfig } from '../src/modules/curation/adapters/config';
import { BudgetedLlm } from '../src/modules/curation/application/budgeted-llm';
import { EventGrouping } from '../src/modules/curation/application/event-grouping';

void test('evaluation plans six bounded windows without losing labelled endpoints', () => {
  const plan = eventGroupingEvaluationPlan();
  assert.equal(plan.length, 6);
  assert.deepEqual(plan, eventGroupingEvaluationPlan());
  assert.deepEqual(
    plan.map((entry) => entry.candidates.length),
    [40, 40, 40, 20, 31, 23],
  );
  for (const entry of plan) {
    assert.ok(entry.labelledCandidates <= entry.candidates.length);
    assert.ok(entry.candidates.every((item) => item.topicId === entry.topicId));
    assert.equal(
      new Set(entry.candidates.map((item) => item.id)).size,
      entry.candidates.length,
    );
  }
});

void test('runner uses the real budgeted grouping component with a fake provider once per window and reuses cache', async () => {
  const cache = new Map<string, unknown>();
  let calls = 0;
  const grouping = new EventGrouping(
    new BudgetedLlm(
      {
        async complete() {
          calls++;
          return {
            text: '{"groups":[]}',
            usage: { input: 10, output: 10, cacheWrite: 0, cacheRead: 0 },
          };
        },
      },
      {
        async cached(key) {
          return cache.get(key);
        },
        async cache(key, value) {
          cache.set(key, value);
        },
        async reserve() {
          return 'hold';
        },
        async settle() {},
        async fail() {},
      },
    ),
    llmConfig({}).haiku,
  );
  const result = await runEventGroupingEvaluation(grouping, 'fake-evaluation');
  assert.equal(calls, 6);
  assert.equal(result.report.pairs, 98);
  assert.equal(result.report.truePositives, 0);
  assert.equal(result.report.falsePositives, 0);
  assert.equal(Object.keys(result.memberships).length, 6);
  assert.deepEqual(
    await runEventGroupingEvaluation(grouping, 'fake-cached'),
    result,
  );
  assert.equal(calls, 6);
});

void test('runner stops before the next window when supplied output is invalid', async () => {
  let calls = 0;
  await assert.rejects(
    runEventGroupingEvaluation(
      {
        async group() {
          calls++;
          return [['unknown', 'also-unknown']];
        },
      },
      'fake-invalid',
    ),
    /Unknown or duplicate/,
  );
  assert.equal(calls, 1);
});
