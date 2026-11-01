import { Queue, Worker } from 'bullmq';
import { PostgresProfileRepository } from './modules/profiles/database/profile.repository';
import { PostgresPreviewRepository } from './modules/digests/database/preview.repository';
import { scheduledSlot } from './modules/profiles/domain/scheduled-slot';
import { coverageWindow } from './modules/profiles/domain/schedule';

export function startScheduledDigests() {
 const connection = { host: '127.0.0.1', port: 6379 };
 const profiles = new PostgresProfileRepository();
 const previews = new PostgresPreviewRepository();
 const queue = new Queue('digest-generation', { connection });
 const worker = new Worker('digest-generation', async job => {
 const profile = await profiles.getDefault();
 // A replaced schedule may leave an already queued slot; ignore obsolete settings.
 if (job.data.cadence !== profile.schedule.cadence || job.data.timezone !== profile.schedule.timezone) return { skipped: 'Schedule changed' };
 const slot = scheduledSlot(job.opts.prevMillis, Date.now());
 if (!slot.ok) throw new Error(slot.error);
 if (slot.value.skip) return { skipped: slot.value.skip };
 const scheduledAt = slot.value.timestamp;
 const window = coverageWindow(new Date(scheduledAt), profile.schedule.coverageWindow);
 if (!window.ok) throw new Error(window.error);
 const edition = await previews.generate(window.value.windowStart, window.value.windowEnd, `${profile.id}:${scheduledAt}`);
 return { editionId: edition.id, windowStart: edition.windowStart, windowEnd: edition.windowEnd };
 }, { connection, concurrency: 1 });
 worker.on('error', () => console.error('Digest worker connection error'));
 worker.on('failed', job => console.error('Scheduled digest failed', job?.id));
 let refreshing = false;
 async function refresh() {
 if (refreshing) return;
 refreshing = true;
 try {
 const profile = await profiles.getDefault();
 await queue.upsertJobScheduler(`profile-${profile.id}`, { pattern: profile.schedule.cadence, tz: profile.schedule.timezone }, {
 name: 'generate', data: { cadence: profile.schedule.cadence, timezone: profile.schedule.timezone },
 opts: { attempts: 3, backoff: { type: 'exponential', delay: 60000 }, removeOnComplete: 100, removeOnFail: 100 }
 });
 } finally { refreshing = false; }
 }
 void refresh().catch(() => console.error('Digest scheduling failed'));
 const timer = setInterval(() => { void refresh().catch(() => console.error('Digest scheduling refresh failed')); }, 10000);
 return async () => { clearInterval(timer); await worker.close(); await queue.close(); await profiles.onModuleDestroy(); await previews.onModuleDestroy(); };
}
