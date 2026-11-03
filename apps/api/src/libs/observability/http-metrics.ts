import { Histogram, type Registry } from 'prom-client';

// Only framework route templates enter labels; never inspect URL, params or query.
export function httpMetrics(registry: Registry) {
  const duration = new Histogram({
    name: 'news_digest_http_request_duration_seconds',
    help: 'API requests by route template, including closed responses; count is request volume.',
    labelNames: ['method', 'route', 'status', 'outcome'],
    buckets: [0.005, 0.025, 0.1, 0.5, 1, 5, 30],
    registers: [registry],
  });
  const methods = new Set([
    'GET',
    'HEAD',
    'POST',
    'PUT',
    'PATCH',
    'DELETE',
    'OPTIONS',
  ]);
  return (
    req: { method?: string; route?: { path?: string | string[] } },
    res: {
      statusCode: number;
      once(event: string, callback: () => void): void;
    },
    next: () => void,
  ) => {
    const started = performance.now();
    let recorded = false;
    const record = (outcome: string) => {
      if (recorded) return;
      recorded = true;
      duration.observe(
        {
          method: methods.has(req.method ?? '') ? req.method! : 'OTHER',
          route: Array.isArray(req.route?.path)
            ? req.route.path.join(' | ')
            : (req.route?.path ?? 'unmatched-or-static'),
          status:
            res.statusCode >= 100 && res.statusCode <= 599
              ? String(res.statusCode)
              : 'other',
          outcome,
        },
        (performance.now() - started) / 1000,
      );
    };
    res.once('finish', () => record('finished'));
    res.once('close', () => record('closed'));
    next();
  };
}
