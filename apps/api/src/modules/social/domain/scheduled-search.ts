import type { XSearchRequest } from './x-search.port';

export type ScheduledSearchType = 'account-list' | 'open-topic';

export interface ScheduledSearchTopic {
  id: string;
  name: string;
  guidance: string;
  handles: string[];
  freePosts: number;
}

// Coverage counts are a scarcity signal, not a relevance or virality score.
// Caller supplies enabled topics with a positive post budget, in owner order.
export function planScheduledSearch(
  topics: ScheduledSearchTopic[],
  now: Date,
  editionAt: Date,
  searchType: ScheduledSearchType = 'account-list',
  coverageStart = new Date(editionAt.getTime() - 86400000),
): {
  topic: ScheduledSearchTopic;
  scheduledDay: string;
  request: XSearchRequest;
} | null {
  const remaining = editionAt.getTime() - now.getTime();
  // Leave at least five minutes for search, official verification and collection.
  // Missed windows are skipped rather than spending after publication starts.
  if (
    !Number.isFinite(remaining) ||
    remaining > 30 * 60000 ||
    remaining < 5 * 60000
  )
    return null;
  // Search the available part of the edition window, bounded to one recent day.
  // Date-only tool bounds must include today's partial UTC day; the prompt
  // supplies exact times and publication still enforces the immutable window.
  const start = new Date(
    Math.max(coverageStart.getTime(), now.getTime() - 86400000),
  );
  if (!Number.isFinite(start.getTime()) || start >= now) return null;
  const toDate = new Date(now.getTime());
  toDate.setUTCHours(0, 0, 0, 0);
  if (toDate < now) toDate.setUTCDate(toDate.getUTCDate() + 1);
  const eligible = topics.filter(
    (topic) =>
      (searchType === 'open-topic' ||
        (topic.handles.length > 0 &&
          topic.handles.length <= 20 &&
          topic.handles.every((handle) =>
            /^[A-Za-z0-9_]{1,15}$/.test(handle),
          ) &&
          new Set(topic.handles.map((handle) => handle.toLowerCase())).size ===
            topic.handles.length)) &&
      Number.isSafeInteger(topic.freePosts) &&
      topic.freePosts >= 0,
  );
  const topic = eligible.reduce<ScheduledSearchTopic | undefined>(
    (best, candidate) =>
      !best || candidate.freePosts < best.freePosts ? candidate : best,
    undefined,
  );
  if (!topic) return null;
  return {
    topic,
    scheduledDay: now.toISOString().slice(0, 10),
    request: {
      topic: topic.name,
      guidance: topic.guidance,
      ...(searchType === 'account-list' ? { handles: [...topic.handles] } : {}),
      fromDate: start.toISOString().slice(0, 10),
      toDate: toDate.toISOString().slice(0, 10),
      publicationWindow: { start: start.toISOString(), end: now.toISOString() },
    } satisfies XSearchRequest,
  };
}
