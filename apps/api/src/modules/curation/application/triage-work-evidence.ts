import { z } from 'zod';

import type { LlmLedger } from '../domain/llm-ledger.port';

const scoreIdentity = z.object({ id: z.string().min(1) });

// Create one recorder per scoring invocation, never one shared across topics.
// Observe item writes, not returned scores: returned scores include cache hits.
// Reads pass through unchanged; only successful article writes are evidence.
export function triageWorkEvidence(
  cache: Pick<LlmLedger, 'cached' | 'cachedMany' | 'cache' | 'cacheMany'>,
  context: { topicId: string; attemptId: string },
  now: () => number = Date.now,
) {
  if (!context.topicId.trim() || !context.attemptId.trim())
    throw new Error('Expected topic and attempt IDs');
  const { topicId, attemptId } = context;
  const rows: {
    topicId: string;
    attemptId: string;
    articleId: string;
    fingerprint: string;
    completedAt: string;
    outcome: 'scored';
  }[] = [];
  const seen = new Set<string>();
  return {
    cache: {
      cached: cache.cached.bind(cache),
      cachedMany: cache.cachedMany?.bind(cache),
      cacheMany: cache.cacheMany
        ? async (entries: { key: string; response: unknown }[]) => {
            const articles = entries.flatMap(({ key, response }) =>
              /^triage-item-v1:[a-f0-9]{64}$/.test(key)
                ? [{ article: scoreIdentity.parse(response).id, key }]
                : [],
            );
            const ids = articles.map(({ article }) => article);
            if (
              new Set(ids).size !== ids.length ||
              ids.some((id) => seen.has(id))
            )
              throw new Error('Duplicate article write within scoring attempt');
            for (const id of ids) seen.add(id);
            try {
              await cache.cacheMany!(entries);
            } catch (error) {
              for (const id of ids) seen.delete(id);
              throw error;
            }
            const completedAt = new Date(now()).toISOString();
            for (const { article, key } of articles)
              rows.push({
                topicId,
                attemptId,
                articleId: article,
                fingerprint: key,
                completedAt,
                outcome: 'scored',
              });
          }
        : undefined,
      async cache(key: string, value: unknown) {
        // Whole-request and social caches are not article scoring evidence.
        const article = /^triage-item-v1:[a-f0-9]{64}$/.test(key)
          ? scoreIdentity.parse(value).id
          : null;
        if (article && seen.has(article))
          throw new Error('Duplicate article write within scoring attempt');
        if (article) seen.add(article);
        try {
          await cache.cache(key, value);
        } catch (error) {
          if (article) seen.delete(article);
          throw error;
        }
        if (article) {
          rows.push({
            topicId,
            attemptId,
            articleId: article,
            fingerprint: key,
            completedAt: new Date(now()).toISOString(),
            outcome: 'scored',
          });
        }
      },
    },
    // Copy rows so callers cannot mutate retained evidence. Partial successful
    // writes survive a subsequent provider/cache failure in the same attempt.
    attempts: () => rows.map((row) => ({ ...row })),
  };
}
