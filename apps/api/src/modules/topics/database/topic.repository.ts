import { TopicRepository } from '../domain/topic.repository';
import { Injectable, OnModuleDestroy } from '@nestjs/common';
import { database } from '../../../libs/db/connections';
import type { Topic } from '@digest/contracts';
@Injectable()
export class PostgresTopicRepository extends TopicRepository implements OnModuleDestroy {
 private readonly db = database();
 async listDefault(): Promise<Topic[]> {
 const result = await this.db.query(`SELECT id, profile_id AS "profileId", name, description, include_guidance AS "includeGuidance", exclude_guidance AS "excludeGuidance", enabled, position, story_budget AS "storyBudget", post_budget AS "postBudget", sources, queries, accounts FROM topics WHERE profile_id=$1 ORDER BY position, id`, ['00000000-0000-4000-8000-000000000001']);
 return result.rows;
 }
 async onModuleDestroy() { await this.db.end(); }
}
