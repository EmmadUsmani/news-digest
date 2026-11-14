import assert from 'node:assert/strict';
import { test } from 'node:test';

import {
  evaluateFixture,
  evaluateGamingWindow,
  evaluateLaterTechWindow,
  evaluateNbaWindow,
  evaluateTechWindow,
  evaluateWorldWindow,
} from '../scripts/evaluate-ranking';

void test('recorded NBA window preserves baseline event recall and omits labeled filler', () => {
  const result = evaluateNbaWindow();
  assert.equal(result.candidates, 52);
  assert.equal(result.targetEvents, 5);
  assert.ok(result.selected.length <= result.budget);
  assert.ok(
    result.eventRecall !== null && result.eventRecall >= 0.4,
    JSON.stringify(result),
  );
  assert.ok(result.targetSlotYield >= 0.4, JSON.stringify(result));
  assert.deepEqual(result.forbiddenSelected, []);
});

void test('recorded World window preserves baseline event recall and omits labeled filler', () => {
  const result = evaluateWorldWindow();
  assert.equal(result.candidates, 47);
  assert.equal(result.targetEvents, 5);
  assert.ok(result.selected.length <= result.budget);
  assert.ok(
    result.eventRecall !== null && result.eventRecall >= 0.2,
    JSON.stringify(result),
  );
  assert.ok(result.targetSlotYield >= 0.2, JSON.stringify(result));
  assert.deepEqual(result.forbiddenSelected, []);
  assert.equal(result.eventDiagnostics.length, 5);
  assert.ok(
    result.eventDiagnostics.every((event) => event.recordedArticles > 0),
  );
});

// The first Tech baseline finds zero targets. Do not disguise a vacuous >= 0
// assertion as a quality floor: validate labels/diagnostics and guard omissions.
void test('recorded Tech window reports all labeled articles and omits labeled filler', () => {
  const result = evaluateTechWindow();
  assert.equal(result.candidates, 54);
  assert.equal(result.targetEvents, 5);
  assert.equal(result.eventDiagnostics.length, result.targetEvents);
  assert.ok(
    result.selected.length > 0 && result.selected.length <= result.budget,
  );
  assert.deepEqual(result.forbiddenSelected, []);
  for (const event of result.eventDiagnostics) {
    assert.ok(event.recordedArticles > 0);
    assert.equal(event.articles.length, event.recordedArticles);
    assert.equal(
      event.articles.filter((article) => article.relevanceEligible).length,
      event.relevanceEligibleArticles,
    );
    for (const article of event.articles) {
      assert.ok(article.relevanceReason);
      if (article.selected) {
        assert.equal(article.relevanceEligible, true);
        assert.equal(article.qualityRule, null);
      }
    }
    assert.equal(
      result.foundEvents.includes(event.name),
      event.articles.some((article) => article.selected),
    );
    assert.equal(
      result.missedEvents.includes(event.name),
      !result.foundEvents.includes(event.name),
    );
    if (event.articles.some((article) => article.selected))
      assert.ok(
        event.firstRankWithinTwenty !== null &&
          event.firstRankWithinTwenty <= result.budget,
      );
  }
  assert.equal(
    result.eventRecall,
    result.foundEvents.length / result.targetEvents,
  );
  assert.equal(
    result.targetSlotYield,
    result.foundEvents.length / result.selected.length,
  );
});

// A later Gaming window adds topic/date coverage without fitting production scores.
void test('recorded Gaming window counts a ceremony once and preserves its event baseline', () => {
  const result = evaluateGamingWindow();
  assert.equal(result.candidates, 200);
  assert.equal(result.targetEvents, 5);
  assert.ok(
    result.selected.length > 0 && result.selected.length <= result.budget,
  );
  assert.ok(
    result.eventRecall !== null && result.eventRecall >= 0.2,
    JSON.stringify(result),
  );
  assert.ok(result.targetSlotYield >= 0.2, JSON.stringify(result));
  assert.deepEqual(result.forbiddenSelected, []);
  const ceremony = result.eventDiagnostics.find(
    (event) => event.name === 'Golden Joystick ceremony winners',
  );
  assert.ok(ceremony && ceremony.recordedArticles > 1);
  assert.equal(
    result.foundEvents.filter((name) => name === ceremony.name).length,
    ceremony.articles.some((article) => article.selected) ? 1 : 0,
  );
  for (const event of result.eventDiagnostics) {
    assert.equal(event.articles.length, event.recordedArticles);
    assert.equal(
      result.foundEvents.includes(event.name),
      event.articles.some((article) => article.selected),
    );
    assert.equal(
      event.relevanceEligibleArticles,
      event.articles.filter((article) => article.relevanceEligible).length,
    );
  }
});

void test('label grouping frees repeated slots while keeping unknown articles separate', () => {
  const candidates = Array.from({ length: 5 }, (_, index) => ({
    id: String(index),
    title: `Reported development ${index}`,
    url: `https://example.com/${index}`,
    excerpt: 'A supplied report with substantive details.',
    publishedAt: `2026-11-12T${String(14 - index).padStart(2, '0')}:00:00Z`,
    sources: ['Recorded publisher'],
    points: 0,
  }));
  const result = evaluateFixture({
    topic: 'Synthetic grouping control',
    windowStart: '2026-11-11T15:00:00Z',
    windowEnd: '2026-11-12T15:00:00Z',
    budget: 3,
    relevancePolicy: { includeAny: ['development'], excludeAny: [] },
    candidates,
    events: [
      { name: 'Repeated event', reason: 'Control', ids: ['0', '1'] },
      { name: 'Later event', reason: 'Control', ids: ['3'] },
    ],
    mustOmit: [],
  });
  const comparison = result.labeledGroupingComparison;
  assert.equal(comparison.knownRepeatedSlots, 1);
  assert.deepEqual(result.foundEvents, ['Repeated event']);
  assert.deepEqual(comparison.groupedFoundEvents, [
    'Repeated event',
    'Later event',
  ]);
  assert.deepEqual(
    comparison.groupedSelected.map((item) => item.id),
    ['0', '2', '3'],
  );
  assert.equal(comparison.groupedSelected[0].coveredArticles, 2);
  assert.ok(comparison.groupedSlots.every((event) => event.slots <= 1));
  // With no labels, even similar unknown reports remain separate.
  const unknown = evaluateFixture({
    topic: 'Unknown control',
    windowStart: result.windowStart,
    windowEnd: result.windowEnd,
    budget: 3,
    relevancePolicy: { includeAny: ['development'], excludeAny: [] },
    candidates,
    events: [],
    mustOmit: [],
  });
  assert.equal(unknown.eventRecall, null);
  assert.deepEqual(
    unknown.labeledGroupingComparison.groupedSelected.map((item) => item.id),
    ['0', '1', '2'],
  );
});

void test('recorded label grouping measures only known events and retains omission guards', () => {
  for (const evaluate of [
    evaluateNbaWindow,
    evaluateWorldWindow,
    evaluateTechWindow,
    evaluateGamingWindow,
    evaluateLaterTechWindow,
  ]) {
    const result = evaluate();
    const comparison = result.labeledGroupingComparison;
    assert.ok(comparison.groupedSelected.length <= result.budget);
    assert.ok(comparison.groupedSlots.every((event) => event.slots <= 1));
    assert.deepEqual(comparison.groupedForbiddenSelected, []);
    assert.deepEqual(
      comparison.baselineSlots
        .filter((event) => event.slots > 0)
        .map((event) => event.name),
      result.foundEvents,
    );
    assert.equal(
      comparison.knownRepeatedSlots,
      comparison.baselineSlots.reduce(
        (total, event) => total + Math.max(0, event.slots - 1),
        0,
      ),
    );
  }
});

void test('later Tech outage labels expose a recoverable repeated slot', () => {
  const result = evaluateLaterTechWindow();
  assert.equal(result.candidates, 200);
  assert.equal(result.targetEvents, 5);
  assert.deepEqual(result.forbiddenSelected, []);
  const comparison = result.labeledGroupingComparison;
  // Measured fallback floor: two Claude reports consume separate slots.
  assert.equal(comparison.knownRepeatedSlots, 1);
  assert.equal(
    comparison.baselineSlots.find(
      (event) => event.name === 'Claude service outage',
    )?.slots,
    2,
  );
  assert.equal(
    comparison.groupedSlots.find(
      (event) => event.name === 'Claude service outage',
    )?.slots,
    1,
  );
  // ID labels are a counterfactual control, not a production semantic matcher.
  assert.ok(
    comparison.groupedFoundEvents.includes('Microsoft Outlook and 365 outage'),
  );
  assert.ok(comparison.groupedFoundEvents.length > result.foundEvents.length);
  assert.equal(comparison.groupedSelected.length, result.budget);
  assert.deepEqual(comparison.groupedForbiddenSelected, []);
});
