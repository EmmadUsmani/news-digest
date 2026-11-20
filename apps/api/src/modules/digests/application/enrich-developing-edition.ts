import { enrichSelectedDevelopingStories } from './enrich-selected-developing-stories';

type TopicInput = Parameters<typeof enrichSelectedDevelopingStories>[0];

// Prepared only: callers must admit the complete budget before invoking this.
// Atomicity applies to returned stories, not already-settled provider charges.
export async function enrichDevelopingEdition<T extends TopicInput>(
  topics: readonly T[],
) {
  const unchanged = (reason: string) => ({
    status: 'unchanged' as const,
    reason,
    topics: topics.map((topic) => ({
      topicId: topic.topicId,
      stories: topic.selected,
    })),
  });
  if (
    new Set(topics.map((topic) => topic.topicId)).size !== topics.length ||
    topics.some((topic) => !topic.topicId.trim()) ||
    new Set(topics.map((topic) => topic.runId)).size > 1
  ) {
    return unchanged('invalid-edition');
  }
  const staged = [];
  for (const topic of topics) {
    try {
      const result = await enrichSelectedDevelopingStories(topic);
      if (
        result.status === 'unchanged' &&
        ![
          'non-ai-selection',
          'empty-selection',
          'empty-history',
          'no-validated-links',
        ].includes(result.reason)
      )
        return unchanged(result.reason);
      staged.push({ topicId: topic.topicId, stories: result.stories });
    } catch {
      return unchanged('enrichment-failed');
    }
  }
  return { status: 'completed' as const, topics: staged };
}
