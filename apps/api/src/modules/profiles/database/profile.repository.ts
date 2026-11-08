import type { ProfileSettings, ScheduleSettings } from '@digest/contracts';
import { Injectable, OnModuleDestroy } from '@nestjs/common';
import { eq } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/node-postgres';

import { database } from '../../../libs/db/connections';
import {
  digestSchedules,
  editionSettings,
  profiles,
} from '../../../libs/db/schema';
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
    const schedule =
      process.env.SYSTEM_OWNERSHIP === '1'
        ? await this.getSystemSchedule()
        : row;
    return {
      id: row.id,
      name: row.name,
      schedule: {
        cadence: schedule.cadence,
        timezone: schedule.timezone,
        coverageWindow: schedule.coverageWindow,
        storyBudget: schedule.storyBudget,
        postBudget: schedule.postBudget,
      },
    };
  }
  private async getSystemSchedule(): Promise<ScheduleSettings> {
    const [row] = await this.db
      .select()
      .from(editionSettings)
      .where(eq(editionSettings.id, 1));
    if (!row)
      throw new Error('System edition settings missing; run migrations');
    return row;
  }
  async updateDefault(schedule: ScheduleSettings): Promise<ProfileSettings> {
    await this.db.transaction(async (tx) => {
      const result = await tx
        .update(digestSchedules)
        .set(schedule)
        .where(
          eq(digestSchedules.profileId, '00000000-0000-4000-8000-000000000001'),
        )
        .returning({ profileId: digestSchedules.profileId });
      if (!result.length) throw new Error('Default profile schedule missing');
      // Keep rollback reads current even while the system ownership flag is off.
      const system = await tx
        .update(editionSettings)
        .set(schedule)
        .where(eq(editionSettings.id, 1))
        .returning({ id: editionSettings.id });
      if (!system.length)
        throw new Error('System edition settings missing; run migrations');
    });
    return this.getDefault();
  }
  async onModuleDestroy() {
    await this.pool.end();
  }
}
