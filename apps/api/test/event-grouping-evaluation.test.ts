import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import test from 'node:test';

import {
  evaluateClusterMembership,
  evaluateEventGrouping,
} from '../scripts/evaluate-event-grouping';

void test('recorded strict event labels expose false merges and missed paraphrases', () => {
  const result = evaluateEventGrouping();
  assert.equal(result.pairs, 138);
  assert.equal(result.positives, 77);
  assert.equal(result.negatives, 61);
  assert.equal(result.falsePositives, 0);
  assert.equal(result.truePositives, 0);
  assert.equal(result.truePositives + result.falseNegatives, result.positives);
  assert.equal(result.precision, null);
  assert.equal(result.disagreements.length, result.falseNegatives);
  assert.equal(result.windows.length, 7);
  const freshNba = result.windows.find(
    (entry) => entry.window === 'event-grouping-nba-2026-11-03.json',
  )!;
  assert.equal(freshNba.positives, 20);
  assert.equal(freshNba.negatives, 20);
  assert.equal(freshNba.membership.mergedPairs, 0);

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

void test('saved AI memberships score labels and all within-group pairs without provider calls', () => {
  const baseline = evaluateEventGrouping();
  const pair = baseline.disagreements[0];
  const saved = { [pair.window]: [[pair.left, pair.right]] };
  const result = evaluateEventGrouping(undefined, saved);
  assert.equal(result.truePositives, 1);
  assert.equal(result.falsePositives, 0);
  assert.equal(result.precision, 1);
  assert.equal(result.recall, 1 / baseline.positives);
  const membership = result.windows.find(
    (item) => item.window === pair.window,
  )!.membership;
  assert.equal(membership.mergedPairs, 1);
  assert.equal(membership.unlabeledMergedPairs, 0);
  assert.equal(membership.permutationCheck.orderSensitivePairs, 0);
  assert.deepEqual(evaluateEventGrouping(undefined, {}), baseline);
});

void test('saved AI memberships reject unknown windows, IDs and repeated membership', () => {
  const pair = evaluateEventGrouping().disagreements[0];
  for (const groups of [
    [[pair.left]],
    [[pair.left, 'unknown']],
    [[pair.left, pair.left]],
    [
      [pair.left, pair.right],
      [pair.left, pair.right],
    ],
  ]) {
    assert.throws(() =>
      evaluateEventGrouping(undefined, { [pair.window]: groups }),
    );
  }
  assert.throws(() => evaluateEventGrouping(undefined, { 'unknown.json': [] }));
  // An ID known in a different recorded topic/window is still invalid here.
  const other = evaluateEventGrouping().disagreements.find(
    (item) => item.window !== pair.window,
  )!;
  assert.throws(() =>
    evaluateEventGrouping(undefined, {
      [pair.window]: [[pair.left, other.left]],
    }),
  );
});

void test('saved AI groups expose wrong and unlabelled merges rather than inflating precision', () => {
  const fixture = JSON.parse(
    readFileSync(join(__dirname, 'fixtures/event-grouping-pairs.json'), 'utf8'),
  ) as {
    pairs: {
      window: string;
      left: string;
      right: string;
      sameEvent: boolean;
    }[];
  };
  const negative = fixture.pairs.find((pair) => !pair.sameEvent)!;
  const result = evaluateEventGrouping(undefined, {
    [negative.window]: [[negative.left, negative.right]],
  });
  assert.equal(result.falsePositives, 1);
  assert.equal(result.precision, 0);
  const window = negative.window;
  const recorded = JSON.parse(
    readFileSync(join(__dirname, 'fixtures', window), 'utf8'),
  ) as {
    candidates: { id: string }[];
  };
  const key = (a: string, b: string) => JSON.stringify([a, b].sort());
  const known = new Set(
    fixture.pairs
      .filter((pair) => pair.window === window)
      .map((pair) => key(pair.left, pair.right)),
  );
  const left = recorded.candidates[0].id;
  const right = recorded.candidates.find(
    (item) => item.id !== left && !known.has(key(left, item.id)),
  )!.id;
  const unknown = evaluateEventGrouping(undefined, {
    [window]: [[left, right]],
  });
  assert.equal(unknown.precision, null);
  assert.equal(
    unknown.windows.find((item) => item.window === window)!.membership
      .unlabeledMergedPairs,
    1,
  );
  assert.throws(() =>
    evaluateEventGrouping(
      undefined,
      JSON.parse(JSON.stringify({ [window]: null })) as Record<
        string,
        string[][]
      >,
    ),
  );
});

void test('once-only paid evaluation remains reproducible and fails the activation gate', () => {
  const memberships = JSON.parse(
    readFileSync(
      join(__dirname, 'fixtures/event-grouping-evaluation-2026-11-03.json'),
      'utf8',
    ),
  ) as Record<string, string[][]>;
  const result = evaluateEventGrouping(undefined, memberships);
  assert.equal(result.truePositives, 76);
  assert.equal(result.falsePositives, 2);
  assert.equal(result.falseNegatives, 1);
  assert.equal(result.precision, 76 / 78);
  assert.equal(result.recall, 76 / 77);
  assert.equal(
    result.windows.reduce(
      (sum, entry) => sum + entry.membership.unlabeledMergedPairs,
      0,
    ),
    57,
  );
  const fresh = result.windows.find(
    (entry) => entry.window === 'event-grouping-nba-2026-11-03.json',
  )!;
  assert.equal(fresh.truePositives, 20);
  assert.equal(fresh.falsePositives, 1);
});

void test('same-story review covers every original label and previously unknown merge without changing historical evidence', () => {
  const fixture = (name: string) =>
    JSON.parse(readFileSync(join(__dirname, 'fixtures', name), 'utf8'));
  const original = fixture('event-grouping-pairs.json').pairs as {
    window: string;
    left: string;
    right: string;
    sameEvent: boolean;
  }[];
  const reviewed = fixture('same-story-pairs.json')
    .pairs as ((typeof original)[number] & {
    originalPairIndex: number | null;
    reason: string;
    borderline: boolean;
  })[];
  assert.equal(reviewed.length, 195);
  original.forEach((pair, index) => {
    const review = reviewed.filter((item) => item.originalPairIndex === index);
    assert.equal(review.length, 1);
    assert.equal(review[0].window, pair.window);
    assert.equal(review[0].left, pair.left);
    assert.equal(review[0].right, pair.right);
  });
  assert.equal(
    reviewed.filter((pair) => pair.originalPairIndex === null).length,
    57,
  );
  assert.equal(reviewed.filter((pair) => pair.borderline).length, 10);
  assert.ok(
    reviewed.every(
      (pair) => pair.reason.trim() && typeof pair.borderline === 'boolean',
    ),
  );

  const memberships = fixture(
    'event-grouping-evaluation-2026-11-03.json',
  ) as Record<string, string[][]>;
  const result = evaluateEventGrouping(undefined, memberships, 'same-story');
  assert.equal(result.pairs, 195);
  assert.equal(result.positives, 157);
  assert.equal(result.negatives, 38);
  assert.equal(result.truePositives, 135);
  assert.equal(result.falsePositives, 0);
  assert.equal(result.falseNegatives, 22);
  assert.equal(result.precision, 1);
  assert.equal(result.recall, 135 / 157);
  assert.equal(result.borderlineMergedPairs, 0);
  assert.equal(result.clearlyUnrelatedMergedPairs, 0);
  assert.ok(
    result.windows.every(
      (window) => window.membership.unlabeledMergedPairs === 0,
    ),
  );
  // Broadening the story boundary changes labels, not the recorded prediction.
  const strict = evaluateEventGrouping(undefined, memberships);
  assert.equal(strict.falsePositives, 2);
  assert.equal(strict.truePositives, 76);
  assert.equal(strict.pairs, 138);
  // A clearly unrelated games pair must still fail with the new labels.
  const negative = reviewed.find(
    (pair) => !pair.sameEvent && !pair.borderline,
  )!;
  const unrelated = evaluateEventGrouping(
    undefined,
    {
      [negative.window]: [[negative.left, negative.right]],
    },
    'same-story',
  );
  assert.equal(unrelated.clearlyUnrelatedMergedPairs, 1);
  assert.equal(unrelated.falsePositives, 1);
  const borderline = reviewed.find(
    (pair) => pair.borderline && pair.sameEvent,
  )!;
  assert.equal(
    evaluateEventGrouping(
      undefined,
      {
        [borderline.window]: [[borderline.left, borderline.right]],
      },
      'same-story',
    ).borderlineMergedPairs,
    1,
  );
});
