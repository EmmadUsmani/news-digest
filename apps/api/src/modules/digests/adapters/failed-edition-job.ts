import type { Job } from 'bullmq';

import type { EditionJobFailures } from '../domain/edition-job-failures';

// A terminal stall can fail outside the processor's try/catch. Reconcile the
// retained queue history on startup and refresh, before Redis prunes it.
export async function reconcileFailedOnDemandJob(
  failures: EditionJobFailures,
  job: Pick<Job, 'id' | 'name' | 'processedOn' | 'finishedOn' | 'getState'>,
): Promise<void> {
  if (job.name !== 'on-demand' || !job.id) return;
  if ((await job.getState()) !== 'failed') return;
  if (job.processedOn === undefined || job.finishedOn === undefined) return;
  await failures.record(job.id, Math.max(0, job.finishedOn - job.processedOn));
}
