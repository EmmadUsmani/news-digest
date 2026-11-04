import {
  planScheduledSearch,
  type ScheduledSearchTopic,
} from './scheduled-search';
import type { ReactionStory } from './story-reactions';
import type { XSearchRequest } from './x-search.port';

export interface FixedSearchSettings {
  reactionMinFaves: number;
  trendingMinFaves: number;
  exclusions: string[];
}

export interface FixedSearchTopic extends ScheduledSearchTopic {
  settings: FixedSearchSettings | null;
  // Already restricted to this topic and the edition window, without fresh AI.
  stories: ReactionStory[];
}

export interface FixedSearchPlan {
  topicId: string;
  scheduledDay: string;
  style: 'reactions' | 'trending';
  request: XSearchRequest;
  settings: FixedSearchSettings;
  rankedStoryTitles: string[];
}

// Preparation only, deliberately disconnected from production execution until
// the experiment decision. Ledger admission remains mandatory before each call.
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
    const ids = new Set<string>();
    const titles = new Set<string>();
    const stories = [...topic.stories]
      .filter(
        (story) =>
          story.id.trim() &&
          story.title.trim() &&
          story.title.length <= 500 &&
          Number.isFinite(story.importance),
      )
      .sort((a, b) => b.importance - a.importance)
      .filter((story) => {
        const title = story.title.trim().replace(/\s+/g, ' ').toLowerCase();
        if (ids.has(story.id) || titles.has(title)) return false;
        ids.add(story.id);
        titles.add(title);
        return true;
      });
    return [{ topic, plan, stories, settings }];
  });
  const build = (
    candidate: (typeof candidates)[number],
    style: FixedSearchPlan['style'],
  ): FixedSearchPlan => ({
    topicId: candidate.topic.id,
    scheduledDay: candidate.plan.scheduledDay,
    style,
    request: candidate.plan.request,
    settings: {
      ...candidate.settings,
      exclusions: [...candidate.settings.exclusions],
    },
    rankedStoryTitles:
      style === 'reactions'
        ? candidate.stories.slice(0, 3).map(({ title }) => title.trim())
        : [],
  });
  // Primary A covers scarce topics first. B loses slots before any A; among B
  // plans the quietest article pools lose first. Stable ties keep owner order.
  const reactions = [...candidates]
    .sort((a, b) => a.topic.freePosts - b.topic.freePosts)
    .filter(({ stories }) => stories.length >= 2)
    .map((candidate) => build(candidate, 'reactions'));
  const trending = [...candidates]
    .sort((a, b) => b.stories.length - a.stories.length)
    .map((candidate) => build(candidate, 'trending'));
  return [...reactions, ...trending].slice(
    0,
    Math.floor(input.availableMicros / input.reservationMicros),
  );
}
