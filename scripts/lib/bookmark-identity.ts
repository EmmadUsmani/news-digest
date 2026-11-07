// Structural audit only: no text, authors, URLs or provider diagnostics exported.
export type IdentityEdition = {
  id: string;
  snapshot: { topics?: { stories?: unknown[]; posts?: unknown[] }[] };
};
type Entry = { editions: Set<string>; counterparts: Set<string> };
function add(
  map: Map<string, Entry>,
  key: string,
  other: string,
  edition: string,
) {
  const entry = map.get(key) ?? {
    editions: new Set(),
    counterparts: new Set(),
  };
  entry.editions.add(edition);
  entry.counterparts.add(other);
  map.set(key, entry);
}
function summary(map: Map<string, Entry>) {
  const entries = [...map.values()];
  return {
    unique: entries.length,
    repeatedAcrossEditions: entries.filter((v) => v.editions.size > 1).length,
    multipleCounterparts: entries.filter((v) => v.counterparts.size > 1).length,
    multipleCounterpartsAcrossEditions: entries.filter(
      (v) => v.editions.size > 1 && v.counterparts.size > 1,
    ).length,
  };
}
export function auditBookmarkIdentity(editions: IdentityEdition[]) {
  const storyIds = new Map<string, Entry>();
  const storyUrls = new Map<string, Entry>();
  const postKeys = new Map<string, Entry>();
  const postUrls = new Map<string, Entry>();
  const platforms = new Set<string>();
  let stories = 0,
    posts = 0,
    invalidStories = 0,
    invalidPosts = 0;
  for (const edition of editions) {
    for (const topic of edition.snapshot.topics ?? []) {
      for (const value of topic.stories ?? []) {
        stories++;
        const story = value as Record<string, unknown> | null;
        if (
          !story ||
          typeof story.id !== 'string' ||
          !story.id.trim() ||
          typeof story.url !== 'string' ||
          !story.url.trim()
        ) {
          invalidStories++;
          continue;
        }
        add(storyIds, story.id, story.url, edition.id);
        add(storyUrls, story.url, story.id, edition.id);
      }
      for (const value of topic.posts ?? []) {
        posts++;
        const post = value as Record<string, unknown> | null;
        if (
          !post ||
          typeof post.platform !== 'string' ||
          !post.platform.trim() ||
          typeof post.externalId !== 'string' ||
          !post.externalId.trim() ||
          typeof post.url !== 'string' ||
          !post.url.trim()
        ) {
          invalidPosts++;
          continue;
        }
        platforms.add(post.platform);
        // Tuple encoding avoids collisions if either field contains a separator.
        const key = JSON.stringify([post.platform, post.externalId]);
        add(postKeys, key, post.url, edition.id);
        add(postUrls, post.url, key, edition.id);
      }
    }
  }
  return {
    editions: editions.length,
    stories,
    posts,
    invalidStories,
    invalidPosts,
    platforms: [...platforms].sort(),
    storyIds: summary(storyIds),
    storyUrls: summary(storyUrls),
    postKeys: summary(postKeys),
    postUrls: summary(postUrls),
  };
}
