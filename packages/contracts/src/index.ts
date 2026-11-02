import { z } from 'zod';
export const healthSchema = z.object({
  status: z.enum(['ok', 'degraded']),
  database: z.boolean(),
  redis: z.boolean(),
});
export type Health = z.infer<typeof healthSchema>;

export const scheduleSchema = z
  .object({
    cadence: z.string().max(100),
    timezone: z.string().min(1).max(100),
    coverageWindow: z.string().max(100),
    storyBudget: z.number().int().min(0).max(20),
    postBudget: z.number().int().min(0).max(20),
  })
  .strict();
export const profileSettingsSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  schedule: scheduleSchema,
});
export type ProfileSettings = z.infer<typeof profileSettingsSchema>;
export const relevancePolicySchema = z
  .object({
    includeAny: z.array(z.string().trim().min(1).max(80)).max(100),
    excludeAny: z.array(z.string().trim().min(1).max(80)).max(100),
  })
  .strict();
export type RelevancePolicy = z.infer<typeof relevancePolicySchema>;
export const topicSchema = z.object({
  id: z.string().uuid(),
  profileId: z.string().uuid(),
  name: z.string(),
  description: z.string(),
  includeGuidance: z.string(),
  excludeGuidance: z.string(),
  enabled: z.boolean(),
  position: z.number().int(),
  storyBudget: z.number().int().min(0).max(20),
  postBudget: z.number().int().min(0).max(20),
  relevancePolicy: relevancePolicySchema,
  sources: z.array(z.string()),
  queries: z.array(z.string()),
  accounts: z.array(z.string()),
});
export type Topic = z.infer<typeof topicSchema>;
export const contentGroupSchema = z.object({
  topicId: z.string().uuid(),
  items: z.array(
    z.object({
      id: z.string().uuid(),
      title: z.string(),
      url: z.string().url(),
      publishedAt: z.string(),
      source: z.string(),
    }),
  ),
});
export type ContentGroup = z.infer<typeof contentGroupSchema>;

export const rankedStorySchema = z.object({
  id: z.string().uuid(),
  title: z.string(),
  url: z.string().url(),
  excerpt: z.string(),
  evidence: z
    .array(
      z.object({
        id: z.string().uuid(),
        title: z.string(),
        url: z.string().url(),
        excerpt: z.string(),
        sources: z.array(z.string()),
        publishedAt: z.string(),
      }),
    )
    .optional(),
  summary: z.string().optional(),
  whyItMatters: z.string().optional(),
  imageUrl: z
    .string()
    .url()
    .refine((value) => {
      try {
        const url = new URL(value);
        return url.protocol === 'https:' && !url.username && !url.password;
      } catch {
        return false;
      }
    })
    .nullable()
    .optional(),
  publishedAt: z.string(),
  sources: z.array(z.string()),
  coverage: z
    .array(
      z.object({
        id: z.string().uuid(),
        title: z.string(),
        url: z.string().url(),
        sources: z.array(z.string()),
        publishedAt: z.string(),
      }),
    )
    .optional(),
  score: z.number(),
  reasons: z.array(z.string()),
});
// Optional on historical editions; new selections are copied into the snapshot.
export const selectedPostSchema = z.object({
  platform: z.literal('x'),
  externalId: z.string(),
  url: z.string().url(),
  author: z.string(),
  authorUrl: z.string().url(),
  publishedAt: z.string().datetime(),
  text: z.string(),
  displayText: z.string().max(20000).optional(),
  metrics: z.record(z.string(), z.number()),
  whyItMatters: z.string().optional(),
  citingStories: z
    .array(z.object({ id: z.string().uuid(), title: z.string() }))
    .optional(),
  reasons: z.array(z.string()),
});
export type SelectedPost = z.infer<typeof selectedPostSchema>;

export const digestPreviewSchema = z.object({
  id: z.string().uuid(),
  createdAt: z.string(),
  windowStart: z.string(),
  windowEnd: z.string(),
  method: z.enum([
    'signals-v1',
    'signals-v2',
    'signals-v3',
    'signals-v4',
    'signals-v5',
    'signals-v6',
    'editorial-v1',
  ]),
  topics: z.array(
    z.object({
      id: z.string().uuid(),
      name: z.string(),
      candidateCount: z.number().int(),
      editorial: z
        .object({
          mode: z.enum(['ai', 'non-ai']),
          model: z.string().nullable(),
          reason: z.string(),
          brief: z.array(z.string()),
          triage: z.array(
            z.object({
              id: z.string(),
              relevance: z.number(),
              importance: z.number(),
              event: z.string(),
              rationale: z.string(),
            }),
          ),
          unscoredIds: z.array(z.string()),
        })
        .optional(),
      relevanceRejectedCount: z.number().int().optional(),
      relevancePolicy: relevancePolicySchema.optional(),
      qualityRejections: z
        .array(
          z.object({
            id: z.string().uuid(),
            title: z.string(),
            rule: z.string(),
            reason: z.string(),
          }),
        )
        .optional(),
      posts: z.array(selectedPostSchema).optional(),
      postSelectionMethod: z
        .enum([
          'verified-lexical-recency-v1',
          'verified-semantic-editor-v1',
          'verified-lexical-recency-v2',
          'verified-semantic-editor-v2',
        ])
        .optional(),
      postEditorial: z
        .object({
          mode: z.enum(['ai', 'non-ai']),
          model: z.string().nullable(),
          reason: z.string(),
          triage: z.array(
            z.object({
              id: z.string(),
              relevance: z.number(),
              importance: z.number(),
              event: z.string(),
              rationale: z.string(),
            }),
          ),
          unscoredIds: z.array(z.string()),
        })
        .optional(),
      stories: z.array(rankedStorySchema),
    }),
  ),
});
export type DigestPreview = z.infer<typeof digestPreviewSchema>;

export const previewRequestSchema = z
  .object({
    windowStart: z.string().datetime({ offset: true }),
    windowEnd: z.string().datetime({ offset: true }),
  })
  .strict();

export const previewHistoryEntrySchema = digestPreviewSchema.pick({
  id: true,
  createdAt: true,
  windowStart: true,
  windowEnd: true,
  method: true,
});
export const previewHistorySchema = z.object({
  entries: z.array(previewHistoryEntrySchema),
  hasMore: z.boolean(),
});
export type PreviewHistory = z.infer<typeof previewHistorySchema>;

export const xAccountsSchema = z
  .array(
    z
      .string()
      .trim()
      .regex(/^[a-zA-Z0-9_]{1,15}$/),
  )
  .max(20)
  .refine(
    (handles) =>
      new Set(handles.map((handle) => handle.toLowerCase())).size ===
      handles.length,
    'X accounts must be unique, ignoring case',
  );

export const topicUpdateSchema = topicSchema
  .pick({
    name: true,
    description: true,
    includeGuidance: true,
    excludeGuidance: true,
    enabled: true,
    storyBudget: true,
    postBudget: true,
    relevancePolicy: true,
  })
  .extend({
    accounts: xAccountsSchema.optional(),
    name: z.string().trim().min(1).max(120),
    description: z.string().trim().max(2000),
    includeGuidance: z.string().trim().max(2000),
    excludeGuidance: z.string().trim().max(2000),
  })
  .strict();
export type TopicUpdate = z.infer<typeof topicUpdateSchema>;

export const topicOrderSchema = z
  .object({
    ids: z
      .array(z.string().uuid())
      .max(1000)
      .refine(
        (ids) => new Set(ids).size === ids.length,
        'Topic IDs must be unique',
      ),
  })
  .strict();

export const topicSourcesSchema = z
  .object({
    ids: z
      .array(z.string().min(1).max(100))
      .max(100)
      .refine(
        (ids) => new Set(ids).size === ids.length,
        'Sources must be unique',
      ),
  })
  .strict();
export const sourceCatalogSchema = z.array(
  z.object({ id: z.string(), name: z.string(), url: z.string().url() }),
);
export type SourceCatalog = z.infer<typeof sourceCatalogSchema>;

export type ScheduleSettings = z.infer<typeof scheduleSchema>;

export const llmUsageSchema = z.object({
  monthMicros: z.number().int().nonnegative(),
  todayMicros: z.number().int().nonnegative(),
  monthReservedMicros: z.number().int().nonnegative(),
  todayReservedMicros: z.number().int().nonnegative(),
  dailyCapMicros: z.number().int().nonnegative(),
  monthlyCapMicros: z.number().int().nonnegative(),
  availableMicros: z.number().int().nonnegative(),
  modelAllocation: z
    .object({
      model: z.string(),
      dailyCapMicros: z.number().int().nonnegative(),
      usedMicros: z.number().int().nonnegative(),
      availableMicros: z.number().int().nonnegative(),
    })
    .optional(),
  blockedUntil: z.string().datetime().nullable(),
  models: z.array(
    z.object({
      model: z.string(),
      calls: z.number().int().nonnegative(),
      costMicros: z.number().int().nonnegative(),
    }),
  ),
  lastError: z
    .object({ code: z.string(), at: z.string().datetime() })
    .nullable(),
});
export type LlmUsage = z.infer<typeof llmUsageSchema>;

export const xDiscoveryUsageSchema = z.object({
  todayMicros: z.number().int().nonnegative(),
  monthMicros: z.number().int().nonnegative(),
  reservedMicros: z.number().int().nonnegative(),
  dailyMicros: z.number().int().nonnegative(),
  monthlyMicros: z.number().int().nonnegative(),
  availableMicros: z.number().int().nonnegative(),
  blocked: z.boolean(),
});

export const socialCollectionResultSchema = z.object({
  sources: z.number().int().nonnegative(),
  citations: z.number().int().nonnegative(),
  discoveryErrors: z.number().int().nonnegative(),
  verified: z.number().int().nonnegative(),
  verificationErrors: z.number().int().nonnegative(),
  articleDiscovery: z.object({
    checked: z.number().int().nonnegative(),
    citations: z.number().int().nonnegative(),
    errors: z.number().int().nonnegative(),
  }),
});

export const operationsStatusSchema = z.object({
  xDiscovery: xDiscoveryUsageSchema,
  llm: llmUsageSchema,
  checkedAt: z.string().datetime(),
  sources: z.array(
    z.object({
      id: z.string(),
      name: z.string(),
      lastAttempt: z.string().datetime().nullable(),
      lastSuccess: z.string().datetime().nullable(),
      error: z.string().nullable(),
      lastItemCount: z.number().int(),
      storedItems: z.number().int(),
      active: z.boolean(),
    }),
  ),
  queues: z.array(
    z.object({
      name: z.string(),
      available: z.boolean(),
      workers: z.number().int(),
      paused: z.boolean(),
      counts: z.record(z.string(), z.number()),
      nextRun: z.string().datetime().nullable(),
      runs: z.array(
        z.object({
          id: z.string(),
          state: z.string(),
          attempts: z.number().int(),
          scheduledAt: z.string().datetime().nullable(),
          finishedAt: z.string().datetime().nullable(),
          editionId: z.string().nullable(),
          skipped: z.string().nullable(),
          socialCollection: socialCollectionResultSchema.nullable().optional(),
        }),
      ),
    }),
  ),
});
export type OperationsStatus = z.infer<typeof operationsStatusSchema>;

export const customFeedSchema = z
  .object({
    name: z.string().trim().min(1).max(120),
    url: z.string().trim().url().max(2000),
  })
  .strict();
export type CustomFeed = z.infer<typeof customFeedSchema>;

export const newsQuerySchema = z
  .object({
    query: z
      .string()
      .trim()
      .min(1)
      .max(100)
      .regex(/^[^\x00-\x1f\x7f]+$/),
  })
  .strict();
export type NewsQuery = z.infer<typeof newsQuerySchema>;
// Fixed edition: English-language US Google News RSS. Queries are encoded as data.
export function newsQueryFeed(input: NewsQuery): CustomFeed {
  const { query } = newsQuerySchema.parse(input);
  const url = new URL('https://news.google.com/rss/search');
  url.search = new URLSearchParams({
    q: query,
    hl: 'en-US',
    gl: 'US',
    ceid: 'US:en',
  }).toString();
  return { name: `Google News: ${query}`, url: url.href };
}
