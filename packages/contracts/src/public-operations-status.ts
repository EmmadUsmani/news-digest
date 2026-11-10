import { z } from 'zod';

// Public wire contract: keep independent of private ledgers and job payloads.
const count = z.number().int().nonnegative().safe();
const timestamp = z.string().datetime().nullable();
// Production totals only. Never reuse the private usage schemas: their optional
// fields include ledger records, provider errors and free-form purpose strings.
const llmBudget = z.object({
  todayMicros: count,
  monthMicros: count,
  todayReservedMicros: count,
  monthReservedMicros: count,
  dailyCapMicros: count,
  monthlyCapMicros: count,
  availableMicros: count,
});
const xBudget = z.object({
  todayMicros: count,
  monthMicros: count,
  reservedMicros: count,
  dailyMicros: count,
  monthlyMicros: count,
  availableMicros: count,
  blocked: z.boolean(),
});
const source = z.object({
  id: z.string(),
  name: z.string(),
  lastAttempt: timestamp,
  lastSuccess: timestamp,
  hasError: z.boolean(),
  active: z.boolean(),
  enabled: z.boolean(),
  lastItemCount: count,
  storedItems: count,
  items24h: count,
  items7d: count,
});
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
export const publicOperationsStatusSchema = z.object({
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
  llm: llmBudget.optional(),
  xDiscovery: xBudget.optional(),
});

export type PublicOperationsStatus = z.infer<
  typeof publicOperationsStatusSchema
>;
