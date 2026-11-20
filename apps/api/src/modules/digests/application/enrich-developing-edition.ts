import {
  type enrichSelectedDevelopingStories,
  matchSelectedDevelopingStories,
  prepareSelectedDevelopingStories,
} from './enrich-selected-developing-stories';
import { rewriteSelectedDevelopingStories } from './rewrite-selected-developing-stories';

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
  const publicationTimes = topics.map((topic) => Date.parse(topic.publishedAt));
  if (
    publicationTimes.some((time) => !Number.isFinite(time)) ||
    new Set(publicationTimes).size > 1 ||
    topics.some((topic) => !topic.runId.trim()) ||
    topics.some(
      (topic) =>
        topic.history.length > 7 ||
        new Set(topic.history.map((edition) => edition.editionId)).size !==
          topic.history.length ||
        topic.history.some(
          (edition, index) =>
            !edition.editionId.trim() ||
            (index > 0 &&
              Date.parse(edition.publishedAt) >
                Date.parse(topic.history[index - 1].publishedAt)),
        ),
    ) ||
    topics.some((topic, index) =>
      topic.history.some(
        (edition) =>
          edition.editionId === topic.runId ||
          !Number.isFinite(Date.parse(edition.publishedAt)) ||
          Date.parse(edition.publishedAt) >= publicationTimes[index],
      ),
    ) ||
    new Set(topics.map((topic) => topic.topicId)).size !== topics.length ||
    topics.some((topic) => !topic.topicId.trim()) ||
    new Set(topics.map((topic) => topic.runId)).size > 1
  ) {
    return unchanged('invalid-edition');
  }
  for (const topic of topics) {
    const preparation = prepareSelectedDevelopingStories(topic);
    if (
      ![
        'ready',
        'non-ai-selection',
        'empty-selection',
        'empty-history',
      ].includes(preparation)
    )
      return unchanged(preparation);
  }
  const matched = [];
  for (const topic of topics) {
    try {
      const result = await matchSelectedDevelopingStories(topic);
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
      matched.push({ topic, result });
    } catch {
      return unchanged('enrichment-failed');
    }
  }
  const staged = [];
  for (const { topic, result } of matched) {
    if (result.status === 'unchanged') {
      staged.push({ topicId: topic.topicId, stories: topic.selected });
      continue;
    }
    try {
      const rewritten = await rewriteSelectedDevelopingStories({
        ...topic,
        links: result.links,
      });
      if (rewritten.status !== 'rewritten') return unchanged('rewrite-refused');
      staged.push({ topicId: topic.topicId, stories: rewritten.stories });
    } catch {
      return unchanged('enrichment-failed');
    }
  }
  return { status: 'completed' as const, topics: staged };
}
