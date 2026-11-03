import type { XSearchRequest } from './x-search.port';

export interface ReactionStory {
  id: string;
  title: string;
  importance: number;
}

// Preparation only: callers must first complete every topic's open discovery,
// then obtain a separate ledger admission before executing any request.
// Input stories must already belong to this topic and the edition window.
export function planStoryReactions(
  topicRequest: XSearchRequest,
  stories: ReactionStory[],
): { storyId: string; request: XSearchRequest }[] {
  if (topicRequest.handles !== undefined)
    throw new Error('Story reactions require unrestricted topic discovery');
  const seenIds = new Set<string>();
  const seenTitles = new Set<string>();
  return stories
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
      const title = story.title.trim().replace(/\s+/g, ' ').toLowerCase();
      if (seenIds.has(story.id) || seenTitles.has(title)) return false;
      seenIds.add(story.id);
      seenTitles.add(title);
      return true;
    })
    .slice(0, 2)
    .map((story) => ({
      storyId: story.id,
      request: {
        ...topicRequest,
        reactionStory: { id: story.id, title: story.title.trim() },
      },
    }));
}
