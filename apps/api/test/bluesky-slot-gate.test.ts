import assert from 'node:assert/strict';
import { test } from 'node:test';

import { evaluateBlueskySlotGate } from '../scripts/evaluate-bluesky-slot-gate';

// Synthetic arithmetic cases; these are not observed Nov 6 edition costs.
const input = {
  editionDate: '2026-11-06',
  editionId: '00000000-0000-4000-8000-000000000001',
  fullyAiEdited: true,
  budgetRefused: false,
  usageSettled: true,
  editionCostMicros: 300000,
  dailyCapMicros: 480000,
  topics: [{ topicId: 'one', extraCostMicros: 20000, basis: 'synthetic test' }],
};

void test('gate accepts equality but rejects one microdollar over the protected cap', () => {
  assert.equal(evaluateBlueskySlotGate(input).eligible, true);
  const result = evaluateBlueskySlotGate({
    ...input,
    editionCostMicros: 300001,
  });
  assert.equal(result.protectedCostMicros, 480002);
  assert.equal(result.eligible, false);
});

void test('unknown estimates, incomplete AI editing, budget refusal and unsettled usage block the gate', () => {
  for (const patch of [
    { fullyAiEdited: false },
    { budgetRefused: true },
    { usageSettled: false },
    { topics: [{ ...input.topics[0], extraCostMicros: null }] },
  ])
    assert.equal(
      evaluateBlueskySlotGate({ ...input, ...patch }).eligible,
      false,
    );
  assert.equal(
    evaluateBlueskySlotGate({
      ...input,
      topics: [{ ...input.topics[0], extraCostMicros: null }],
    }).protectedCostMicros,
    null,
  );
});

void test('gate sums all topics and rejects duplicate, invalid-money and wrong-date inputs', () => {
  assert.equal(
    evaluateBlueskySlotGate({
      ...input,
      topics: [
        ...input.topics,
        { ...input.topics[0], topicId: 'two', extraCostMicros: 1 },
      ],
    }).eligible,
    false,
  );
  for (const patch of [
    { topics: [...input.topics, ...input.topics] },
    { editionCostMicros: -1 },
    { dailyCapMicros: 0.5 },
    { editionDate: '2026-11-05' },
    { topics: [] },
  ])
    assert.throws(() => evaluateBlueskySlotGate({ ...input, ...patch }));
});
