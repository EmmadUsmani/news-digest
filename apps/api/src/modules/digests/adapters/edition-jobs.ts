import { createHash } from 'node:crypto';

import { Injectable, OnModuleDestroy } from '@nestjs/common';
import { Job, Queue } from 'bullmq';

import { redis } from '../../../libs/db/connections';
import { EditionJobs, type EditionJobStatus } from '../domain/edition-jobs';

@Injectable()
export class BullEditionJobs extends EditionJobs implements OnModuleDestroy {
  readonly connection = redis();
  readonly queue = new Queue('digest-generation', {
    connection: this.connection,
  });
  constructor() {
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
    const job = await this.queue.getJob(id);
    if (!job || job.name !== 'on-demand') return null;
    return this.status(job);
  }
  private async status(job: Job): Promise<EditionJobStatus> {
    const state = await job.getState();
    // Completion can race the initial read; refresh terminal fields before returning.
    if (state === 'completed' || state === 'failed')
      job = (await this.queue.getJob(job.id!)) ?? job;
    const result: unknown = job.returnvalue;
    const editionId =
      result &&
      typeof result === 'object' &&
      'editionId' in result &&
      typeof result.editionId === 'string'
        ? result.editionId
        : null;
    return {
      id: job.id!,
      state,
      editionId,
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
