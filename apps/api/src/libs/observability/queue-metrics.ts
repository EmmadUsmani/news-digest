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
  getJobSchedulersCount(): Promise<number>;
  isPaused(): Promise<boolean>;
}

// Read through existing connections at scrape time. No job payloads or mutations.
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
