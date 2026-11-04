import type { PoolClient } from 'pg';

import { budgetDaySlot } from '../adapters/budget-day-slot';
import { readBudgetDaySchedule } from '../database/budget-day.reader';

// Read under the caller's admission transaction. The row lock prevents a
// settings change from installing an occurrence before this spend commits.
export async function hasBudgetDayOccurrence(client: PoolClient, day: string) {
  return budgetDaySlot(day, await readBudgetDaySchedule(client)) !== null;
}
