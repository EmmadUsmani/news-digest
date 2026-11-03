import type { IncomingMessage, ServerResponse } from 'node:http';

import { createBullBoard } from '@bull-board/api';
import { BullMQAdapter } from '@bull-board/api/bullMQAdapter';
import { ExpressAdapter } from '@bull-board/express';
import type { INestApplication } from '@nestjs/common';
import type { Queue } from 'bullmq';

// Enforce read-only HTTP access as well as hiding all mutation controls.
export function jobsReadOnly(
  req: IncomingMessage,
  res: ServerResponse,
  next: () => void,
) {
  if (req.method === 'GET' || req.method === 'HEAD') return next();
  res.writeHead(405, { Allow: 'GET, HEAD' }).end();
}

export function mountJobsBrowser(app: INestApplication, queues: Queue[]) {
  const serverAdapter = new ExpressAdapter();
  serverAdapter.setBasePath('/queues');
  createBullBoard({
    serverAdapter,
    queues: queues.map(
      (queue) =>
        new BullMQAdapter(queue, {
          readOnlyMode: true,
          allowRetries: false,
        }),
    ),
    options: { uiConfig: { boardTitle: 'News Digest jobs (read-only)' } },
  });
  app.use('/queues', jobsReadOnly, serverAdapter.getRouter());
}
