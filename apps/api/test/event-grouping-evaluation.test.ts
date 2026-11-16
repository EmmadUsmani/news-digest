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

void test('later Gaming pairs distinguish ceremony coverage from franchise overlap', () => {
  const baseline = evaluateEventGrouping(undefined, undefined, 'later-gaming');
  assert.equal(baseline.pairs, 10);
  assert.equal(baseline.positives, 6);
  assert.equal(baseline.negatives, 4);
  assert.equal(baseline.windows.length, 1);
  assert.equal(baseline.falseNegatives, 6);
  assert.equal(baseline.falsePositives, 0);
  const window = baseline.windows[0].window;
  assert.equal(window, 'ranking-gaming-2026-11-12.json');
  // A broad franchise heuristic must fail even though both texts mention Witcher.
  const franchise = evaluateEventGrouping(
    (a, b) => /witcher/i.test(a.title) && /witcher/i.test(b.title),
    undefined,
    'later-gaming',
  );
  assert.equal(franchise.falsePositives, 2);
  assert.ok(franchise.windows[0].membership.unlabeledMergedPairs > 0);
  // Labels supply a control only, not a semantic matcher or accuracy estimate.
  const fixture = JSON.parse(
    readFileSync(
      join(__dirname, 'fixtures/ranking-gaming-2026-11-12.json'),
      'utf8',
    ),
  ) as {
    events: { ids: string[] }[];
  };
  const control = evaluateEventGrouping(
    undefined,
    {
      [window]: fixture.events
        .map((event) => event.ids)
        .filter((ids) => ids.length > 1),
    },
    'later-gaming',
  );
  assert.equal(control.truePositives, 6);
  assert.equal(control.falsePositives, 0);
  assert.equal(control.recall, 1);
  // Additional within-event pairs remain unknown rather than silently accepted.
  assert.ok(control.windows[0].membership.unlabeledMergedPairs > 0);
});

void test('later Tech pairs separate outage providers, lawsuit claims and subsequent allegations', () => {
  const baseline = evaluateEventGrouping(undefined, undefined, 'later-tech');
  assert.equal(baseline.pairs, 13);
  assert.equal(baseline.positives, 8);
  assert.equal(baseline.negatives, 5);
  assert.equal(baseline.falseNegatives, 8);
  assert.equal(baseline.falsePositives, 0);
  assert.equal(baseline.windows.length, 1);
  const window = baseline.windows[0].window;
  assert.equal(window, 'ranking-tech-2026-11-13.json');
  // Downtime words alone incorrectly merge independent cloud-provider incidents.
  const outages = evaluateEventGrouping(
    (a, b) =>
      /outage|down|errors/i.test(a.title) &&
      /outage|down|errors/i.test(b.title),
    undefined,
    'later-tech',
  );
  assert.equal(outages.falsePositives, 2);
  assert.ok(outages.windows[0].membership.unlabeledMergedPairs > 0);
  const recorded = JSON.parse(
    readFileSync(join(__dirname, 'fixtures', window), 'utf8'),
  ) as { events: { ids: string[] }[] };
  const control = evaluateEventGrouping(
    undefined,
    { [window]: recorded.events.map((event) => event.ids) },
    'later-tech',
  );
  assert.equal(control.truePositives, 8);
  assert.equal(control.falsePositives, 0);
  assert.equal(control.recall, 1);
  // Unreviewed pairs stay unknown even when the event-label control merges them.
  assert.ok(control.windows[0].membership.unlabeledMergedPairs > 0);
});

void test('later NBA pairs retain game injury consequences and leave the Irving retrospective unknown', () => {
  const baseline = evaluateEventGrouping(undefined, undefined, 'later-nba');
  assert.equal(baseline.pairs, 15);
  assert.equal(baseline.positives, 4);
  assert.equal(baseline.negatives, 11);
  assert.equal(baseline.falseNegatives, 4);
  const broad = evaluateEventGrouping(() => true, undefined, 'later-nba');
  assert.equal(broad.falsePositives, 11);
  assert.equal(broad.windows[0].membership.unlabeledMergedPairs, 6);
  const window = 'event-grouping-nba-2026-11-15.json';
  const control = evaluateEventGrouping(
    undefined,
    {
      [window]: [
        [
          'cc023ec6-2a0a-4bc3-a824-6db973d3e855',
          '427f7fbb-00ea-4091-8d42-6bfb6171c373',
        ],
        [
          'fdcfcd18-321b-4028-81fc-eb6ef6d28d21',
          'd1a8d5ad-8e0f-491c-8b2e-7a02c9d0a496',
          '04aa058e-0688-4086-843f-5a75cfadd6cf',
        ],
      ],
    },
    'later-nba',
  );
  assert.equal(control.truePositives, 4);
  assert.equal(control.falsePositives, 0);
  assert.equal(control.windows[0].membership.unlabeledMergedPairs, 0);
  // A historical unknown must not turn into a positive or negative judgment.
  const unresolved = evaluateEventGrouping(
    undefined,
    {
      [window]: [
        [
          'cc023ec6-2a0a-4bc3-a824-6db973d3e855',
          '189a8242-21fd-4f13-a8a0-4dd3ffb58f13',
        ],
      ],
    },
    'later-nba',
  );
  assert.equal(unresolved.truePositives, 0);
  assert.equal(unresolved.falsePositives, 0);
  assert.equal(unresolved.windows[0].membership.unlabeledMergedPairs, 1);
});

void test('later World labels separate conflicts and keep broad Trump analysis unknown', () => {
  const baseline = evaluateEventGrouping(undefined, undefined, 'later-world');
  assert.equal(baseline.pairs, 36);
  assert.equal(baseline.positives, 5);
  assert.equal(baseline.negatives, 31);
  assert.equal(baseline.falseNegatives, 5);
  const control = evaluateEventGrouping(
    undefined,
    {
      'event-grouping-world-2026-11-15.json': [
        [
          '3cccf465-358b-4c2c-aa89-85b7feb44404',
          '464e5d64-85f0-453b-984e-4b082775b48c',
          'c5a67785-b640-45ca-948f-d86d7e1de968',
        ],
        [
          '4aba097c-9e4a-4159-9e21-fc6a8ac60475',
          'c7122227-5224-4ff1-8878-c45d3c3970d4',
        ],
        [
          'fbd83e46-dadc-418d-b7f3-6a1d5a6e3ce5',
          'ac1296d6-2571-44d6-a2ba-8dae2c14d099',
        ],
      ],
    },
    'later-world',
  );
  assert.equal(control.truePositives, 5);
  assert.equal(control.falsePositives, 0);
  assert.equal(control.windows[0].membership.unlabeledMergedPairs, 0);
  const broad = evaluateEventGrouping(() => true, undefined, 'later-world');
  assert.equal(broad.falsePositives, 31);
  assert.equal(broad.windows[0].membership.unlabeledMergedPairs, 9);
  const unresolved = evaluateEventGrouping(
    undefined,
    {
      'event-grouping-world-2026-11-15.json': [
        [
          '960621a8-61b7-4569-b2aa-f4964574eea3',
          '5aa1e63b-7dc7-46be-9010-e5961f4df549',
        ],
      ],
    },
    'later-world',
  );
  assert.equal(unresolved.truePositives, 0);
  assert.equal(unresolved.falsePositives, 0);
  assert.equal(unresolved.windows[0].membership.unlabeledMergedPairs, 1);
});

void test('later U.S. labels separate election outcomes from leadership, health policy and litigation', () => {
  const baseline = evaluateEventGrouping(undefined, undefined, 'later-us');
  assert.equal(baseline.pairs, 15);
  assert.equal(baseline.positives, 1);
  assert.equal(baseline.negatives, 14);
  assert.equal(baseline.falseNegatives, 1);
  const window = 'event-grouping-us-2026-11-15.json';
  const alaska = [
    '31c4d3d9-bbf1-4844-8f3a-29d8780cee67',
    '662e60eb-cc10-4e3d-ba61-0de2bd87b95e',
  ];
  const control = evaluateEventGrouping(
    undefined,
    { [window]: [alaska] },
    'later-us',
  );
  assert.equal(control.truePositives, 1);
  assert.equal(control.falsePositives, 0);
  assert.equal(control.windows[0].membership.unlabeledMergedPairs, 0);
  const electionOvermerge = evaluateEventGrouping(
    undefined,
    {
      [window]: [
        [
          ...alaska,
          '560c9e5e-38c6-4ee7-9b1b-008ba001ef42',
          'e459a5aa-e56e-4dda-a685-31410206b53c',
        ],
      ],
    },
    'later-us',
  );
  assert.equal(electionOvermerge.truePositives, 1);
  assert.equal(electionOvermerge.falsePositives, 5);
  const broad = evaluateEventGrouping(() => true, undefined, 'later-us');
  assert.equal(broad.falsePositives, 14);
  assert.equal(broad.windows[0].membership.unlabeledMergedPairs, 0);
});
