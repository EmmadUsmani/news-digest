import { Gauge, type Registry } from 'prom-client';

const states = [
  'waiting',
  'active',
  'delayed',
  'failed',
  'completed',
  'paused',
] as const;
const names = new Set([
  'operations',
  'ingestion',
  'digest-generation',
  'social-collection',
]);
interface QueueReader {
  name: string;
  getJobCounts(...states: string[]): Promise<Record<string, number>>;
  getJobs(
    types: ['completed'],
    start: number,
    end: number,
    asc: boolean,
  ): Promise<{ processedOn?: number; finishedOn?: number }[]>;
  getJobSchedulersCount(): Promise<number>;
  isPaused(): Promise<boolean>;
  getJobSchedulers(
    start: number,
    end: number,
    asc: boolean,
  ): Promise<{ next?: number }[]>;
}

// Read through existing connections at scrape time. Never export job payloads or mutate queues.
export function startQueueMetrics(
  registry: Registry,
  queues: readonly QueueReader[],
) {
  const allowed = queues.filter((queue) => names.has(queue.name));
  new Gauge({
    name: 'news_digest_queue_jobs',
    help: 'Retained BullMQ jobs by state, not cumulative throughput.',
    labelNames: ['queue', 'state'],
    registers: [registry],
    async collect() {
      const snapshots = await Promise.all(
        allowed.map(async (queue) => ({
          queue: queue.name,
          counts: await queue.getJobCounts(...states),
        })),
      );
      this.reset();
      for (const { queue, counts } of snapshots)
        for (const state of states)
          this.set({ queue, state }, counts[state] ?? 0);
    },
  });
  new Gauge({
    name: 'news_digest_queue_schedulers',
    help: 'Registered BullMQ recurring schedules.',
    labelNames: ['queue'],
    registers: [registry],
    async collect() {
      const snapshots = await Promise.all(
        allowed.map(async (queue) => ({
          queue: queue.name,
          count: await queue.getJobSchedulersCount(),
        })),
      );
      this.reset();
      for (const { queue, count } of snapshots) this.set({ queue }, count);
    },
  });
  new Gauge({
    name: 'news_digest_queue_next_scheduled_timestamp_seconds',
    help: 'Earliest registered digest/social recurring run in Unix seconds; absent without a valid schedule. Not a completion guarantee.',
    labelNames: ['queue'],
    registers: [registry],
    async collect() {
      const snapshots = await Promise.all(
        allowed
          .filter((queue) =>
            ['digest-generation', 'social-collection'].includes(queue.name),
          )
          .map(async (queue) => ({
            queue: queue.name,
            schedules: await queue.getJobSchedulers(0, 0, true),
          })),
      );
      this.reset();
      for (const { queue, schedules } of snapshots) {
        const next = schedules[0]?.next;
        if (typeof next === 'number' && Number.isFinite(next) && next > 0)
          this.set({ queue }, next / 1000);
      }
    },
  });
  // Two bounded reads per queue keep each gauge's collection independent.
  // No IDs, payloads or edition content enter the metric labels.
  for (const field of ['duration', 'finished_timestamp'] as const) {
    new Gauge({
      name: `news_digest_queue_latest_completed_${field}_seconds`,
      help:
        field === 'duration'
          ? 'Latest retained completed job finish minus processor start; excludes queue wait, includes local work. Any trigger; not necessarily a publication.'
          : 'Finish time of latest retained completed job in Unix seconds; any trigger. Absent without valid timing.',
      labelNames: ['queue'],
      registers: [registry],
      async collect() {
        const snapshots = await Promise.all(
          allowed
            .filter((queue) =>
              ['digest-generation', 'social-collection'].includes(queue.name),
            )
            .map(async (queue) => ({
              queue: queue.name,
              jobs: await queue.getJobs(['completed'], 0, 0, false),
            })),
        );
        this.reset();
        for (const { queue, jobs } of snapshots) {
          const job = jobs[0];
          const started = job?.processedOn;
          const finished = job?.finishedOn;
          if (
            typeof started === 'number' &&
            Number.isFinite(started) &&
            started > 0 &&
            typeof finished === 'number' &&
            Number.isFinite(finished) &&
            finished >= started
          )
            this.set(
              { queue },
              (field === 'duration' ? finished - started : finished) / 1000,
            );
        }
      },
    });
  }
  new Gauge({
    name: 'news_digest_queue_paused',
    help: 'Whether the queue is paused.',
    labelNames: ['queue'],
    registers: [registry],
    async collect() {
      const snapshots = await Promise.all(
        allowed.map(async (queue) => ({
          queue: queue.name,
          paused: await queue.isPaused(),
        })),
      );
      this.reset();
      for (const { queue, paused } of snapshots)
        this.set({ queue }, Number(paused));
    },
  });
}
