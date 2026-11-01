import { PostgresContentRepository } from './modules/ingestion/database/content.repository';
import { FeedAdapter } from './modules/ingestion/adapters/feed.adapter';
import { HackerNewsAdapter } from './modules/ingestion/adapters/hn.adapter';
import { ingest } from './modules/ingestion/ingest';
import { SharedHttpClient } from './libs/ports/http.client';
import { Queue, Worker } from 'bullmq';
const connection = { host: '127.0.0.1', port: 6379 };
// Operations telemetry remains separate from content collection.
const queue = new Queue('operations', { connection });
const worker = new Worker('operations', async job => {
 if (job.name !== 'heartbeat') throw new Error('Unknown operations job');
 return { checkedAt: new Date().toISOString() };
}, { connection, concurrency: 1 });
worker.on('error', () => console.error('Operations worker connection error'));
void queue.upsertJobScheduler('heartbeat', { every: 60000 }, { name: 'heartbeat', opts: { removeOnComplete: 10, removeOnFail: 10 } });
const repository = new PostgresContentRepository();
const http = new SharedHttpClient();
const adapters = { feed: new FeedAdapter(http), hn: new HackerNewsAdapter(http) };
const ingestionQueue = new Queue('ingestion', { connection });
const ingestionWorker = new Worker('ingestion', job => ingest(repository, adapters, String(job.data.sourceId)), { connection, concurrency: 1 });
ingestionWorker.on('error', () => console.error('Ingestion worker connection error'));
async function scheduleSources() {
 for (const source of await repository.sources()) await ingestionQueue.upsertJobScheduler(`source-${source.id}`, { every: 1800000 }, { name: 'collect', data: { sourceId: source.id }, opts: { attempts: 3, backoff: { type: 'exponential', delay: 60000 }, removeOnComplete: 100, removeOnFail: 100 } });
}
void scheduleSources().catch(() => { console.error('Source scheduling failed'); process.exitCode = 1; void stop(); });
const sourceRefresh = setInterval(() => { void scheduleSources().catch(() => console.error('Source scheduling refresh failed')); }, 60000);
async function stop() { clearInterval(sourceRefresh); await ingestionWorker.close(); await ingestionQueue.close(); await repository.onModuleDestroy(); await worker.close(); await queue.close(); }
process.on('SIGTERM', () => { void stop(); });
process.on('SIGINT', () => { void stop(); });
