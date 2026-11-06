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
export const redditCommunitiesSchema = z
  .array(
    z
      .string()
      .trim()
      .regex(/^[a-zA-Z0-9_]{2,21}$/),
  )
  .max(20)
  .refine(
    (names) =>
      new Set(names.map((name) => name.toLowerCase())).size === names.length,
    'Reddit communities must be unique, ignoring case',
  );
export const xDiscoverySettingsSchema = z
  .object({
    minimumLikes: z.number().int().min(0).max(2147483647),
    exclusions: z
      .array(
        z
          .string()
          .trim()
          .regex(/^-[a-zA-Z0-9_]+$/),
      )
      .max(100),
  })
  .strict();
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
  redditCommunities: redditCommunitiesSchema.default([]),
  blueskyQuery: z.string().trim().max(500).optional(),
  xDiscovery: xDiscoverySettingsSchema.nullable().optional(),
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
  xTriageEvidence: z
    .object({
      reportedLikes: z.number().int().nonnegative().optional(),
      media: z.enum(['linked', 'unknown']),
    })
    .optional(),
  xSearchRanking: z
    .object({ bonus: z.number().min(0).max(2), reason: z.string() })
    .optional(),
  whyItMatters: z.string().optional(),
  citingStories: z
    .array(z.object({ id: z.string().uuid(), title: z.string() }))
    .optional(),
  reasons: z.array(z.string()),
});
export type SelectedPost = z.infer<typeof selectedPostSchema>;

// Platform-specific evidence stays discriminated in immutable editions.
export const selectedRedditPostSchema = selectedPostSchema.extend({
  platform: z.literal('reddit'),
  title: z.string().min(1),
  subreddit: z.string().min(1),
  metrics: z.object({
    score: z.number().int(),
    comments: z.number().int().nonnegative(),
    upvoteRatio: z.number().min(0).max(1),
  }),
  thumbnail: z.string().url().nullable(),
  externalUrl: z.string().url().nullable(),
  observedAt: z.string().datetime(),
});
export type SelectedRedditPost = z.infer<typeof selectedRedditPostSchema>;

// Prepared for explicit replays; production publication does not select Bluesky.
const blueskyMediaUrl = z
  .string()
  .url()
  .refine((value) => {
    const url = new URL(value);
    return url.protocol === 'https:' && !url.username && !url.password;
  });
export const selectedBlueskyPostSchema = selectedPostSchema
  .omit({ authorUrl: true })
  .extend({
    platform: z.literal('bluesky'),
    url: blueskyMediaUrl.refine(
      (value) => new URL(value).hostname === 'bsky.app',
    ),
    observedAt: z.string().datetime(),
    metrics: z.object({
      likes: z.number().int().nonnegative(),
      reposts: z.number().int().nonnegative(),
      replies: z.number().int().nonnegative(),
    }),
    media: z
      .array(
        z.discriminatedUnion('type', [
          z.object({
            type: z.literal('image'),
            thumbnail: blueskyMediaUrl,
            fullsize: blueskyMediaUrl,
            alt: z.string(),
          }),
          z.object({
            type: z.literal('video'),
            thumbnail: blueskyMediaUrl.nullable(),
            playlist: blueskyMediaUrl,
            alt: z.string(),
          }),
        ]),
      )
      .max(4)
      .optional(),
  });
export type SelectedBlueskyPost = z.infer<typeof selectedBlueskyPostSchema>;

export const selectedSocialPostSchema = z.discriminatedUnion('platform', [
  selectedPostSchema,
  selectedRedditPostSchema,
  selectedBlueskyPostSchema,
]);
export type SelectedSocialPost = z.infer<typeof selectedSocialPostSchema>;

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
      posts: z.array(selectedSocialPostSchema).optional(),
      postSelectionMethod: z
        .enum([
          'verified-lexical-recency-v1',
          'verified-semantic-editor-v1',
          'verified-lexical-recency-v2',
          'verified-lexical-engagement-v3',
          'verified-semantic-editor-v2',
          'verified-semantic-engagement-v3',
        ])
        .optional(),
      blueskySelection: z
        .object({
          openSlots: z.number().int().nonnegative(),
          reservedSlot: z.boolean().optional(),
          replacedXPostId: z.string().optional(),
          candidatesRead: z.number().int().nonnegative(),
          candidatesShortlisted: z.number().int().nonnegative(),
          postsPicked: z.number().int().nonnegative(),
          droppedPosts: z
            .object({
              invalidFields: z.number().int().nonnegative(),
              unknownId: z.number().int().nonnegative(),
              repeatedId: z.number().int().nonnegative(),
              unsupportedClaim: z.number().int().nonnegative(),
              overBudget: z.number().int().nonnegative(),
            })
            .optional(),
          result: z.enum([
            'no-slot',
            'no-candidates',
            'nothing-passed-triage',
            'editor-chose-none',
            'picks-made',
            'ai-editing-failed',
            'ai-unavailable',
            'budget-refused',
            'switched-off',
          ]),
        })
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

// Reader contracts are explicit allowlists: new operational fields stay private.
export const readerStorySchema = rankedStorySchema.pick({
  id: true,
  title: true,
  url: true,
  summary: true,
  imageUrl: true,
  publishedAt: true,
  sources: true,
  coverage: true,
});
const readerPostFields = {
  platform: true,
  externalId: true,
  url: true,
  author: true,
  publishedAt: true,
  text: true,
  displayText: true,
  metrics: true,
} as const;
export const readerPostSchema = z.discriminatedUnion('platform', [
  selectedPostSchema.pick({ ...readerPostFields, authorUrl: true }),
  selectedRedditPostSchema.pick({
    ...readerPostFields,
    authorUrl: true,
    title: true,
    subreddit: true,
    thumbnail: true,
    externalUrl: true,
  }),
  selectedBlueskyPostSchema.pick({ ...readerPostFields, media: true }),
]);
export const readerEditionSchema = z.object({
  id: z.string().uuid(),
  createdAt: z.string(),
  windowStart: z.string(),
  windowEnd: z.string(),
  topics: z.array(
    z.object({
      id: z.string().uuid(),
      name: z.string(),
      brief: z.array(z.string()),
      stories: z.array(readerStorySchema),
      posts: z.array(readerPostSchema),
    }),
  ),
});
export type ReaderEdition = z.infer<typeof readerEditionSchema>;
export const readerEditionHistorySchema = z.object({
  entries: z.array(
    readerEditionSchema
      .pick({
        id: true,
        createdAt: true,
        windowStart: true,
        windowEnd: true,
      })
      .extend({
        topics: z
          .array(z.object({ id: z.string().uuid(), name: z.string() }))
          .default([]),
      }),
  ),
  hasMore: z.boolean(),
});
export type ReaderEditionHistory = z.infer<typeof readerEditionHistorySchema>;

export const previewRequestSchema = z
  .object({
    windowStart: z.string().datetime({ offset: true }),
    windowEnd: z.string().datetime({ offset: true }),
  })
  .strict();

export const editionJobIdSchema = z
  .string()
  .regex(
    /^(?:[0-9]{1,20}|[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12})$/,
  );

export const previewHistoryEntrySchema = digestPreviewSchema
  .pick({
    id: true,
    createdAt: true,
    windowStart: true,
    windowEnd: true,
    method: true,
  })
  .extend({
    topicModes: z
      .array(
        z.object({
          id: z.string().uuid(),
          name: z.string(),
          stories: z.enum(['ai', 'non-ai']).nullable(),
          posts: z.enum(['ai', 'non-ai']).nullable(),
        }),
      )
      .optional(),
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
    redditCommunities: redditCommunitiesSchema.optional(),
    blueskyQuery: z.string().trim().max(500).optional(),
    xDiscovery: xDiscoverySettingsSchema.nullable().optional(),
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

export const recentCallSchema = z.object({
  id: z.string().uuid(),
  createdAt: z.string().datetime(),
  model: z.string(),
  purpose: z.string(),
  status: z.enum(['pending', 'succeeded', 'failed', 'uncertain']),
  costMicros: z.number().int().nonnegative().nullable(),
  reservedMicros: z.number().int().nonnegative(),
  inputTokens: z.number().int().nonnegative().nullable(),
  outputTokens: z.number().int().nonnegative().nullable(),
});
export type RecentCall = z.infer<typeof recentCallSchema>;

export const llmUsageSchema = z.object({
  recentCalls: z.array(recentCallSchema).max(20).optional(),
  scheduledReserve: z
    .object({
      lastOutcome: z
        .object({
          budgetDay: z.string(),
          scheduledAt: z.string().datetime(),
          state: z.enum(['succeeded', 'failed']),
          outcome: z
            .object({
              editionId: z.string().uuid(),
              mode: z.enum(['full-ai', 'mixed', 'fallback']),
              reason: z.string(),
            })
            .nullable(),
        })
        .nullable(),
      enabled: z.boolean(),
      budgetDay: z.string(),
      state: z.enum([
        'pending',
        'running',
        'retrying',
        'succeeded',
        'failed',
        'not-scheduled',
      ]),
      sizedReserveMicros: z.number().int().nonnegative(),
      reserveMicros: z.number().int().nonnegative(),
      otherSpendLimitMicros: z.number().int().nonnegative(),
      otherAvailableMicros: z.number().int().nonnegative(),
      limitedByReserve: z.boolean(),
    })
    .optional(),
  purposes: z
    .array(
      z.object({
        purpose: z.string(),
        todayMicros: z.number().int().nonnegative(),
        monthMicros: z.number().int().nonnegative(),
        reservedMicros: z.number().int().nonnegative(),
      }),
    )
    .optional(),
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
  recentCalls: z.array(recentCallSchema).max(20).optional(),
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
  coverage: z
    .object({
      start: z.string().datetime(),
      end: z.string().datetime(),
      topics: z.array(
        z.object({
          topicId: z.string().uuid(),
          name: z.string(),
          enabled: z.boolean(),
          connectedSources: z.number().int().nonnegative(),
          healthySources: z.number().int().nonnegative(),
          articles: z.number().int().nonnegative(),
          xPosts: z.number().int().nonnegative(),
          redditPosts: z.number().int().nonnegative(),
        }),
      ),
    })
    .optional(),
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
      items24h: z.number().int().nonnegative(),
      items7d: z.number().int().nonnegative(),
      active: z.boolean(),
      enabled: z.boolean(),
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
          startedAt: z.string().datetime().nullable(),
          durationMs: z.number().int().nonnegative().nullable(),
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

export const identitySchema = z.object({ isAdmin: z.boolean() });

export const editionCostSchema = z.object({
  costMicros: z.number().int().nonnegative(),
  reservedMicros: z.number().int().nonnegative(),
  calls: z.number().int().nonnegative(),
  byModelAndPurpose: z.array(
    z.object({
      model: z.string(),
      purpose: z.string(),
      calls: z.number().int().nonnegative(),
      succeeded: z.number().int().nonnegative(),
      failed: z.number().int().nonnegative(),
      unresolved: z.number().int().nonnegative(),
      costMicros: z.number().int().nonnegative(),
      reservedMicros: z.number().int().nonnegative(),
    }),
  ),
});
export type EditionCost = z.infer<typeof editionCostSchema>;

export const monitoringAlertsSchema = z.object({
  checkedAt: z.string().datetime(),
  firing: z.number().int().nonnegative(),
  pending: z.number().int().nonnegative(),
});
export type MonitoringAlerts = z.infer<typeof monitoringAlertsSchema>;

export const sourceEnabledSchema = z.object({ enabled: z.boolean() }).strict();
