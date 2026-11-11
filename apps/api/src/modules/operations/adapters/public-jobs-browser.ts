import type { IncomingMessage, ServerResponse } from 'node:http';

import type { Queue } from 'bullmq';

import { jobsReadOnly } from './jobs-browser';

const names = [
  'operations',
  'ingestion',
  'digest-generation',
  'social-collection',
] as const;
const states = ['waiting', 'active', 'delayed', 'failed', 'completed'] as const;
type QueueReader = Pick<Queue, 'name' | 'getJobCounts' | 'getJobSchedulers'>;

// Prepared for an exclusive /queues mount. Unknown routes terminate here;
// they must never fall through to Bull Board or the SPA.
export function publicJobsBrowser(queues: readonly QueueReader[]) {
  return (req: IncomingMessage, res: ServerResponse) => {
    res.setHeader('cache-control', 'no-store');
    if (req.url !== '/api/queues') {
      res.writeHead(404).end();
      return;
    }
    jobsReadOnly(req, res, () => {
      const send = (status: number, value: unknown) => {
        res
          .writeHead(status, { 'content-type': 'application/json' })
          .end(req.method === 'HEAD' ? undefined : JSON.stringify(value));
      };
      void Promise.all(
        names.map(async (name) => {
          const queue = queues.find((candidate) => candidate.name === name);
          if (!queue) throw new Error('Missing queue');
          const [counts, [scheduler]] = await Promise.all([
            queue.getJobCounts(...states),
            queue.getJobSchedulers(0, 0, true),
          ]);
          return {
            name,
            counts: Object.fromEntries(
              states.map((state) => [state, counts[state] ?? 0]),
            ),
            nextRunAt:
              typeof scheduler?.next === 'number' &&
              Number.isSafeInteger(scheduler.next) &&
              scheduler.next > 0
                ? scheduler.next
                : null,
          };
        }),
      ).then(
        (projection) => send(200, { queues: projection }),
        () => send(503, { error: 'Queue status unavailable' }),
      );
    });
  };
}
