import type {
  LlmExecutionContext,
  ObserveStoryGrouping,
  StoryGroupingResult,
} from '../../curation/public/editorial';
import type { Candidate } from '../domain/rank';

export interface GroupingResultPort {
  groupWithResult(
    topicId: string,
    candidates: {
      id: string;
      topicId: string;
      title: string;
      outlet: string;
      publishedAt: string;
      excerpt: string;
    }[],
    runId: string,
    observe?: ObserveStoryGrouping,
    execution?: LlmExecutionContext,
  ): Promise<StoryGroupingResult>;
}

type PreparedGrouping = {
  matches: (a: Candidate, b: Candidate) => boolean;
} & ({ status: 'validated'; groups: string[][] } | { status: 'unavailable' });

// Explicit grouping status for opt-in admission consumers.
export async function prepareStoryGrouping(
  grouping: GroupingResultPort | null,
  topicId: string,
  shortlist: Candidate[],
  runId: string,
  observe?: ObserveStoryGrouping,
): Promise<PreparedGrouping> {
  const unavailable = { status: 'unavailable' as const, matches: () => false };
  const ids = new Set(shortlist.map((item) => item.id));
  if (
    !grouping ||
    shortlist.length < 2 ||
    shortlist.length > 40 ||
    ids.size !== shortlist.length ||
    ids.has('')
  )
    return unavailable;
  try {
    const result = await grouping.groupWithResult(
      topicId,
      shortlist.map((item) => ({
        id: item.id,
        topicId,
        title: item.title,
        outlet: item.sources.join(', '),
        publishedAt: item.publishedAt,
        excerpt: item.excerpt,
      })),
      runId,
      observe,
    );
    if (result.status !== 'validated') return unavailable;
    const memberships = new Map<string, number>();
    for (const [index, group] of result.groups.entries()) {
      if (group.length < 2) return unavailable;
      for (const id of group) {
        if (!ids.has(id) || memberships.has(id)) return unavailable;
        memberships.set(id, index);
      }
    }
    return {
      status: 'validated',
      groups: result.groups.map((group) => [...group]),
      matches: (a, b) =>
        a.id !== b.id &&
        memberships.has(a.id) &&
        memberships.get(a.id) === memberships.get(b.id),
    };
  } catch {
    return unavailable;
  }
}
