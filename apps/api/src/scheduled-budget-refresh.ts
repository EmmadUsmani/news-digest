import type { ProfileSettings } from '@digest/contracts';

import type { ScheduledBudgetRepository } from './modules/curation/domain/scheduled-budget.port';
import { budgetDaySlot } from './modules/profiles/adapters/budget-day-slot';

// Read the expected identity BEFORE loading settings. A slow settings snapshot
// cannot replace an identity installed by a newer refresh in the meantime.
export async function refreshScheduledBudget(
  budgets: ScheduledBudgetRepository,
  loadProfile: () => Promise<ProfileSettings>,
  now: Date,
) {
  const day = now.toISOString().slice(0, 10);
  const expected = await budgets.read(day);
  const profile = await loadProfile();
  const slot = budgetDaySlot(day, profile.schedule);
  if (slot) {
    // Same stable key as edition publication; never use an LLM purpose as trust.
    const runId = `${profile.id}:${slot.getTime()}`;
    if (!expected) {
      // A competing refresh may have registered already. First registration
      // wins; do not overwrite it using this older settings snapshot.
      await budgets.register(slot, runId);
    } else if (expected.runId !== runId) {
      await budgets.reconcilePending(day, expected.runId, slot, runId);
    }
  }
  return profile;
}
