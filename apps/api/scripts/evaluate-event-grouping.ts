// Offline only: recorded articles and explicit pair labels, no database or provider calls.
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import {
  clusterCandidates,
  noGrouping,
} from '../src/modules/digests/domain/cluster';
import type { Candidate } from '../src/modules/digests/domain/rank';

interface EventLabel {
  left: string;
  right: string;
  sameEvent: boolean;
}

function evaluationOrders(candidates: Candidate[]): Candidate[][] {
  const canonical = [...candidates].sort((a, b) => a.id.localeCompare(b.id));
  if (canonical.length <= 6) {
    const permutations = (items: Candidate[]): Candidate[][] =>
      items.length === 0
        ? [[]]
        : items.flatMap((item, index) =>
            permutations(items.filter((_, i) => i !== index)).map((rest) => [
              item,
              ...rest,
            ]),
          );
    return permutations(canonical);
  }
  // Bounded, reproducible samples independent of the fixture's initial order.
  let state = 434;
  const orders = [candidates, [...candidates].reverse()];
  for (let sample = 0; sample < 32; sample++) {
    const order = [...canonical];
    for (let i = order.length - 1; i > 0; i--) {
      state = (Math.imul(state, 1664525) + 1013904223) >>> 0;
      const j = state % (i + 1);
      [order[i], order[j]] = [order[j], order[i]];
    }
    orders.push(order);
  }
  return orders;
}

// Evaluate every within-cluster pair, including pairs absent from sparse labels.
// Unknown pairs are never counted as correct merges.
export function evaluateClusterMembership(
  candidates: Candidate[],
  labels: EventLabel[],
  matches = noGrouping,
) {
  const key = (left: string, right: string) => [left, right].sort().join(':');
  const known = new Map(
    labels.map((pair) => [key(pair.left, pair.right), pair.sameEvent]),
  );
  // Matchers are pure; reuse directional comparisons across all input orders.
  const comparisons = new Map<Candidate, Map<Candidate, boolean>>();
  const cachedMatch = (a: Candidate, b: Candidate) => {
    let row = comparisons.get(a);
    if (!row) comparisons.set(a, (row = new Map()));
    if (!row.has(b)) row.set(b, matches(a, b));
    return row.get(b)!;
  };
  const inspect = (ordered: Candidate[]) => {
    const clusters = clusterCandidates(ordered, cachedMatch);
    const merged = new Set<string>();
    for (const group of clusters)
      for (let i = 0; i < group.length; i++)
        for (let j = i + 1; j < group.length; j++)
          merged.add(key(group[i].id, group[j].id));
    const truePositives = [...merged].filter(
      (pair) => known.get(pair) === true,
    ).length;
    const falsePositives = [...merged].filter(
      (pair) => known.get(pair) === false,
    ).length;
    return {
      clusters: clusters.length,
      mergedPairs: merged.size,
      truePositives,
      falsePositives,
      unlabeledMergedPairs: [...merged].filter((pair) => !known.has(pair))
        .length,
      unlabeledPairs: [...merged]
        .filter((pair) => !known.has(pair))
        .map((pair) => {
          const members = candidates.filter((candidate) =>
            pair.split(':').includes(candidate.id),
          );
          return members.map(({ id, title }) => ({ id, title }));
        }),
      missedPositivePairs: labels.filter(
        (pair) => pair.sameEvent && !merged.has(key(pair.left, pair.right)),
      ).length,
      labeledPrecision:
        truePositives + falsePositives
          ? truePositives / (truePositives + falsePositives)
          : null,
      merged,
    };
  };
  const { merged: forward, ...result } = inspect(candidates);
  const { merged: backward, ...reverse } = inspect([...candidates].reverse());
  const samples = evaluationOrders(candidates).map(inspect);
  const possible = new Set(samples.flatMap((sample) => [...sample.merged]));
  const unstable = [...possible].filter((pair) =>
    samples.some((sample) => !sample.merged.has(pair)),
  );
  return {
    ...result,
    permutationCheck: {
      orders: samples.length,
      exhaustive: candidates.length <= 6,
      orderSensitivePairs: unstable.length,
      maxFalsePositives: Math.max(
        ...samples.map((sample) => sample.falsePositives),
      ),
      maxUnlabeledMergedPairs: Math.max(
        ...samples.map((sample) => sample.unlabeledMergedPairs),
      ),
      minMatchedPositivePairs: Math.min(
        ...samples.map((sample) => sample.truePositives),
      ),
      maxMatchedPositivePairs: Math.max(
        ...samples.map((sample) => sample.truePositives),
      ),
    },
    reverse,
    orderSensitivePairs: new Set([
      ...[...forward].filter((pair) => !backward.has(pair)),
      ...[...backward].filter((pair) => !forward.has(pair)),
    ]).size,
  };
}

export function evaluateEventGrouping(matches = noGrouping) {
  const root = join(__dirname, '../test/fixtures');
  const fixture = JSON.parse(
    readFileSync(join(root, 'event-grouping-pairs.json'), 'utf8'),
  ) as {
    note: string;
    pairs: {
      window: string;
      left: string;
      right: string;
      sameEvent: boolean;
      reason: string;
    }[];
  };
  const seen = new Set<string>();
  const windows = new Map<string, Candidate[]>();
  const pairs = fixture.pairs.map((pair) => {
    if (
      !/^ranking-(tech|nba|world)-2026-11-01\.json$/.test(pair.window) &&
      !/^event-grouping-(nba|gaming)-2026-11-02\.json$/.test(pair.window) &&
      pair.window !== 'event-grouping-gaming-2026-11-03.json'
    )
      throw new Error('Unknown recorded window');
    if (!windows.has(pair.window))
      windows.set(
        pair.window,
        (
          JSON.parse(readFileSync(join(root, pair.window), 'utf8')) as {
            candidates: Candidate[];
          }
        ).candidates,
      );
    const candidates = windows.get(pair.window)!;
    const left = candidates.find((item) => item.id === pair.left);
    const right = candidates.find((item) => item.id === pair.right);
    const key = [pair.window, ...[pair.left, pair.right].sort()].join(':');
    if (
      !left ||
      !right ||
      left.id === right.id ||
      seen.has(key) ||
      typeof pair.sameEvent !== 'boolean' ||
      !pair.reason.trim()
    )
      throw new Error('Missing, duplicate or invalid pair label');
    seen.add(key);
    return {
      ...pair,
      titles: [left.title, right.title],
      predictedSameEvent: matches(left, right),
    };
  });
  const truePositives = pairs.filter(
    (pair) => pair.sameEvent && pair.predictedSameEvent,
  ).length;
  const falsePositives = pairs.filter(
    (pair) => !pair.sameEvent && pair.predictedSameEvent,
  ).length;
  const positives = pairs.filter((pair) => pair.sameEvent).length;
  return {
    note: fixture.note,
    pairs: pairs.length,
    positives,
    negatives: pairs.length - positives,
    truePositives,
    falsePositives,
    falseNegatives: positives - truePositives,
    precision:
      truePositives + falsePositives
        ? truePositives / (truePositives + falsePositives)
        : null,
    recall: positives ? truePositives / positives : null,
    windows: [...windows.keys()].map((window) => {
      const labeled = pairs.filter((pair) => pair.window === window);
      return {
        window,
        membership: evaluateClusterMembership(
          windows.get(window)!,
          labeled,
          matches,
        ),
        positives: labeled.filter((pair) => pair.sameEvent).length,
        negatives: labeled.filter((pair) => !pair.sameEvent).length,
        truePositives: labeled.filter(
          (pair) => pair.sameEvent && pair.predictedSameEvent,
        ).length,
        falsePositives: labeled.filter(
          (pair) => !pair.sameEvent && pair.predictedSameEvent,
        ).length,
      };
    }),
    disagreements: pairs.filter(
      (pair) => pair.sameEvent !== pair.predictedSameEvent,
    ),
  };
}
