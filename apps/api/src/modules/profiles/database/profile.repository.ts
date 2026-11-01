import { Injectable, OnModuleDestroy } from '@nestjs/common';
import { database } from '../../../libs/db/connections';
import { ProfileRepository } from '../domain/profile.repository';
import type { ProfileSettings, ScheduleSettings } from '@digest/contracts';
@Injectable()
export class PostgresProfileRepository
  extends ProfileRepository
  implements OnModuleDestroy
{
  private readonly db = database();
  async getDefault(): Promise<ProfileSettings> {
    const result = await this.db.query(
      `SELECT p.id, p.name, s.cadence, s.timezone, s.coverage_window AS "coverageWindow", s.story_budget AS "storyBudget", s.post_budget AS "postBudget" FROM profiles p JOIN digest_schedules s ON s.profile_id=p.id WHERE p.id=$1`,
      ['00000000-0000-4000-8000-000000000001'],
    );
    const row = result.rows[0];
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
    const result = await this.db.query(
      `UPDATE digest_schedules SET cadence=$2, timezone=$3, coverage_window=$4, story_budget=$5, post_budget=$6 WHERE profile_id=$1 RETURNING profile_id`,
      [
        '00000000-0000-4000-8000-000000000001',
        schedule.cadence,
        schedule.timezone,
        schedule.coverageWindow,
        schedule.storyBudget,
        schedule.postBudget,
      ],
    );
    if (!result.rowCount) throw new Error('Default profile schedule missing');
    return this.getDefault();
  }
  async onModuleDestroy() {
    await this.db.end();
  }
}
