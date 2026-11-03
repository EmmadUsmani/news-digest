import { Histogram, type Registry } from 'prom-client';

let duration: Histogram<'target' | 'status' | 'outcome'> | undefined;
const targets = [
  'feed',
  'hacker-news',
  'x-oembed',
  'anthropic',
  'xai',
  'bluesky',
];

export function startExternalMetrics(registry: Registry) {
  duration = new Histogram({
    name: 'news_digest_external_call_duration_seconds',
    help: 'Settled HTTP attempts; provider timing ends at headers, shared HTTP includes body decoding.',
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

// Measures transport through headers, without consuming or changing the response.
// The caller retains timeouts, parsing, retry and budget policy.
export function measuredFetch(
  target: 'anthropic' | 'xai' | 'bluesky',
  transport: typeof fetch,
): typeof fetch {
  return async (input, init) => {
    const started = performance.now();
    let status: number | undefined;
    try {
      const response = await transport(input, init);
      status = response.status;
      return response;
    } finally {
      recordExternalAttempt(
        target,
        status,
        status === undefined || status >= 400
          ? 'failure'
          : status >= 300
            ? 'redirect'
            : 'success',
        (performance.now() - started) / 1000,
      );
    }
  };
}
