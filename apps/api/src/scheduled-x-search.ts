import type { ProfileSettings } from '@digest/contracts';

import { budgetDaySlot } from './modules/profiles/adapters/budget-day-slot';
import {
  planScheduledSearch,
  type ScheduledSearchTopic,
} from './modules/social/domain/scheduled-search';

type Plan = NonNullable<ReturnType<typeof planScheduledSearch>>;

// Re-read settings after coverage I/O. Never execute a plan for replaced settings.
// Only consider this UTC day's edition: midnight editions wait until midnight,
// so one edition cannot consume both the previous and current day's admission.
export async function runScheduledXSearch(
  loadProfile: () => Promise<ProfileSettings>,
  topics: (now: Date) => Promise<ScheduledSearchTopic[]>,
  execute: (plan: Plan, runId: string) => Promise<unknown>,
  clock: () => Date = () => new Date(),
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
  const candidates = await topics(now);
  const results: unknown[] = [];
  // Stable sort preserves owner order on ties. Recheck settings and time before
  // every call: a slow search must not spend after the pre-edition window.
  for (const topic of [...candidates].sort(
    (a, b) => a.freePosts - b.freePosts,
  )) {
    const current = await loadProfile();
    if (
      current.id !== profile.id ||
      JSON.stringify(current.schedule) !== JSON.stringify(profile.schedule)
    )
      return { skipped: 'Schedule changed', results };
    const plan = planScheduledSearch([topic], clock(), edition);
    if (!plan || plan.scheduledDay !== now.toISOString().slice(0, 10)) continue;
    results.push(
      await execute(plan, `scheduled-x:${profile.id}:${edition.getTime()}`),
    );
  }
  return results;
}
