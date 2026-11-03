import './libs/observability/worker-logging';

import { Queue, Worker } from 'bullmq';

import {
  installFatalLogging,
  logger,
  logJob,
} from './libs/observability/logging';
import { startRuntimeMetrics } from './libs/observability/runtime-metrics';
import { SharedHttpClient } from './libs/ports/http.client';
import { FeedAdapter } from './modules/ingestion/adapters/feed.adapter';
import { HackerNewsAdapter } from './modules/ingestion/adapters/hn.adapter';
import { PostgresContentRepository } from './modules/ingestion/database/content.repository';
import { ingest } from './modules/ingestion/ingest';
import { startScheduledDigests } from './scheduled-digests';
import { startScheduledSocial } from './scheduled-social';
installFatalLogging();
const runtimeMetrics = startRuntimeMetrics('worker', 9465);
const stopScheduledDigests = startScheduledDigests();
const connection = { host: '127.0.0.1', port: 6379 };
// Operations telemetry remains separate from content collection.
const queue = new Queue('operations', { connection });
const worker = new Worker(
  'operations',
  logJob('operations', async (job) => {
    if (job.name !== 'heartbeat') throw new Error('Unknown operations job');
    return { checkedAt: new Date().toISOString() };
  }),
  { connection, concurrency: 1 },
);
worker.on('error', (err) =>
  logger.error({ err }, 'Operations worker connection error'),
);
void queue.upsertJobScheduler(
  'heartbeat',
  { every: 60000 },
  { name: 'heartbeat', opts: { removeOnComplete: 10, removeOnFail: 10 } },
);
const repository = new PostgresContentRepository();
const http = new SharedHttpClient();
const stopScheduledSocial = startScheduledSocial(http);
const adapters = {
  feed: new FeedAdapter(http),
  hn: new HackerNewsAdapter(http),
};
const ingestionQueue = new Queue('ingestion', { connection });
const ingestionWorker = new Worker(
  'ingestion',
  logJob('ingestion', (job) =>
    ingest(repository, adapters, String(job.data.sourceId)),
  ),
  { connection, concurrency: 1 },
);
ingestionWorker.on('error', (err) =>
  logger.error({ err }, 'Ingestion worker connection error'),
);
async function scheduleSources() {
  for (const source of await repository.sources())
    await ingestionQueue.upsertJobScheduler(
      `source-${source.id}`,
      { every: 1800000 },
      {
        name: 'collect',
        data: { sourceId: source.id },
        opts: {
          attempts: 3,
          backoff: { type: 'exponential', delay: 60000 },
          removeOnComplete: 100,
          removeOnFail: 100,
        },
      },
    );
}
void scheduleSources().catch(() => {
  logger.error('Source scheduling failed');
  process.exitCode = 1;
  void stop();
});
const sourceRefresh = setInterval(() => {
  void scheduleSources().catch((err) =>
    logger.error({ err }, 'Source scheduling refresh failed'),
  );
}, 60000);
async function stop() {
  runtimeMetrics.server.close();
  clearInterval(sourceRefresh);
  await stopScheduledDigests();
  await stopScheduledSocial();
  await ingestionWorker.close();
  await ingestionQueue.close();
  await repository.onModuleDestroy();
  await worker.close();
  await queue.close();
}
process.on('SIGTERM', () => {
  void stop();
});
process.on('SIGINT', () => {
  void stop();
});
