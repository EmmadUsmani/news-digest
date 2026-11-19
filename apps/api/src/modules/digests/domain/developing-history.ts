// Publication facts are supplied by the repository, never inferred from snapshot dates.
export interface PublishedStoryEdition {
  id: string;
  profileId: string | null;
  publishedAt: string;
  topics: {
    id: string;
    stories: { id: string; title: string; summary?: string }[];
  }[];
}

// This selects evidence only. It does not assert that any two stories match.
export function developingHistory(
  editions: readonly PublishedStoryEdition[],
  target: {
    id: string;
    profileId: string | null;
    publishedAt: string;
    topicId: string;
  },
) {
  const cutoff = Date.parse(target.publishedAt);
  if (!Number.isFinite(cutoff))
    throw new Error('Invalid target publication time');
  return editions
    .filter(
      (edition) =>
        edition.id !== target.id &&
        edition.profileId === target.profileId &&
        Number.isFinite(Date.parse(edition.publishedAt)) &&
        Date.parse(edition.publishedAt) < cutoff &&
        edition.topics.some((topic) => topic.id === target.topicId),
    )
    .sort(
      (a, b) =>
        Date.parse(b.publishedAt) - Date.parse(a.publishedAt) ||
        a.id.localeCompare(b.id),
    )
    .slice(0, 7)
    .map((edition) => ({
      editionId: edition.id,
      publishedAt: edition.publishedAt,
      stories: edition.topics
        .find((topic) => topic.id === target.topicId)!
        .stories.map((story) => ({
          id: story.id,
          title: story.title,
          summary: story.summary ?? null,
        })),
    }));
}
