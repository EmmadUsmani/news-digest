import type { Pool } from 'pg';

import { DevelopmentCall } from './modules/digests/application/development-call';
import { PostgresDevelopmentSpendRepository } from './modules/digests/database/development-spend.repository';
import type { DevelopmentSpendPort } from './modules/digests/domain/development-spend.port';
import { DirectXSearch, xSearchBody } from './modules/social/adapters/x-search';
import { xDiscoveryCost } from './modules/social/domain/x-discovery-budget';
import type { XSearchRequest } from './modules/social/domain/x-search.port';

/** Development only; never installed in scheduled/manual production callers. */
export function prepareDevelopmentXRuntime(
  deps: { db: Pool; env?: NodeJS.ProcessEnv; fetch?: typeof globalThis.fetch },
  spend: (db: Pool) => DevelopmentSpendPort = (db) =>
    new PostgresDevelopmentSpendRepository(db),
) {
  const env = deps.env ?? process.env;
  if (env.X_SEARCH_LIVE !== '1') return null;
  if (!env.XAI_API_KEY) throw new Error('Missing development xAI key');
  const provider = new DirectXSearch(env.XAI_API_KEY, deps.fetch);
  const guard = new DevelopmentCall(spend(deps.db));
  return {
    search(request: XSearchRequest, attemptId: string) {
      if (!attemptId.trim()) throw new Error('Missing development attempt ID');
      // Validate before reserving; only the existing fixed keyword recipe is allowed.
      xSearchBody(request);
      return guard.run(
        {
          enabled: true,
          id: attemptId,
          provider: 'xai',
          // Same conservative hold as a production manual call, not a provider
          // billing ceiling: fetched items are unbounded. Settle the entire bill.
          maxCostMicros: 400000,
        },
        async () => {
          const value = await provider.search(request);
          const longContext = value.usage.inputTokens >= 200000;
          return {
            value,
            costMicros: xDiscoveryCost(value.usage, {
              inputPerMillion: longContext ? 2.5 : 1.25,
              outputPerMillion: longContext ? 5 : 2.5,
              perPost: 0.005,
              perProfile: 0.01,
            }),
          };
        },
      );
    },
  };
}
