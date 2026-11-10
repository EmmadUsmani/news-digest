import { eq } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/node-postgres';
import type { Pool } from 'pg';

import { editionSettings } from '../../../libs/db/schema';
import { readPublicSchedule } from '../../../public-read/settings';

// Public-mode system reader. The caller owns this pool.
// Never consult a profile or fall back to a legacy schedule, even with the
// system-ownership flag disabled or the singleton missing.
export class PublicScheduleReader {
  constructor(private readonly pool: Pool) {}

  read() {
    return readPublicSchedule(async () => {
      const [row] = await drizzle(this.pool)
        .select({
          cadence: editionSettings.cadence,
          timezone: editionSettings.timezone,
          coverageWindow: editionSettings.coverageWindow,
          storyBudget: editionSettings.storyBudget,
          postBudget: editionSettings.postBudget,
        })
        .from(editionSettings)
        .where(eq(editionSettings.id, 1));
      return row;
    });
  }
}
