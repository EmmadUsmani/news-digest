import { Worker } from 'bullmq';
import Redis from 'ioredis';

if (process.env.NEWS_DIGEST_ISOLATED_TEST !== '1') {
  throw new Error('Disposable Redis required');
}
const connection = new Redis(process.env.REDIS_URL, {
  maxRetriesPerRequest: null,
});
new Worker(
  'digest-generation',
  async (job) => {
    await job.updateProgress({ stage: 'topics', topics: [] });
    process.send({ id: job.id });
    await new Promise(() => {});
  },
  { connection, lockDuration: 500, stalledInterval: 100 },
);
