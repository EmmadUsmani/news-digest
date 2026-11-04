import type { ProfileSettings } from '@digest/contracts';

import { budgetDaySlot } from './modules/profiles/adapters/budget-day-slot';
import { coverageWindow } from './modules/profiles/domain/schedule';
import {
  type FixedSearchPlan,
  type FixedSearchTopic,
  planFixedSearchSchedule,
} from './modules/social/domain/fixed-search-schedule';

// Exact opt-in only. Activation still requires the owner's experiment decision.
export function fixedXSearchEnabled(env: NodeJS.ProcessEnv = process.env) {
  return env.X_FIXED_SEARCH_ENABLED === '1';
}

export async function runScheduledFixedXSearch(deps: {
  enabled: () => boolean;
  profile: () => Promise<ProfileSettings>;
  topics: (start: Date, end: Date) => Promise<FixedSearchTopic[]>;
  availableMicros: () => Promise<number>;
  execute: (plan: FixedSearchPlan, runId: string) => Promise<unknown>;
  clock?: () => Date;
}) {
  if (!deps.enabled()) return { skipped: 'Fixed search disabled' };
  const clock = deps.clock ?? (() => new Date());
  const now = clock();
  const profile = await deps.profile();
  const day = now.toISOString().slice(0, 10);
  const edition = budgetDaySlot(day, profile.schedule);
  const remaining = edition ? edition.getTime() - now.getTime() : 0;
  if (
    !edition ||
    profile.schedule.postBudget <= 0 ||
    remaining < 300000 ||
    remaining > 1800000
  )
    return { skipped: 'Outside search window' };
  const window = coverageWindow(edition, profile.schedule.coverageWindow);
  if (!window.ok) return { skipped: 'Invalid coverage window' };
  const start = new Date(
    Math.max(window.value.windowStart.getTime(), now.getTime() - 86400000),
  );
  const topics = await deps.topics(start, now);
  const configuration = (rows: FixedSearchTopic[]) =>
    JSON.stringify(
      rows.map(({ id, name, guidance, handles, settings }) => ({
        id,
        name,
        guidance,
        handles,
        settings,
      })),
    );
  const original = configuration(topics);
  // Enumerate both styles before checking the live balance. Previously consumed
  // A slots must not hide affordable B slots on a later tick after restart.
  const plans = planFixedSearchSchedule({
    enabled: true,
    topics,
    now,
    editionAt: edition,
    coverageStart: start,
    availableMicros: topics.length * 2 * 100000,
    reservationMicros: 100000,
  });
  const results: unknown[] = [];
  for (const plan of plans) {
    if (configuration(await deps.topics(start, now)) !== original)
      return { skipped: 'Topics changed', results };
    if ((await deps.availableMicros()) < 100000) break;
    const current = await deps.profile();
    const instant = clock();
    if (
      !deps.enabled() ||
      current.id !== profile.id ||
      JSON.stringify(current.schedule) !== JSON.stringify(profile.schedule)
    )
      return { skipped: 'Schedule changed', results };
    if (
      instant.toISOString().slice(0, 10) !== day ||
      edition.getTime() - instant.getTime() < 300000 ||
      edition.getTime() - instant.getTime() > 1800000
    )
      return { skipped: 'Outside search window', results };
    results.push(
      await deps.execute(
        plan,
        `scheduled-fixed-x:${profile.id}:${edition.getTime()}`,
      ),
    );
  }
  return results;
}
