import type { ScheduleSettings } from '@digest/contracts';
import type { PoolClient } from 'pg';

import { budgetDaySlot } from '../adapters/budget-day-slot';

// Read under the caller's admission transaction. The row lock prevents a
// settings change from installing an occurrence before this spend commits.
export async function hasBudgetDayOccurrence(client: PoolClient, day: string) {
  const { rows } = await client.query<ScheduleSettings>(
    `SELECT cadence,timezone,coverage_window AS "coverageWindow",
     story_budget AS "storyBudget",post_budget AS "postBudget"
     FROM digest_schedules WHERE profile_id=$1 FOR SHARE`,
    ['00000000-0000-4000-8000-000000000001'],
  );
  if (!rows[0]) throw new Error('Default profile schedule missing');
  return budgetDaySlot(day, rows[0]) !== null;
}
