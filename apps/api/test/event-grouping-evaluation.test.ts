import assert from 'node:assert/strict';
import test from 'node:test';

import { evaluateEventGrouping } from '../scripts/evaluate-event-grouping';

void test('recorded strict event labels expose false merges and missed paraphrases', () => {
  const result = evaluateEventGrouping();
  assert.equal(result.pairs, 21);
  assert.equal(result.positives, 11);
  assert.equal(result.negatives, 10);
  assert.equal(result.falsePositives, 0);
  assert.ok(
    result.truePositives > 0,
    'Precision needs actual predicted merges',
  );
  assert.equal(result.truePositives + result.falseNegatives, result.positives);
  assert.equal(result.precision, 1);
  assert.equal(result.disagreements.length, result.falseNegatives);
});
