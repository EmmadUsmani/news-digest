import assert from 'node:assert/strict';
import test from 'node:test';

import { evaluateEventGrouping } from '../scripts/evaluate-event-grouping';
import { sameEventWithGameScore } from '../src/modules/digests/domain/game-event';

void test('recorded strict event labels expose false merges and missed paraphrases', () => {
  const result = evaluateEventGrouping();
  assert.equal(result.pairs, 55);
  assert.equal(result.positives, 27);
  assert.equal(result.negatives, 28);
  assert.equal(result.falsePositives, 0);
  assert.ok(
    result.truePositives > 0,
    'Precision needs actual predicted merges',
  );
  assert.equal(result.truePositives + result.falseNegatives, result.positives);
  assert.equal(result.precision, 1);
  assert.equal(result.disagreements.length, result.falseNegatives);
  assert.equal(result.windows.length, 5);
  const gaming = result.windows.find((window) =>
    window.window.includes('gaming'),
  )!;
  assert.equal(gaming.positives, 8);
  assert.equal(gaming.negatives, 12);
  assert.equal(gaming.truePositives, 0);
  assert.equal(gaming.falsePositives, 0);
});

void test('opt-in grouping preserves recorded negative labels in both argument orders', () => {
  const forward = evaluateEventGrouping(sameEventWithGameScore);
  const reversed = evaluateEventGrouping((a, b) =>
    sameEventWithGameScore(b, a),
  );
  assert.equal(forward.truePositives, 7);
  assert.equal(forward.falsePositives, 0);
  assert.deepEqual(reversed, forward);
});
