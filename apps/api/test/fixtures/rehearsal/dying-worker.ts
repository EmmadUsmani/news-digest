import { Worker } from 'bullmq';

import { redis } from '../../../src/libs/db/connections';
import { PostgresScheduledBudgetRepository } from '../../../src/modules/curation/database/scheduled-budget.repository';
import { PostgresPreviewRepository } from '../../../src/modules/digests/database/preview.repository';
import { runScheduledBudgetAttempt } from '../../../src/scheduled-budget-attempt';

if (process.env.NEWS_DIGEST_ISOLATED_TEST !== '1')
  throw new Error('Disposable rehearsal environment required');
const repository = new PostgresPreviewRepository();
Object.defineProperty(repository, 'editorial', { value: null });
const budgets = new PostgresScheduledBudgetRepository(repository.db);
const connection = redis().duplicate({ maxRetriesPerRequest: null });
new Worker(
  process.env.REHEARSAL_QUEUE!,
  async (job) => {
    const end = new Date(job.data.timestamp);
    return runScheduledBudgetAttempt(
      budgets,
      end,
      job.data.runId,
      job.attemptsStarted,
      job.attemptsMade,
      job.opts.attempts ?? 1,
      () =>
        repository.generate(
          new Date(end.getTime() - 86400000),
          end,
          job.data.runId,
          async (progress) => {
            if (progress.stage === 'publishing') {
              process.send?.('publishing');
              // Parent sends SIGKILL while this process owns the publication lock.
              await new Promise(() => {});
            }
          },
        ),
    );
  },
  { connection, lockDuration: 1000, stalledInterval: 1000 },
);
