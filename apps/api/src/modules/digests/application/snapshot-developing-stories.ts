import { developingStorySchema } from '@digest/contracts';

import type { developingLinks } from '../domain/developing-links';

// Called before persistence; never update an already-published edition.
export function snapshotDevelopingStories<T extends { id: string }>(
  stories: readonly T[],
  links: ReturnType<typeof developingLinks>,
) {
  const selected = new Set(stories.map((story) => story.id));
  const byStory = new Map<
    string,
    ReturnType<typeof developingStorySchema.parse>
  >();
  for (const { storyId, ...link } of links) {
    if (!selected.has(storyId) || byStory.has(storyId))
      throw new Error('Developing links must identify unique selected stories');
    byStory.set(storyId, developingStorySchema.parse(link));
  }
  return stories.map((story) => {
    const developing = byStory.get(story.id);
    return developing ? { ...story, developing } : { ...story };
  });
}
