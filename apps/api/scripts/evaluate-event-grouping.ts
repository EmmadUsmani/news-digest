// Offline only: recorded articles and explicit pair labels, no database or provider calls.
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import { sameEvent } from '../src/modules/digests/domain/cluster';
import type { Candidate } from '../src/modules/digests/domain/rank';

export function evaluateEventGrouping() {
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
    if (!/^ranking-(tech|nba|world)-2026-11-01\.json$/.test(pair.window))
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
      predictedSameEvent: sameEvent(left, right),
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
    disagreements: pairs.filter(
      (pair) => pair.sameEvent !== pair.predictedSameEvent,
    ),
  };
}
