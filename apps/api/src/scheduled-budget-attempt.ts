import type { DigestPreview } from '@digest/contracts';

import type { ScheduledBudgetRepository } from './modules/curation/domain/scheduled-budget.port';
import { scheduledOutcome } from './modules/curation/domain/scheduled-budget-outcome';
import { withScheduledAttempt } from './modules/curation/public/scheduled-context';

export { scheduledOutcome } from './modules/curation/domain/scheduled-budget-outcome';

// Called only by the scheduled BullMQ processor, after queue lock acquisition.
// attemptsStarted includes stalled redeliveries, unlike attemptsMade.
export async function runScheduledBudgetAttempt(
  budgets: ScheduledBudgetRepository,
  scheduledAt: Date,
  runId: string,
  attemptsStarted: number,
  attemptsMade: number,
  maxAttempts: number,
  generate: () => Promise<DigestPreview>,
) {
  const observed = await budgets.read(scheduledAt.toISOString().slice(0, 10));
  // Additional cron slots in the same UTC day do not own the daily reserve.
  if (
    !observed ||
    observed.runId !== runId ||
    observed.state === 'succeeded' ||
    observed.state === 'failed'
  )
    return generate();
  const claimed = await budgets.claim(
    runId,
    attemptsStarted > 1 && observed.state === 'running'
      ? observed.attempt
      : undefined,
  );
  if (!claimed)
    throw new Error('Scheduled budget attempt could not be claimed');
  try {
    const edition = await withScheduledAttempt(
      runId,
      claimed.attempt,
      generate,
    );
    await budgets.finishAttempt(
      runId,
      claimed.attempt,
      'succeeded',
      scheduledOutcome(edition),
    );
    return edition;
  } catch (error) {
    await budgets.finishAttempt(
      runId,
      claimed.attempt,
      attemptsMade + 1 < maxAttempts ? 'retrying' : 'failed',
    );
    throw error;
  }
}

// Read the attempt before checking Redis. A redelivery during the check then
// increments the attempt and prevents this stale failure from releasing it.
export async function reconcileFailedScheduledJob(
  budgets: ScheduledBudgetRepository,
  profileId: string,
  job: {
    name: string;
    opts: { prevMillis?: number };
    getState(): Promise<string>;
  },
) {
  const timestamp = job.opts.prevMillis;
  if (job.name !== 'generate' || !Number.isSafeInteger(timestamp)) return false;
  const slot = new Date(timestamp!);
  if (!Number.isFinite(slot.getTime())) return false;
  const observed = await budgets.read(slot.toISOString().slice(0, 10));
  if (
    !observed ||
    observed.runId !== `${profileId}:${timestamp}` ||
    observed.state !== 'running'
  )
    return false;
  if ((await job.getState()) !== 'failed') return false;
  return budgets.finishAttempt(observed.runId, observed.attempt, 'failed');
}
