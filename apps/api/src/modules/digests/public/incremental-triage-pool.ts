import type { PoolClient } from 'pg';

import { loadArticleCandidates } from '../database/article-candidates';
import {
  articleTriageInput,
  type ArticleTriageSettings,
} from '../domain/article-triage-input';

// Prepared read-only boundary. Caller supplies the current scheduled window;
// no timer, model calls, cache writes or production activation happen here.
export async function loadIncrementalTriagePool(
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
    throw new Error('Invalid incremental triage topic or window');
  const {
    rows: [settings],
  } = await db.query<ArticleTriageSettings>(
    `SELECT id,name,description,include_guidance,exclude_guidance,relevance_policy
     FROM topics WHERE id=$1 AND enabled AND story_budget > 0`,
    [topicId],
  );
  if (!settings) return null;
  const candidates = await loadArticleCandidates(db, topicId, start, end);
  return articleTriageInput(settings, candidates);
}
