import type { BlueskyRepository, BlueskySearchPort } from '../domain/bluesky';

// Explicit single-query collection only; no scheduler or edition caller.
// Reuse one search adapter across topics so its session and backoff are shared.
export async function collectBluesky(
  repository: BlueskyRepository,
  search: BlueskySearchPort,
  topicId: string,
  query: string,
  start: Date,
  end: Date,
  now: () => Date = () => new Date(),
) {
  if (
    !topicId.trim() ||
    !query.trim() ||
    query.length > 500 ||
    !Number.isFinite(start.getTime()) ||
    !Number.isFinite(end.getTime()) ||
    start >= end ||
    end.getTime() - start.getTime() > 86400000 ||
    end > now()
  )
    throw new Error('Invalid Bluesky collection request');
  // Search failures propagate: callers must stop a pass rather than make more
  // requests after a shared-host rate limit or authentication failure.
  const fetched = await search.search(query, start, end);
  const cutoff = now();
  const latest = new Map<string, (typeof fetched)[number]>();
  for (const post of fetched.slice(0, 50)) {
    const published = Date.parse(post.publishedAt);
    const observed = Date.parse(post.observedAt);
    if (
      post.platform !== 'bluesky' ||
      !Number.isFinite(published) ||
      !Number.isFinite(observed) ||
      published < start.getTime() ||
      published >= end.getTime() ||
      observed < published ||
      observed > cutoff.getTime() ||
      Object.values(post.metrics).some((n) => !Number.isSafeInteger(n) || n < 0)
    )
      continue;
    const previous = latest.get(post.externalId);
    if (!previous || observed > Date.parse(previous.observedAt))
      latest.set(post.externalId, post);
  }
  // Storage failures propagate; never report a failed transaction as success.
  await repository.store(topicId, [...latest.values()]);
  // Counts are submissions, not inserts: replay/disabled-topic writes may be no-ops.
  return { fetched: fetched.length, submitted: latest.size, cutoff };
}
