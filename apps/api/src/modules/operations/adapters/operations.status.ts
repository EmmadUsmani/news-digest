import { socialCollectionResultSchema } from '@digest/contracts';
import { Injectable, OnModuleDestroy } from '@nestjs/common';
import { Queue } from 'bullmq';

import { database, redis } from '../../../libs/db/connections';
import { readLlmUsage } from '../../curation/public/usage';
import { readXDiscoveryUsage } from '../../social/public/usage';
import { readSourceStatus } from '../database/source-status';
import { readTopicCoverage } from '../database/topic-coverage';
import { OperationsReader } from '../domain/operations.reader';

@Injectable()
export class OperationsStatus
  extends OperationsReader
  implements OnModuleDestroy
{
  readonly db = database();
  readonly connection = redis();
  readonly queues = [
    'operations',
    'ingestion',
    'digest-generation',
    'social-collection',
  ].map(
    (name) =>
      new Queue(name, {
        connection: this.connection,
        skipVersionCheck: true,
      }),
  );
  constructor() {
    super();
    for (const queue of this.queues) queue.on('error', () => {});
  }
  async read() {
    const checkedAt = new Date();
    const coverage = await readTopicCoverage(this.db, checkedAt);
    const sources = await readSourceStatus(this.db);
    const queues = await Promise.all(
      this.queues.map(async (queue) => {
        try {
          const [counts, workers, jobs, schedulers, paused] = await Promise.all(
            [
              queue.getJobCounts(
                'waiting',
                'active',
                'delayed',
                'failed',
                'completed',
              ),
              queue.getWorkers(),
              ['digest-generation', 'social-collection'].includes(queue.name)
                ? queue.getJobs(
                    ['completed', 'failed', 'active', 'waiting', 'delayed'],
                    0,
                    19,
                  )
                : Promise.resolve([]),
              ['digest-generation', 'social-collection'].includes(queue.name)
                ? queue.getJobSchedulers(0, 0, true)
                : Promise.resolve([]),
              queue.isPaused(),
            ],
          );
          const runs = await Promise.all(
            jobs.map(async (job) => ({
              id: job.id!,
              state: await job.getState(),
              attempts: job.attemptsMade,
              scheduledAt: job.opts.prevMillis
                ? new Date(job.opts.prevMillis).toISOString()
                : null,
              startedAt: job.processedOn
                ? new Date(job.processedOn).toISOString()
                : null,
              durationMs:
                job.processedOn != null && job.finishedOn != null
                  ? Math.max(0, job.finishedOn - job.processedOn)
                  : null,
              finishedAt: job.finishedOn
                ? new Date(job.finishedOn).toISOString()
                : null,
              editionId:
                typeof job.returnvalue?.editionId === 'string'
                  ? job.returnvalue.editionId
                  : null,
              socialCollection:
                queue.name === 'social-collection'
                  ? (socialCollectionResultSchema.safeParse(job.returnvalue)
                      .data ?? null)
                  : null,
              skipped:
                typeof job.returnvalue?.skipped === 'string'
                  ? job.returnvalue.skipped
                  : null,
            })),
          );
          runs.sort((a, b) =>
            (b.finishedAt ?? b.startedAt ?? b.scheduledAt ?? '').localeCompare(
              a.finishedAt ?? a.startedAt ?? a.scheduledAt ?? '',
            ),
          );
          return {
            name: queue.name,
            available: true,
            workers: workers.length,
            paused,
            counts,
            runs: runs.slice(0, 20),
            nextRun: schedulers[0]?.next
              ? new Date(schedulers[0].next).toISOString()
              : null,
          };
        } catch {
          return {
            name: queue.name,
            available: false,
            workers: 0,
            paused: false,
            counts: {},
            runs: [],
            nextRun: null,
          };
        }
      }),
    );
    return {
      checkedAt: checkedAt.toISOString(),
      coverage,
      sources,
      queues,
      llm: await readLlmUsage(this.db),
      xDiscovery: await readXDiscoveryUsage(this.db),
    };
  }
  async onModuleDestroy() {
    await Promise.all(this.queues.map((queue) => queue.close()));
    await this.connection.quit();
    await this.db.end();
  }
}
