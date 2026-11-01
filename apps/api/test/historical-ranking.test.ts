import { test } from 'node:test';
import assert from 'node:assert/strict';
import { evaluateNbaWindow, evaluateWorldWindow, evaluateTechWindow } from '../scripts/evaluate-ranking';

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

// The first Tech baseline finds zero targets. Do not disguise a vacuous >= 0
// assertion as a quality floor: validate labels/diagnostics and guard omissions.
test('recorded Tech window reports all labeled articles and omits labeled filler', () => {
 const result = evaluateTechWindow();
 assert.equal(result.candidates,54);
 assert.equal(result.targetEvents,5);
 assert.equal(result.eventDiagnostics.length,result.targetEvents);
 assert.ok(result.selected.length > 0 && result.selected.length <= result.budget);
 assert.deepEqual(result.forbiddenSelected,[]);
 for (const event of result.eventDiagnostics) {
 assert.ok(event.recordedArticles > 0);
 assert.equal(event.articles.length,event.recordedArticles);
 assert.equal(event.articles.filter(article => article.relevanceEligible).length,event.relevanceEligibleArticles);
 for (const article of event.articles) {
 assert.ok(article.relevanceReason);
 if (article.selected) {
 assert.equal(article.relevanceEligible,true);
 assert.equal(article.qualityRule,null);
 }
 }
 assert.equal(result.foundEvents.includes(event.name),event.articles.some(article => article.selected));
 assert.equal(result.missedEvents.includes(event.name),!result.foundEvents.includes(event.name));
 if (event.articles.some(article => article.selected)) assert.ok(event.firstRankWithinTwenty !== null && event.firstRankWithinTwenty <= result.budget);
 }
 assert.equal(result.eventRecall,result.foundEvents.length/result.targetEvents);
 assert.equal(result.targetSlotYield,result.foundEvents.length/result.selected.length);
});
