import { AsyncLocalStorage } from 'node:async_hooks';
import { randomUUID } from 'node:crypto';

import type { Job } from 'bullmq';
import pino, { type DestinationStream, type Logger } from 'pino';

import { recordJobAttempt } from './job-metrics';

const context = new AsyncLocalStorage<Record<string, string>>();
const sensitive =
  /authorization|cookie|password|secret|token|api.?key|database_url|redis_url/i;

// Sanitize before serialization, including strings embedded inside error stacks.
export function createLogger(
  service: string,
  destination?: DestinationStream,
  secrets = Object.entries(process.env)
    .filter(
      ([key, value]) => value && (sensitive.test(key) || value.length >= 8),
    )
    .map(([, value]) => value!),
): Logger {
  const values = [...new Set(secrets.filter(Boolean))].sort(
    (a, b) => b.length - a.length,
  );
  const cleanString = (value: string) =>
    values
      .reduce((text, secret) => text.split(secret).join('[REDACTED]'), value)
      .replace(/(Bearer\s+)\S+/gi, '$1[REDACTED]')
      .replace(/(https?:\/\/)[^\s/@]+:[^\s/@]+@/gi, '$1[REDACTED]@');
  function clean(value: unknown, seen = new WeakSet<object>()): unknown {
    if (typeof value === 'string') return cleanString(value);
    if (!value || typeof value !== 'object') return value;
    if (seen.has(value)) return '[Circular]';
    seen.add(value);
    if (value instanceof Error)
      return clean(
        {
          type: value.name,
          message: value.message,
          stack: value.stack,
          cause: value.cause,
        },
        seen,
      );
    if (Array.isArray(value)) return value.map((entry) => clean(entry, seen));
    return Object.fromEntries(
      Object.entries(value).map(([key, entry]) => [
        key,
        sensitive.test(key) ? '[REDACTED]' : clean(entry, seen),
      ]),
    );
  }
  return pino(
    {
      base: { service },
      mixin: () => clean(context.getStore() ?? {}) as Record<string, string>,
      hooks: {
        logMethod(args, method) {
          method.apply(
            this,
            args.map((arg) => clean(arg)) as Parameters<typeof method>,
          );
        },
      },
    },
    destination ?? pino.destination({ sync: true }),
  );
}

export const logger = createLogger(process.env.NEWS_DIGEST_SERVICE ?? 'api');

export function installFatalLogging(log = logger) {
  process.once('uncaughtException', (err) => {
    log.fatal({ err }, 'uncaughtException');
    process.exit(1);
  });
  process.once('unhandledRejection', (err) => {
    log.fatal({ err }, 'unhandledRejection');
    process.exit(1);
  });
}

export function requestLogging(log = logger) {
  return (
    req: { method?: string; route?: { path?: string | string[] } },
    res: {
      statusCode: number;
      setHeader(name: string, value: string): void;
      once(event: string, callback: () => void): void;
    },
    next: () => void,
  ) => {
    const requestId = randomUUID();
    const started = performance.now();
    let finished = false;
    res.setHeader('X-Request-Id', requestId);
    context.run({ requestId }, () => {
      const finish = (outcome: string) => {
        if (finished) return;
        finished = true;
        // Route templates only: URLs, queries, headers and bodies can contain secrets.
        context.run({ requestId }, () =>
          log.info(
            {
              event: 'http.request',
              method: req.method,
              route: Array.isArray(req.route?.path)
                ? req.route.path.join(' | ')
                : (req.route?.path ?? 'unmatched-or-static'),
              status: res.statusCode,
              outcome,
              durationMs: Math.round(performance.now() - started),
            },
            'HTTP request',
          ),
        );
      };
      res.once('finish', () => finish('finished'));
      res.once('close', () => finish('closed'));
      next();
    });
  };
}

export function logJob<R>(
  queue: string,
  processJob: (job: Job) => Promise<R>,
  log = logger,
) {
  return (job: Job): Promise<R> =>
    context.run({ queue, jobId: job.id ?? 'unknown' }, async () => {
      const started = performance.now();
      log.info(
        {
          event: 'job.start',
          jobName: job.name,
          attempt: job.attemptsMade + 1,
        },
        'Job started',
      );
      try {
        const result = await processJob(job);
        recordJobAttempt(
          queue,
          job.name,
          'completed',
          (performance.now() - started) / 1000,
        );
        log.info(
          {
            event: 'job.finish',
            durationMs: Math.round(performance.now() - started),
          },
          'Job finished',
        );
        return result;
      } catch (err) {
        recordJobAttempt(
          queue,
          job.name,
          'failed',
          (performance.now() - started) / 1000,
        );
        log.error(
          {
            event: 'job.failure',
            err,
            durationMs: Math.round(performance.now() - started),
          },
          'Job failed',
        );
        throw err;
      }
    });
}
