import type { ProfileSettings } from '@digest/contracts';

import { searchX } from './modules/social/application/search-x';
import { verifySearch } from './modules/social/application/verify-search';
import type { PostgresXSearchRepository } from './modules/social/database/x-search.repository';
import type { ScheduledSearchTopic } from './modules/social/domain/scheduled-search';
import type { XDiscoveryLedger } from './modules/social/domain/x-discovery-ledger.port';
import type {
  FixedSearchSettings,
  XSearchPort,
  XSearchRequest,
} from './modules/social/domain/x-search.port';
import { runScheduledFixedXSearch } from './scheduled-fixed-x-search';

export function runScheduledXRuntime(
  dependencies: {
    profile: () => Promise<ProfileSettings>;
    searches: Pick<PostgresXSearchRepository, 'scheduledTopics' | 'save'>;
    search: XSearchPort;
    ledger: XDiscoveryLedger & {
      completeVerification(callId: string): Promise<void>;
    };
    verify: (callId: string) => Promise<{ verificationErrors: number }>;
    fixed?: {
      enabled: () => boolean;
      settings: (topicId: string) => Promise<FixedSearchSettings | null>;
      availableMicros: () => Promise<number>;
    };
  },
  clock: () => Date = () => new Date(),
) {
  const fixed = dependencies.fixed;
  if (!fixed?.enabled())
    return Promise.resolve({ skipped: 'Fixed search disabled' });
  const execute = async (
    plan: {
      topic: ScheduledSearchTopic;
      request: XSearchRequest;
      scheduledDay: string;
    },
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
  return runScheduledFixedXSearch({
    enabled: fixed.enabled,
    profile: dependencies.profile,
    topics: async (_start, end) =>
      Promise.all(
        (await dependencies.searches.scheduledTopics(end)).map(
          async (topic) => ({
            ...topic,
            settings: await fixed.settings(topic.id),
            stories: [],
          }),
        ),
      ),
    availableMicros: fixed.availableMicros,
    execute: (plan, runId, parentId) =>
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
        parentId,
      ),
    clock,
  });
}
