// Explicit live check: one GET/feed + HN list and 20 stories per pass.
import { Queue, QueueEvents } from 'bullmq';
import assert from 'node:assert/strict';
import { PostgresContentRepository } from '../src/modules/ingestion/database/content.repository';
async function smoke() {
 const connection = { host: '127.0.0.1', port: 6379 };
 const queue = new Queue('ingestion', { connection });
 const events = new QueueEvents('ingestion', { connection });
 const repository = new PostgresContentRepository();
 try {
 await events.waitUntilReady();
 const sources = await repository.sources();
 const run = async () => {
 const jobs = await Promise.all(sources.map(s => queue.add('collect', { sourceId: s.id }, { removeOnComplete: 100, removeOnFail: 100 })));
 await Promise.all(jobs.map(j => j.waitUntilFinished(events, 120000)));
 return (await repository.db.query('SELECT count(*)::int AS n FROM content_items')).rows[0].n;
 };
 const before = await run(); const after = await run();
 assert.equal(after, before, 'Repeated collection must not create duplicate items');
 const status = await repository.db.query('SELECT id,last_success,last_error,last_item_count FROM content_sources');
 assert.ok(status.rows.every(s => s.last_success && !s.last_error && s.last_item_count > 0));
 const topics = await repository.db.query('SELECT DISTINCT s.topic_id FROM content_sources s JOIN content_observations o ON o.source_id=s.id');
 assert.equal(topics.rowCount, 4);
 console.log(JSON.stringify({ storedItems: after, topics: topics.rowCount, sources: status.rows }));
 } finally { await events.close(); await queue.close(); await repository.onModuleDestroy(); }
}
void smoke();
