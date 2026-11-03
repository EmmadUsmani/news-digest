import assert from 'node:assert/strict';
import test from 'node:test';

import {
  evaluateClusterMembership,
  evaluateEventGrouping,
} from '../scripts/evaluate-event-grouping';

void test('recorded strict event labels expose false merges and missed paraphrases', () => {
  const result = evaluateEventGrouping();
  assert.equal(result.pairs, 98);
  assert.equal(result.positives, 57);
  assert.equal(result.negatives, 41);
  assert.equal(result.falsePositives, 0);
  assert.equal(result.truePositives, 0);
  assert.equal(result.truePositives + result.falseNegatives, result.positives);
  assert.equal(result.precision, null);
  assert.equal(result.disagreements.length, result.falseNegatives);
  assert.equal(result.windows.length, 6);
  const gaming = result.windows.find((window) =>
    window.window.includes('gaming'),
  )!;
  assert.equal(gaming.positives, 10);
  assert.equal(gaming.negatives, 12);
  assert.equal(gaming.truePositives, 0);
  assert.equal(gaming.falsePositives, 0);
});

void test('cluster evaluation separates unknown merges and exposes complete-link order sensitivity', () => {
  const candidates = ['a', 'b', 'c'].map((id) => ({
    id,
    title: id,
    url: `https://example.org/${id}`,
    excerpt: '',
    publishedAt: '2026-11-02T12:00:00Z',
    sources: ['Fixture'],
    points: 0,
  }));
  // A-B and B-C match pairwise; A-C must never be chained into one cluster.
  const result = evaluateClusterMembership(
    candidates,
    [
      { left: 'a', right: 'b', sameEvent: true },
      { left: 'a', right: 'c', sameEvent: false },
    ],
    (a, b) => [a.id, b.id].sort().join('') !== 'ac',
  );
  assert.equal(result.clusters, 2);
  assert.equal(result.truePositives, 1);
  assert.equal(result.falsePositives, 0);
  assert.equal(result.unlabeledMergedPairs, 0);
  assert.equal(result.reverse.unlabeledMergedPairs, 1);
  assert.equal(result.reverse.labeledPrecision, null);
  assert.equal(result.reverse.missedPositivePairs, 1);
  assert.equal(result.orderSensitivePairs, 2);
  const incorrect = evaluateClusterMembership(
    candidates,
    [{ left: 'a', right: 'c', sameEvent: false }],
    () => true,
  );
  assert.equal(incorrect.mergedPairs, 3);
  assert.equal(incorrect.falsePositives, 1);
  assert.equal(incorrect.unlabeledMergedPairs, 2);
  assert.equal(incorrect.labeledPrecision, 0);
});

void test('permutation review catches instability hidden by forward and reverse agreement', () => {
  const candidates = ['a', 'b', 'c', 'd'].map((id) => ({
    id,
    title: id,
    url: `https://example.org/${id}`,
    excerpt: '',
    publishedAt: '2026-11-02T12:00:00Z',
    sources: ['Fixture'],
    points: 0,
  }));
  const matches = (a: { id: string }, b: { id: string }) =>
    ['ac', 'bc', 'bd'].includes([a.id, b.id].sort().join(''));
  const result = evaluateClusterMembership(
    candidates,
    [
      { left: 'a', right: 'c', sameEvent: true },
      { left: 'b', right: 'd', sameEvent: true },
      { left: 'b', right: 'c', sameEvent: false },
    ],
    matches,
  );
  assert.equal(result.orderSensitivePairs, 0);
  assert.equal(result.falsePositives, 0);
  assert.equal(result.reverse.falsePositives, 0);
  assert.deepEqual(result.permutationCheck, {
    orders: 24,
    exhaustive: true,
    orderSensitivePairs: 3,
    maxFalsePositives: 1,
    maxUnlabeledMergedPairs: 0,
    minMatchedPositivePairs: 0,
    maxMatchedPositivePairs: 2,
  });
});

void test('large-window permutation sampling is bounded, reproducible and labels unknown merges', () => {
  const candidates = Array.from({ length: 7 }, (_, index) => ({
    id: String(index),
    title: String(index),
    url: `https://example.org/${index}`,
    excerpt: '',
    publishedAt: '2026-11-02T12:00:00Z',
    sources: ['Fixture'],
    points: 0,
  }));
  const evaluate = () =>
    evaluateClusterMembership(candidates, [], () => true).permutationCheck;
  assert.deepEqual(evaluate(), evaluate());
  assert.deepEqual(evaluate(), {
    orders: 34,
    exhaustive: false,
    orderSensitivePairs: 0,
    maxFalsePositives: 0,
    maxUnlabeledMergedPairs: 21,
    minMatchedPositivePairs: 0,
    maxMatchedPositivePairs: 0,
  });
  assert.equal(evaluateClusterMembership([], []).permutationCheck.orders, 1);
});
