export const storageKey = 'news-digest.reader-preferences.v1';
export const bookmarkLimit = 1000;
export type BookmarkCopy = {
  title: string;
  url: string;
  attribution: string;
  excerpt: string;
  platform: string;
  editionId: string;
};
export type BookmarkChange = { updatedAt: number; copy: BookmarkCopy | null };
type TopicChange = { hidden: boolean; updatedAt: number };
export type PreferenceStore = {
  version: 1;
  hiddenTopics: Record<string, TopicChange>;
  bookmarks: Record<string, BookmarkChange>;
};
export const emptyStore = (): PreferenceStore => ({
  version: 1,
  hiddenTopics: {},
  bookmarks: {},
});
const record = (value: unknown): value is Record<string, unknown> =>
  !!value && typeof value === 'object' && !Array.isArray(value);
const timestamp = (value: unknown): value is number =>
  typeof value === 'number' && Number.isSafeInteger(value) && value >= 0;
export function boundBookmarkCopy(value: unknown): BookmarkCopy | null {
  if (!record(value)) return null;
  const limits = {
    title: 300,
    url: 2048,
    attribution: 200,
    excerpt: 600,
    platform: 40,
    editionId: 200,
  };
  const result: Record<string, string> = {};
  for (const [key, limit] of Object.entries(limits)) {
    const field = value[key];
    if (typeof field !== 'string') return null;
    if ((key === 'url' || key === 'editionId') && field.length > limit)
      return null;
    result[key] = field.slice(0, limit);
  }
  try {
    const url = new URL(result.url);
    if (
      !['https:', 'http:'].includes(url.protocol) ||
      url.username ||
      url.password
    )
      return null;
  } catch {
    return null;
  }
  if (!result.title || !result.editionId || !result.platform) return null;
  return result as BookmarkCopy;
}
export function parsePreferences(raw: string | null): PreferenceStore {
  const result = emptyStore();
  try {
    const value: unknown = JSON.parse(raw ?? 'null');
    if (!record(value) || value.version !== 1) return result;
    if (record(value.hiddenTopics)) {
      for (const [id, change] of Object.entries(value.hiddenTopics)) {
        if (
          id.length <= 200 &&
          record(change) &&
          typeof change.hidden === 'boolean' &&
          timestamp(change.updatedAt)
        )
          Object.defineProperty(result.hiddenTopics, id, {
            value: { hidden: change.hidden, updatedAt: change.updatedAt },
            enumerable: true,
            configurable: true,
            writable: true,
          });
      }
    }
    if (record(value.bookmarks)) {
      for (const [id, change] of Object.entries(value.bookmarks).slice(
        0,
        bookmarkLimit,
      )) {
        if (
          !id ||
          id.length > 400 ||
          !record(change) ||
          !timestamp(change.updatedAt)
        )
          continue;
        const copy =
          change.copy === null ? null : boundBookmarkCopy(change.copy);
        if (change.copy !== null && !copy) continue;
        Object.defineProperty(result.bookmarks, id, {
          value: { copy, updatedAt: change.updatedAt },
          enumerable: true,
          configurable: true,
          writable: true,
        });
      }
    }
  } catch {
    /* Corrupt or unavailable storage starts empty. */
  }
  return result;
}
export function mergePreferences(
  a: PreferenceStore,
  b: PreferenceStore,
): PreferenceStore {
  const newest = <T extends { updatedAt: number }>(
    left: Record<string, T>,
    right: Record<string, T>,
  ) => {
    const merged = { ...left };
    for (const [id, change] of Object.entries(right)) {
      if (
        !Object.hasOwn(merged, id) ||
        change.updatedAt >= merged[id].updatedAt
      )
        Object.defineProperty(merged, id, {
          value: change,
          enumerable: true,
          configurable: true,
          writable: true,
        });
    }
    return merged;
  };
  return {
    version: 1,
    hiddenTopics: newest(a.hiddenTopics, b.hiddenTopics),
    bookmarks: newest(a.bookmarks, b.bookmarks),
  };
}
export function changeBookmark(
  store: PreferenceStore,
  id: string,
  copy: BookmarkCopy | null,
  now = Date.now(),
): PreferenceStore {
  if (!id || id.length > 400 || !timestamp(now))
    throw new Error('Invalid bookmark identity or time');
  if (
    !Object.hasOwn(store.bookmarks, id) &&
    Object.keys(store.bookmarks).length >= bookmarkLimit
  )
    throw new Error('This browser has reached its 1,000 saved-item limit.');
  const bounded = copy === null ? null : boundBookmarkCopy(copy);
  if (copy !== null && !bounded)
    throw new Error('Invalid bookmark display copy');
  // Keep removal records: silently evicting them would resurrect saves on sync.
  const updatedAt = Math.max(now, (store.bookmarks[id]?.updatedAt ?? -1) + 1);
  return {
    ...store,
    bookmarks: { ...store.bookmarks, [id]: { copy: bounded, updatedAt } },
  };
}
