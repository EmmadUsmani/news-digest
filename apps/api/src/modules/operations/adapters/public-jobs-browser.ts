import type { IncomingMessage, ServerResponse } from 'node:http';

import type { INestApplication } from '@nestjs/common';
import type { Queue } from 'bullmq';

import { jobsReadOnly, mountJobsBrowser } from './jobs-browser';

const names = [
  'operations',
  'ingestion',
  'digest-generation',
  'social-collection',
] as const;
const states = ['waiting', 'active', 'delayed', 'failed', 'completed'] as const;
type QueueReader = Pick<Queue, 'name' | 'getJobCounts' | 'getJobSchedulers'>;

// Mount after the public access stack so admission runs before queue reads.
// Select exactly one implementation; public mode never registers Bull Board.
export function mountQueueTools(
  app: INestApplication,
  queues: Queue[],
  publicMode: boolean,
) {
  if (!publicMode) return mountJobsBrowser(app, queues);
  const status = publicJobsBrowser(queues);
  app.use((req: IncomingMessage, res: ServerResponse, next: () => void) => {
    if (req.url?.split('?')[0] === '/api/queues') return status(req, res);
    next();
  });
}

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
