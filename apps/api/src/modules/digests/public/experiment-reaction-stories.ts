import { relevancePolicySchema } from '@digest/contracts';
import type { PoolClient } from 'pg';

import { readReactionTopic } from '../database/article-topic.reader';
import type { articleTriageInput } from '../domain/article-triage-input';
import { cachedReactionStories } from '../domain/cached-reaction-stories';
import { assessRelevance } from '../domain/relevance';
import { loadIncrementalTriagePool } from './incremental-triage-pool';

// Experiment preparation only; production reaction ranking is unchanged.
export async function loadExperimentReactionStories(
  db: Pick<PoolClient, 'query'>,
  topicId: string,
  start: Date,
  end: Date,
  cachedScores: (
    topic: ReturnType<typeof articleTriageInput>['topic'],
    candidates: ReturnType<typeof articleTriageInput>['candidates'],
  ) => Promise<{ id: string; relevance: number; importance: number }[]>,
) {
  const pool = await loadIncrementalTriagePool(db, topicId, start, end);
  if (!pool) return [];
  const settings = await readReactionTopic(db, topicId);
  if (!settings) return [];
  const policy = relevancePolicySchema.parse(settings.relevance_policy);
  const scores = await cachedScores(pool.topic, pool.candidates);
  const scored = new Set(scores.map((score) => score.id));
  const candidates = pool.candidates.filter(
    (candidate) =>
      scored.has(candidate.id) || assessRelevance(candidate, policy).eligible,
  );
  return cachedReactionStories(candidates, scores, start, end);
}
