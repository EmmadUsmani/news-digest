import type { PoolClient } from 'pg';

import { llmConfig } from '../adapters/config';
import { CandidateTriage } from '../application/triage';
import { triageCacheReader } from '../database/triage-cache.reader';

export function cachedArticleTriage(db: Pick<PoolClient, 'query'>) {
  const cache = triageCacheReader(db);
  const readOnly = new CandidateTriage(
    {
      json() {
        return Promise.reject(
          new Error('Read-only triage cannot call a provider'),
        );
      },
    },
    {
      ...cache,
      cache() {
        return Promise.reject(new Error('Read-only triage cannot write'));
      },
    },
    llmConfig().haiku,
  );
  return readOnly.cachedScores.bind(readOnly);
}
