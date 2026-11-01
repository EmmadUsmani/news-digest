import assert from 'node:assert/strict';

import { profileSettingsSchema } from '@digest/contracts';
import { type Job, Queue, QueueEvents } from 'bullmq';

import { database } from '../src/libs/db/connections';

// Explicit synthetic outage probes against the real worker and stored content.
// No schedule edits, external requests, or fabricated articles are involved.
async function smoke() {
  const connection = { host: '127.0.0.1', port: 6379 };
  const queue = new Queue('digest-generation', { connection });
  const events = new QueueEvents('digest-generation', { connection });
  const db = database();
  const jobs: Job[] = [];
  try {
    await events.waitUntilReady();
    const profile = profileSettingsSchema.parse(
      await (await fetch('http://localhost:8000/api/profile')).json(),
    );
    const data = {
      cadence: profile.schedule.cadence,
      timezone: profile.schedule.timezone,
    };
    const oldSlot = Date.now() - 7 * 3600000;
    const old = await queue.add('outage-policy-probe', data, {
      prevMillis: oldSlot,
    });
    jobs.push(old);
    const skipped = await old.waitUntilFinished(events, 15000);
    assert.match(skipped.skipped, /more than six hours late/);
    assert.equal(
      (
        await db.query(
          'SELECT id FROM digest_previews WHERE scheduled_key=$1',
          [`${profile.id}:${oldSlot}`],
        )
      ).rowCount,
      0,
    );
    const recentSlot = Date.now() - 3600000;
    const recent = await queue.add('outage-policy-probe', data, {
      prevMillis: recentSlot,
    });
    jobs.push(recent);
    const recovered = await recent.waitUntilFinished(events, 15000);
    assert.ok(recovered.editionId);
    assert.equal(recovered.windowEnd, new Date(recentSlot).toISOString());
    const retry = await queue.add('outage-policy-probe', data, {
      prevMillis: recentSlot,
    });
    jobs.push(retry);
    assert.deepEqual(await retry.waitUntilFinished(events, 15000), recovered);
    const edition = (
      await db.query(
        'SELECT snapshot FROM digest_previews WHERE scheduled_key=$1',
        [`${profile.id}:${recentSlot}`],
      )
    ).rows;
    assert.equal(edition.length, 1);
    assert.ok(
      edition[0].snapshot.topics.some(
        (topic: { candidateCount: number }) => topic.candidateCount > 0,
      ),
    );
    const status = await (
      await fetch('http://localhost:8000/api/status')
    ).json();
    assert.ok(
      status.queues
        .find((queue: { name: string }) => queue.name === 'digest-generation')
        .runs.some(
          (run: { id: string; skipped: string }) =>
            run.id === old.id && run.skipped === skipped.skipped,
        ),
    );
    console.log(
      'Synthetic outage probes: stale slot skipped without snapshot; one-hour recovery uses original window and real candidates; retry idempotent; skip reason visible in status',
    );
  } finally {
    // Remove probe telemetry; the real-content immutable recovered edition remains.
    for (const job of jobs) await job.remove();
    await events.close();
    await queue.close();
    await db.end();
  }
}
void smoke();
