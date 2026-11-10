import { ServiceUnavailableException } from '@nestjs/common';
import { z } from 'zod';

const count = z.number().int().nonnegative().safe();
const timestamp = z.string().datetime().nullable();
const source = z
  .object({
    id: z.string(),
    name: z.string(),
    lastAttempt: timestamp,
    lastSuccess: timestamp,
    error: z.string().nullable(),
    active: z.boolean(),
    enabled: z.boolean(),
    lastItemCount: count,
    storedItems: count,
    items24h: count,
    items7d: count,
  })
  .transform(({ error, ...row }) => ({ ...row, hasError: error !== null }));
const queue = z.object({
  name: z.enum([
    'operations',
    'ingestion',
    'digest-generation',
    'social-collection',
  ]),
  available: z.boolean(),
  workers: count,
  paused: z.boolean(),
  counts: z.object({
    waiting: count.optional(),
    active: count.optional(),
    delayed: count.optional(),
    failed: count.optional(),
    completed: count.optional(),
  }),
  nextRun: timestamp,
});
const status = z.object({
  checkedAt: z.string().datetime(),
  coverage: z
    .object({
      start: z.string().datetime(),
      end: z.string().datetime(),
      topics: z.array(
        z.object({
          topicId: z.string().uuid(),
          name: z.string(),
          enabled: z.boolean(),
          connectedSources: count,
          healthySources: count,
          articles: count,
          xPosts: count,
          redditPosts: count,
        }),
      ),
    })
    .optional(),
  sources: source.array(),
  queues: queue.array(),
});

// Preparation only. Explicit schemas omit job IDs/results, provider ledger and
// development accounting, including any fields added to the private reader.
// Stored failures become presence flags; queue names/count keys are allowlisted.
export async function readPublicStatus(read: () => Promise<unknown>) {
  try {
    return status.parse(await read());
  } catch {
    throw new ServiceUnavailableException('Status unavailable');
  }
}
