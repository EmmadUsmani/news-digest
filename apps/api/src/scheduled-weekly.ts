import { randomUUID } from 'node:crypto';

import type { Job, Queue } from 'bullmq';

import {
  runScheduledWeeklyReview,
  weeklySchedule,
} from './modules/digests/application/scheduled-weekly-review';

export const weeklyJobName = 'weekly-review';

export async function registerWeeklyReview(
  queue: Pick<Queue, 'upsertJobScheduler'>,
) {
  await queue.upsertJobScheduler('public-weekly-review', weeklySchedule, {
    name: weeklyJobName,
    data: {},
    opts: {
      attempts: 3,
      backoff: { type: 'exponential', delay: 300_000 },
      removeOnComplete: 100,
      removeOnFail: 100,
    },
  });
}

export function dispatchWeeklyReview(
  job: Pick<Job, 'opts'>,
  generate: Parameters<typeof runScheduledWeeklyReview>[0],
  topics: Parameters<typeof runScheduledWeeklyReview>[1]['topics'],
  now = Date.now(),
) {
  return runScheduledWeeklyReview(generate, {
    timestamp: job.opts.prevMillis,
    now,
    id: randomUUID(),
    topics,
  });
}
