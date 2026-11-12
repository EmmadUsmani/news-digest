import { Queue, Worker } from 'bullmq';

import { database } from './libs/db/connections';
import { logger, logJob } from './libs/observability/logging';
import { PostgresScheduledBudgetRepository } from './modules/curation/database/scheduled-budget.repository';
import { withLlmExecution } from './modules/curation/public/scheduled-context';
import {
  reconcileFailedOnDemandJob,
  watchFailedOnDemandJobs,
} from './modules/digests/adapters/failed-edition-job';
import { generateOnDemandEdition } from './modules/digests/application/on-demand-edition';
import { PostgresEditionJobFailures } from './modules/digests/database/edition-job-failures';
import { PostgresPreviewRepository } from './modules/digests/database/preview.repository';
import { PostgresProfileRepository } from './modules/profiles/database/profile.repository';
import { coverageWindow } from './modules/profiles/domain/schedule';
import { scheduledSlot } from './modules/profiles/domain/scheduled-slot';
import {
  reconcileFailedScheduledJob,
  runScheduledBudgetAttempt,
} from './scheduled-budget-attempt';
import { refreshScheduledBudget } from './scheduled-budget-refresh';

export function startScheduledDigests() {
  const connection = { host: '127.0.0.1', port: 6379 };
  const profiles = new PostgresProfileRepository();
  const previews = new PostgresPreviewRepository();
  const failures = new PostgresEditionJobFailures();
  const budgetDb = database();
  const budgets = new PostgresScheduledBudgetRepository(budgetDb);
  const queue = new Queue('digest-generation', { connection });
  const worker = new Worker(
    'digest-generation',
    logJob('digest-generation', async (job) => {
      if (job.name === 'on-demand')
        return generateOnDemandEdition(
          previews,
          job.id!,
          job.data,
          (progress) => job.updateProgress(progress),
          failures,
        );
      const profile = await profiles.getDefault();
      // A replaced schedule may leave an already queued slot; ignore obsolete settings.
      if (
        job.data.cadence !== profile.schedule.cadence ||
        job.data.timezone !== profile.schedule.timezone
      )
        return { skipped: 'Schedule changed' };
      const slot = scheduledSlot(job.opts.prevMillis, Date.now());
      if (!slot.ok) throw new Error(slot.error);
      if (slot.value.skip) return { skipped: slot.value.skip };
      const scheduledAt = slot.value.timestamp;
      const window = coverageWindow(
        new Date(scheduledAt),
        profile.schedule.coverageWindow,
      );
      if (!window.ok) throw new Error(window.error);
      const runId = `${profile.id}:${scheduledAt}`;
      const execution = Object.freeze({
        deadline: performance.now() + 600_000,
      });
      const edition = await runScheduledBudgetAttempt(
        budgets,
        new Date(scheduledAt),
        runId,
        job.attemptsStarted,
        job.attemptsMade,
        job.opts.attempts ?? 1,
        () =>
          withLlmExecution(execution, () =>
            previews.generate(
              window.value.windowStart,
              window.value.windowEnd,
              runId,
              (progress) => job.updateProgress(progress),
            ),
          ),
      );
      return {
        editionId: edition.id,
        windowStart: edition.windowStart,
        windowEnd: edition.windowEnd,
      };
    }),
    { connection, concurrency: 1 },
  );
  worker.on('error', (err) =>
    logger.error({ err }, 'Digest worker connection error'),
  );
  watchFailedOnDemandJobs(worker, failures, (err) =>
    logger.error({ err }, 'On-demand failure reconciliation failed'),
  );
  worker.on('failed', (job) => {
    logger.error({ jobId: job?.id }, 'Scheduled digest failed');
    if (job)
      void profiles
        .getDefault()
        .then((profile) =>
          reconcileFailedScheduledJob(budgets, profile.id, job),
        )
        .catch((err) =>
          logger.error(
            { err },
            'Scheduled budget failure reconciliation failed',
          ),
        );
  });
  let refreshing = false;
  async function refresh() {
    if (refreshing) return;
    refreshing = true;
    try {
      const profile = await refreshScheduledBudget(
        budgets,
        () => profiles.getDefault(),
        new Date(),
      );
      // Recover final stalls even if the failed event occurred during downtime.
      // Retention is capped at 100 jobs by this queue's scheduler options.
      for (const job of await queue.getJobs(['failed'], 0, 99)) {
        await reconcileFailedOnDemandJob(failures, job);
        await reconcileFailedScheduledJob(budgets, profile.id, job);
      }
      await queue.upsertJobScheduler(
        `profile-${profile.id}`,
        { pattern: profile.schedule.cadence, tz: profile.schedule.timezone },
        {
          name: 'generate',
          data: {
            cadence: profile.schedule.cadence,
            timezone: profile.schedule.timezone,
          },
          opts: {
            attempts: 3,
            backoff: { type: 'exponential', delay: 60000 },
            removeOnComplete: 100,
            removeOnFail: 100,
          },
        },
      );
    } finally {
      refreshing = false;
    }
  }
  void refresh().catch((err) =>
    logger.error({ err }, 'Digest scheduling failed'),
  );
  const timer = setInterval(() => {
    void refresh().catch((err) =>
      logger.error({ err }, 'Digest scheduling refresh failed'),
    );
  }, 10000);
  return async () => {
    clearInterval(timer);
    await worker.close();
    await queue.close();
    await profiles.onModuleDestroy();
    await previews.onModuleDestroy();
    await failures.onModuleDestroy();
    await budgetDb.end();
  };
}
