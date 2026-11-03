import type { ProfileSettings } from '@digest/contracts';

import { searchX } from './modules/social/application/search-x';
import { verifySearch } from './modules/social/application/verify-search';
import type { PostgresXSearchRepository } from './modules/social/database/x-search.repository';
import type { ReactionStory } from './modules/social/domain/story-reactions';
import type { XDiscoveryLedger } from './modules/social/domain/x-discovery-ledger.port';
import type { XSearchPort } from './modules/social/domain/x-search.port';
import { runScheduledXSearch } from './scheduled-x-search';

// The Nov 3 account-list run is recorded and acknowledged under STEERING 15.
// Open discovery is primary; durable admission gates any optional followups.
export const scheduledXSearchType = 'open-topic' as const;

export function runScheduledXRuntime(
  dependencies: {
    profile: () => Promise<ProfileSettings>;
    searches: Pick<
      PostgresXSearchRepository,
      'scheduledTopics' | 'completedOpenSearches' | 'save'
    >;
    search: XSearchPort;
    ledger: XDiscoveryLedger & {
      completeVerification(callId: string): Promise<void>;
    };
    verify: (callId: string) => Promise<{ verificationErrors: number }>;
    stories: (topicId: string, end: Date) => Promise<ReactionStory[]>;
  },
  clock: () => Date = () => new Date(),
  searchType: 'account-list' | 'open-topic' = scheduledXSearchType,
) {
  const execute = async (
    plan: Parameters<Parameters<typeof runScheduledXSearch>[2]>[0],
    runId: string,
    parentId?: string,
  ) => {
    const result = await searchX(
      plan.topic.id,
      runId,
      plan.request,
      dependencies.search,
      dependencies.ledger,
      dependencies.searches,
      {
        inputPerMillion: 1.25,
        outputPerMillion: 2.5,
        perPost: 0.005,
        perProfile: 0.01,
      },
      plan.scheduledDay,
      parentId,
    );
    await verifySearch(
      result,
      plan.request,
      plan.scheduledDay,
      dependencies.verify,
      (callId) => dependencies.ledger.completeVerification(callId),
    );
    return result;
  };
  return runScheduledXSearch(
    dependencies.profile,
    (now) => dependencies.searches.scheduledTopics(now),
    execute,
    clock,
    searchType,
    {
      completed: (day) => dependencies.searches.completedOpenSearches(day),
      stories: dependencies.stories,
      execute,
    },
  );
}
