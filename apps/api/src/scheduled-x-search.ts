import type { ProfileSettings } from '@digest/contracts';

import { budgetDaySlot } from './modules/profiles/adapters/budget-day-slot';
import { coverageWindow } from './modules/profiles/domain/schedule';
import {
  type FollowupTopic,
  runSearchFollowups,
} from './modules/social/application/search-followups';
import {
  planScheduledSearch,
  type ScheduledSearchTopic,
  type ScheduledSearchType,
} from './modules/social/domain/scheduled-search';

type Plan = NonNullable<ReturnType<typeof planScheduledSearch>>;

// Coverage changes naturally during collection; only configuration invalidates a tick.
function topicSettings(topics: ScheduledSearchTopic[]) {
  return JSON.stringify(
    topics.map(({ id, name, guidance, handles }) => ({
      id,
      name,
      guidance,
      handles,
    })),
  );
}

// Re-read settings after coverage I/O. Never execute a plan for replaced settings.
// Only consider this UTC day's edition: midnight editions wait until midnight,
// so one edition cannot consume both the previous and current day's admission.
export async function runScheduledXSearch(
  loadProfile: () => Promise<ProfileSettings>,
  topics: (now: Date) => Promise<ScheduledSearchTopic[]>,
  execute: (plan: Plan, runId: string) => Promise<unknown>,
  clock: () => Date = () => new Date(),
  searchType: ScheduledSearchType = 'account-list',
  followups?: {
    completed: (day: string) => Promise<
      {
        topicId: string;
        openCallId: string;
        openVerifiedAdditions: number;
      }[]
    >;
    stories: (topicId: string, end: Date) => Promise<FollowupTopic['stories']>;
    execute: (
      plan: Plan,
      runId: string,
      parentId: string,
    ) => Promise<{
      state: 'completed' | 'failed' | 'budget-blocked';
    }>;
  },
) {
  const profile = await loadProfile();
  const now = clock();
  const edition = budgetDaySlot(
    now.toISOString().slice(0, 10),
    profile.schedule,
  );
  const remaining = edition ? edition.getTime() - now.getTime() : 0;
  if (
    !edition ||
    profile.schedule.postBudget <= 0 ||
    remaining < 5 * 60000 ||
    remaining > 30 * 60000
  )
    return { skipped: 'Outside search window' };
  const window = coverageWindow(edition, profile.schedule.coverageWindow);
  if (!window.ok) return { skipped: 'Invalid coverage window' };
  const coverageStart = window.value.windowStart;
  const candidates = await topics(now);
  const settings = topicSettings(candidates);
  const results: unknown[] = [];
  // Stable sort preserves owner order on ties. Recheck settings and time before
  // every call: a slow search must not spend after the pre-edition window.
  for (const topic of [...candidates].sort(
    (a, b) => a.freePosts - b.freePosts,
  )) {
    // Topics can be disabled, deleted or edited while an earlier HTTP call runs.
    // Recheck the whole enabled set so a newly added topic waits for a fresh tick.
    if (topicSettings(await topics(clock())) !== settings)
      return { skipped: 'Topics changed', results };
    const current = await loadProfile();
    if (
      current.id !== profile.id ||
      JSON.stringify(current.schedule) !== JSON.stringify(profile.schedule)
    )
      return { skipped: 'Schedule changed', results };
    const plan = planScheduledSearch(
      [topic],
      clock(),
      edition,
      searchType,
      coverageStart,
    );
    if (!plan || plan.scheduledDay !== now.toISOString().slice(0, 10)) continue;
    results.push(
      await execute(plan, `scheduled-x:${profile.id}:${edition.getTime()}`),
    );
  }
  if (searchType === 'open-topic' && followups && candidates.length > 0) {
    const day = now.toISOString().slice(0, 10);
    // Load durable evidence after all primary attempts, including after restart.
    // Missing/ambiguous evidence for any enabled topic blocks every followup.
    const completed = await followups.completed(day);
    if (
      candidates.some(
        ({ id }) => completed.filter((row) => row.topicId === id).length !== 1,
      )
    )
      return results;
    const plans: FollowupTopic[] = [];
    for (const topic of [...candidates].sort(
      (a, b) => a.freePosts - b.freePosts,
    )) {
      const plan = planScheduledSearch(
        [topic],
        now,
        edition,
        'open-topic',
        coverageStart,
      );
      if (!plan) return results;
      const evidence = completed.find((row) => row.topicId === topic.id)!;
      plans.push({
        id: topic.id,
        request: plan.request,
        openCallId: evidence.openCallId,
        openState: 'completed',
        openVerifiedAdditions: evidence.openVerifiedAdditions,
        stories: await followups.stories(topic.id, now),
        handles: topic.handles,
      });
    }
    const optional = await runSearchFollowups(
      plans,
      async () => {
        if (topicSettings(await topics(clock())) !== settings) return false;
        const current = await loadProfile();
        const instant = clock();
        return (
          current.id === profile.id &&
          JSON.stringify(current.schedule) ===
            JSON.stringify(profile.schedule) &&
          instant.toISOString().slice(0, 10) === day &&
          planScheduledSearch(
            candidates,
            instant,
            edition,
            'open-topic',
            coverageStart,
          ) !== null
        );
      },
      async (topicId, request, parentId) =>
        followups.execute(
          {
            topic: candidates.find((topic) => topic.id === topicId)!,
            request,
            scheduledDay: day,
          },
          `scheduled-x:${profile.id}:${edition.getTime()}`,
          parentId,
        ),
    );
    results.push(...optional);
  }
  return results;
}
