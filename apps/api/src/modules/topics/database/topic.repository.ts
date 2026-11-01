import { TopicRepository } from '../domain/topic.repository';
import { Injectable, OnModuleDestroy } from '@nestjs/common';
import { database } from '../../../libs/db/connections';
import type { Topic, TopicUpdate } from '@digest/contracts';
@Injectable()
export class PostgresTopicRepository extends TopicRepository implements OnModuleDestroy {
 private readonly db = database();
 async listDefault(): Promise<Topic[]> {
 const result = await this.db.query(`SELECT id, profile_id AS "profileId", name, description, include_guidance AS "includeGuidance", exclude_guidance AS "excludeGuidance", enabled, position, story_budget AS "storyBudget", post_budget AS "postBudget", relevance_policy AS "relevancePolicy", sources, queries, accounts FROM topics WHERE profile_id=$1 ORDER BY position, id`, ['00000000-0000-4000-8000-000000000001']);
 return result.rows;
 }
 async updateDefault(id: string, update: TopicUpdate): Promise<Topic | null> {
 const result = await this.db.query(`UPDATE topics SET name=$3, description=$4, include_guidance=$5, exclude_guidance=$6, enabled=$7, story_budget=$8, post_budget=$9, relevance_policy=$10 WHERE id=$1 AND profile_id=$2 RETURNING id`, [id,'00000000-0000-4000-8000-000000000001',update.name,update.description,update.includeGuidance,update.excludeGuidance,update.enabled,update.storyBudget,update.postBudget,update.relevancePolicy]);
 if (!result.rowCount) return null;
 return (await this.listDefault()).find(topic => topic.id === id) ?? null;
 }
 async onModuleDestroy() { await this.db.end(); }
}
