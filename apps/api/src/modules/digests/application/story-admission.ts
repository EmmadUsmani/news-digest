import type {
  ObserveStoryGrouping,
  StoryGroupingResult,
} from '../../curation/public/editorial';
import { type Candidate, rank } from '../domain/rank';
import {
  type AdmissionScore,
  techAdmissionControl,
} from '../domain/tech-story-admission';
import { groupShortlist } from './group-shortlist';
import { prepareStoryGrouping } from './prepare-story-grouping';

type GroupingInput = Parameters<
  NonNullable<Parameters<typeof groupShortlist>[0]>['group']
>;
interface GroupingPort {
  group(...args: GroupingInput): Promise<string[][]>;
  groupWithResult(...args: GroupingInput): Promise<StoryGroupingResult>;
}

// The disabled path preserves the existing call and ten-story ranking exactly.
export async function storyAdmission(input: {
  grouping: GroupingPort | null;
  topicId: string;
  tech: boolean;
  enabled?: boolean;
  shortlist: Candidate[];
  scores: AdmissionScore[];
  triage: 'complete' | 'failed' | 'incomplete';
  start: Date;
  end: Date;
  runId: string;
  observeGrouping?: ObserveStoryGrouping;
}) {
  const { grouping, topicId, shortlist, runId, start, end } = input;
  if (!input.enabled || !input.tech) {
    const matches = await groupShortlist(
      grouping,
      topicId,
      shortlist,
      runId,
      input.observeGrouping,
    );
    return { matches, ranked: rank(shortlist, start, end, 10, matches) };
  }
  // Exactly one grouping call, using the same pool, cache and budget as before.
  const prepared = await prepareStoryGrouping(
    grouping,
    topicId,
    shortlist,
    runId,
    input.observeGrouping,
  );
  const { matches } = prepared;
  const first = rank(shortlist, start, end, 20, matches);
  const used = new Set(
    first.flatMap((event) => event.coverage.map((c) => c.id)),
  );
  const ranked = [
    ...first,
    ...rank(
      shortlist.filter((c) => !used.has(c.id)),
      start,
      end,
      20,
      matches,
    ),
  ];
  const decision = techAdmissionControl({
    ranked,
    scores: input.scores,
    enabled: true,
    topic: 'tech',
    grouping: prepared.status,
    triage: input.triage,
  });
  return { matches, ranked: decision.admitted, decision };
}
