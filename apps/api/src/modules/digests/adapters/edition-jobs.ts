import { createHash, randomUUID } from 'node:crypto';

import { editionJobIdSchema } from '@digest/contracts';
import { Injectable, OnModuleDestroy } from '@nestjs/common';
import { Job, Queue } from 'bullmq';

import { redis } from '../../../libs/db/connections';
import { EditionJobFailures } from '../domain/edition-job-failures';
import { EditionJobs, type EditionJobStatus } from '../domain/edition-jobs';
import { PreviewRepository } from '../domain/preview.repository';

@Injectable()
export class BullEditionJobs extends EditionJobs implements OnModuleDestroy {
  readonly connection = redis();
  readonly queue = new Queue('digest-generation', {
    connection: this.connection,
  });
  constructor(
    private readonly repository: PreviewRepository,
    private readonly failures: EditionJobFailures,
  ) {
    super();
    this.queue.on('error', () => {});
  }
  async enqueue(start: Date, end: Date): Promise<EditionJobStatus> {
    const data = {
      windowStart: start.toISOString(),
      windowEnd: end.toISOString(),
    };
    const id = createHash('sha256').update(JSON.stringify(data)).digest('hex');
    const added = await this.queue.add('on-demand', data, {
      // Redis counters can reset independently of durable publication keys.
      jobId: randomUUID(),
      deduplication: { id },
      attempts: 1,
      removeOnComplete: 100,
      removeOnFail: 100,
    });
    // A deduplicated add can contain the submitted data: read the retained job.
    const job = await this.queue.getJob(added.id!);
    if (!job) throw new Error('Edition job unavailable');
    return this.status(job);
  }
  async find(id: string): Promise<EditionJobStatus | null> {
    try {
      const job = await this.queue.getJob(id);
      if (!job) return this.recover(id);
      if (job.name !== 'on-demand') return null;
      return await this.status(job);
    } catch (error) {
      const recovered = await this.recover(id);
      if (recovered) return recovered;
      // An unknown job may still be queued: an outage is not a missing job.
      throw error;
    }
  }
  private async recover(id: string): Promise<EditionJobStatus | null> {
    // BullMQ prunes its bounded history; the publication key survives in
    // Postgres. Recover publication or failure without enqueueing a new run.
    if (!editionJobIdSchema.safeParse(id).success) return null;
    const edition = await this.repository.findByGenerationKey(
      `on-demand:${id}`,
    );
    if (!edition) {
      const failed = await this.failures.find(id);
      return failed
        ? {
            id,
            state: 'failed',
            editionId: null,
            progress: null,
            durationMs: failed.durationMs,
            error: 'Edition generation failed. Try again later.',
          }
        : null;
    }
    return edition
      ? {
          id,
          state: 'completed',
          editionId: edition.id,
          progress: null,
          durationMs: null,
          error: null,
        }
      : null;
  }
  private async status(job: Job): Promise<EditionJobStatus> {
    const state = await job.getState();
    // Pruning can race either read. Prefer durable history over stale fields.
    if (state === 'unknown') {
      const recovered = await this.recover(job.id!);
      if (recovered) return recovered;
    }
    // Publication commits before the worker acknowledges completion. A worker
    // can stall in that gap; don't keep the reader polling a saved edition.
    if (state === 'active') {
      const edition = await this.repository.findByGenerationKey(
        `on-demand:${job.id!}`,
      );
      if (edition)
        return {
          id: job.id!,
          state: 'completed',
          editionId: edition.id,
          progress: null,
          durationMs: null,
          error: null,
        };
    }
    if (state === 'completed' || state === 'failed') {
      const refreshed = await this.queue.getJob(job.id!);
      if (!refreshed) {
        const recovered = await this.recover(job.id!);
        if (recovered) return recovered;
      }
      job = refreshed ?? job;
    }
    const result: unknown = job.returnvalue;
    const editionId =
      result &&
      typeof result === 'object' &&
      'editionId' in result &&
      typeof result.editionId === 'string'
        ? result.editionId
        : null;
    // Publication can commit before the worker loses its lock or fails to
    // acknowledge completion. A saved edition is authoritative in either case.
    if ((state === 'failed' || state === 'completed') && !editionId) {
      const recovered = await this.recover(job.id!);
      if (recovered?.state === 'completed') {
        return {
          ...recovered,
          durationMs:
            job.processedOn && job.finishedOn
              ? job.finishedOn - job.processedOn
              : null,
        };
      }
    }
    return {
      id: job.id!,
      state,
      editionId,
      progress:
        typeof job.progress === 'object'
          ? (job.progress as EditionJobStatus['progress'])
          : null,
      durationMs:
        job.processedOn && job.finishedOn
          ? job.finishedOn - job.processedOn
          : null,
      // Do not expose provider responses, SQL or credentials through worker errors.
      error:
        state === 'failed'
          ? 'Edition generation failed. Try again later.'
          : null,
    };
  }
  async onModuleDestroy() {
    await this.queue.close();
    await this.connection.quit();
  }
}
