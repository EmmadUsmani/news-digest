import { Queue, Worker } from 'bullmq';
const connection = { host: '127.0.0.1', port: 6379 };
// Until ingestion lands, this repeatable local probe verifies the worker and queue.
const queue = new Queue('operations', { connection });
const worker = new Worker('operations', async job => {
 if (job.name !== 'heartbeat') throw new Error('Unknown operations job');
 return { checkedAt: new Date().toISOString() };
}, { connection, concurrency: 1 });
worker.on('error', () => console.error('Operations worker connection error'));
void queue.upsertJobScheduler('heartbeat', { every: 60000 }, { name: 'heartbeat', opts: { removeOnComplete: 10, removeOnFail: 10 } });
async function stop() { await worker.close(); await queue.close(); }
process.on('SIGTERM', () => { void stop(); });
process.on('SIGINT', () => { void stop(); });
