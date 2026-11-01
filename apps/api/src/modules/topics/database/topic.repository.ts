import { randomUUID } from 'node:crypto';
import { TopicRepository } from '../domain/topic.repository';
import { Injectable, OnModuleDestroy } from '@nestjs/common';
import { database } from '../../../libs/db/connections';
import type { Topic, TopicUpdate, CustomFeed } from '@digest/contracts';
@Injectable()
export class PostgresTopicRepository extends TopicRepository implements OnModuleDestroy {
 private readonly db = database();
 async listDefault(): Promise<Topic[]> {
 const result = await this.db.query(`SELECT id, profile_id AS "profileId", name, description, include_guidance AS "includeGuidance", exclude_guidance AS "excludeGuidance", enabled, position, story_budget AS "storyBudget", post_budget AS "postBudget", relevance_policy AS "relevancePolicy", COALESCE((SELECT jsonb_agg(source_id ORDER BY source_id) FROM topic_source_connections c WHERE c.topic_id=topics.id),'[]') AS sources, queries, accounts FROM topics WHERE profile_id=$1 ORDER BY position, id`, ['00000000-0000-4000-8000-000000000001']);
 return result.rows;
 }
 async catalog() { return (await this.db.query('SELECT id,name,url FROM content_sources ORDER BY name,id')).rows; }
 async addFeedDefault(id: string, input: CustomFeed): Promise<Topic | null | false> {
 const client = await this.db.connect();
 try {
 await client.query('BEGIN');
 // Serialize catalog registration and enforce bounded catalog/connection sizes.
 await client.query("SELECT pg_advisory_xact_lock(hashtext('custom-feed-catalog'))");
 const topic = await client.query('SELECT id FROM topics WHERE id=$1 AND profile_id=$2 FOR UPDATE', [id,'00000000-0000-4000-8000-000000000001']);
 if (!topic.rowCount) { await client.query('ROLLBACK'); return null; }
 const existing = await client.query("SELECT id FROM content_sources WHERE kind='feed' AND url=$1 ORDER BY id LIMIT 1",[input.url]);
 const sourceId = existing.rows[0]?.id ?? `feed-${randomUUID()}`;
 const counts = await client.query('SELECT (SELECT count(*) FROM content_sources)::int AS catalog,(SELECT count(*) FROM topic_source_connections WHERE topic_id=$1)::int AS connections', [id]);
 const connected = await client.query('SELECT 1 FROM topic_source_connections WHERE topic_id=$1 AND source_id=$2',[id,sourceId]);
 if ((!existing.rowCount && counts.rows[0].catalog >= 500) || (!connected.rowCount && counts.rows[0].connections >= 100)) { await client.query('ROLLBACK'); return false; }
 if (!existing.rowCount) await client.query("INSERT INTO content_sources(id,name,kind,url) VALUES($1,$2,'feed',$3)",[sourceId,input.name,input.url]);
 await client.query('INSERT INTO topic_source_connections(topic_id,source_id) VALUES($1,$2) ON CONFLICT DO NOTHING',[id,sourceId]);
 await client.query('COMMIT');
 } catch(error) { await client.query('ROLLBACK'); throw error; }
 finally { client.release(); }
 return (await this.listDefault()).find(t=>t.id===id) ?? null;
 }
 async connectDefault(id: string, ids: string[]): Promise<Topic | null | false> {
 const client = await this.db.connect();
 try {
 await client.query('BEGIN');
 const topic = await client.query('SELECT id FROM topics WHERE id=$1 AND profile_id=$2 FOR UPDATE', [id, '00000000-0000-4000-8000-000000000001']);
 if (!topic.rowCount) { await client.query('ROLLBACK'); return null; }
 const known = await client.query('SELECT id FROM content_sources WHERE id=ANY($1::text[])', [ids]);
 if (known.rowCount !== ids.length) { await client.query('ROLLBACK'); return false; }
 await client.query('DELETE FROM topic_source_connections WHERE topic_id=$1', [id]);
 await client.query('INSERT INTO topic_source_connections(topic_id,source_id) SELECT $1,unnest($2::text[])', [id,ids]);
 await client.query('COMMIT');
 } catch (error) { await client.query('ROLLBACK'); throw error; }
 finally { client.release(); }
 return (await this.listDefault()).find(topic => topic.id === id) ?? null;
 }
 async deleteDefault(id: string): Promise<Topic[] | null> {
 const client = await this.db.connect();
 try {
 await client.query('BEGIN');
 // Share the creation/reorder lock so deleting closes positions atomically.
 await client.query('SELECT id FROM profiles WHERE id=$1 FOR UPDATE', ['00000000-0000-4000-8000-000000000001']);
 const removed = await client.query('DELETE FROM topics WHERE id=$1 AND profile_id=$2 RETURNING id', [id, '00000000-0000-4000-8000-000000000001']);
 if (!removed.rowCount) { await client.query('ROLLBACK'); return null; }
 await client.query(`UPDATE topics SET position=ordered.position FROM
 (SELECT id,(row_number() OVER (ORDER BY position,id)-1)::int AS position FROM topics WHERE profile_id=$1) ordered
 WHERE topics.id=ordered.id`, ['00000000-0000-4000-8000-000000000001']);
 await client.query('COMMIT');
 } catch (error) { await client.query('ROLLBACK'); throw error; }
 finally { client.release(); }
 return this.listDefault();
 }
 async createDefault(input: TopicUpdate): Promise<Topic> {
 const client = await this.db.connect();
 const profileId = '00000000-0000-4000-8000-000000000001';
 const id = randomUUID();
 try {
 await client.query('BEGIN');
 // Serialize creation and reorder through the parent, including an empty topic list.
 await client.query('SELECT id FROM profiles WHERE id=$1 FOR UPDATE', [profileId]);
 await client.query(`INSERT INTO topics(id, profile_id, name, description, include_guidance, exclude_guidance, enabled, position, story_budget, post_budget, relevance_policy)
 SELECT $1,$2,$3,$4,$5,$6,$7,COALESCE(MAX(position)+1,0),$8,$9,$10 FROM topics WHERE profile_id=$2`, [id,profileId,input.name,input.description,input.includeGuidance,input.excludeGuidance,input.enabled,input.storyBudget,input.postBudget,input.relevancePolicy]);
 await client.query('COMMIT');
 } catch (error) { await client.query('ROLLBACK'); throw error; }
 finally { client.release(); }
 return (await this.listDefault()).find(topic => topic.id === id)!;
 }
 async reorderDefault(ids: string[]): Promise<boolean> {
 const client = await this.db.connect();
 try {
 await client.query('BEGIN');
 await client.query('SELECT id FROM profiles WHERE id=$1 FOR UPDATE', ['00000000-0000-4000-8000-000000000001']);
 const current = await client.query('SELECT id FROM topics WHERE profile_id=$1 ORDER BY id FOR UPDATE', ['00000000-0000-4000-8000-000000000001']);
 if (current.rows.length !== ids.length || current.rows.some(row => !ids.includes(row.id))) {
 await client.query('ROLLBACK'); return false;
 }
 await client.query('UPDATE topics SET position=(ordering.ordinality - 1)::int FROM unnest($1::uuid[]) WITH ORDINALITY AS ordering(id, ordinality) WHERE topics.id=ordering.id AND profile_id=$2', [ids, '00000000-0000-4000-8000-000000000001']);
 await client.query('COMMIT'); return true;
 } catch (error) { await client.query('ROLLBACK'); throw error; }
 finally { client.release(); }
 }
 async updateDefault(id: string, update: TopicUpdate): Promise<Topic | null> {
 const result = await this.db.query(`UPDATE topics SET name=$3, description=$4, include_guidance=$5, exclude_guidance=$6, enabled=$7, story_budget=$8, post_budget=$9, relevance_policy=$10 WHERE id=$1 AND profile_id=$2 RETURNING id`, [id,'00000000-0000-4000-8000-000000000001',update.name,update.description,update.includeGuidance,update.excludeGuidance,update.enabled,update.storyBudget,update.postBudget,update.relevancePolicy]);
 if (!result.rowCount) return null;
 return (await this.listDefault()).find(topic => topic.id === id) ?? null;
 }
 async onModuleDestroy() { await this.db.end(); }
}
