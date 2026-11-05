import { xSearchComparisonBody } from '../../apps/api/src/modules/social/adapters/x-search-comparison';
import { viralXSearchBody } from '../../apps/api/src/modules/social/adapters/x-viral-search-body';
import type { ReactionStory } from '../../apps/api/src/modules/social/domain/story-reactions';

export function experimentWindow(start: string, end: string) {
  const dates = [start, end].map((value) => new Date(value));
  if (
    ![start, end].every((value) => /(Z|[+-]\d{2}:\d{2})$/.test(value)) ||
    !dates.every((date) => Number.isFinite(date.getTime())) ||
    dates[0] >= dates[1]
  )
    throw new Error('Expected timezone-qualified START END timestamps');
  return { start: dates[0].toISOString(), end: dates[1].toISOString() };
}

// Prepared bodies only. This module cannot dispatch or admit a paid request.
export function prepareXExperimentTopic(
  topic: {
    id: string;
    name: string;
    includeGuidance: string;
    excludeGuidance: string;
  },
  settings: {
    reactionMinFaves: number;
    trendingMinFaves: number;
    exclusions: string[];
  },
  stories: ReactionStory[],
  window: { start: string; end: string },
) {
  const publicationWindow = experimentWindow(window.start, window.end);
  const seen = new Set<string>();
  const seenIds = new Set<string>();
  const rankedStories = stories
    .filter(
      (story) =>
        story.id.trim() &&
        story.id.length <= 200 &&
        story.title.trim() &&
        story.title.length <= 500 &&
        Number.isFinite(story.importance),
    )
    .sort((a, b) => b.importance - a.importance)
    .filter((story) => {
      const key = story.title.trim().replace(/\s+/g, ' ').toLowerCase();
      if (seen.has(key) || seenIds.has(story.id)) return false;
      seen.add(key);
      seenIds.add(story.id);
      return true;
    })
    .slice(0, 3);
  const request = {
    topic: topic.name,
    guidance: `${topic.includeGuidance}\nExclude: ${topic.excludeGuidance}`,
    fromDate: publicationWindow.start.slice(0, 10),
    toDate: new Date(
      Math.ceil(Date.parse(publicationWindow.end) / 86_400_000) * 86_400_000,
    )
      .toISOString()
      .slice(0, 10),
    publicationWindow,
  };
  const titles = rankedStories.map((story) => story.title);
  const ready = titles.length >= 2;
  return {
    topicId: topic.id,
    topic: topic.name,
    settings,
    rankedStories,
    ready,
    blockedReason: ready
      ? null
      : 'Fewer than two usable distinct ranked articles in the window',
    requests: {
      viral: viralXSearchBody(request, settings),
      current: xSearchComparisonBody(request, 'current', settings, []),
      trending: xSearchComparisonBody(request, 'trending', settings, []),
      reactions: ready
        ? xSearchComparisonBody(request, 'reactions', settings, titles)
        : null,
    },
  };
}
