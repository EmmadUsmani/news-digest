// Prepared policy only: callers must serialize read/merge/write per reader.
// Tombstones count toward capacity and are never silently discarded.
export const readerSyncLimits = { bookmarks: 1000, topics: 1000 } as const;
export type ReaderBookmarkCopy = {
  title: string;
  url: string;
  attribution: string;
  excerpt: string;
  platform: string;
  editionId: string;
};
export type ReaderSyncState = {
  version: 1;
  hiddenTopics: Record<string, { hidden: boolean; updatedAt: number }>;
  bookmarks: Record<
    string,
    { copy: ReaderBookmarkCopy | null; updatedAt: number }
  >;
};

const fields = {
  title: 300,
  url: 2048,
  attribution: 200,
  excerpt: 600,
  platform: 40,
  editionId: 200,
} as const;
const record = (value: unknown): value is Record<string, unknown> =>
  !!value && typeof value === 'object' && !Array.isArray(value);
function validCopy(value: unknown): value is ReaderBookmarkCopy {
  if (!record(value) || Object.keys(value).length !== 6) return false;
  for (const [key, limit] of Object.entries(fields)) {
    const field = value[key];
    if (
      typeof field !== 'string' ||
      field.length > limit ||
      field.includes('\0')
    )
      return false;
  }
  if (!value.title || !value.platform || !value.editionId) return false;
  try {
    const url = new URL(value.url as string);
    return (
      ['https:', 'http:'].includes(url.protocol) &&
      !url.username &&
      !url.password
    );
  } catch {
    return false;
  }
}
function validate(value: unknown): asserts value is ReaderSyncState {
  if (
    !record(value) ||
    value.version !== 1 ||
    Object.keys(value).length !== 3 ||
    !record(value.hiddenTopics) ||
    !record(value.bookmarks)
  )
    throw new Error('Invalid reader sync state');
  for (const [kind, limit, keyLimit] of [
    ['hiddenTopics', readerSyncLimits.topics, 200],
    ['bookmarks', readerSyncLimits.bookmarks, 400],
  ] as const) {
    const changes = value[kind];
    if (!record(changes)) throw new Error('Invalid reader sync state');
    const entries = Object.entries(changes);
    if (entries.length > limit)
      throw new Error('Reader sync capacity exceeded');
    for (const [key, change] of entries) {
      if (
        !key ||
        key.length > keyLimit ||
        key.includes('\0') ||
        !record(change) ||
        Object.keys(change).length !== 2 ||
        !Number.isSafeInteger(change.updatedAt) ||
        (change.updatedAt as number) < 0 ||
        (change.updatedAt as number) > 8_640_000_000_000_000 ||
        (kind === 'hiddenTopics'
          ? typeof change.hidden !== 'boolean'
          : change.copy !== null && !validCopy(change.copy))
      )
        throw new Error('Invalid reader sync change');
    }
  }
}
function merge<T extends { updatedAt: number }>(
  left: Record<string, T>,
  right: Record<string, T>,
  tie: (change: T) => string,
  limit: number,
): Record<string, T> {
  const result = new Map(Object.entries(left));
  for (const [key, change] of Object.entries(right)) {
    const previous = result.get(key);
    if (
      !previous ||
      change.updatedAt > previous.updatedAt ||
      (change.updatedAt === previous.updatedAt && tie(change) > tie(previous))
    )
      result.set(key, change);
  }
  if (result.size > limit) throw new Error('Reader sync capacity exceeded');
  return Object.fromEntries(result);
}

// Same tie ordering as the local browser store: hide wins equal topic clocks,
// removal wins equal bookmark clocks, display-copy ties use fixed field order.
export function mergeReaderSync(
  left: unknown,
  right: unknown,
): ReaderSyncState {
  validate(left);
  validate(right);
  const merged: ReaderSyncState = {
    version: 1,
    hiddenTopics: merge(
      left.hiddenTopics,
      right.hiddenTopics,
      (c) => String(c.hidden),
      readerSyncLimits.topics,
    ),
    bookmarks: merge(
      left.bookmarks,
      right.bookmarks,
      (c) =>
        c.copy === null
          ? '1'
          : '0' +
            JSON.stringify([
              c.copy.title,
              c.copy.url,
              c.copy.attribution,
              c.copy.excerpt,
              c.copy.platform,
              c.copy.editionId,
            ]),
      readerSyncLimits.bookmarks,
    ),
  };
  // Do not let a caller mutate persisted state through a merged display copy.
  return structuredClone(merged);
}
