import { test } from 'node:test';
import assert from 'node:assert/strict';
import { evaluateNbaWindow } from '../scripts/evaluate-ranking';

test('recorded NBA window preserves baseline event recall and omits labeled filler', () => {
 const result = evaluateNbaWindow();
 assert.equal(result.candidates,52);
 assert.equal(result.targetEvents,5);
 assert.ok(result.selected.length <= result.budget);
 assert.ok(result.eventRecall >= 0.4,JSON.stringify(result));
 assert.ok(result.targetSlotYield >= 0.4,JSON.stringify(result));
 assert.deepEqual(result.forbiddenSelected,[]);
});
