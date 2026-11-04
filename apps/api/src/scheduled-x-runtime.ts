import type { ProfileSettings } from '@digest/contracts';

import { searchX } from './modules/social/application/search-x';
import { verifySearch } from './modules/social/application/verify-search';
import type { PostgresXSearchRepository } from './modules/social/database/x-search.repository';
import type { ReactionStory } from './modules/social/domain/story-reactions';
import type { XDiscoveryLedger } from './modules/social/domain/x-discovery-ledger.port';
import type {
  FixedSearchSettings,
  XSearchPort,
} from './modules/social/domain/x-search.port';
import { runScheduledFixedXSearch } from './scheduled-fixed-x-search';
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
    fixed?: {
      enabled: () => boolean;
      settings: (topicId: string) => Promise<FixedSearchSettings | null>;
      stories: (
        topicId: string,
        start: Date,
        end: Date,
      ) => Promise<ReactionStory[]>;
      availableMicros: () => Promise<number>;
    };
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
  const fixed = dependencies.fixed;
  if (fixed?.enabled()) {
    return runScheduledFixedXSearch({
      enabled: fixed.enabled,
      profile: dependencies.profile,
      topics: async (start, end) =>
        Promise.all(
          (await dependencies.searches.scheduledTopics(end)).map(
            async (topic) => ({
              ...topic,
              settings: await fixed.settings(topic.id),
              stories: await fixed.stories(topic.id, start, end),
            }),
          ),
        ),
      availableMicros: fixed.availableMicros,
      execute: (plan, runId) =>
        execute(
          {
            topic: {
              id: plan.topicId,
              name: plan.request.topic,
              guidance: plan.request.guidance,
              handles: [],
              freePosts: 0,
            },
            scheduledDay: plan.scheduledDay,
            request: {
              ...plan.request,
              fixedSearch: {
                style: plan.style,
                settings: plan.settings,
                rankedStoryTitles: plan.rankedStoryTitles,
              },
            },
          },
          runId,
        ),
      clock,
    });
  }
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
