import { Injectable, OnModuleDestroy } from '@nestjs/common';
import { relevancePolicySchema, type DigestPreview, type PreviewHistory } from '@digest/contracts';
import { database } from '../../../libs/db/connections';
import { PreviewRepository } from '../domain/preview.repository';
import { Candidate, rank } from '../domain/rank';
import { qualityRejection } from '../domain/quality';
import { assessRelevance } from '../domain/relevance';
const profileId = '00000000-0000-4000-8000-000000000001';
@Injectable()
export class PostgresPreviewRepository extends PreviewRepository implements OnModuleDestroy {
 readonly db = database();
 async latest(): Promise<DigestPreview | null> {
 return (await this.db.query('SELECT snapshot FROM digest_previews WHERE profile_id=$1 ORDER BY created_at DESC,id DESC LIMIT 1', [profileId])).rows[0]?.snapshot ?? null;
 }
 async find(id: string): Promise<DigestPreview | null> {
 return (await this.db.query('SELECT snapshot FROM digest_previews WHERE profile_id=$1 AND id=$2', [profileId,id])).rows[0]?.snapshot ?? null;
 }
 async history(offset: number): Promise<PreviewHistory> {
 const rows = (await this.db.query(`SELECT id,created_at AS "createdAt",window_start AS "windowStart",window_end AS "windowEnd",snapshot->>'method' AS method FROM digest_previews WHERE profile_id=$1 ORDER BY created_at DESC,id DESC LIMIT 21 OFFSET $2`, [profileId,offset])).rows;
 return { entries: rows.slice(0,20).map(row => ({ ...row, createdAt: row.createdAt.toISOString(), windowStart: row.windowStart.toISOString(), windowEnd: row.windowEnd.toISOString() })), hasMore: rows.length > 20 };
 }
 async generate(start: Date, end: Date, scheduledKey?: string): Promise<DigestPreview> {
 const client = await this.db.connect();
 try {
 // Lock before opening the snapshot so a retry sees the committed prior run.
 if (scheduledKey) await client.query('SELECT pg_advisory_lock(hashtextextended($1,0))', [scheduledKey]);
 await client.query('BEGIN ISOLATION LEVEL REPEATABLE READ');
 if (scheduledKey) {
 const prior = (await client.query('SELECT snapshot FROM digest_previews WHERE scheduled_key=$1', [scheduledKey])).rows[0];
 if (prior) { await client.query('COMMIT'); return prior.snapshot; }
 }
 const topics = (await client.query('SELECT id,name,story_budget,relevance_policy FROM topics WHERE profile_id=$1 AND enabled ORDER BY position,id', [profileId])).rows;
 const selections = [];
 for (const topic of topics) {
 // Limit candidate work per topic, selecting the most recent 200 in the exact window.
 const candidates: Candidate[] = (await client.query(`SELECT i.id,i.title,i.canonical_url AS url,i.excerpt,i.image_url AS "imageUrl",i.published_at AS "publishedAt",array_agg(DISTINCT s.name ORDER BY s.name) AS sources,i.engagement->>'points' AS points FROM content_items i JOIN content_observations o ON o.item_id=i.id JOIN content_sources s ON s.id=o.source_id JOIN topic_source_connections c ON c.source_id=s.id WHERE c.topic_id=$1 AND i.published_at >= $2 AND i.published_at < $3 GROUP BY i.id ORDER BY i.published_at DESC,i.id LIMIT 200`, [topic.id,start,end])).rows.map(row => ({ ...row, publishedAt: row.publishedAt.toISOString(), points: Number(row.points ?? 0) }));
 const policy = relevancePolicySchema.parse(topic.relevance_policy);
 const eligible = candidates.filter(item => assessRelevance(item, policy).eligible);
 const qualityRejections = eligible.flatMap(item => {
 const rejection = qualityRejection(item);
 return rejection ? [{ id: item.id, title: item.title, ...rejection }] : [];
 });
 const stories = rank(eligible,start,end,topic.story_budget).map(story => ({ ...story, reasons: [...story.reasons, assessRelevance(story,policy).reason] }));
 selections.push({ qualityRejections, relevancePolicy: policy, relevanceRejectedCount: candidates.length - eligible.length, id: topic.id, name: topic.name, candidateCount: candidates.length, stories });
 }
 const snapshot: DigestPreview = { id: crypto.randomUUID(), createdAt: new Date().toISOString(), windowStart: start.toISOString(), windowEnd: end.toISOString(), method: 'signals-v6', topics: selections };
 await client.query('INSERT INTO digest_previews(id,profile_id,created_at,window_start,window_end,snapshot,scheduled_key) VALUES($1,$2,$3,$4,$5,$6,$7)', [snapshot.id,profileId,snapshot.createdAt,start,end,snapshot,scheduledKey ?? null]);
 await client.query('COMMIT'); return snapshot;
 } catch (error) { await client.query('ROLLBACK'); throw error; } finally {
 try { if (scheduledKey) await client.query('SELECT pg_advisory_unlock(hashtextextended($1,0))', [scheduledKey]); } finally { client.release(); }
 }
 }
 async onModuleDestroy() { await this.db.end(); }
}
