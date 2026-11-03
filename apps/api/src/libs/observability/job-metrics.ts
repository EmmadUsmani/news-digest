import { Histogram, type Registry } from 'prom-client';

let duration: Histogram<'queue' | 'name' | 'outcome'> | undefined;
const names: Record<string, readonly string[]> = {
  operations: ['heartbeat'],
  ingestion: ['collect'],
  'digest-generation': ['generate', 'on-demand'],
  'social-collection': ['collect'],
};

export function startJobMetrics(registry: Registry) {
  duration = new Histogram({
    name: 'news_digest_job_duration_seconds',
    help: 'Settled processor attempts by queue, job name and outcome; retries count separately.',
    labelNames: ['queue', 'name', 'outcome'],
    buckets: [0.01, 0.1, 1, 5, 15, 60, 120, 600],
    registers: [registry],
  });
}

// Allowlisted labels only: no job IDs, source IDs, payloads or error text.
export function recordJobAttempt(
  queue: string,
  name: string,
  outcome: 'completed' | 'failed',
  seconds: number,
) {
  duration?.observe(
    {
      queue: Object.hasOwn(names, queue) ? queue : 'other',
      name:
        Object.hasOwn(names, queue) && names[queue].includes(name)
          ? name
          : 'other',
      outcome,
    },
    seconds,
  );
}
