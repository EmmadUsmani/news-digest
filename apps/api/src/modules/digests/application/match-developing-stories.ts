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
export async function matchDevelopingStories(
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
    return [];
  const evidence = developingEvidence(current, history);
  if (evidence.length > 40) return [];
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
    return result.status === 'validated'
      ? developingLinks(current, history, result.groups)
      : [];
  } catch {
    return [];
  }
}
