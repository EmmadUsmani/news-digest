import { relevancePolicySchema } from '@digest/contracts';
import type { PoolClient } from 'pg';

import { loadArticleCandidates } from '../database/article-candidates';
import { readReactionTopic } from '../database/article-topic.reader';
import { rank } from '../domain/rank';
import { assessRelevance } from '../domain/relevance';

// Read-only article pipeline boundary: no generation, LLM calls or publication.
// These are heuristic article priorities, not a claim of semantic importance.
export async function loadReactionStories(
  db: Pick<PoolClient, 'query'>,
  topicId: string,
  start: Date,
  end: Date,
) {
  if (
    !topicId.trim() ||
    !Number.isFinite(start.getTime()) ||
    !Number.isFinite(end.getTime()) ||
    start >= end
  )
    throw new Error('Invalid reaction story topic or window');
  const topic = await readReactionTopic(db, topicId);
  if (!topic) return [];
  const policy = relevancePolicySchema.parse(topic.relevance_policy);
  const candidates = await loadArticleCandidates(db, topicId, start, end);
  return rank(
    candidates.filter((item) => assessRelevance(item, policy).eligible),
    start,
    end,
    2,
  ).map(({ id, title, score }) => ({ id, title, importance: score }));
}
