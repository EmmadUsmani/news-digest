import { Histogram, type Registry } from 'prom-client';

let duration: Histogram<'queue' | 'name' | 'outcome' | 'trigger'> | undefined;
const names: Record<string, readonly string[]> = {
  operations: ['heartbeat'],
  ingestion: ['collect'],
  'digest-generation': ['generate', 'on-demand'],
  'social-collection': ['collect'],
};

// Match the worker's on-demand branch before consulting scheduler metadata.
// Missing/invalid metadata is unknown, never evidence of a manual run.
export function jobTrigger(
  queue: string,
  name: string,
  prevMillis: unknown,
  repeatJobKey?: unknown,
) {
  if (!Object.hasOwn(names, queue) || !names[queue].includes(name))
    return 'unknown';
  if (queue === 'digest-generation' && name === 'on-demand') return 'manual';
  return (typeof repeatJobKey === 'string' && repeatJobKey.trim().length > 0) ||
    (typeof prevMillis === 'number' &&
      Number.isFinite(prevMillis) &&
      prevMillis > 0)
    ? 'scheduled'
    : 'unknown';
}

export function startJobMetrics(registry: Registry) {
  duration = new Histogram({
    name: 'news_digest_job_duration_seconds',
    help: 'Settled processor attempts by queue, job name, outcome and trigger; retries count separately. Scheduled is valid scheduler metadata, not proof of a fresh publication or provider call.',
    labelNames: ['queue', 'name', 'outcome', 'trigger'],
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
  trigger: 'scheduled' | 'manual' | 'unknown' = 'unknown',
) {
  duration?.observe(
    {
      queue: Object.hasOwn(names, queue) ? queue : 'other',
      name:
        Object.hasOwn(names, queue) && names[queue].includes(name)
          ? name
          : 'other',
      outcome,
      trigger,
    },
    seconds,
  );
}
