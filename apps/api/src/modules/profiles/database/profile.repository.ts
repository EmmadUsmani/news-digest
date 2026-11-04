import type { ProfileSettings, ScheduleSettings } from '@digest/contracts';
import { Injectable, OnModuleDestroy } from '@nestjs/common';
import { eq } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/node-postgres';

import { database } from '../../../libs/db/connections';
import { digestSchedules, profiles } from '../../../libs/db/schema';
import { ProfileRepository } from '../domain/profile.repository';
@Injectable()
export class PostgresProfileRepository
  extends ProfileRepository
  implements OnModuleDestroy
{
  private readonly pool = database();
  private readonly db = drizzle(this.pool);
  async getDefault(): Promise<ProfileSettings> {
    const [row] = await this.db
      .select({
        id: profiles.id,
        name: profiles.name,
        cadence: digestSchedules.cadence,
        timezone: digestSchedules.timezone,
        coverageWindow: digestSchedules.coverageWindow,
        storyBudget: digestSchedules.storyBudget,
        postBudget: digestSchedules.postBudget,
      })
      .from(profiles)
      .innerJoin(digestSchedules, eq(digestSchedules.profileId, profiles.id))
      .where(eq(profiles.id, '00000000-0000-4000-8000-000000000001'));
    if (!row)
      throw new Error('Default profile schedule missing; run migrations');
    return {
      id: row.id,
      name: row.name,
      schedule: {
        cadence: row.cadence,
        timezone: row.timezone,
        coverageWindow: row.coverageWindow,
        storyBudget: row.storyBudget,
        postBudget: row.postBudget,
      },
    };
  }
  async updateDefault(schedule: ScheduleSettings): Promise<ProfileSettings> {
    const result = await this.db
      .update(digestSchedules)
      .set({
        cadence: schedule.cadence,
        timezone: schedule.timezone,
        coverageWindow: schedule.coverageWindow,
        storyBudget: schedule.storyBudget,
        postBudget: schedule.postBudget,
      })
      .where(
        eq(digestSchedules.profileId, '00000000-0000-4000-8000-000000000001'),
      )
      .returning({ profileId: digestSchedules.profileId });
    if (!result.length) throw new Error('Default profile schedule missing');
    return this.getDefault();
  }
  async onModuleDestroy() {
    await this.pool.end();
  }
}
