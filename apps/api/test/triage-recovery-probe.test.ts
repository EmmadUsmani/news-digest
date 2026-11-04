import assert from 'node:assert/strict';
import { test } from 'node:test';

import { evaluateTriageRecovery } from '../scripts/evaluate-triage-recovery';

void test('offline refusal and thrown failures drain siblings and retain their cache across recovery', async () => {
  for (const kind of ['article', 'social'] as const)
    for (const failure of ['refusal', 'throw'] as const) {
      const row = await evaluateTriageRecovery(200, 200, kind, failure);
      assert.deepEqual(row.initialBatchItems, [50, 50, 50, 50]);
      assert.equal(row.cachedAfterFailure, 150);
      assert.equal(row.initial.activeAfterPass, 0);
      assert.equal(row.initial.thrown, failure === 'throw' ? 1 : 0);
      assert.deepEqual(row.recoveryBatchItems, [50]);
      assert.equal(row.recovery.unscoredInAttemptedPasses, 0);
      assert.equal(row.cachedAfterRecovery, 200);
      assert.equal(row.requestedItems, 250);
      assert.equal(row.successfullyScoredItems, 200);
      assert.equal(row.duplicateSuccessfulItems, 0);
      assert.equal(row.repeatRequests, 0);
    }
});

void test('small caller passes limit failed work but fragment explicit recovery', async () => {
  const row = await evaluateTriageRecovery(200, 25, 'social', 'refusal');
  assert.deepEqual(row.initialBatchItems, [25]);
  assert.equal(row.cachedAfterFailure, 0);
  assert.deepEqual(row.recoveryBatchItems, Array(8).fill(25));
  assert.equal(row.observedFakePeakRequests, 1);
  assert.equal(row.requestedItems, 225);
  assert.equal(row.duplicateSuccessfulItems, 0);
  assert.equal(row.repeatRequests, 0);
  for (const [count, size] of [
    [0, 50],
    [201, 201],
    [1.5, 25],
  ])
    await assert.rejects(
      evaluateTriageRecovery(count, size, 'article', 'throw'),
    );
});
