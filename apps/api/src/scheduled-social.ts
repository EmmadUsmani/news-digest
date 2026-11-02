import { Queue, Worker } from 'bullmq';

import { SharedHttpClient } from './libs/ports/http.client';
import { RiverDiscovery } from './modules/social/adapters/river-discovery';
import { XOfficialEmbed } from './modules/social/adapters/x-oembed';
import { collectSocial } from './modules/social/application/collect';
import { PostgresArticleDiscoveryRepository } from './modules/social/database/article-discovery.repository';
import { PostgresSocialRepository } from './modules/social/database/social.repository';

export function startScheduledSocial(http: SharedHttpClient) {
  const connection = { host: '127.0.0.1', port: 6379 };
  const repository = new PostgresSocialRepository();
  const articles = new PostgresArticleDiscoveryRepository();
  const queue = new Queue('social-collection', { connection });
  const worker = new Worker(
    'social-collection',
    async (job) => {
      if (job.name !== 'collect') throw new Error('Unknown social job');
      return collectSocial(
        repository,
        new RiverDiscovery(http),
        new XOfficialEmbed(http),
        articles,
      );
    },
    { connection, concurrency: 1 },
  );
  worker.on('error', () => console.error('Social worker connection error'));
  worker.on('failed', () => console.error('Social collection failed'));
  void queue
    .upsertJobScheduler(
      'free-social-hourly',
      { every: 3600000 },
      {
        name: 'collect',
        opts: { attempts: 1, removeOnComplete: 48, removeOnFail: 48 },
      },
    )
    .catch(() => console.error('Social scheduling failed'));
  return async () => {
    await worker.close();
    await queue.close();
    await repository.db.end();
    await articles.db.end();
  };
}
