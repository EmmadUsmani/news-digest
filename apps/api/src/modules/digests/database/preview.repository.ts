import { Injectable, OnModuleDestroy } from '@nestjs/common';
import { relevancePolicySchema, type DigestPreview } from '@digest/contracts';
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
 async generate(start: Date, end: Date): Promise<DigestPreview> {
 const client = await this.db.connect();
 try {
 await client.query('BEGIN ISOLATION LEVEL REPEATABLE READ');
 const topics = (await client.query('SELECT id,name,story_budget,relevance_policy FROM topics WHERE profile_id=$1 AND enabled ORDER BY position,id', [profileId])).rows;
 const selections = [];
 for (const topic of topics) {
 // Limit candidate work per topic, selecting the most recent 200 in the exact window.
 const candidates: Candidate[] = (await client.query(`SELECT i.id,i.title,i.canonical_url AS url,i.excerpt,i.published_at AS "publishedAt",array_agg(DISTINCT s.name ORDER BY s.name) AS sources,i.engagement->>'points' AS points FROM content_items i JOIN content_observations o ON o.item_id=i.id JOIN content_sources s ON s.id=o.source_id WHERE s.topic_id=$1 AND i.published_at >= $2 AND i.published_at < $3 GROUP BY i.id ORDER BY i.published_at DESC,i.id LIMIT 200`, [topic.id,start,end])).rows.map(row => ({ ...row, publishedAt: row.publishedAt.toISOString(), points: Number(row.points ?? 0) }));
 const policy = relevancePolicySchema.parse(topic.relevance_policy);
 const eligible = candidates.filter(item => assessRelevance(item, policy).eligible);
 const qualityRejections = eligible.flatMap(item => {
 const rejection = qualityRejection(item);
 return rejection ? [{ id: item.id, title: item.title, ...rejection }] : [];
 });
 const stories = rank(eligible,start,end,topic.story_budget).map(story => ({ ...story, reasons: [...story.reasons, assessRelevance(story,policy).reason] }));
 selections.push({ qualityRejections, relevancePolicy: policy, relevanceRejectedCount: candidates.length - eligible.length, id: topic.id, name: topic.name, candidateCount: candidates.length, stories });
 }
 const snapshot: DigestPreview = { id: crypto.randomUUID(), createdAt: new Date().toISOString(), windowStart: start.toISOString(), windowEnd: end.toISOString(), method: 'signals-v4', topics: selections };
 await client.query('INSERT INTO digest_previews(id,profile_id,created_at,window_start,window_end,snapshot) VALUES($1,$2,$3,$4,$5,$6)', [snapshot.id,profileId,snapshot.createdAt,start,end,snapshot]);
 await client.query('COMMIT'); return snapshot;
 } catch (error) { await client.query('ROLLBACK'); throw error; } finally { client.release(); }
 }
 async onModuleDestroy() { await this.db.end(); }
}
