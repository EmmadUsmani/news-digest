import { Histogram, type Registry } from 'prom-client';

let duration: Histogram<'target' | 'status' | 'outcome'> | undefined;
const targets = ['feed', 'hacker-news', 'x-oembed'];

export function startExternalMetrics(registry: Registry) {
  duration = new Histogram({
    name: 'news_digest_external_call_duration_seconds',
    help: 'Settled shared HTTP network attempts; cache hits and rate-limit waiting excluded.',
    labelNames: ['target', 'status', 'outcome'],
    buckets: [0.05, 0.1, 0.5, 1, 5, 10, 20, 60],
    registers: [registry],
  });
}

// Fixed targets only; never label with hosts, URLs, IDs or provider errors.
export function recordExternalAttempt(
  target: string,
  status: number | undefined,
  outcome: 'success' | 'redirect' | 'failure',
  seconds: number,
) {
  duration?.observe(
    {
      target: targets.includes(target) ? target : 'other',
      status:
        status != null &&
        Number.isInteger(status) &&
        status >= 100 &&
        status <= 599
          ? String(status)
          : 'unknown',
      outcome,
    },
    seconds,
  );
}
