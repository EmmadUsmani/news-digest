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
) {
  const remaining = editionAt.getTime() - now.getTime();
  // Leave at least five minutes for search, official verification and collection.
  // Missed windows are skipped rather than spending after publication starts.
  if (
    !Number.isFinite(remaining) ||
    remaining > 30 * 60000 ||
    remaining < 5 * 60000
  )
    return null;
  const eligible = topics.filter(
    (topic) =>
      topic.handles.length > 0 &&
      topic.handles.length <= 20 &&
      topic.handles.every((handle) => /^[A-Za-z0-9_]{1,15}$/.test(handle)) &&
      new Set(topic.handles.map((handle) => handle.toLowerCase())).size ===
        topic.handles.length &&
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
      handles: [...topic.handles],
      fromDate: new Date(now.getTime() - 86400000).toISOString().slice(0, 10),
      toDate: now.toISOString().slice(0, 10),
    },
  };
}
