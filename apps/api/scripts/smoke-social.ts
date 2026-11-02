// Explicit live collection: public rivers, at most eight publisher pages and ten oEmbeds.
// No inference or digest publication. Never run as part of the offline test suite.
import assert from 'node:assert/strict';

import { Queue, QueueEvents } from 'bullmq';

async function main() {
  const connection = { host: '127.0.0.1', port: 6379 };
  const queue = new Queue('social-collection', { connection });
  const events = new QueueEvents('social-collection', { connection });
  try {
    await events.waitUntilReady();
    const job = await queue.add(
      'collect',
      {},
      {
        attempts: 1,
        removeOnComplete: 48,
        removeOnFail: 48,
      },
    );
    const result = (await job.waitUntilFinished(events, 180000)) as {
      verified: number;
      verificationErrors: number;
      articleDiscovery: { checked: number; errors: number; citations: number };
    };
    assert.ok(result.articleDiscovery);
    assert.ok(
      result.articleDiscovery.checked + result.articleDiscovery.errors <= 8,
    );
    assert.ok(result.verified + result.verificationErrors <= 10);
    console.log(JSON.stringify({ jobId: job.id, ...result }));
  } finally {
    await events.close();
    await queue.close();
  }
}
void main().catch(() => {
  console.error('Live social collection check failed');
  process.exitCode = 1;
});
