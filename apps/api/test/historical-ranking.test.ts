import { test } from 'node:test';
import assert from 'node:assert/strict';
import { evaluateNbaWindow, evaluateWorldWindow } from '../scripts/evaluate-ranking';

test('recorded NBA window preserves baseline event recall and omits labeled filler', () => {
 const result = evaluateNbaWindow();
 assert.equal(result.candidates,52);
 assert.equal(result.targetEvents,5);
 assert.ok(result.selected.length <= result.budget);
 assert.ok(result.eventRecall >= 0.4,JSON.stringify(result));
 assert.ok(result.targetSlotYield >= 0.4,JSON.stringify(result));
 assert.deepEqual(result.forbiddenSelected,[]);
});

test('recorded World window preserves baseline event recall and omits labeled filler', () => {
 const result = evaluateWorldWindow();
 assert.equal(result.candidates,47);
 assert.equal(result.targetEvents,5);
 assert.ok(result.selected.length <= result.budget);
 assert.ok(result.eventRecall >= 0.2,JSON.stringify(result));
 assert.ok(result.targetSlotYield >= 0.2,JSON.stringify(result));
 assert.deepEqual(result.forbiddenSelected,[]);
 assert.equal(result.eventDiagnostics.length,5);
 assert.ok(result.eventDiagnostics.every(event => event.recordedArticles > 0));
});
