import { Queue, Worker } from 'bullmq';

import { logger, logJob } from './libs/observability/logging';
import { SharedHttpClient } from './libs/ports/http.client';
import { PostgresProfileRepository } from './modules/profiles/database/profile.repository';
import { BlueskySearch } from './modules/social/adapters/bluesky-search';
import { RiverDiscovery } from './modules/social/adapters/river-discovery';
import { XOfficialEmbed } from './modules/social/adapters/x-oembed';
import { DirectXSearch } from './modules/social/adapters/x-search';
import { collectSocial } from './modules/social/application/collect';
import { collectBlueskyTopics } from './modules/social/application/collect-bluesky-topics';
import { verifyPosts } from './modules/social/application/verify-posts';
import { PostgresArticleDiscoveryRepository } from './modules/social/database/article-discovery.repository';
import { PostgresBlueskyRepository } from './modules/social/database/bluesky.repository';
import { PostgresSocialRepository } from './modules/social/database/social.repository';
import { PostgresXDiscoveryLedger } from './modules/social/database/x-discovery.ledger';
import { PostgresXSearchRepository } from './modules/social/database/x-search.repository';
import { PostgresTopicRepository } from './modules/topics/database/topic.repository';
import { fixedXSearchEnabled } from './scheduled-fixed-x-search';
import { runScheduledXRuntime } from './scheduled-x-runtime';

export function startScheduledSocial(http: SharedHttpClient) {
  const connection = { host: '127.0.0.1', port: 6379 };
  const repository = new PostgresSocialRepository();
  const profiles = new PostgresProfileRepository();
  const searches = new PostgresXSearchRepository(repository.db);
  const ledger = new PostgresXDiscoveryLedger(repository.db);
  let searching = false;
  async function discover() {
    if (searching || !process.env.XAI_API_KEY) return;
    searching = true;
    try {
      await runScheduledXRuntime({
        profile: () => profiles.getDefault(),
        fixed: {
          enabled: () => fixedXSearchEnabled(),
          settings: (topicId) => repository.searchSettings(topicId),
          availableMicros: async () => (await ledger.status()).availableMicros,
        },
        searches,
        search: new DirectXSearch(process.env.XAI_API_KEY),
        ledger,
        verify: async (callId) =>
          verifyPosts(
            repository,
            new XOfficialEmbed(http),
            await searches.verificationCandidates(callId),
          ),
      });
    } finally {
      searching = false;
    }
  }
  const refreshSearch = () =>
    discover().catch((err) =>
      logger.error({ err }, 'Scheduled X discovery failed'),
    );
  void refreshSearch();
  const searchTimer = setInterval(() => {
    void refreshSearch();
  }, 60000);
  const articles = new PostgresArticleDiscoveryRepository();
  const topics = new PostgresTopicRepository();
  const bluesky = new PostgresBlueskyRepository();
  const blueskySearch =
    process.env.BLUESKY_HANDLE && process.env.BLUESKY_APP_PASSWORD
      ? new BlueskySearch({
          handle: process.env.BLUESKY_HANDLE,
          password: process.env.BLUESKY_APP_PASSWORD,
        })
      : null;
  const queue = new Queue('social-collection', { connection });
  const worker = new Worker(
    'social-collection',
    logJob('social-collection', async (job) => {
      if (job.name === 'collect-bluesky') {
        if (!blueskySearch)
          return { status: 'credentials-missing', topics: [] };
        return collectBlueskyTopics(
          bluesky,
          blueskySearch,
          await topics.listDefault(),
        );
      }
      if (job.name !== 'collect') throw new Error('Unknown social job');
      return collectSocial(
        repository,
        new RiverDiscovery(http),
        new XOfficialEmbed(http),
        articles,
      );
    }),
    { connection, concurrency: 1 },
  );
  worker.on('error', (err) =>
    logger.error({ err }, 'Social worker connection error'),
  );
  worker.on('failed', (err) =>
    logger.error({ err }, 'Social collection failed'),
  );
  void queue
    .upsertJobScheduler(
      'free-social-hourly',
      { every: 3600000 },
      {
        name: 'collect',
        opts: { attempts: 1, removeOnComplete: 48, removeOnFail: 48 },
      },
    )
    .catch((err) => logger.error({ err }, 'Social scheduling failed'));
  void queue
    .upsertJobScheduler(
      'bluesky-hourly',
      { every: 3600000 },
      {
        name: 'collect-bluesky',
        opts: { attempts: 1, removeOnComplete: 48, removeOnFail: 48 },
      },
    )
    .catch((err) => logger.error({ err }, 'Bluesky scheduling failed'));
  return async () => {
    clearInterval(searchTimer);
    // Let in-flight discovery settle its ledger entry before closing connections.
    while (searching) await new Promise((resolve) => setTimeout(resolve, 100));
    await profiles.onModuleDestroy();
    await worker.close();
    await queue.close();
    await repository.db.end();
    await articles.db.end();
    await bluesky.db.end();
    await topics.onModuleDestroy();
  };
}
