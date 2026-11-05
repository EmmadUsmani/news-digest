import {
  planScheduledSearch,
  type ScheduledSearchTopic,
} from './scheduled-search';
import type { ReactionStory } from './story-reactions';
import type { FixedSearchSettings, XSearchRequest } from './x-search.port';

export type { FixedSearchSettings } from './x-search.port';

export interface FixedSearchTopic extends ScheduledSearchTopic {
  settings: FixedSearchSettings | null;
  // Already restricted to this topic and the edition window, without fresh AI.
  stories: ReactionStory[];
}

export interface FixedSearchPlan {
  topicId: string;
  scheduledDay: string;
  style: 'trending';
  request: XSearchRequest;
  settings: FixedSearchSettings;
  rankedStoryTitles: string[];
}

// Runtime opt-in stays off until the experiment decision. Ledger admission
// remains mandatory before each call.
export function planFixedSearchSchedule(input: {
  enabled?: boolean;
  topics: FixedSearchTopic[];
  now: Date;
  editionAt: Date;
  coverageStart: Date;
  availableMicros: number;
  reservationMicros: number;
}): FixedSearchPlan[] {
  if (!input.enabled) return [];
  if (
    !Number.isSafeInteger(input.availableMicros) ||
    input.availableMicros < 0 ||
    !Number.isSafeInteger(input.reservationMicros) ||
    input.reservationMicros <= 0 ||
    new Set(input.topics.map(({ id }) => id)).size !== input.topics.length
  )
    throw new Error('Invalid fixed X schedule projection');
  const candidates = input.topics.flatMap((topic) => {
    const settings = topic.settings;
    if (!settings) return [];
    if (
      ![settings.reactionMinFaves, settings.trendingMinFaves].every(
        (value) => Number.isSafeInteger(value) && value >= 0,
      ) ||
      settings.exclusions.some((value) => !/^-[a-zA-Z0-9_]+$/.test(value))
    )
      throw new Error('Invalid fixed X search settings');
    const plan = planScheduledSearch(
      [topic],
      input.now,
      input.editionAt,
      'open-topic',
      input.coverageStart,
    );
    if (!plan) return [];
    return [{ topic, plan, settings }];
  });
  const build = (
    candidate: (typeof candidates)[number],
    style: FixedSearchPlan['style'],
  ): FixedSearchPlan => ({
    topicId: candidate.topic.id,
    scheduledDay: candidate.plan.scheduledDay,
    style,
    request: {
      ...candidate.plan.request,
      fromDate: input.coverageStart.toISOString().slice(0, 10),
      toDate: new Date(
        Math.ceil(input.editionAt.getTime() / 86400000) * 86400000,
      )
        .toISOString()
        .slice(0, 10),
      publicationWindow: {
        start: input.coverageStart.toISOString(),
        end: input.editionAt.toISOString(),
      },
    },
    settings: {
      ...candidate.settings,
      exclusions: [...candidate.settings.exclusions],
    },
    rankedStoryTitles: [],
  });
  // One viral search per topic. Scarce free-link coverage gets admission first.
  return [...candidates]
    .sort((a, b) => a.topic.freePosts - b.topic.freePosts)
    .map((candidate) => build(candidate, 'trending'))
    .slice(0, Math.floor(input.availableMicros / input.reservationMicros));
}
