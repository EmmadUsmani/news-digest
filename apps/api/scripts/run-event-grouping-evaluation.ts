// Evaluation orchestration only: callers supply the budgeted grouping component.
// This module never constructs a provider, changes settings or publishes editions.
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import type {
  EventGrouping,
  GroupingCandidate,
} from '../src/modules/curation/application/event-grouping';
import type { Candidate } from '../src/modules/digests/domain/rank';
import { evaluateEventGrouping } from './evaluate-event-grouping';

export function eventGroupingEvaluationPlan() {
  // Validate the labels and allowlisted windows before preparing any calls.
  const baseline = evaluateEventGrouping();
  const root = join(__dirname, '../test/fixtures');
  const labels = JSON.parse(
    readFileSync(join(root, 'event-grouping-pairs.json'), 'utf8'),
  ) as { pairs: { window: string; left: string; right: string }[] };
  return baseline.windows.map(({ window }) => {
    const fixture = JSON.parse(readFileSync(join(root, window), 'utf8')) as {
      topic: string;
      candidates: Candidate[];
    };
    const required = new Set(
      labels.pairs
        .filter((pair) => pair.window === window)
        .flatMap((pair) => [pair.left, pair.right]),
    );
    if (required.size > 40)
      throw new Error('Labelled window exceeds one-call shortlist limit');
    // Preserve every labelled endpoint; fill remaining slots in recorded order.
    // This is a label-aware evaluation sample, never production ranking evidence.
    const selected = new Set(required);
    for (const item of fixture.candidates) {
      if (selected.size >= 40) break;
      selected.add(item.id);
    }
    const candidates: GroupingCandidate[] = fixture.candidates
      .filter((item) => selected.has(item.id))
      .map((item) => ({
        id: item.id,
        topicId: fixture.topic,
        title: item.title,
        outlet: item.sources.join(', '),
        publishedAt: item.publishedAt,
        excerpt: item.excerpt,
      }));
    if (candidates.length !== selected.size)
      throw new Error('Duplicate or missing recorded candidate');
    return {
      window,
      topicId: fixture.topic,
      recordedCandidates: fixture.candidates.length,
      labelledCandidates: required.size,
      candidates,
    };
  });
}

export async function runEventGroupingEvaluation(
  grouping: Pick<EventGrouping, 'group'>,
  runId: string,
) {
  const plan = eventGroupingEvaluationPlan();
  const memberships: Record<string, string[][]> = {};
  // Sequential execution: at most one grouping request per recorded topic/day.
  // No retries, repairs, overlapping requests or input-order provider reruns.
  for (const entry of plan) {
    memberships[entry.window] = await grouping.group(
      entry.topicId,
      entry.candidates,
      runId,
    );
    // Stop immediately on invalid injected/saved output, before another call.
    evaluateEventGrouping(undefined, memberships);
  }
  return {
    memberships,
    report: evaluateEventGrouping(undefined, memberships),
    shortlist: plan.map(({ candidates, ...entry }) => ({
      ...entry,
      selectedCandidates: candidates.length,
    })),
  };
}
