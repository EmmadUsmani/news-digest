import type { LlmExecutionContext } from '../../curation/public/editorial';
import type { developingHistory } from '../domain/developing-history';
import {
  developingEvidence,
  developingLinks,
} from '../domain/developing-links';
import type { GroupingResultPort } from './prepare-story-grouping';

// Opt-in orchestration only: callers retain control of admission and publication.
// Reuse the existing budgeted semantic grouping interface without splitting the
// history into extra calls or silently dropping older evidence to fit its limit.
export async function matchDevelopingStoriesWithResult(
  grouping: GroupingResultPort | null,
  target: {
    topicId: string;
    publishedAt: string;
    runId: string;
    execution?: LlmExecutionContext;
  },
  current: Parameters<typeof developingEvidence>[0],
  history: ReturnType<typeof developingHistory>,
) {
  if (!grouping || !current.length || !history.some((x) => x.stories.length))
    return { status: 'unavailable' as const, links: [] };
  const evidence = developingEvidence(current, history);
  if (evidence.length > 40)
    return { status: 'unavailable' as const, links: [] };
  const publishedAt = new Map(
    history.map((edition) => [edition.editionId, edition.publishedAt]),
  );
  try {
    const result = await grouping.groupWithResult(
      target.topicId,
      evidence.map((item) => ({
        id: item.reference,
        topicId: target.topicId,
        title: item.story.title,
        outlet: '',
        publishedAt: item.editionId
          ? publishedAt.get(item.editionId)!
          : target.publishedAt,
        excerpt: item.story.summary ?? '',
      })),
      target.runId,
      undefined,
      target.execution,
    );
    if (result.status !== 'validated')
      return { status: 'unavailable' as const, links: [] };
    const references = new Set(evidence.map((item) => item.reference));
    const seen = new Set<string>();
    for (const group of result.groups) {
      if (group.length < 2)
        return { status: 'unavailable' as const, links: [] };
      for (const reference of group) {
        if (!references.has(reference) || seen.has(reference))
          return { status: 'unavailable' as const, links: [] };
        seen.add(reference);
      }
    }
    return {
      status: 'validated' as const,
      links: developingLinks(current, history, result.groups),
    };
  } catch {
    return { status: 'unavailable' as const, links: [] };
  }
}

// Compatibility for existing consumers that only need validated relationships.
export async function matchDevelopingStories(
  ...args: Parameters<typeof matchDevelopingStoriesWithResult>
) {
  return (await matchDevelopingStoriesWithResult(...args)).links;
}
