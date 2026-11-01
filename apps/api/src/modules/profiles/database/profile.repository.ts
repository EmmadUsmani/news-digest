import { Injectable, OnModuleDestroy } from '@nestjs/common';
import { database } from '../../../libs/db/connections';
import { ProfileRepository } from '../domain/profile.repository';
import type { ProfileSettings } from '@digest/contracts';
@Injectable()
export class PostgresProfileRepository extends ProfileRepository implements OnModuleDestroy {
 private readonly db = database();
 async getDefault(): Promise<ProfileSettings> {
 const result = await this.db.query(`SELECT p.id, p.name, s.cadence, s.timezone, s.coverage_window AS "coverageWindow", s.story_budget AS "storyBudget", s.post_budget AS "postBudget" FROM profiles p JOIN digest_schedules s ON s.profile_id=p.id WHERE p.id=$1`, ['00000000-0000-4000-8000-000000000001']);
 const row = result.rows[0];
 if (!row) throw new Error('Default profile schedule missing; run migrations');
 return { id: row.id, name: row.name, schedule: { cadence: row.cadence, timezone: row.timezone, coverageWindow: row.coverageWindow, storyBudget: row.storyBudget, postBudget: row.postBudget } };
 }
 async onModuleDestroy() { await this.db.end(); }
}
