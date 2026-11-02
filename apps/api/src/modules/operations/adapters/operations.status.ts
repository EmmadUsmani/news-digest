import { socialCollectionResultSchema } from '@digest/contracts';
import { Injectable, OnModuleDestroy } from '@nestjs/common';
import { Queue } from 'bullmq';

import { database, redis } from '../../../libs/db/connections';
import { readLlmUsage } from '../../curation/public/usage';
import { readXDiscoveryUsage } from '../../social/public/usage';
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
    const sources = (
      await this.db
        .query(`SELECT s.id,s.name,s.last_attempt AS "lastAttempt",s.last_success AS "lastSuccess",
 s.last_error AS error,s.last_item_count AS "lastItemCount",count(o.item_id)::int AS "storedItems",
 EXISTS(SELECT 1 FROM topic_source_connections c JOIN topics t ON t.id=c.topic_id WHERE c.source_id=s.id AND t.enabled) AS active
 FROM content_sources s LEFT JOIN content_observations o ON o.source_id=s.id GROUP BY s.id ORDER BY s.name`)
    ).rows;
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
                ? queue.getJobSchedulers(0, 9)
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
            (b.scheduledAt ?? b.finishedAt ?? '').localeCompare(
              a.scheduledAt ?? a.finishedAt ?? '',
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
      checkedAt: new Date().toISOString(),
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
