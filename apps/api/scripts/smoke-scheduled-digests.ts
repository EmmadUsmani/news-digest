import assert from 'node:assert/strict';
import { Queue } from 'bullmq';
import { profileSettingsSchema } from '@digest/contracts';
import { database } from '../src/libs/db/connections';
const base = 'http://localhost:8000';
async function smoke() {
  const queue = new Queue('digest-generation', {
    connection: { host: '127.0.0.1', port: 6379 },
  });
  const db = database();
  const profile = profileSettingsSchema.parse(
    await (await fetch(`${base}/api/profile`)).json(),
  );
  const slot = new Date(Math.ceil((Date.now() + 20000) / 60000) * 60000);
  const cadence = `${slot.getUTCMinutes()} ${slot.getUTCHours()} * * *`;
  async function save(schedule: typeof profile.schedule) {
    assert.equal(
      (
        await fetch(`${base}/api/profile/schedule`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(schedule),
        })
      ).status,
      200,
    );
  }
  try {
    await save({
      ...profile.schedule,
      cadence,
      timezone: 'UTC',
      coverageWindow: 'PT6H',
    });
    console.log('Waiting for actual scheduled slot', slot.toISOString());
    let edition;
    const deadline = slot.getTime() + 30000;
    while (Date.now() < deadline) {
      const result = await db.query(
        'SELECT snapshot FROM digest_previews WHERE scheduled_key=$1',
        [`${profile.id}:${slot.getTime()}`],
      );
      if (result.rows[0]) {
        edition = result.rows[0].snapshot;
        break;
      }
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }
    assert.ok(
      edition,
      'Worker must generate the scheduled edition without a manual request',
    );
    assert.equal(edition.windowEnd, slot.toISOString());
    assert.equal(
      edition.windowStart,
      new Date(slot.getTime() - 21600000).toISOString(),
    );
    assert.ok(
      edition.topics.some(
        (topic: { candidateCount: number }) => topic.candidateCount > 0,
      ),
    );
    const jobs = await queue.getCompleted();
    assert.ok(
      jobs.some((job) => job.returnvalue?.editionId === edition.id),
      'Queue retains successful run',
    );
    const failed = await queue.getFailed();
    assert.equal(failed.length, 0);
    console.log(
      'Scheduled edition stored from real content; exact 6h slot window and completed queue run verified',
      edition.id,
    );
  } finally {
    await save(profile.schedule);
    // Ensure the restored schedule reaches Redis before exiting.
    for (let attempt = 0; attempt < 20; attempt++) {
      const scheduler = await queue.getJobScheduler(`profile-${profile.id}`);
      if (
        scheduler?.pattern === profile.schedule.cadence &&
        scheduler?.tz === profile.schedule.timezone
      )
        break;
      if (attempt === 19)
        throw new Error('Original scheduler was not restored');
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }
    await queue.close();
    await db.end();
  }
}
void smoke();
