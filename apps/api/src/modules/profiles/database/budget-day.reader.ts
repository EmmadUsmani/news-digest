import { eq } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/node-postgres';
import type { PoolClient } from 'pg';

import { digestSchedules } from '../../../libs/db/schema';

// Reuse the admission transaction and hold the schedule stable until it commits.
export async function readBudgetDaySchedule(client: PoolClient) {
  const [row] = await drizzle(client)
    .select({
      cadence: digestSchedules.cadence,
      timezone: digestSchedules.timezone,
      coverageWindow: digestSchedules.coverageWindow,
      storyBudget: digestSchedules.storyBudget,
      postBudget: digestSchedules.postBudget,
    })
    .from(digestSchedules)
    .where(
      eq(digestSchedules.profileId, '00000000-0000-4000-8000-000000000001'),
    )
    .for('share');
  if (!row) throw new Error('Default profile schedule missing');
  return row;
}
