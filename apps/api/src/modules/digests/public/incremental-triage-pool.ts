import type { PoolClient } from 'pg';

import { loadArticleCandidates } from '../database/article-candidates';
import { readIncrementalTriageTopic } from '../database/article-topic.reader';
import { articleTriageInput } from '../domain/article-triage-input';

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
  const settings = await readIncrementalTriageTopic(db, topicId);
  if (!settings) return null;
  const candidates = await loadArticleCandidates(db, topicId, start, end);
  return articleTriageInput(settings, candidates);
}
